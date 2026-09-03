import { redirect } from "next/navigation";
import { AppShell } from "@/features/auth/shell";
import { requireRole, homeForRole } from "@/features/auth/get-profile";
import { SuspendedPanel } from "@/features/auth/suspended-panel";
import { AdminTabs } from "@/features/admin/tabs";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
      <AdminTabs />
      {children}
    </AppShell>
  );
}
