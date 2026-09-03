"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminTabs() {
  const path = usePathname();
  const people = path.startsWith("/admin/people");
  const on =
    "border-b-2 border-zinc-900 pb-2 text-sm font-medium text-zinc-900";
  const off = "pb-2 text-sm text-zinc-500 hover:text-zinc-900";
  return (
    <nav className="mb-8 flex gap-6 border-b border-zinc-200">
      <Link href="/admin" className={people ? off : on}>
        Lumen
      </Link>
      <Link href="/admin/people" className={people ? on : off}>
        People
      </Link>
    </nav>
  );
}
