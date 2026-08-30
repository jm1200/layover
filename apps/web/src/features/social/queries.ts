import { createClient } from "@/lib/supabase/server";
import {
  MAX_COMMENT_PHOTOS,
  type CommentPhoto,
  type CommentRow,
  type SocialKind,
} from "@/features/social/types";

export function socialTablesError(message?: string): string {
  if (
    message &&
    /likes|comments|comment_photos|byline_for|schema cache|place_id/i.test(
      message,
    )
  ) {
    return "Social tables aren’t in the database yet. Paste 018_social.sql then 019_comments.sql in the Supabase SQL Editor, then try again.";
  }
  return message ?? "Couldn’t load that.";
}

export async function bylineFor(userId: string | null): Promise<string> {
  if (!userId) return "Crew";
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("byline_for", { p_id: userId });
  if (error || data == null || String(data).trim() === "") return "Crew";
  return String(data);
}

export async function likeCount(
  kind: SocialKind,
  id: string,
): Promise<number> {
  const supabase = await createClient();
  const col = kind === "place" ? "place_id" : "playbook_id";
  const { count, error } = await supabase
    .from("likes")
    .select("id", { count: "exact", head: true })
    .eq(col, id);
  if (error) {
    console.warn("[likeCount]", error.message);
    return 0;
  }
  return count ?? 0;
}

export async function likedByMe(
  kind: SocialKind,
  id: string,
  userId: string | null,
): Promise<boolean> {
  if (!userId) return false;
  const supabase = await createClient();
  const col = kind === "place" ? "place_id" : "playbook_id";
  const { data, error } = await supabase
    .from("likes")
    .select("id")
    .eq(col, id)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    console.warn("[likedByMe]", error.message);
    return false;
  }
  return Boolean(data);
}

type CommentRaw = {
  id: string;
  playbook_id: string | null;
  place_id: string | null;
  author_id: string;
  body: string;
  created_at: string;
};

export async function listComments(
  kind: SocialKind,
  id: string,
): Promise<CommentRow[]> {
  const supabase = await createClient();
  const col = kind === "place" ? "place_id" : "playbook_id";
  const full = await supabase
    .from("comments")
    .select("id, playbook_id, place_id, author_id, body, created_at")
    .eq(col, id)
    .order("created_at", { ascending: true });

  let rows: CommentRaw[] = [];
  if (full.error) {
    if (kind === "place") {
      console.warn("[listComments]", full.error.message);
      return [];
    }
    const old = await supabase
      .from("comments")
      .select("id, playbook_id, author_id, body, created_at")
      .eq("playbook_id", id)
      .order("created_at", { ascending: true });
    if (old.error) {
      console.warn("[listComments]", old.error.message);
      return [];
    }
    rows = (old.data ?? []).map((r) => ({
      id: r.id as string,
      playbook_id: r.playbook_id as string,
      place_id: null,
      author_id: r.author_id as string,
      body: r.body as string,
      created_at: r.created_at as string,
    }));
  } else {
    rows = (full.data ?? []) as CommentRaw[];
  }

  const photosBy = await photosForComments(rows.map((r) => r.id));
  const labels = await Promise.all(
    rows.map((r) => bylineFor(r.author_id)),
  );
  return rows.map((r, i) => ({
    id: r.id,
    playbook_id: r.playbook_id,
    place_id: r.place_id,
    author_id: r.author_id,
    body: r.body,
    created_at: r.created_at,
    byline: labels[i] ?? "Crew",
    photos: (photosBy[r.id] ?? []).slice(0, MAX_COMMENT_PHOTOS),
  }));
}

async function photosForComments(
  commentIds: string[],
): Promise<Record<string, CommentPhoto[]>> {
  const out: Record<string, CommentPhoto[]> = {};
  if (commentIds.length === 0) return out;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comment_photos")
    .select("id, comment_id, image_url, sort_order")
    .in("comment_id", commentIds)
    .order("sort_order");
  if (error) {
    console.warn("[comment_photos]", error.message);
    return out;
  }
  for (const p of data ?? []) {
    const cid = p.comment_id as string;
    (out[cid] ??= []).push({
      id: p.id as string,
      src: p.image_url as string,
    });
  }
  return out;
}
