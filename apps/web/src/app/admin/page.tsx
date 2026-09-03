import { KillSwitch } from "@/features/ai-import/kill-switch";
import { LumenLog } from "@/features/ai-import/lumen-log";
import { createClient } from "@/lib/supabase/server";
import { getXaiKey, monthlyCapUsd } from "@/lib/ai/xai";

function utcMonthStart() {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString();
}

export default async function AdminPage() {
  const supabase = await createClient();
  const [{ data: setting }, spend] = await Promise.all([
    supabase.from("site_settings").select("value").eq("key", "ai_killed").maybeSingle(),
    supabase
      .from("ai_import_logs")
      .select("estimated_usd")
      .gte("created_at", utcMonthStart()),
  ]);
  const killed = setting?.value === "true";
  const cap = monthlyCapUsd();
  const spentN = (spend.data ?? []).reduce(
    (sum, row) => sum + (Number(row.estimated_usd) || 0),
    0,
  );
  const spentLabel = Number.isFinite(spentN)
    ? `$${spentN.toFixed(2)}`
    : "$0.00";

  return (
    <>
      <p className="text-zinc-600">
        This month {spentLabel} of ${cap}.{" "}
        <span className="text-zinc-500">
          {getXaiKey() ? "Key is set." : "Key is missing — she can’t file."}
        </span>
      </p>
      <KillSwitch killed={killed} />
      <LumenLog />
    </>
  );
}
