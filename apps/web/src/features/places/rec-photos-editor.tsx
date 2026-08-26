"use client";

import { useState, useTransition } from "react";
import { attachPlaceStill } from "@/features/places/actions";

const MAX = 3;

export function RecPhotosEditor({
  placeId,
  heroSrc,
  extras,
}: {
  placeId: string;
  heroSrc?: string | null;
  extras: { src: string; alt: string }[];
}) {
  const unique: { src: string; alt: string }[] = [];
  if (heroSrc) unique.push({ src: heroSrc, alt: "Hero" });
  for (const e of extras) {
    if (!unique.some((u) => u.src === e.src)) unique.push(e);
  }
  const [hero, setHero] = useState(heroSrc ?? unique[0]?.src ?? null);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const shown = unique.slice(0, MAX);

  if (shown.length === 0) return null;

  return (
    <div className="mt-8 max-w-lg">
      <p className="text-sm font-medium">Photos</p>
      <p className="mt-0.5 text-xs text-zinc-500">
        Tap one for the city card. The others stay on the rec. Max {MAX}.
      </p>
      <ul className="mt-3 grid grid-cols-3 gap-2">
        {shown.map((p) => {
          const selected = p.src === hero;
          return (
            <li key={p.src}>
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  start(async () => {
                    setMsg(null);
                    const r = await attachPlaceStill(placeId, p.src, "user");
                    if (r.error) setMsg(r.error);
                    else {
                      setHero(p.src);
                      setMsg("That’s the hero.");
                    }
                  })
                }
                className={
                  selected
                    ? "block w-full overflow-hidden rounded-lg ring-2 ring-zinc-900"
                    : "block w-full overflow-hidden rounded-lg ring-1 ring-zinc-200"
                }
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.src}
                  alt={p.alt}
                  className="aspect-[4/5] w-full object-cover"
                />
              </button>
              <p className="mt-1 text-center text-[11px] text-zinc-500">
                {selected ? "Hero" : "Tap to use as hero"}
              </p>
            </li>
          );
        })}
      </ul>
      {msg ? (
        <p className="mt-2 text-sm text-zinc-700" role="alert">
          {msg}
        </p>
      ) : null}
    </div>
  );
}
