import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/features/auth/shell";
import { requireRole, homeForRole } from "@/features/auth/get-profile";
import { SuspendedPanel } from "@/features/auth/suspended-panel";
import { KillSwitch } from "@/features/ai-import/kill-switch";
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
  const { data: setting } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "ai_killed")
    .maybeSingle();
  const killed = setting?.value === "true";

  return (
    <AppShell profile={profile} title="Admin">
      <p className="text-zinc-600">
        Kill switch for Lumen. Full moderation queue lands in Phase 6.
      </p>
      <p className="mt-2 text-sm text-zinc-500">
        Key {getXaiKey() ? "is set" : "is missing"}. Monthly cap ${monthlyCapUsd()}.
      </p>
      <KillSwitch killed={killed} />
      <p className="mt-4 text-sm text-zinc-500">
        To promote another account to sponsor or admin, run SQL in Supabase (see
        HUMAN-SETUP.md).
      </p>
      <ul className="mt-6 flex flex-col gap-2 text-sm">
        <li>
          <Link href="/dashboard" className="underline">
            User dashboard
          </Link>
        </li>
        <li>
          <Link href="/sponsor" className="underline">
            Sponsor dashboard
          </Link>
        </li>
      </ul>
    </AppShell>
  );
}
