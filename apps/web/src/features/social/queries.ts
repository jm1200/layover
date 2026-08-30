import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/features/auth/get-profile";
import {
  MAX_COMMENT_PHOTOS,
  type CommentPhoto,
  type CommentRow,
  type SocialKind,
} from "@/features/social/types";

export function socialTablesError(message?: string): string {
  if (
    message &&
    /likes|comments|comment_photos|byline_for|author_card|like_count_of|avatar_url|row-level security|schema cache|place_id/i.test(
      message,
    )
  ) {
    return "Social tables aren’t in the database yet. Paste 018_social.sql, 019_comments.sql, then 020_author.sql in the Supabase SQL Editor, then try again.";
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

export type AuthorCard = {
  id: string;
  display_name: string;
  avatar_url: string | null;
};

export async function authorCard(
  userId: string | null,
): Promise<AuthorCard | null> {
  if (!userId) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("author_card", { p_id: userId });
  if (error) {
    const me = await getProfile();
    if (me?.id === userId) {
      return {
        id: me.id,
        display_name: me.display_name?.trim() || "Crew",
        avatar_url: me.avatar_url,
      };
    }
    console.warn("[authorCard]", error.message);
    return null;
  }
  const row = Array.isArray(data) ? data[0] : data;
  if (!row || !row.id) return null;
  const name = String(row.display_name ?? "").trim();
  return {
    id: row.id as string,
    display_name: name || "Crew",
    avatar_url: (row.avatar_url as string | null) ?? null,
  };
}

export async function likeCount(
  kind: SocialKind,
  id: string,
): Promise<number> {
  const supabase = await createClient();
  const rpc = await supabase.rpc("like_count_of", {
    p_place: kind === "place" ? id : null,
    p_playbook: kind === "playbook" ? id : null,
  });
  if (!rpc.error && rpc.data != null) return Number(rpc.data);

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
  const authorIds = [...new Set(rows.map((r) => r.author_id))];
  const [labels, cards] = await Promise.all([
    Promise.all(rows.map((r) => bylineFor(r.author_id))),
    Promise.all(authorIds.map((id) => authorCard(id))),
  ]);
  const avatarBy: Record<string, string | null> = {};
  for (let i = 0; i < authorIds.length; i++) {
    avatarBy[authorIds[i]] = cards[i]?.avatar_url ?? null;
  }
  return rows.map((r, i) => ({
    id: r.id,
    playbook_id: r.playbook_id,
    place_id: r.place_id,
    author_id: r.author_id,
    body: r.body,
    created_at: r.created_at,
    byline: labels[i] ?? "Crew",
    avatar_url: avatarBy[r.author_id] ?? null,
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
