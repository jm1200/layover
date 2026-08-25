"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/features/auth/get-profile";
import {
  EXTRACT_MODEL,
  getXaiKey,
  monthlyCapUsd,
  STILL_MODEL,
  STILL_USD,
  xaiClient,
} from "@/lib/ai/xai";
import { lumenOffersStill } from "@/features/ai-import/quality";
import { listCities } from "@/features/places/queries";

export type PlaceMediaState = {
  error?: string;
  success?: string;
  blurb?: string;
  imageUrl?: string;
};

async function ownDraftPlace(placeId: string) {
  const profile = await getProfile();
  if (!profile || profile.status === "suspended") {
    return { ok: false as const, error: "Log in first." };
  }
  const supabase = await createClient();
  const { data: place } = await supabase
    .from("places")
    .select(
      "id, name, blurb, category, city_id, author_id, image_url, image_source, status",
    )
    .eq("id", placeId)
    .maybeSingle();
  if (!place) return { ok: false as const, error: "Rec not found." };
  if (profile.role !== "admin" && place.author_id !== profile.id) {
    return { ok: false as const, error: "Not your rec." };
  }
  return { ok: true as const, profile, supabase, place };
}

async function aiAllowed(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<string | null> {
  if (!getXaiKey()) return "Lumen’s taking a nap.";
  const { data: setting } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "ai_killed")
    .maybeSingle();
  if (setting?.value === "true") return "Lumen’s taking a nap.";
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
  if (spent + STILL_USD > monthlyCapUsd()) return "Lumen’s taking a nap.";
  return null;
}

export async function savePlaceBlurb(
  placeId: string,
  _prev: PlaceMediaState,
  formData: FormData,
): Promise<PlaceMediaState> {
  const ctx = await ownDraftPlace(placeId);
  if (!ctx.ok) return { error: ctx.error };
  const blurb = String(formData.get("blurb") ?? "").trim() || null;
  const { error } = await ctx.supabase
    .from("places")
    .update({ blurb })
    .eq("id", placeId);
  if (error) return { error: error.message };
  revalidatePath(`/places/${placeId}`);
  revalidatePath("/dashboard");
  return { success: "Saved the blurb." };
}

export async function attachPlaceImage(
  placeId: string,
  url: string,
  source: "user" | "ai",
): Promise<PlaceMediaState> {
  const ctx = await ownDraftPlace(placeId);
  if (!ctx.ok) return { error: ctx.error };
  if (!url.startsWith("https://") && !url.startsWith("/")) {
    return { error: "Bad image URL." };
  }
  const { error } = await ctx.supabase
    .from("places")
    .update({ image_url: url, image_source: source })
    .eq("id", placeId);
  if (error) return { error: error.message };
  revalidatePath(`/places/${placeId}`);
  revalidatePath("/dashboard");
  revalidatePath("/cities");
  return { success: source === "ai" ? "Still’s up." : "Photo saved." };
}

/** Lumen rewrites a limp blurb so it sells. Uses lookup. */
export async function sellPlaceBlurb(
  placeId: string,
): Promise<PlaceMediaState> {
  const ctx = await ownDraftPlace(placeId);
  if (!ctx.ok) return { error: ctx.error };
  const blocked = await aiAllowed(ctx.supabase);
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
    });
    const blurb = (response.output_text ?? "").trim();
    if (blurb.length < 40) return { error: "Couldn’t make that sell. Try again." };
    const { error } = await ctx.supabase
      .from("places")
      .update({ blurb })
      .eq("id", placeId);
    if (error) return { error: error.message };
    const usage = response.usage as
      | { input_tokens?: number; output_tokens?: number }
      | undefined;
    await ctx.supabase.from("ai_import_logs").insert({
      user_id: ctx.profile.id,
      model: EXTRACT_MODEL,
      success: true,
      error_code: "sell_blurb",
      input_chars: (ctx.place.blurb ?? "").length,
      input_tokens: usage?.input_tokens ?? null,
      output_tokens: usage?.output_tokens ?? null,
      estimated_usd: 0.01,
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

/** Lumen generates one still when the rec is worth it. ~2¢. */
export async function generatePlaceStill(
  placeId: string,
): Promise<PlaceMediaState> {
  const ctx = await ownDraftPlace(placeId);
  if (!ctx.ok) return { error: ctx.error };
  if (!lumenOffersStill(ctx.place.blurb)) {
    return {
      error:
        "This rec isn’t selling yet. Make the blurb specific first — then I’ll spend on a still.",
    };
  }
  const blocked = await aiAllowed(ctx.supabase);
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
    const path = `${ctx.profile.id}/${placeId}.jpg`;
    const { error: upErr } = await ctx.supabase.storage
      .from("place-stills")
      .upload(path, bytes, {
        contentType: "image/jpeg",
        upsert: true,
      });
    if (upErr) return { error: upErr.message };
    const { data: pub } = ctx.supabase.storage
      .from("place-stills")
      .getPublicUrl(path);
    const { error } = await ctx.supabase
      .from("places")
      .update({ image_url: pub.publicUrl, image_source: "ai" })
      .eq("id", placeId);
    if (error) return { error: error.message };
    await ctx.supabase.from("ai_import_logs").insert({
      user_id: ctx.profile.id,
      model: STILL_MODEL,
      success: true,
      error_code: "still",
      estimated_usd: STILL_USD,
      city_id: ctx.place.city_id,
      payload: { place_id: placeId },
    });
    revalidatePath(`/places/${placeId}`);
    revalidatePath("/dashboard");
    revalidatePath("/cities");
    return {
      success: "Still’s up. Flagged AI.",
      imageUrl: `${pub.publicUrl}?t=${Date.now()}`,
    };
  } catch (e) {
    const detail = e instanceof Error ? e.message : "Couldn’t generate.";
    return { error: detail };
  }
}
