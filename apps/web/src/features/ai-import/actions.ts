"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/features/auth/get-profile";
import { EXTRACT_MODEL, getXaiKey, monthlyCapUsd } from "@/lib/ai/xai";
import {
  DAILY_EXTRACT_CAP,
  MAX_STORY_CHARS,
  type LumenExtract,
} from "@/features/ai-import/schema";
import {
  extractWithLumen,
  matchCity,
  matchPlace,
  normalizeIata,
  zoneIdFor,
} from "@/features/ai-import/extract";
import { listAllZones, listCities } from "@/features/places/queries";
import type { City, Place } from "@/features/places/types";

export type ShareState = {
  error?: string;
  nap?: boolean;
  question?: string;
  story?: string;
  hintSlug?: string;
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

  const { data: setting } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "ai_killed")
    .maybeSingle();
  if (setting?.value === "true") return nap();
  if (!getXaiKey()) return nap();

  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count: dayCount } = await supabase
    .from("ai_import_logs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", authorId)
    .gte("created_at", dayAgo);
  if ((dayCount ?? 0) >= DAILY_EXTRACT_CAP) {
    return {
      error: "Three for today. Drop another tomorrow.",
      story,
      hintSlug: hintSlug ?? undefined,
    };
  }

  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);
  const { data: monthRows } = await supabase
    .from("ai_import_logs")
    .select("estimated_usd")
    .gte("created_at", monthStart.toISOString());
  const spent = (monthRows ?? []).reduce(
    (s, r) => s + Number(r.estimated_usd ?? 0),
    0,
  );
  if (spent >= monthlyCapUsd()) return nap();

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

  async function ensurePlace(opts: {
    name: string;
    category: "eat" | "do" | "shop";
    blurb: string | null;
    zoneType: LumenExtract["zone_type"];
    dishName: string | null;
    dishNote?: string | null;
  }): Promise<string | null> {
    const found = matchPlace(existing, city!.id, opts.name);
    if (found) {
      if (!createdPlaceIds.includes(found.id)) createdPlaceIds.push(found.id);
      return found.id;
    }
    const { data: place, error } = await supabase
      .from("places")
      .insert({
        city_id: city!.id,
        zone_id: zoneIdFor(zones, city!.id, opts.zoneType),
        name: opts.name,
        blurb: opts.blurb,
        category: opts.category,
        status: "draft",
        author_id: authorId,
      })
      .select("id")
      .single();
    if (error || !place) return null;
    createdPlaceIds.push(place.id);
    existing.push({
      id: place.id,
      city_id: city!.id,
      zone_id: null,
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

  if (extract.post_kind === "playbook") {
    const stops = extract.stops.filter((s) => s.name.trim());
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

    const { data: pb, error: pbErr } = await supabase
      .from("playbooks")
      .insert({
        city_id: city.id,
        title: extract.title.trim(),
        narrative: extract.narrative,
        hours_available: extract.hours_available,
        status: "draft",
        author_id: authorId,
      })
      .select("id")
      .single();
    if (pbErr || !pb) {
      await supabase.from("ai_import_logs").insert({
        ...logBase,
        success: false,
        error_code: "write",
        city_id: city.id,
        payload: extract as unknown as Record<string, unknown>,
      });
      return { error: "Couldn’t save the plan. Try again.", story };
    }
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
        return { error: "Couldn’t save stops. Try again.", story };
      }
    }
  } else {
    const name = extract.name?.trim();
    const category = extract.category;
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
      return { error: "Couldn’t save the rec. Try again.", story };
    }
  }

  const { data: logRow, error: logErr } = await supabase
    .from("ai_import_logs")
    .insert({
      ...logBase,
      success: true,
      city_id: city.id,
      payload: extract as unknown as Record<string, unknown>,
      created_place_ids: createdPlaceIds,
      created_playbook_id: playbookId,
    })
    .select("id")
    .single();

  if (logErr || !logRow) {
    return { error: "Draft saved but I lost the review link. Check Dashboard." };
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
