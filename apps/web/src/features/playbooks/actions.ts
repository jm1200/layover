"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/features/auth/get-profile";
import type { ContentStatus } from "@/features/places/types";
import { assertPlaceInCity } from "@/features/places/validate";

export type PlaybookFormState = { error?: string; success?: string };

export async function createPlaybook(
  _prev: PlaybookFormState,
  formData: FormData,
): Promise<PlaybookFormState> {
  const profile = await getProfile();
  if (!profile || profile.status === "suspended") {
    return { error: "You must be logged in." };
  }

  const cityId = String(formData.get("city_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const narrative = String(formData.get("narrative") ?? "").trim() || null;
  const hoursRaw = String(formData.get("hours_available") ?? "").trim();
  const hours = hoursRaw ? Number.parseInt(hoursRaw, 10) : null;
  const status = (String(formData.get("status") ?? "draft") ||
    "draft") as ContentStatus;

  // Match form: 4 stop slots (server still caps at 4 for consistency)
  const stops: { title: string; body: string; place_id: string | null }[] = [];
  for (let i = 1; i <= 4; i++) {
    const st = String(formData.get(`stop_${i}_title`) ?? "").trim();
    const body = String(formData.get(`stop_${i}_body`) ?? "").trim();
    const placeId = String(formData.get(`stop_${i}_place_id`) ?? "") || null;
    if (st || body || placeId) {
      stops.push({ title: st || `Stop ${i}`, body, place_id: placeId });
    }
  }

  if (!cityId || !title) {
    return { error: "City and title are required." };
  }
  if (!["draft", "published"].includes(status)) {
    return { error: "Invalid status." };
  }

  const supabase = await createClient();

  for (const s of stops) {
    if (!s.place_id) continue;
    const placeErr = await assertPlaceInCity(supabase, cityId, s.place_id);
    if (placeErr) return { error: placeErr };
  }

  const { data: pb, error } = await supabase
    .from("playbooks")
    .insert({
      city_id: cityId,
      title,
      narrative,
      hours_available: Number.isFinite(hours) ? hours : null,
      status,
      author_id: profile.id,
    })
    .select("id")
    .single();

  if (error || !pb) {
    return { error: error?.message ?? "Could not create layover plan." };
  }

  if (stops.length) {
    const { error: stopErr } = await supabase.from("playbook_stops").insert(
      stops.map((s, idx) => ({
        playbook_id: pb.id,
        position: idx + 1,
        title: s.title,
        body: s.body || null,
        place_id: s.place_id || null,
      })),
    );
    if (stopErr) {
      await supabase.from("playbooks").delete().eq("id", pb.id);
      return {
        error: `Could not save stops: ${stopErr.message}. Layover plan was not created.`,
      };
    }
  }

  const { data: city } = await supabase
    .from("cities")
    .select("slug")
    .eq("id", cityId)
    .maybeSingle();

  revalidatePath("/cities");
  revalidatePath("/dashboard");
  if (city?.slug) revalidatePath(`/cities/${city.slug}`);
  revalidatePath(`/playbooks/${pb.id}`);
  redirect(`/playbooks/${pb.id}`);
}

export async function updatePlaybookMeta(
  playbookId: string,
  _prev: PlaybookFormState,
  formData: FormData,
): Promise<PlaybookFormState> {
  const profile = await getProfile();
  if (!profile || profile.status === "suspended") {
    return { error: "You must be logged in." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const narrative = String(formData.get("narrative") ?? "").trim() || null;
  const hoursRaw = String(formData.get("hours_available") ?? "").trim();
  const hours = hoursRaw ? Number.parseInt(hoursRaw, 10) : null;
  const status = String(formData.get("status") ?? "draft") as ContentStatus;

  if (!title) return { error: "Title is required." };
  if (!["draft", "published", "hidden"].includes(status)) {
    return { error: "Invalid status." };
  }
  if (status === "hidden" && profile.role !== "admin") {
    return { error: "Only admins can hide content." };
  }
  if (
    profile.role !== "admin" &&
    !["draft", "published"].includes(status)
  ) {
    return { error: "Invalid status for your role." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("playbooks")
    .update({
      title,
      narrative,
      hours_available: Number.isFinite(hours) ? hours : null,
      status,
    })
    .eq("id", playbookId);

  if (error) return { error: error.message };

  const { data: pb } = await supabase
    .from("playbooks")
    .select("city_id")
    .eq("id", playbookId)
    .maybeSingle();
  if (pb?.city_id) {
    const { data: city } = await supabase
      .from("cities")
      .select("slug")
      .eq("id", pb.city_id)
      .maybeSingle();
    if (city?.slug) revalidatePath(`/cities/${city.slug}`);
  }

  revalidatePath(`/playbooks/${playbookId}`);
  revalidatePath("/cities");
  revalidatePath("/dashboard");
  return { success: "Saved." };
}
