import type { Profile } from "@/features/auth/types";
import { SiteHeader } from "@/features/auth/site-header";

export function AppShell({
  profile,
  title,
  children,
}: {
  profile: Profile;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <SiteHeader profile={profile} tone="light" />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="mb-2 text-2xl font-semibold tracking-tight">{title}</h1>
        {children}
      </main>
    </div>
  );
}
