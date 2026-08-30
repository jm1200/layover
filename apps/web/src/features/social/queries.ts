import { createClient } from "@/lib/supabase/server";
import type { CommentRow } from "@/features/social/types";

export function socialTablesError(message?: string): string {
  if (message && /likes|comments|byline_for|schema cache/i.test(message)) {
    return "Social tables aren’t in the database yet. Paste 018_social.sql in the Supabase SQL Editor, then try again.";
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
  kind: "place" | "playbook",
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
  kind: "place" | "playbook",
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

export async function listComments(playbookId: string): Promise<CommentRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comments")
    .select("id, playbook_id, author_id, body, created_at")
    .eq("playbook_id", playbookId)
    .order("created_at", { ascending: true });
  if (error) {
    console.warn("[listComments]", error.message);
    return [];
  }
  const rows = data ?? [];
  const labels = await Promise.all(
    rows.map((r) => bylineFor(r.author_id as string)),
  );
  return rows.map((r, i) => ({
    id: r.id as string,
    playbook_id: r.playbook_id as string,
    author_id: r.author_id as string,
    body: r.body as string,
    created_at: r.created_at as string,
    byline: labels[i] ?? "Crew",
  }));
}
