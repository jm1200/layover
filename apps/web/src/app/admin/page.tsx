import { redirect } from "next/navigation";
import { AppShell } from "@/features/auth/shell";
import { requireRole, homeForRole } from "@/features/auth/get-profile";
import { SuspendedPanel } from "@/features/auth/suspended-panel";
import { KillSwitch } from "@/features/ai-import/kill-switch";
import { LumenLog } from "@/features/ai-import/lumen-log";
import { monthSpentUsd } from "@/features/ai-import/spend";
import { createClient } from "@/lib/supabase/server";
import { getXaiKey, monthlyCapUsd } from "@/lib/ai/xai";

export default async function AdminPage() {
  const { profile, error } = await requireRole(["admin"]);

  if (error === "unauthenticated") redirect("/login");
  if (error === "suspended") {
    return <SuspendedPanel />;
  }
  if (error === "forbidden" && profile) {
    redirect(homeForRole(profile.role));
  }
  if (!profile) redirect("/login");

  const supabase = await createClient();
  const [{ data: setting }, spent] = await Promise.all([
    supabase.from("site_settings").select("value").eq("key", "ai_killed").maybeSingle(),
    monthSpentUsd(supabase),
  ]);
  const killed = setting?.value === "true";
  const cap = monthlyCapUsd();
  const spentN = Number(spent ?? 0);
  const spentLabel = Number.isFinite(spentN)
    ? `$${spentN.toFixed(2)}`
    : "$0.00";

  return (
    <AppShell profile={profile} title="Admin">
      <p className="text-zinc-600">
        This month {spentLabel} of ${cap}.{" "}
        <span className="text-zinc-500">
          {getXaiKey() ? "Key is set." : "Key is missing — she can’t file."}
        </span>
      </p>
      <KillSwitch killed={killed} />
      <LumenLog />
    </AppShell>
  );
}
