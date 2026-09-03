import type { createClient } from "@/lib/supabase/server";

/** Stamp last login on profiles. Column lands in SQL 024 — ignore if missing. */
export async function touchLastSeen(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
) {
  const { error } = await supabase
    .from("profiles")
    .update({ last_seen_at: new Date().toISOString() })
    .eq("id", userId);
  if (error) console.warn("[touchLastSeen]", error.message);
}
