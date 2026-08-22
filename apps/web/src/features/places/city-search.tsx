"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { City } from "@/features/places/types";

export function CitySearch({ cities }: { cities: City[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

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
    router.push(`/cities/${slug}`);
  }

  return (
    <form
      className="relative"
      onSubmit={(e) => {
        e.preventDefault();
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
        onBlur={() => {
          window.setTimeout(() => setOpen(false), 150);
        }}
        placeholder="Where are you headed?"
        autoComplete="off"
        className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-base outline-none focus:border-zinc-900"
      />
      {open ? (
        <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
          {matches.length === 0 ? (
            <li className="px-4 py-3 text-sm text-zinc-500">No city yet.</li>
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
