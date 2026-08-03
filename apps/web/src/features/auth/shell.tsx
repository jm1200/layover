import Link from "next/link";
import type { Profile } from "@/features/auth/types";
import { SignOutButton } from "@/features/auth/sign-out-button";

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
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="font-semibold tracking-tight">
            Layover
          </Link>
          <div className="flex items-center gap-3 text-sm text-zinc-600">
            <span className="hidden sm:inline">
              {profile.email} · <span className="font-medium">{profile.role}</span>
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="mb-2 text-2xl font-semibold tracking-tight">{title}</h1>
        {children}
      </main>
    </div>
  );
}
