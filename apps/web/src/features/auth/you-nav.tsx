"use client";

import Link from "next/link";
import { SignOutButton } from "@/features/auth/sign-out-button";
import type { UserRole } from "@/features/auth/types";

export function YouNav({
  role,
  tone,
  signOut,
}: {
  role: UserRole;
  tone: "dark" | "light";
  signOut: () => Promise<void>;
}) {
  const link =
    "block w-full px-3 py-2 text-left text-sm text-zinc-800 hover:bg-zinc-100";
  const summary =
    tone === "dark"
      ? "flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-full text-white/90 ring-1 ring-white/40 hover:text-white hover:ring-white"
      : "flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-full text-zinc-700 ring-1 ring-zinc-300 hover:text-zinc-900 hover:ring-zinc-500";

  return (
    <details className="relative">
      <summary
        aria-label="Account"
        className={`${summary} [&::-webkit-details-marker]:hidden`}
      >
        <ProfileIcon />
      </summary>
      <div className="absolute right-0 z-30 mt-2 min-w-[11rem] overflow-hidden rounded-lg bg-white py-1 shadow-lg ring-1 ring-zinc-200">
        <Link href="/dashboard" className={link}>
          Your recs
        </Link>
        {role === "admin" ? (
          <Link href="/admin" className={link}>
            Admin
          </Link>
        ) : null}
        {role === "admin" || role === "sponsor" ? (
          <Link href="/sponsor" className={link}>
            Sponsor
          </Link>
        ) : null}
        <SignOutButton action={signOut} className={link} />
      </div>
    </details>
  );
}

function ProfileIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      aria-hidden
    >
      <circle cx="12" cy="8" r="3.25" />
      <path d="M5.4 19.2c1.3-2.8 3.6-4.2 6.6-4.2s5.3 1.4 6.6 4.2" />
    </svg>
  );
}
