import Link from "next/link";
import { signOut } from "@/features/auth/actions";
import { YouNav } from "@/features/auth/you-nav";
import type { Profile } from "@/features/auth/types";

export function SiteHeader({
  profile,
  tone,
}: {
  profile: Profile | null;
  tone: "dark" | "light";
}) {
  const loggedIn = Boolean(profile);
  const bar =
    tone === "dark"
      ? "text-white"
      : "border-b border-zinc-200 bg-white text-zinc-900";
  const citiesCls =
    tone === "dark"
      ? "text-sm text-white/90 hover:text-white"
      : "text-sm text-zinc-700 hover:text-zinc-900";
  const pill =
    tone === "dark"
      ? "rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-950 hover:bg-white/90"
      : "rounded-full bg-zinc-950 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-zinc-800";

  return (
    <div className={bar}>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Layover
        </Link>
        <nav className="flex items-center gap-4">
          <Link href={loggedIn ? "/share" : "/signup"} className={pill}>
            Share your intel
          </Link>
          <Link href="/cities" className={citiesCls}>
            Cities
          </Link>
          {loggedIn && profile ? (
            <YouNav role={profile.role} tone={tone} signOut={signOut} />
          ) : (
            <Link href="/login" className={citiesCls}>
              Log in
            </Link>
          )}
        </nav>
      </div>
    </div>
  );
}
