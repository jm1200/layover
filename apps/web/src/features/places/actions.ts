"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/features/auth/get-profile";
import { parseRecKind } from "@/features/places/kind";
import type { ContentStatus } from "@/features/places/types";
import { assertZoneInCity } from "@/features/places/validate";

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
    return { error: "Pick Eat, Do, or Shop." };
  }
  if (!["draft", "published"].includes(status)) {
    return { error: "Invalid status." };
  }

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
    return { error: error?.message ?? "Could not create rec." };
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
        error: `Could not save item: ${dishErr.message}. Rec was not created.`,
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
  if (!kind) return { error: "Pick Eat, Do, or Shop." };
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
  return { success: "Saved." };
}
