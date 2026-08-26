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

  if (status === "published") {
    const { data: stops } = await supabase
      .from("playbook_stops")
      .select("place_id")
      .eq("playbook_id", playbookId);
    const placeIds = [
      ...new Set(
        (stops ?? [])
          .map((s) => s.place_id)
          .filter((id): id is string => Boolean(id)),
      ),
    ];
    if (placeIds.length) {
      await supabase
        .from("places")
        .update({ status: "published" })
        .in("id", placeIds)
        .eq("author_id", profile.id)
        .neq("status", "hidden");
    }
  }

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
    if (city?.slug) {
      revalidatePath(`/cities/${city.slug}`);
      revalidatePath(`/cities/${city.slug}/eat`);
      revalidatePath(`/cities/${city.slug}/do`);
      revalidatePath(`/cities/${city.slug}/buy`);
      revalidatePath(`/cities/${city.slug}/layovers`);
    }
  }

  revalidatePath(`/playbooks/${playbookId}`);
  revalidatePath("/cities");
  revalidatePath("/dashboard");
  return {
    success:
      status === "published"
        ? "Live on the city — recs too."
        : "Saved as draft (only you).",
  };
}

export async function deletePlaybook(
  playbookId: string,
): Promise<PlaybookFormState> {
  const profile = await getProfile();
  if (!profile || profile.status === "suspended") {
    return { error: "You must be logged in." };
  }
  const supabase = await createClient();
  const { data: pb } = await supabase
    .from("playbooks")
    .select("id, city_id, author_id")
    .eq("id", playbookId)
    .maybeSingle();
  if (!pb) return { error: "Plan not found." };
  if (profile.role !== "admin" && pb.author_id !== profile.id) {
    return { error: "Not your plan." };
  }
  const { data: city } = pb.city_id
    ? await supabase
        .from("cities")
        .select("slug")
        .eq("id", pb.city_id)
        .maybeSingle()
    : { data: null };
  const { error } = await supabase.from("playbooks").delete().eq("id", playbookId);
  if (error) return { error: error.message };
  revalidatePath("/cities");
  revalidatePath("/dashboard");
  if (city?.slug) {
    revalidatePath(`/cities/${city.slug}`);
    revalidatePath(`/cities/${city.slug}/layovers`);
  }
  redirect(city?.slug ? `/cities/${city.slug}` : "/cities");
}

export async function savePlaybookStops(
  playbookId: string,
  orderedIds: string[],
): Promise<PlaybookFormState> {
  const profile = await getProfile();
  if (!profile || profile.status === "suspended") {
    return { error: "You must be logged in." };
  }
  if (orderedIds.length > 4) return { error: "Four stops is the cap." };
  const supabase = await createClient();
  const { data: pb } = await supabase
    .from("playbooks")
    .select("id, author_id, city_id")
    .eq("id", playbookId)
    .maybeSingle();
  if (!pb) return { error: "Plan not found." };
  if (profile.role !== "admin" && pb.author_id !== profile.id) {
    return { error: "Not your plan." };
  }
  const { data: existing } = await supabase
    .from("playbook_stops")
    .select("id")
    .eq("playbook_id", playbookId);
  const keep = new Set(orderedIds);
  const toDrop = (existing ?? []).map((s) => s.id).filter((id) => !keep.has(id));
  if (toDrop.length) {
    await supabase.from("playbook_stops").delete().in("id", toDrop);
  }
  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabase
      .from("playbook_stops")
      .update({ position: i + 1 })
      .eq("id", orderedIds[i])
      .eq("playbook_id", playbookId);
    if (error) return { error: error.message };
  }
  revalidatePath(`/playbooks/${playbookId}`);
  revalidatePath("/dashboard");
  if (pb.city_id) {
    const { data: city } = await supabase
      .from("cities")
      .select("slug")
      .eq("id", pb.city_id)
      .maybeSingle();
    if (city?.slug) revalidatePath(`/cities/${city.slug}`);
  }
  return { success: "Stops updated. Recs are unchanged." };
}
