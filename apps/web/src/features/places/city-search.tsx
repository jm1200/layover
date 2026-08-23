"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { City } from "@/features/places/types";

export function CitySearch({
  cities,
  variant = "light",
}: {
  cities: City[];
  variant?: "light" | "hero";
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const hero = variant === "hero";

  const matches = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return cities;
    return cities.filter((c) =>
      [c.name, c.slug, c.airport_code ?? ""].some((s) =>
        s.toLowerCase().includes(n),
      ),
    );
  }, [q, cities]);

  function go(slug: string) {
    setOpen(false);
    router.push(`/cities/${slug}`);
  }

  return (
    <form
      className="relative"
      onSubmit={(e) => {
        e.preventDefault();
        if (!q.trim()) return;
        if (matches[0]) go(matches[0].slug);
      }}
    >
      <label htmlFor="city-search" className="sr-only">
        Where are you headed?
      </label>
      <input
        id="city-search"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={(e) => {
          const next = e.relatedTarget as Node | null;
          if (next && e.currentTarget.parentElement?.contains(next)) return;
          setOpen(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setOpen(false);
            (e.target as HTMLInputElement).blur();
          }
        }}
        placeholder="Where are you headed?"
        autoComplete="off"
        className={
          hero
            ? "w-full rounded-full border-0 bg-white px-6 py-4 text-base text-zinc-900 shadow-lg outline-none placeholder:text-zinc-400 focus-visible:ring-2 focus-visible:ring-white/80"
            : "w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-base outline-none focus:border-zinc-900 focus-visible:ring-2 focus-visible:ring-zinc-900/20"
        }
      />
      <p
        className={
          hero
            ? "mt-3 text-xs text-white/70"
            : "mt-2 text-xs text-zinc-500"
        }
      >
        Try an airport code — ZRH, DEL, SCL, MUC.
      </p>
      {open ? (
        <ul className="absolute z-30 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-zinc-200 bg-white text-left text-zinc-900 shadow-lg">
          {matches.length === 0 ? (
            <li className="px-4 py-3 text-sm text-zinc-500">
              We don’t have that city yet.
            </li>
          ) : (
            matches.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-zinc-50"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => go(c.slug)}
                >
                  {c.name}
                  {c.airport_code ? ` (${c.airport_code})` : ""}
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </form>
  );
}
