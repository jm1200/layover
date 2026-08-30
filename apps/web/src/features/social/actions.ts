"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/features/auth/get-profile";
import { refusePublicCopy } from "@/features/ai-import/moderate";
import { socialTablesError } from "@/features/social/queries";

export type SocialState = { error?: string; success?: string };

function revalidateTarget(
  kind: "place" | "playbook",
  id: string,
) {
  if (kind === "place") revalidatePath(`/places/${id}`);
  else revalidatePath(`/playbooks/${id}`);
}

export async function toggleLike(
  kind: "place" | "playbook",
  id: string,
): Promise<SocialState> {
  const profile = await getProfile();
  if (!profile || profile.status === "suspended") {
    return { error: "Log in to like." };
  }
  const supabase = await createClient();
  const col = kind === "place" ? "place_id" : "playbook_id";
  const { data: existing, error: findErr } = await supabase
    .from("likes")
    .select("id")
    .eq(col, id)
    .eq("user_id", profile.id)
    .maybeSingle();
  if (findErr) return { error: socialTablesError(findErr.message) };

  if (existing) {
    const { error } = await supabase.from("likes").delete().eq("id", existing.id);
    if (error) return { error: socialTablesError(error.message) };
    revalidateTarget(kind, id);
    return { success: "Unliked." };
  }

  const { error } =
    kind === "place"
      ? await supabase.from("likes").insert({ user_id: profile.id, place_id: id })
      : await supabase
          .from("likes")
          .insert({ user_id: profile.id, playbook_id: id });
  if (error) return { error: socialTablesError(error.message) };
  revalidateTarget(kind, id);
  return { success: "Liked." };
}

export async function addComment(
  playbookId: string,
  _prev: SocialState,
  formData: FormData,
): Promise<SocialState> {
  const profile = await getProfile();
  if (!profile || profile.status === "suspended") {
    return { error: "Log in to comment." };
  }
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { error: "Write a note first." };
  if (body.length > 500) return { error: "Keep it under 500 characters." };
  const lodging = refusePublicCopy(body, null);
  if (lodging) return { error: lodging };

  const supabase = await createClient();
  const { error } = await supabase.from("comments").insert({
    playbook_id: playbookId,
    author_id: profile.id,
    body,
  });
  if (error) return { error: socialTablesError(error.message) };
  revalidatePath(`/playbooks/${playbookId}`);
  return { success: "Added." };
}

export async function deleteComment(
  commentId: string,
  playbookId: string,
): Promise<SocialState> {
  const profile = await getProfile();
  if (!profile || profile.status === "suspended") {
    return { error: "Log in first." };
  }
  const supabase = await createClient();
  const { error } = await supabase.from("comments").delete().eq("id", commentId);
  if (error) return { error: socialTablesError(error.message) };
  revalidatePath(`/playbooks/${playbookId}`);
  return { success: "Removed." };
}
