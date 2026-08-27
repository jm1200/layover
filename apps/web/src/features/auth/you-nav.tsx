"use client";

import Link from "next/link";
import type { UserRole } from "@/features/auth/types";

export function YouNav({
  role,
  tone,
}: {
  role: UserRole;
  tone: "dark" | "light";
}) {
  const link =
    tone === "dark"
      ? "block px-3 py-2 text-sm text-zinc-900 hover:bg-zinc-100"
      : "block px-3 py-2 text-sm text-zinc-800 hover:bg-zinc-100";
  const summary =
    tone === "dark"
      ? "cursor-pointer list-none text-sm text-white/90 hover:text-white"
      : "cursor-pointer list-none text-sm text-zinc-700 hover:text-zinc-900";

  if (role !== "admin" && role !== "sponsor") {
    return (
      <Link
        href="/dashboard"
        className={
          tone === "dark"
            ? "text-sm text-white/90 hover:text-white"
            : "text-sm text-zinc-700 hover:text-zinc-900"
        }
      >
        You
      </Link>
    );
  }

  return (
    <details className="relative">
      <summary className={`${summary} [&::-webkit-details-marker]:hidden`}>
        You
      </summary>
      <div className="absolute right-0 z-30 mt-2 min-w-[9rem] overflow-hidden rounded-lg bg-white py-1 shadow-lg ring-1 ring-zinc-200">
        <Link href="/dashboard" className={link}>
          Yours
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
      </div>
    </details>
  );
}
