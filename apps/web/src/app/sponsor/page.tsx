import { redirect } from "next/navigation";
import { AppShell } from "@/features/auth/shell";
import { requireRole, homeForRole } from "@/features/auth/get-profile";
import { SuspendedPanel } from "@/features/auth/suspended-panel";

export default async function SponsorPage() {
  const { profile, error } = await requireRole(["sponsor", "admin"]);

  if (error === "unauthenticated") redirect("/login");
  if (error === "suspended") {
    return <SuspendedPanel />;
  }
  if (error === "forbidden" && profile) {
    redirect(homeForRole(profile.role));
  }
  if (!profile) redirect("/login");

  return (
    <AppShell profile={profile} title="Sponsor">
      <p className="text-zinc-600">
        Phase 1 stub. Self-serve campaigns and Stripe land in Phase 5.
      </p>
      <p className="mt-4 text-sm text-zinc-500">
        You have sponsor access. Labeled placements only — never sold as organic
        crew staples.
      </p>
    </AppShell>
  );
}
