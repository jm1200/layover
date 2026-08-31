"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/features/auth/get-profile";
import { refuseComment } from "@/features/ai-import/moderate";
import { lumenCheckNote } from "@/features/social/lumen-note";
import { socialTablesError } from "@/features/social/queries";
import {
  MAX_COMMENT_PHOTOS,
  type SocialKind,
} from "@/features/social/types";

export type SocialState = { error?: string; success?: string };

function revalidateTarget(kind: SocialKind, id: string) {
  if (kind === "place") revalidatePath(`/places/${id}`);
  else revalidatePath(`/playbooks/${id}`);
}

function stillUrlOurs(url: string): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return Boolean(
    supabaseUrl &&
      url.startsWith(supabaseUrl) &&
      url.includes("/place-stills/") &&
      !url.startsWith("//"),
  );
}

export async function toggleLike(
  kind: SocialKind,
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
  kind: SocialKind,
  id: string,
  _prev: SocialState,
  formData: FormData,
): Promise<SocialState> {
  const profile = await getProfile();
  if (!profile || profile.status === "suspended") {
    return { error: "Log in to leave a note." };
  }
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { error: "Write a note first." };
  if (body.length > 500) return { error: "Keep it under 500 characters." };
  const refused = refuseComment(body);
  if (refused) return { error: refused };

  const photoUrls = formData
    .getAll("photo_url")
    .map((v) => String(v).trim())
    .filter(Boolean)
    .slice(0, MAX_COMMENT_PHOTOS);
  for (const url of photoUrls) {
    if (!stillUrlOurs(url)) return { error: "Bad image URL." };
  }

  const supabase = await createClient();
  const lumen = await lumenCheckNote(supabase, profile.id, body, photoUrls);
  if (lumen) return { error: lumen };

  const inserted =
    kind === "place"
      ? await supabase
          .from("comments")
          .insert({ place_id: id, author_id: profile.id, body })
          .select("id")
          .single()
      : await supabase
          .from("comments")
          .insert({ playbook_id: id, author_id: profile.id, body })
          .select("id")
          .single();
  if (inserted.error || !inserted.data) {
    return { error: socialTablesError(inserted.error?.message) };
  }

  for (const [i, url] of photoUrls.entries()) {
    const { error } = await supabase.from("comment_photos").insert({
      comment_id: inserted.data.id,
      image_url: url,
      sort_order: i + 1,
    });
    if (error) {
      await supabase.from("comments").delete().eq("id", inserted.data.id);
      return { error: socialTablesError(error.message) };
    }
  }

  revalidateTarget(kind, id);
  return { success: "Added." };
}

export async function editComment(
  commentId: string,
  kind: SocialKind,
  id: string,
  bodyRaw: string,
): Promise<SocialState> {
  const profile = await getProfile();
  if (!profile || profile.status === "suspended") {
    return { error: "Log in first." };
  }
  const body = bodyRaw.trim();
  if (!body) return { error: "Write a note first." };
  if (body.length > 500) return { error: "Keep it under 500 characters." };
  const refused = refuseComment(body);
  if (refused) return { error: refused };

  const supabase = await createClient();
  const { data: existing, error: findErr } = await supabase
    .from("comments")
    .select("id, author_id")
    .eq("id", commentId)
    .maybeSingle();
  if (findErr) return { error: socialTablesError(findErr.message) };
  if (!existing) return { error: "Not found." };
  if (profile.role !== "admin" && existing.author_id !== profile.id) {
    return { error: "Not yours." };
  }

  const { data: pics } = await supabase
    .from("comment_photos")
    .select("image_url")
    .eq("comment_id", commentId);
  const lumen = await lumenCheckNote(
    supabase,
    profile.id,
    body,
    (pics ?? []).map((p) => String(p.image_url)),
  );
  if (lumen) return { error: lumen };

  let save = supabase
    .from("comments")
    .update({ body, updated_at: new Date().toISOString() })
    .eq("id", commentId);
  if (profile.role !== "admin") save = save.eq("author_id", profile.id);
  const { data, error } = await save.select("id").maybeSingle();
  if (error) return { error: socialTablesError(error.message) };
  if (!data) return { error: "Not yours." };
  revalidateTarget(kind, id);
  return { success: "Saved." };
}

export async function deleteComment(
  commentId: string,
  kind: SocialKind,
  id: string,
): Promise<SocialState> {
  const profile = await getProfile();
  if (!profile || profile.status === "suspended") {
    return { error: "Log in first." };
  }
  const supabase = await createClient();
  const { error } = await supabase.from("comments").delete().eq("id", commentId);
  if (error) return { error: socialTablesError(error.message) };
  revalidateTarget(kind, id);
  return { success: "Removed." };
}

export async function addCommentPhoto(
  commentId: string,
  kind: SocialKind,
  id: string,
  url: string,
): Promise<SocialState & { photoId?: string }> {
  const profile = await getProfile();
  if (!profile || profile.status === "suspended") {
    return { error: "Log in first." };
  }
  if (!stillUrlOurs(url)) return { error: "Bad image URL." };

  const supabase = await createClient();
  const { data: comment, error: findErr } = await supabase
    .from("comments")
    .select("id, author_id, body")
    .eq("id", commentId)
    .maybeSingle();
  if (findErr) return { error: socialTablesError(findErr.message) };
  if (!comment) return { error: "Not found." };
  if (profile.role !== "admin" && comment.author_id !== profile.id) {
    return { error: "Not yours." };
  }

  const counted = await supabase
    .from("comment_photos")
    .select("id", { count: "exact", head: true })
    .eq("comment_id", commentId);
  if (counted.error) return { error: socialTablesError(counted.error.message) };
  if ((counted.count ?? 0) >= MAX_COMMENT_PHOTOS) {
    return { error: "Three photos is enough." };
  }

  const lumen = await lumenCheckNote(
    supabase,
    profile.id,
    String(comment.body ?? ""),
    [url],
  );
  if (lumen) return { error: lumen };

  const { data: photo, error } = await supabase
    .from("comment_photos")
    .insert({
      comment_id: commentId,
      image_url: url,
      sort_order: (counted.count ?? 0) + 1,
    })
    .select("id")
    .single();
  if (error || !photo) return { error: socialTablesError(error?.message) };
  revalidateTarget(kind, id);
  return { success: "Photo added.", photoId: photo.id as string };
}

export async function removeCommentPhoto(
  commentId: string,
  photoId: string,
  kind: SocialKind,
  id: string,
): Promise<SocialState> {
  const profile = await getProfile();
  if (!profile || profile.status === "suspended") {
    return { error: "Log in first." };
  }
  const supabase = await createClient();
  const { data: comment, error: findErr } = await supabase
    .from("comments")
    .select("id, author_id")
    .eq("id", commentId)
    .maybeSingle();
  if (findErr) return { error: socialTablesError(findErr.message) };
  if (!comment) return { error: "Not found." };
  if (profile.role !== "admin" && comment.author_id !== profile.id) {
    return { error: "Not yours." };
  }
  const { error } = await supabase
    .from("comment_photos")
    .delete()
    .eq("id", photoId)
    .eq("comment_id", commentId);
  if (error) return { error: socialTablesError(error.message) };
  revalidateTarget(kind, id);
  return { success: "Removed." };
}

const MAX_NAME = 80;

function revalidateAuthor(id: string) {
  revalidatePath(`/u/${id}`);
  revalidatePath(`/u/${id}/edit`);
  revalidatePath("/dashboard");
}

export async function saveProfile(
  _prev: SocialState,
  formData: FormData,
): Promise<SocialState> {
  const profile = await getProfile();
  if (!profile || profile.status === "suspended") {
    return { error: "Log in first." };
  }
  const name = String(formData.get("name") ?? "").trim();
  if (name.length > MAX_NAME) {
    return { error: "Keep the name under 80 characters." };
  }
  const lodging = refuseComment(name);
  if (name && lodging) return { error: lodging };

  const avatarRaw = String(formData.get("avatar_url") ?? "").trim();
  const clearPhoto = String(formData.get("clear_photo") ?? "") === "1";
  let avatar_url: string | null | undefined;
  if (clearPhoto) avatar_url = null;
  else if (avatarRaw) {
    if (!stillUrlOurs(avatarRaw)) return { error: "Bad image URL." };
    avatar_url = avatarRaw.split("?")[0];
  }

  const supabase = await createClient();
  const patch: { display_name: string | null; avatar_url?: string | null } = {
    display_name: name || null,
  };
  if (avatar_url !== undefined) patch.avatar_url = avatar_url;
  const { data, error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", profile.id)
    .select("id")
    .maybeSingle();
  if (error) return { error: socialTablesError(error.message) };
  if (!data) {
    return {
      error: socialTablesError("avatar_url"),
    };
  }
  revalidateAuthor(profile.id);
  return { success: "Saved." };
}

export async function attachGooglePhoto(): Promise<
  SocialState & { imageUrl?: string }
> {
  const profile = await getProfile();
  if (!profile || profile.status === "suspended") {
    return { error: "Log in first." };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const meta = user?.user_metadata ?? {};
  const src = String(meta.picture ?? meta.avatar_url ?? "").trim();
  if (!isGooglePhotoUrl(src)) {
    return { error: "No Google photo on this login." };
  }

  let blob: Blob;
  try {
    const res = await fetch(src);
    if (!res.ok) return { error: "Couldn’t read that Google photo." };
    blob = await res.blob();
  } catch {
    return { error: "Couldn’t read that Google photo." };
  }

  const path = `${profile.id}/avatar.jpg`;
  const { error: upErr } = await supabase.storage
    .from("place-stills")
    .upload(path, blob, { upsert: true, contentType: "image/jpeg" });
  if (upErr) return { error: "Couldn’t upload that photo." };
  const url = supabase.storage.from("place-stills").getPublicUrl(path).data
    .publicUrl;
  const { data, error } = await supabase
    .from("profiles")
    .update({ avatar_url: url })
    .eq("id", profile.id)
    .select("id")
    .maybeSingle();
  if (error) return { error: socialTablesError(error.message) };
  if (!data) return { error: socialTablesError("avatar_url") };
  revalidateAuthor(profile.id);
  return { success: "Photo added.", imageUrl: url };
}

function isGooglePhotoUrl(url: string): boolean {
  if (!url || url.startsWith("//")) return false;
  try {
    const u = new URL(url);
    return (
      u.protocol === "https:" &&
      (u.hostname === "lh3.googleusercontent.com" ||
        u.hostname.endsWith(".googleusercontent.com"))
    );
  } catch {
    return false;
  }
}
