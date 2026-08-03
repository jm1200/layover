import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/features/auth/shell";
import { requireRole, homeForRole } from "@/features/auth/get-profile";
import { SuspendedPanel } from "@/features/auth/suspended-panel";

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

  return (
    <AppShell profile={profile} title="Admin">
      <p className="text-zinc-600">
        Phase 1 stub. Moderation queue and metrics land in Phase 6.
      </p>
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
