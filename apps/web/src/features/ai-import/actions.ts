"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/features/auth/get-profile";
import { EXTRACT_MODEL } from "@/lib/ai/xai";
import { MAX_STORY_CHARS, type LumenExtract } from "@/features/ai-import/schema";
import {
  extractWithLumen,
  matchCity,
  matchPlace,
  normalizeIata,
  normName,
  sameStopSet,
  titlesMatch,
  zoneIdFor,
} from "@/features/ai-import/extract";
import { aiBlocked } from "@/features/ai-import/spend";
import { listAllZones, listCities } from "@/features/places/queries";
import { listStopsForPlaybook } from "@/features/playbooks/queries";
import type { City, Place } from "@/features/places/types";
import type { Playbook } from "@/features/playbooks/types";

export type ShareState = {
  error?: string;
  nap?: boolean;
  question?: string;
  story?: string;
  hintSlug?: string;
  alreadyHref?: string;
};

function nap(): ShareState {
  return {
    nap: true,
    error: "Lumen’s taking a nap.",
  };
}

export async function fillDraft(
  _prev: ShareState,
  formData: FormData,
): Promise<ShareState> {
  const profile = await getProfile();
  if (!profile || profile.status === "suspended") {
    return { error: "Log in to dump a layover." };
  }
  const authorId = profile.id;

  const story = String(formData.get("story") ?? "").trim();
  const answer = String(formData.get("answer") ?? "").trim();
  const hintSlug = String(formData.get("city") ?? "").trim() || null;
  const combined = answer ? `${story}\n\n(${answer})` : story;

  if (!combined) {
    return { error: "Dump the layover first.", hintSlug: hintSlug ?? undefined };
  }
  if (combined.length > MAX_STORY_CHARS) {
    return {
      error: "Keep it to one layover.",
      story,
      hintSlug: hintSlug ?? undefined,
    };
  }

  const supabase = await createClient();

  if (await aiBlocked(supabase)) return nap();

  const cities = await listCities();

  const result = await extractWithLumen({
    story: combined,
    cities,
    hintSlug,
  });

  const logBase = {
    user_id: authorId,
    model: EXTRACT_MODEL,
    followup: Boolean(answer),
    input_chars: combined.length,
    input_tokens: result.inputTokens,
    output_tokens: result.outputTokens,
    search_calls: result.searchCalls,
    estimated_usd: result.estimatedUsd,
  };

  if (result.error === "missing_key" || result.error === "xai") {
    await supabase.from("ai_import_logs").insert({
      ...logBase,
      success: false,
      error_code: result.error,
    });
    return nap();
  }

  const extract = result.extract;
  if (!extract) {
    await supabase.from("ai_import_logs").insert({
      ...logBase,
      success: false,
      error_code: "parse",
    });
    return {
      error: "Couldn’t read that. Try one more dump.",
      story,
      hintSlug: hintSlug ?? undefined,
    };
  }

  if (extract.status === "blocked") {
    await supabase.from("ai_import_logs").insert({
      ...logBase,
      success: false,
      error_code: "blocked",
      payload: extract as unknown as Record<string, unknown>,
    });
    return {
      error: extract.question || "I can’t file that.",
      story,
      hintSlug: hintSlug ?? undefined,
    };
  }

  if (extract.status === "need_city" || extract.status === "need_name") {
    await supabase.from("ai_import_logs").insert({
      ...logBase,
      success: false,
      error_code: extract.status,
      payload: extract as unknown as Record<string, unknown>,
    });
    const question =
      extract.question ||
      (extract.status === "need_city"
        ? "Which city? Airport code if you have it."
        : "What’s the place called?");
    return {
      question,
      story,
      hintSlug: hintSlug ?? undefined,
    };
  }

  let city: City | undefined = matchCity(cities, extract, hintSlug);
  if (!city) {
    const iata = normalizeIata(extract.city_airport);
    const newName = (extract.city_name ?? "").trim();
    if (iata && newName) {
      const { data: newId, error: cityErr } = await supabase.rpc(
        "lumen_ensure_city",
        {
          p_name: newName,
          p_slug: extract.city_slug,
          p_airport: iata,
          p_country: extract.city_country,
        },
      );
      if (!cityErr && newId) {
        const { data: row } = await supabase
          .from("cities")
          .select("id, slug, name, country, airport_code")
          .eq("id", newId)
          .maybeSingle();
        if (row) city = row as City;
      }
    }
  }
  if (!city) {
    await supabase.from("ai_import_logs").insert({
      ...logBase,
      success: false,
      error_code: "need_city",
      payload: extract as unknown as Record<string, unknown>,
    });
    return {
      question: "Which city? Airport code if you have it.",
      story,
      hintSlug: hintSlug ?? undefined,
    };
  }

  const zones = await listAllZones();
  const { data: existingRows } = await supabase
    .from("places")
    .select("id, city_id, zone_id, name, blurb, category, status, author_id")
    .eq("city_id", city.id);
  const existing = (existingRows ?? []) as Place[];

  const createdPlaceIds: string[] = [];
  let playbookId: string | null = null;
  let openedCity = false;
  if (!matchCity(cities, extract, hintSlug) && city) openedCity = true;

  async function ensurePlace(opts: {
    name: string;
    category: "eat" | "do" | "shop";
    blurb: string | null;
    zoneType: LumenExtract["zone_type"];
    dishName: string | null;
    dishNote?: string | null;
  }): Promise<string | null> {
    const found = matchPlace(existing, city!.id, opts.name);
    if (found) return found.id;
    const zoneId = zoneIdFor(zones, city!.id, opts.zoneType);
    const { data: place, error } = await supabase
      .from("places")
      .insert({
        city_id: city!.id,
        zone_id: zoneId,
        name: opts.name,
        blurb: opts.blurb,
        category: opts.category,
        status: "draft",
        author_id: authorId,
        want_ai_still: true,
      })
      .select("id")
      .single();
    if (error || !place) return null;
    createdPlaceIds.push(place.id);
    existing.push({
      id: place.id,
      city_id: city!.id,
      zone_id: zoneId,
      name: opts.name,
      blurb: opts.blurb,
      category: opts.category,
      status: "draft",
      author_id: authorId,
    });
    if (opts.dishName && opts.category !== "do") {
      await supabase.from("dishes").insert({
        place_id: place.id,
        name: opts.dishName,
        note: opts.dishNote ?? null,
        sort_order: 1,
      });
    }
    return place.id;
  }

  async function matchExistingPlan(
    title: string,
    stopNames: string[],
    placeIds: string[],
    dayText: string | null,
  ): Promise<Playbook | null> {
    const { data: rows } = await supabase
      .from("playbooks")
      .select("id, city_id, title, narrative, hours_available, status, author_id")
      .eq("city_id", city!.id);
    const plans = (rows ?? []) as Playbook[];
    const wantIds = [...new Set(placeIds.filter(Boolean))].sort().join("\0");
    const day = dayText ? normName(dayText).slice(0, 80) : "";
    for (const pb of plans) {
      if (titlesMatch(pb.title, title)) return pb;
      const stops = await listStopsForPlaybook(pb.id);
      const names = stops.map((s) => s.title ?? "").filter(Boolean);
      if (sameStopSet(names, stopNames)) return pb;
      const ids = [
        ...new Set(stops.map((s) => s.place_id).filter(Boolean)),
      ].sort();
      if (wantIds && ids.length >= 2 && ids.join("\0") === wantIds) {
        return pb;
      }
      if (day.length > 40 && pb.narrative && normName(pb.narrative).slice(0, 80) === day) {
        return pb;
      }
    }
    return null;
  }

  if (extract.post_kind === "playbook") {
    const stops = extract.stops.filter((s) => s.name.trim() && s.found);
    if (!extract.title?.trim() || stops.length === 0) {
      await supabase.from("ai_import_logs").insert({
        ...logBase,
        success: false,
        error_code: "need_name",
        city_id: city.id,
        payload: extract as unknown as Record<string, unknown>,
      });
      return {
        question: "What’s the first stop called?",
        story,
        hintSlug: city.slug,
      };
    }

    const stopNames = stops.map((s) => s.name.trim());
    const dayCopy =
      (extract.narrative ?? "").trim() || story.trim() || null;

    const stopIds: { title: string; body: string | null; place_id: string | null }[] =
      [];
    for (const s of stops) {
      const pid = await ensurePlace({
        name: s.name.trim(),
        category: s.category ?? "do",
        blurb: s.blurb,
        zoneType: s.zone_type,
        dishName: s.dish_name,
      });
      stopIds.push({
        title: s.name.trim(),
        body: s.body,
        place_id: pid,
      });
    }

    const existingPlan = await matchExistingPlan(
      extract.title.trim(),
      stopNames,
      stopIds.map((s) => s.place_id).filter((id): id is string => Boolean(id)),
      dayCopy,
    );
    let skipPlan = false;
    if (existingPlan) {
      if (
        existingPlan.status === "published" ||
        existingPlan.author_id !== authorId
      ) {
        if (!createdPlaceIds.length) {
          await supabase.from("ai_import_logs").insert({
            ...logBase,
            success: false,
            error_code: "duplicate_plan",
            city_id: city.id,
            payload: extract as unknown as Record<string, unknown>,
          });
          return {
            error:
              existingPlan.status === "published"
                ? "This day’s already on the city. I didn’t copy it."
                : "This day’s already being filed. I didn’t copy it.",
            alreadyHref:
              existingPlan.status === "published"
                ? `/playbooks/${existingPlan.id}`
                : undefined,
            story,
            hintSlug: city.slug,
          };
        }
        skipPlan = true;
      } else {
        playbookId = existingPlan.id;
      }
    }

    if (!playbookId && !skipPlan) {
      const { data: pb, error: pbErr } = await supabase
        .from("playbooks")
        .insert({
          city_id: city.id,
          title: extract.title.trim(),
          narrative: dayCopy,
          hours_available: extract.hours_available,
          status: "draft",
          author_id: authorId,
        })
        .select("id")
        .single();
      if (pbErr || !pb) {
        playbookId = null;
      } else {
        playbookId = pb.id;
        if (stopIds.length) {
          const { error: stopErr } = await supabase.from("playbook_stops").insert(
            stopIds.map((s, idx) => ({
              playbook_id: pb.id,
              position: idx + 1,
              title: s.title,
              body: s.body,
              place_id: s.place_id,
            })),
          );
          if (stopErr) {
            await supabase.from("playbooks").delete().eq("id", pb.id);
            playbookId = null;
          }
        }
      }
    }
    if (playbookId && dayCopy) {
      const { data: pbRow } = await supabase
        .from("playbooks")
        .select("narrative")
        .eq("id", playbookId)
        .maybeSingle();
      if (pbRow && !pbRow.narrative) {
        await supabase
          .from("playbooks")
          .update({ narrative: dayCopy })
          .eq("id", playbookId);
      }
    }
  } else if (extract.post_kind === "places") {
    const recs = extract.stops.filter((s) => s.name.trim() && s.found);
    if (recs.length === 0) {
      await supabase.from("ai_import_logs").insert({
        ...logBase,
        success: false,
        error_code: "need_name",
        city_id: city.id,
        payload: extract as unknown as Record<string, unknown>,
      });
      return {
        question: "What’s the place called?",
        story,
        hintSlug: city.slug,
      };
    }
    for (const s of recs) {
      await ensurePlace({
        name: s.name.trim(),
        category: s.category ?? "do",
        blurb: s.blurb,
        zoneType: s.zone_type,
        dishName: s.dish_name,
      });
    }
    if (!createdPlaceIds.length) {
      await supabase.from("ai_import_logs").insert({
        ...logBase,
        success: true,
        error_code: "linked",
        city_id: city.id,
        payload: extract as unknown as Record<string, unknown>,
      });
      return {
        error: "Those are already on the city.",
        story,
        hintSlug: city.slug,
      };
    }
  } else {
    const name = extract.name?.trim();
    const category = extract.category;
    if (name && extract.found === false) {
      await supabase.from("ai_import_logs").insert({
        ...logBase,
        success: false,
        error_code: "need_name",
        city_id: city.id,
        payload: extract as unknown as Record<string, unknown>,
      });
      return {
        question: "I couldn’t find that place. What’s it called?",
        story,
        hintSlug: city.slug,
      };
    }
    if (!name || !category) {
      await supabase.from("ai_import_logs").insert({
        ...logBase,
        success: false,
        error_code: "need_name",
        city_id: city.id,
        payload: extract as unknown as Record<string, unknown>,
      });
      return {
        question: "What’s the place called?",
        story,
        hintSlug: city.slug,
      };
    }
    const pid = await ensurePlace({
      name,
      category,
      blurb: extract.blurb,
      zoneType: extract.zone_type,
      dishName: extract.dish_name,
      dishNote: extract.dish_note,
    });
    if (!pid) {
      return { error: "Couldn’t save that. Try again.", story };
    }
    if (!createdPlaceIds.length) {
      await supabase.from("ai_import_logs").insert({
        ...logBase,
        success: true,
        error_code: "linked",
        city_id: city.id,
        payload: extract as unknown as Record<string, unknown>,
      });
      return {
        error: "That’s already on the city.",
        alreadyHref: `/places/${pid}`,
        story,
        hintSlug: city.slug,
      };
    }
  }

  if (!playbookId && !createdPlaceIds.length) {
    await supabase.from("ai_import_logs").insert({
      ...logBase,
      success: false,
      error_code: "write",
      city_id: city.id,
      payload: extract as unknown as Record<string, unknown>,
    });
    return { error: "Couldn’t save. Try again.", story };
  }

  const { data: logRow, error: logErr } = await supabase
    .from("ai_import_logs")
    .insert({
      ...logBase,
      success: true,
      city_id: city.id,
      payload: {
        ...(extract as unknown as Record<string, unknown>),
        opened_city: openedCity,
      },
      created_place_ids: createdPlaceIds,
      created_playbook_id: playbookId,
    })
    .select("id")
    .single();

  if (logErr || !logRow) {
    return { error: "Draft saved but I lost the review link. Check Yours." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/cities");
  revalidatePath(`/cities/${city.slug}`);
  redirect(`/share/review/${logRow.id}`);
}

export async function setAiKilled(
  _prev: { error?: string; success?: string },
  formData: FormData,
): Promise<{ error?: string; success?: string }> {
  const profile = await getProfile();
  if (!profile || profile.role !== "admin") {
    return { error: "Admin only." };
  }
  const killed = String(formData.get("killed") ?? "") === "true";
  const supabase = await createClient();
  const { error } = await supabase
    .from("site_settings")
    .update({ value: killed ? "true" : "false" })
    .eq("key", "ai_killed");
  if (error) return { error: error.message };
  revalidatePath("/admin");
  revalidatePath("/share");
  return { success: killed ? "Lumen is off." : "Lumen is on." };
}
