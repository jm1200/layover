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
      ? "shrink-0 whitespace-nowrap text-sm text-white/90 hover:text-white"
      : "shrink-0 whitespace-nowrap text-sm text-zinc-700 hover:text-zinc-900";
  const pill =
    tone === "dark"
      ? "shrink-0 whitespace-nowrap rounded-full bg-white px-3 py-2 text-xs font-bold uppercase tracking-wide text-zinc-950 shadow-lg hover:bg-white/90 sm:px-5 sm:py-2.5 sm:text-sm sm:tracking-wider"
      : "shrink-0 whitespace-nowrap rounded-full bg-zinc-950 px-3 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-sm hover:bg-zinc-800 sm:px-5 sm:py-2.5 sm:text-sm sm:tracking-wider";

  return (
    <div className={bar}>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-3 py-4 sm:gap-4 sm:px-4">
        <Link
          href="/"
          className="shrink-0 whitespace-nowrap text-base font-semibold tracking-tight sm:text-lg"
        >
          Layover Intel
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            href={loggedIn ? "/share" : "/signup?next=/share"}
            className={pill}
          >
            Share your intel
          </Link>
          <Link href="/cities" className={citiesCls}>
            Cities
          </Link>
          {loggedIn && profile ? (
            <YouNav
              role={profile.role}
              tone={tone}
              signOut={signOut}
              name={profile.display_name?.trim() || "Crew"}
              href={`/u/${profile.id}/edit`}
              avatarUrl={profile.avatar_url}
            />
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
