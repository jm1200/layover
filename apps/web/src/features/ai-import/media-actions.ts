"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/features/auth/get-profile";
import {
  EXTRACT_MODEL,
  MAX_SEARCH_CALLS,
  STILL_MODEL,
  STILL_USD,
  estimateUsd,
  searchCallsFromResponse,
  xaiClient,
} from "@/lib/ai/xai";
import { refusePublicCopy } from "@/features/ai-import/moderate";
import { aiBlocked } from "@/features/ai-import/spend";
import { CITY_HERO } from "@/features/places/rec-media";
import { listCities } from "@/features/places/queries";
import { MAX_PLATES } from "@/features/ai-import/schema";
import { rememberInAlbum } from "@/features/places/actions";
import type { Dish, Place } from "@/features/places/types";

export type PlaceMediaState = {
  error?: string;
  success?: string;
  blurb?: string;
  imageUrl?: string;
  dish?: Dish;
};

async function ownPlace(placeId: string) {
  const profile = await getProfile();
  if (!profile || profile.status === "suspended") {
    return { ok: false as const, error: "Log in first." };
  }
  const supabase = await createClient();
  const full = await supabase
    .from("places")
    .select(
      "id, name, blurb, category, city_id, author_id, image_url, image_source, status, want_ai_still",
    )
    .eq("id", placeId)
    .maybeSingle();
  const { data: place } = full.error
    ? await supabase
        .from("places")
        .select(
          "id, name, blurb, category, city_id, author_id, image_url, image_source, status",
        )
        .eq("id", placeId)
        .maybeSingle()
    : full;
  if (!place) return { ok: false as const, error: "Not found." };
  if (profile.role !== "admin" && place.author_id !== profile.id) {
    return { ok: false as const, error: "Not yours." };
  }
  return { ok: true as const, profile, supabase, place };
}

export async function savePlaceReview(
  placeId: string,
  _prev: PlaceMediaState,
  formData: FormData,
): Promise<PlaceMediaState> {
  const ctx = await ownPlace(placeId);
  if (!ctx.ok) return { error: ctx.error };
  const blurb = String(formData.get("blurb") ?? "").trim() || null;
  const lodging = refusePublicCopy(ctx.place.name, blurb);
  if (lodging) return { error: lodging };
  const want =
    String(formData.get("want_ai_still") ?? "") === "true" &&
    !ctx.place.image_url;
  const { error } = await ctx.supabase
    .from("places")
    .update({ blurb, want_ai_still: want })
    .eq("id", placeId);
  if (error) return { error: error.message };
  revalidatePath(`/places/${placeId}`);
  revalidatePath("/dashboard");
  return { success: "Saved.", blurb: blurb ?? "" };
}

export async function attachPlaceImage(
  placeId: string,
  url: string,
  source: "user" | "ai",
): Promise<PlaceMediaState> {
  const ctx = await ownPlace(placeId);
  if (!ctx.ok) return { error: ctx.error };
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const ours =
    url.startsWith("/") ||
    (supabaseUrl && url.startsWith(supabaseUrl) && url.includes("/place-stills/"));
  if (!ours) return { error: "Bad image URL." };
  const { error } = await ctx.supabase
    .from("places")
    .update({
      image_url: url,
      image_source: source,
      want_ai_still: false,
    })
    .eq("id", placeId);
  if (error) return { error: error.message };
  await rememberInAlbum(ctx.supabase, placeId, url);
  revalidatePath(`/places/${placeId}`);
  revalidatePath("/dashboard");
  revalidatePath("/cities");
  return { success: source === "ai" ? "Still’s up." : "Photo saved." };
}

export async function addReviewDish(
  placeId: string,
  name: string,
): Promise<PlaceMediaState> {
  const ctx = await ownPlace(placeId);
  if (!ctx.ok) return { error: ctx.error };
  const n = name.trim();
  if (!n) return { error: "Name it." };
  const lodging = refusePublicCopy(n, null);
  if (lodging) return { error: lodging };
  const { count } = await ctx.supabase
    .from("dishes")
    .select("id", { count: "exact", head: true })
    .eq("place_id", placeId);
  if ((count ?? 0) >= MAX_PLATES) {
    return { error: `Three is enough.` };
  }
  const { data: dish, error } = await ctx.supabase
    .from("dishes")
    .insert({
      place_id: placeId,
      name: n,
      sort_order: (count ?? 0) + 1,
    })
    .select("id, place_id, name, note, sort_order, image_url")
    .single();
  if (error || !dish) return { error: error?.message ?? "Couldn’t add that." };
  revalidatePath(`/places/${placeId}`);
  return { success: "Added.", dish: dish as Dish };
}

export async function attachDishImage(
  dishId: string,
  url: string,
): Promise<PlaceMediaState> {
  const profile = await getProfile();
  if (!profile || profile.status === "suspended") {
    return { error: "Log in first." };
  }
  const supabase = await createClient();
  const { data: dish } = await supabase
    .from("dishes")
    .select("id, place_id")
    .eq("id", dishId)
    .maybeSingle();
  if (!dish) return { error: "Not found." };
  const ctx = await ownPlace(dish.place_id);
  if (!ctx.ok) return { error: ctx.error };
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const ours =
    url.startsWith("/") ||
    (supabaseUrl && url.startsWith(supabaseUrl) && url.includes("/place-stills/"));
  if (!ours) return { error: "Bad image URL." };
  const { error } = await supabase
    .from("dishes")
    .update({ image_url: url })
    .eq("id", dishId);
  if (error) return { error: error.message };
  revalidatePath(`/places/${dish.place_id}`);
  return { success: "Photo saved.", imageUrl: url };
}

async function generatePlaceStillNow(
  ctx: Extract<Awaited<ReturnType<typeof ownPlace>>, { ok: true }>,
): Promise<PlaceMediaState> {
  if (ctx.place.image_url) {
    return { success: "Already has a photo.", imageUrl: ctx.place.image_url };
  }
  if (ctx.place.image_source === "ai") {
    return { error: "One generated picture each — upload yours to replace it." };
  }
  const blocked = await aiBlocked(ctx.supabase, STILL_USD);
  if (blocked) return { error: blocked };
  const client = xaiClient();
  if (!client) return { error: "Lumen’s taking a nap." };

  const cities = await listCities();
  const city = cities.find((c) => c.id === ctx.place.city_id);
  const prompt = [
    "Photoreal still photograph, no text, no watermark, no logos.",
    "PG-13. Not porn, not gore.",
    `Place: ${ctx.place.name}.`,
    city ? `City: ${city.name}.` : "",
    ctx.place.blurb ?? "",
    "Mood: you want to be there tonight. Editorial travel photo, natural light.",
  ]
    .filter(Boolean)
    .join(" ");

  try {
    const img = await client.images.generate({
      model: STILL_MODEL,
      prompt,
    });
    const remote = img.data?.[0]?.url;
    if (!remote) return { error: "No still came back." };
    const bin = await fetch(remote);
    if (!bin.ok) return { error: "Couldn’t download the still." };
    const bytes = Buffer.from(await bin.arrayBuffer());
    const path = `${ctx.profile.id}/${ctx.place.id}.jpg`;
    const { error: upErr } = await ctx.supabase.storage
      .from("place-stills")
      .upload(path, bytes, {
        contentType: "image/jpeg",
        upsert: true,
      });
    if (upErr) return { error: "Couldn’t store the still." };
    const { data: pub } = ctx.supabase.storage
      .from("place-stills")
      .getPublicUrl(path);
    const { error } = await ctx.supabase
      .from("places")
      .update({
        image_url: pub.publicUrl,
        image_source: "ai",
        want_ai_still: false,
      })
      .eq("id", ctx.place.id);
    if (error) return { error: error.message };
    await rememberInAlbum(ctx.supabase, ctx.place.id, pub.publicUrl);
    await ctx.supabase.from("ai_import_logs").insert({
      user_id: ctx.profile.id,
      model: STILL_MODEL,
      success: true,
      error_code: "still",
      estimated_usd: STILL_USD,
      city_id: ctx.place.city_id,
      created_place_ids: [ctx.place.id],
      payload: { place_id: ctx.place.id },
    });
    return {
      success: "Still’s up. Flagged AI.",
      imageUrl: `${pub.publicUrl}?t=${Date.now()}`,
    };
  } catch (e) {
    console.warn("[generatePlaceStill]", e instanceof Error ? e.message : e);
    return { error: "Couldn’t generate. Try again, or upload a photo." };
  }
}

async function generateCityHeroIfNeeded(
  supabase: Awaited<ReturnType<typeof createClient>>,
  profileId: string,
  cityId: string,
): Promise<void> {
  const cities = await listCities();
  const city = cities.find((c) => c.id === cityId);
  if (!city) return;
  if (CITY_HERO[city.slug]) return;
  if (city.image_url) return;
  const blocked = await aiBlocked(supabase, STILL_USD);
  if (blocked) return;
  const client = xaiClient();
  if (!client) return;
  const prompt = [
    `${city.name} at blue hour, cinematic travel-editorial photograph.`,
    city.country ? `${city.country}.` : "",
    "Lived-in city, a place you want to walk tonight, slightly underexposed cobalt sky.",
    "No text, no logos, no watermarks, no postcard close-up of a single landmark.",
  ]
    .filter(Boolean)
    .join(" ");
  try {
    const img = await client.images.generate({
      model: STILL_MODEL,
      prompt,
    });
    const remote = img.data?.[0]?.url;
    if (!remote) return;
    const bin = await fetch(remote);
    if (!bin.ok) return;
    const bytes = Buffer.from(await bin.arrayBuffer());
    const path = `${profileId}/city-${cityId}.jpg`;
    const { error: upErr } = await supabase.storage
      .from("place-stills")
      .upload(path, bytes, { contentType: "image/jpeg", upsert: true });
    if (upErr) return;
    const { data: pub } = supabase.storage
      .from("place-stills")
      .getPublicUrl(path);
    const { error } = await supabase.rpc("lumen_set_city_hero", {
      p_city: cityId,
      p_url: pub.publicUrl,
      p_source: "ai",
    });
    if (error) {
      console.warn("[lumen_set_city_hero]", error.message);
      return;
    }
    await supabase.from("ai_import_logs").insert({
      user_id: profileId,
      model: STILL_MODEL,
      success: true,
      error_code: "city_hero",
      estimated_usd: STILL_USD,
      city_id: cityId,
      payload: { city_id: cityId },
    });
  } catch (e) {
    console.warn("[generateCityHero]", e instanceof Error ? e.message : e);
  }
}

export async function publishReviewed(
  logId: string,
  _prev: PlaceMediaState,
  formData: FormData,
): Promise<PlaceMediaState> {
  const profile = await getProfile();
  if (!profile || profile.status === "suspended") {
    return { error: "Log in first." };
  }
  const supabase = await createClient();
  const { data: log } = await supabase
    .from("ai_import_logs")
    .select(
      "id, user_id, created_place_ids, created_playbook_id, success, city_id",
    )
    .eq("id", logId)
    .maybeSingle();
  if (!log || !log.success) return { error: "Review not found." };
  if (profile.role !== "admin" && log.user_id !== profile.id) {
    return { error: "Not your dump." };
  }

  const placeIds = (log.created_place_ids ?? []) as string[];
  const { data: placeRows } = placeIds.length
    ? await supabase
        .from("places")
        .select(
          "id, name, blurb, category, city_id, author_id, image_url, image_source, status, want_ai_still",
        )
        .in("id", placeIds)
    : { data: [] as Place[] };
  const places = (placeRows ?? []) as Place[];

  for (const p of places) {
    if (p.author_id !== profile.id && profile.role !== "admin") continue;
    if (!p.image_url && !p.want_ai_still) {
      return {
        error: `Need a photo for ${p.name} — upload one, or leave AI still checked.`,
      };
    }
  }

  const pending = places.filter(
    (p) =>
      !p.image_url &&
      p.want_ai_still &&
      (p.author_id === profile.id || profile.role === "admin"),
  );
  const cityId = log.city_id ?? places[0]?.city_id ?? null;
  const cities = await listCities();
  const city = cityId ? cities.find((c) => c.id === cityId) : undefined;
  const heroNeeded = Boolean(
    city && !CITY_HERO[city.slug] && !city.image_url,
  );
  const extra = pending.length * STILL_USD + (heroNeeded ? STILL_USD : 0);
  const blocked = await aiBlocked(supabase, extra);
  if (blocked && extra > 0) return { error: blocked };

  for (const p of pending) {
    const ctx = await ownPlace(p.id);
    if (!ctx.ok) return { error: ctx.error };
    const still = await generatePlaceStillNow(ctx);
    if (still.error) return { error: still.error };
  }

  if (heroNeeded && cityId) {
    await generateCityHeroIfNeeded(supabase, profile.id, cityId);
  }

  if (log.created_playbook_id) {
    const title = String(formData.get("title") ?? "").trim();
    const narrative = String(formData.get("narrative") ?? "").trim() || null;
    const hoursRaw = String(formData.get("hours_available") ?? "").trim();
    const hours = hoursRaw ? Number.parseInt(hoursRaw, 10) : null;
    if (!narrative) {
      return { error: "The day needs a blurb — paste what you dumped." };
    }
    const lodging = refusePublicCopy(title || "day", narrative);
    if (lodging) return { error: lodging };
    const patch: Record<string, unknown> = { status: "published" };
    if (title) patch.title = title;
    patch.narrative = narrative;
    if (Number.isFinite(hours)) patch.hours_available = hours;
    const { error } = await supabase
      .from("playbooks")
      .update(patch)
      .eq("id", log.created_playbook_id);
    if (error) return { error: error.message };
    if (placeIds.length) {
      const { error: pErr } = await supabase
        .from("places")
        .update({ status: "published" })
        .in("id", placeIds)
        .eq("author_id", profile.id)
        .neq("status", "hidden");
      if (pErr) return { error: pErr.message };
    }
  } else if (placeIds.length) {
    const { error } = await supabase
      .from("places")
      .update({ status: "published" })
      .in("id", placeIds)
      .eq("author_id", profile.id)
      .neq("status", "hidden");
    if (error) return { error: error.message };
  }

  const slug = city?.slug;
  revalidatePath("/cities");
  revalidatePath("/dashboard");
  if (slug) {
    revalidatePath(`/cities/${slug}`);
    revalidatePath(`/cities/${slug}/eat`);
    revalidatePath(`/cities/${slug}/do`);
    revalidatePath(`/cities/${slug}/buy`);
    revalidatePath(`/cities/${slug}/layovers`);
  }
  if (log.created_playbook_id) {
    revalidatePath(`/playbooks/${log.created_playbook_id}`);
    redirect(`/playbooks/${log.created_playbook_id}`);
  }
  if (placeIds[0]) {
    revalidatePath(`/places/${placeIds[0]}`);
    redirect(`/places/${placeIds[0]}`);
  }
  redirect(slug ? `/cities/${slug}` : "/cities");
}

/** Optional rewrite — extract already writes the blurb. Kept for holes. */
export async function sellPlaceBlurb(
  placeId: string,
): Promise<PlaceMediaState> {
  const ctx = await ownPlace(placeId);
  if (!ctx.ok) return { error: ctx.error };
  if (ctx.place.status !== "draft" && ctx.profile.role !== "admin") {
    return { error: "That’s already live." };
  }
  const blocked = await aiBlocked(ctx.supabase);
  if (blocked) return { error: blocked };
  const client = xaiClient();
  if (!client) return { error: "Lumen’s taking a nap." };

  const cities = await listCities();
  const city = cities.find((c) => c.id === ctx.place.city_id);
  const cityLabel = city
    ? `${city.name}${city.airport_code ? ` (${city.airport_code})` : ""}`
    : "this city";

  try {
    const response = await client.responses.create({
      model: EXTRACT_MODEL,
      tools: [{ type: "web_search" }],
      input: [
        {
          role: "system",
          content: `You are Lumen. Rewrite a layover rec blurb so it SELLS the place. 2–4 sentences. Specific: what it is, a hook (history, dish, room, water, send), where (street or neighborhood). Keep any crew note they already gave (dishes, dip, filet). Never "classic/nice/great/awesome spot in the X." PG-13. No hotels. Output only the blurb text, no quotes or preamble.`,
        },
        {
          role: "user",
          content: `City: ${cityLabel}\nPlace: ${ctx.place.name}\nKind: ${ctx.place.category ?? "do"}\nCurrent blurb:\n${ctx.place.blurb ?? "(none)"}`,
        },
      ],
      max_tool_calls: MAX_SEARCH_CALLS,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    const blurb = (response.output_text ?? "").trim();
    if (blurb.length < 40) return { error: "Couldn’t write that. Try an edit." };
    const { error } = await ctx.supabase
      .from("places")
      .update({ blurb })
      .eq("id", placeId);
    if (error) return { error: error.message };
    const usage = response.usage as
      | { input_tokens?: number; output_tokens?: number }
      | undefined;
    const searchCalls = searchCallsFromResponse(response);
    await ctx.supabase.from("ai_import_logs").insert({
      user_id: ctx.profile.id,
      model: EXTRACT_MODEL,
      success: true,
      error_code: "sell_blurb",
      input_chars: (ctx.place.blurb ?? "").length,
      input_tokens: usage?.input_tokens ?? null,
      output_tokens: usage?.output_tokens ?? null,
      search_calls: searchCalls,
      estimated_usd: estimateUsd(
        usage?.input_tokens ?? 0,
        usage?.output_tokens ?? 0,
        searchCalls,
      ),
      city_id: ctx.place.city_id,
      payload: { place_id: placeId },
    });
    revalidatePath(`/places/${placeId}`);
    revalidatePath("/dashboard");
    return { success: "Rewrote the blurb.", blurb };
  } catch {
    return { error: "Lookup failed. Try again." };
  }
}
