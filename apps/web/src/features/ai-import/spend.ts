import "server-only";

import { getXaiKey, monthlyCapUsd, STILL_USD } from "@/lib/ai/xai";
import type { createClient } from "@/lib/supabase/server";

type Db = Awaited<ReturnType<typeof createClient>>;

/** Company-wide month spend. Fail closed if the RPC is missing. */
export async function monthSpentUsd(supabase: Db): Promise<number> {
  const { data, error } = await supabase.rpc("lumen_month_spend_usd");
  if (error) {
    console.warn("[lumen_month_spend_usd]", error.message);
    return monthlyCapUsd();
  }
  const n = Number(data ?? 0);
  return Number.isFinite(n) ? n : monthlyCapUsd();
}

export async function aiBlocked(
  supabase: Db,
  extraUsd = 0,
): Promise<string | null> {
  if (!getXaiKey()) return "Lumen’s taking a nap.";
  const { data: setting } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "ai_killed")
    .maybeSingle();
  if (setting?.value === "true") return "Lumen’s taking a nap.";
  const spent = await monthSpentUsd(supabase);
  if (spent + extraUsd > monthlyCapUsd()) return "Lumen’s taking a nap.";
  return null;
}

export { STILL_USD };
