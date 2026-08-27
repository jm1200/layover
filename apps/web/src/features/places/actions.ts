"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/features/auth/get-profile";
import { parseRecKind } from "@/features/places/kind";
import type { ContentStatus } from "@/features/places/types";
import { MAX_PLATES } from "@/features/ai-import/schema";
import { refusePublicCopy } from "@/features/ai-import/moderate";
import { assertZoneInCity } from "@/features/places/validate";
import type { Dish } from "@/features/places/types";

export type PlaceFormState = { error?: string; success?: string };

function revalidateContent(citySlug?: string | null) {
  revalidatePath("/cities");
  revalidatePath("/dashboard");
  if (citySlug) revalidatePath(`/cities/${citySlug}`);
}

export async function createPlace(
  _prev: PlaceFormState,
  formData: FormData,
): Promise<PlaceFormState> {
  const profile = await getProfile();
  if (!profile || profile.status === "suspended") {
    return { error: "You must be logged in." };
  }

  const cityId = String(formData.get("city_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const blurb = String(formData.get("blurb") ?? "").trim() || null;
  const kind = parseRecKind(String(formData.get("category") ?? ""));
  const zoneId = String(formData.get("zone_id") ?? "") || null;
  const status = (String(formData.get("status") ?? "draft") ||
    "draft") as ContentStatus;
  const dishName =
    kind === "do" ? "" : String(formData.get("dish_name") ?? "").trim();
  const dishNote = String(formData.get("dish_note") ?? "").trim() || null;

  if (!cityId || !name) {
    return { error: "City and name are required." };
  }
  if (!kind) {
    return { error: "Pick Eat, Do, or Buy." };
  }
  if (!["draft", "published"].includes(status)) {
    return { error: "Invalid status." };
  }
  const lodging = refusePublicCopy(name, blurb);
  if (lodging) return { error: lodging };

  const supabase = await createClient();

  const zoneErr = await assertZoneInCity(supabase, cityId, zoneId || null);
  if (zoneErr) return { error: zoneErr };

  const { data: place, error } = await supabase
    .from("places")
    .insert({
      city_id: cityId,
      zone_id: zoneId || null,
      name,
      blurb,
      category: kind,
      status,
      author_id: profile.id,
    })
    .select("id")
    .single();

  if (error || !place) {
    return { error: error?.message ?? "Could not create this." };
  }

  if (dishName) {
    const { error: dishErr } = await supabase.from("dishes").insert({
      place_id: place.id,
      name: dishName,
      note: dishNote,
      sort_order: 1,
    });
    if (dishErr) {
      await supabase.from("places").delete().eq("id", place.id);
      return {
        error: `Could not save item: ${dishErr.message}. Nothing was created.`,
      };
    }
  }

  const { data: city } = await supabase
    .from("cities")
    .select("slug")
    .eq("id", cityId)
    .maybeSingle();

  revalidateContent(city?.slug);
  revalidatePath(`/places/${place.id}`);
  redirect(`/places/${place.id}`);
}

export async function updatePlace(
  placeId: string,
  _prev: PlaceFormState,
  formData: FormData,
): Promise<PlaceFormState> {
  const profile = await getProfile();
  if (!profile || profile.status === "suspended") {
    return { error: "You must be logged in." };
  }

  const cityId = String(formData.get("city_id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const blurb = String(formData.get("blurb") ?? "").trim() || null;
  const kind = parseRecKind(String(formData.get("category") ?? ""));
  const zoneId = String(formData.get("zone_id") ?? "") || null;
  const status = String(formData.get("status") ?? "draft") as ContentStatus;

  if (!name) return { error: "Name is required." };
  if (!cityId) return { error: "City is required." };
  if (!kind) return { error: "Pick Eat, Do, or Buy." };
  if (!["draft", "published", "hidden"].includes(status)) {
    return { error: "Invalid status." };
  }
  if (status === "hidden" && profile.role !== "admin") {
    return { error: "Only admins can hide content." };
  }
  if (status !== "hidden" && !["draft", "published"].includes(status)) {
    return { error: "Invalid status." };
  }
  if (
    profile.role !== "admin" &&
    !["draft", "published"].includes(status)
  ) {
    return { error: "Invalid status for your role." };
  }
  const lodging = refusePublicCopy(name, blurb);
  if (lodging) return { error: lodging };

  const supabase = await createClient();

  const zoneErr = await assertZoneInCity(supabase, cityId, zoneId || null);
  if (zoneErr) return { error: zoneErr };

  const { error } = await supabase
    .from("places")
    .update({
      city_id: cityId,
      name,
      blurb,
      category: kind,
      zone_id: zoneId || null,
      status,
    })
    .eq("id", placeId);

  if (error) return { error: error.message };

  const { data: city } = await supabase
    .from("cities")
    .select("slug")
    .eq("id", cityId)
    .maybeSingle();

  revalidatePath(`/places/${placeId}`);
  revalidateContent(city?.slug);
  redirect(`/places/${placeId}`);
}

export async function attachPlaceStill(
  placeId: string,
  url: string,
  source: "user" | "ai",
): Promise<PlaceFormState & { imageUrl?: string }> {
  const profile = await getProfile();
  if (!profile || profile.status === "suspended") {
    return { error: "Log in first." };
  }
  const supabase = await createClient();
  const { data: place } = await supabase
    .from("places")
    .select("id, author_id")
    .eq("id", placeId)
    .maybeSingle();
  if (!place) return { error: "Not found." };
  if (profile.role !== "admin" && place.author_id !== profile.id) {
    return { error: "Not yours." };
  }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const ours =
    url.startsWith("/") ||
    (supabaseUrl &&
      url.startsWith(supabaseUrl) &&
      url.includes("/place-stills/"));
  if (!ours) return { error: "Bad image URL." };
  const { error } = await supabase
    .from("places")
    .update({
      image_url: url,
      image_source: source,
      want_ai_still: false,
    })
    .eq("id", placeId);
  if (error) return { error: error.message };
  await rememberInAlbum(supabase, placeId, url);
  revalidatePath(`/places/${placeId}`);
  revalidatePath("/dashboard");
  revalidatePath("/cities");
  return { success: "Hero saved.", imageUrl: url };
}

const MAX_REC_PHOTOS = 3;

export async function rememberInAlbum(
  supabase: Awaited<ReturnType<typeof createClient>>,
  placeId: string,
  url: string,
): Promise<void> {
  const { data: already } = await supabase
    .from("place_photos")
    .select("id")
    .eq("place_id", placeId)
    .eq("image_url", url)
    .maybeSingle();
  if (already) return;
  const counted = await supabase
    .from("place_photos")
    .select("id", { count: "exact", head: true })
    .eq("place_id", placeId);
  if (counted.error) return;
  if ((counted.count ?? 0) >= MAX_REC_PHOTOS) return;
  await supabase.from("place_photos").insert({
    place_id: placeId,
    image_url: url,
    sort_order: (counted.count ?? 0) + 1,
  });
}

function albumMissing(message?: string): string {
  if (
    message &&
    /place_photos|schema cache/i.test(message)
  ) {
    return "Photo album isn’t in the database yet. Paste 016_place_photos.sql in the Supabase SQL Editor, then try again.";
  }
  return message ?? "Couldn’t save that photo.";
}

export async function addPlacePhoto(
  placeId: string,
  url: string,
): Promise<PlaceFormState & { photoId?: string; imageUrl?: string }> {
  const profile = await getProfile();
  if (!profile || profile.status === "suspended") {
    return { error: "Log in first." };
  }
  const supabase = await createClient();
  const { data: place } = await supabase
    .from("places")
    .select("id, author_id, image_url")
    .eq("id", placeId)
    .maybeSingle();
  if (!place) return { error: "Not found." };
  if (profile.role !== "admin" && place.author_id !== profile.id) {
    return { error: "Not yours." };
  }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const ours =
    url.startsWith("/") ||
    (supabaseUrl &&
      url.startsWith(supabaseUrl) &&
      url.includes("/place-stills/"));
  if (!ours) return { error: "Bad image URL." };
  const counted = await supabase
    .from("place_photos")
    .select("id", { count: "exact", head: true })
    .eq("place_id", placeId);
  if (counted.error) {
    return { error: albumMissing(counted.error.message) };
  }
  if ((counted.count ?? 0) >= MAX_REC_PHOTOS) {
    return { error: "Three photos is enough." };
  }
  const { data: photo, error } = await supabase
    .from("place_photos")
    .insert({
      place_id: placeId,
      image_url: url,
      sort_order: (counted.count ?? 0) + 1,
    })
    .select("id")
    .single();
  if (error || !photo) {
    return { error: albumMissing(error?.message) };
  }
  if (!place.image_url) {
    await supabase
      .from("places")
      .update({ image_url: url, image_source: "user", want_ai_still: false })
      .eq("id", placeId);
  }
  revalidatePath(`/places/${placeId}`);
  revalidatePath("/dashboard");
  revalidatePath("/cities");
  return { success: "Photo added.", photoId: photo.id, imageUrl: url };
}

export async function removePlacePhoto(
  placeId: string,
  photoId: string,
): Promise<PlaceFormState> {
  const profile = await getProfile();
  if (!profile || profile.status === "suspended") {
    return { error: "Log in first." };
  }
  const supabase = await createClient();
  const { data: place } = await supabase
    .from("places")
    .select("id, author_id, image_url")
    .eq("id", placeId)
    .maybeSingle();
  if (!place) return { error: "Not found." };
  if (profile.role !== "admin" && place.author_id !== profile.id) {
    return { error: "Not yours." };
  }
  const { data: photo } = await supabase
    .from("place_photos")
    .select("id, image_url")
    .eq("id", photoId)
    .eq("place_id", placeId)
    .maybeSingle();
  if (!photo) {
    if (photoId === "legacy-hero") {
      const { data: next } = await supabase
        .from("place_photos")
        .select("image_url")
        .eq("place_id", placeId)
        .order("sort_order")
        .limit(1)
        .maybeSingle();
      await supabase
        .from("places")
        .update({
          image_url: next?.image_url ?? null,
          image_source: next ? "user" : null,
        })
        .eq("id", placeId);
      revalidatePath(`/places/${placeId}`);
      return { success: "Photo removed." };
    }
    return { error: "Photo not found." };
  }
  const { error } = await supabase
    .from("place_photos")
    .delete()
    .eq("id", photoId);
  if (error) return { error: error.message };
  if (place.image_url === photo.image_url) {
    const { data: next } = await supabase
      .from("place_photos")
      .select("image_url")
      .eq("place_id", placeId)
      .order("sort_order")
      .limit(1)
      .maybeSingle();
    await supabase
      .from("places")
      .update({
        image_url: next?.image_url ?? null,
        image_source: next ? "user" : null,
      })
      .eq("id", placeId);
  }
  await supabase
    .from("dishes")
    .update({ image_url: null })
    .eq("place_id", placeId)
    .eq("image_url", photo.image_url);
  revalidatePath(`/places/${placeId}`);
  revalidatePath("/dashboard");
  revalidatePath("/cities");
  return { success: "Photo removed." };
}

export async function addPlaceDish(
  placeId: string,
  name: string,
): Promise<PlaceFormState & { dish?: Dish }> {
  const profile = await getProfile();
  if (!profile || profile.status === "suspended") {
    return { error: "Log in first." };
  }
  const n = name.trim();
  if (!n) return { error: "Name the plate." };
  const lodging = refusePublicCopy(n, null);
  if (lodging) return { error: lodging };
  const supabase = await createClient();
  const { data: place } = await supabase
    .from("places")
    .select("id, author_id")
    .eq("id", placeId)
    .maybeSingle();
  if (!place) return { error: "Not found." };
  if (profile.role !== "admin" && place.author_id !== profile.id) {
    return { error: "Not yours." };
  }
  const { count } = await supabase
    .from("dishes")
    .select("id", { count: "exact", head: true })
    .eq("place_id", placeId);
  if ((count ?? 0) >= MAX_PLATES) {
    return { error: "Three plates is enough." };
  }
  const { data: dish, error } = await supabase
    .from("dishes")
    .insert({
      place_id: placeId,
      name: n,
      sort_order: (count ?? 0) + 1,
    })
    .select("id, place_id, name, note, sort_order, image_url")
    .single();
  if (error || !dish) {
    return { error: error?.message ?? "Couldn’t add that plate." };
  }
  revalidatePath(`/places/${placeId}`);
  return { success: "Plate added.", dish: dish as Dish };
}

export async function updatePlaceDish(
  dishId: string,
  name: string,
): Promise<PlaceFormState & { dish?: Dish }> {
  const profile = await getProfile();
  if (!profile || profile.status === "suspended") {
    return { error: "Log in first." };
  }
  const n = name.trim();
  if (!n) return { error: "Name the plate." };
  const lodging = refusePublicCopy(n, null);
  if (lodging) return { error: lodging };
  const supabase = await createClient();
  const { data: dish } = await supabase
    .from("dishes")
    .select("id, place_id")
    .eq("id", dishId)
    .maybeSingle();
  if (!dish) return { error: "Plate not found." };
  const { data: place } = await supabase
    .from("places")
    .select("id, author_id")
    .eq("id", dish.place_id)
    .maybeSingle();
  if (!place) return { error: "Not found." };
  if (profile.role !== "admin" && place.author_id !== profile.id) {
    return { error: "Not yours." };
  }
  const { data: updated, error } = await supabase
    .from("dishes")
    .update({ name: n })
    .eq("id", dishId)
    .select("id, place_id, name, note, sort_order, image_url")
    .single();
  if (error || !updated) {
    return { error: error?.message ?? "Couldn’t rename that plate." };
  }
  revalidatePath(`/places/${dish.place_id}`);
  return { success: "Plate renamed.", dish: updated as Dish };
}

export async function deletePlaceDish(
  dishId: string,
): Promise<PlaceFormState> {
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
  if (!dish) return { error: "Plate not found." };
  const { data: place } = await supabase
    .from("places")
    .select("id, author_id")
    .eq("id", dish.place_id)
    .maybeSingle();
  if (!place) return { error: "Not found." };
  if (profile.role !== "admin" && place.author_id !== profile.id) {
    return { error: "Not yours." };
  }
  const { error } = await supabase.from("dishes").delete().eq("id", dishId);
  if (error) return { error: error.message };
  revalidatePath(`/places/${dish.place_id}`);
  return { success: "Plate removed." };
}

export async function attachDishStill(
  dishId: string,
  url: string,
): Promise<PlaceFormState & { imageUrl?: string }> {
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
  if (!dish) return { error: "Plate not found." };
  const { data: place } = await supabase
    .from("places")
    .select("id, author_id")
    .eq("id", dish.place_id)
    .maybeSingle();
  if (!place) return { error: "Not found." };
  if (profile.role !== "admin" && place.author_id !== profile.id) {
    return { error: "Not yours." };
  }
  const { data: rec } = await supabase
    .from("places")
    .select("image_url")
    .eq("id", place.id)
    .maybeSingle();
  if (rec?.image_url && rec.image_url.split("?")[0] === url.split("?")[0]) {
    return { error: "That’s the place shot. Upload the plate." };
  }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const ours =
    url.startsWith("/") ||
    (supabaseUrl &&
      url.startsWith(supabaseUrl) &&
      url.includes("/place-stills/"));
  if (!ours) return { error: "Bad image URL." };
  const { error } = await supabase
    .from("dishes")
    .update({ image_url: url })
    .eq("id", dishId);
  if (error) return { error: error.message };
  revalidatePath(`/places/${dish.place_id}`);
  return { success: "Plate photo saved.", imageUrl: url };
}

export async function deletePlace(
  placeId: string,
): Promise<PlaceFormState> {
  const profile = await getProfile();
  if (!profile || profile.status === "suspended") {
    return { error: "You must be logged in." };
  }
  const supabase = await createClient();
  const { data: place } = await supabase
    .from("places")
    .select("id, city_id, author_id")
    .eq("id", placeId)
    .maybeSingle();
  if (!place) return { error: "Not found." };
  if (profile.role !== "admin" && place.author_id !== profile.id) {
    return { error: "Not yours." };
  }
  const { data: city } = await supabase
    .from("cities")
    .select("slug")
    .eq("id", place.city_id)
    .maybeSingle();
  const { error } = await supabase.from("places").delete().eq("id", placeId);
  if (error) return { error: error.message };
  revalidateContent(city?.slug);
  redirect(city?.slug ? `/cities/${city.slug}` : "/cities");
}
