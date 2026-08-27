"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { savePlaybookStops } from "@/features/playbooks/actions";
import type { PlaybookStop } from "@/features/playbooks/types";

export function StopsEditor({
  playbookId,
  initial,
}: {
  playbookId: string;
  initial: (PlaybookStop & { still?: string | null; placeName?: string | null })[];
}) {
  const [stops, setStops] = useState(initial);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= stops.length) return;
    const next = [...stops];
    const tmp = next[i];
    next[i] = next[j];
    next[j] = tmp;
    setStops(next);
  }

  function drop(i: number) {
    setStops(stops.filter((_, idx) => idx !== i));
  }

  return (
    <div className="mt-8 max-w-xl">
      <p className="text-sm font-medium">Stops</p>
      <p className="mt-0.5 text-xs text-zinc-500">
        Tug the day. Eat, Do, and Buy stay. Cap 4.
      </p>
      <ul className="mt-3 space-y-2">
        {stops.map((s, i) => (
          <li
            key={s.id}
            className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-2"
          >
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
              {s.still ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={s.still}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {s.placeName || s.title || `Stop ${i + 1}`}
              </p>
              {s.place_id ? (
                <Link
                  href={`/places/${s.place_id}`}
                  className="text-xs text-zinc-500 underline"
                >
                  Open
                </Link>
              ) : null}
            </div>
            <div className="flex shrink-0 gap-1 text-xs">
              <button
                type="button"
                disabled={i === 0}
                onClick={() => move(i, -1)}
                className="rounded border border-zinc-200 px-2 py-1 disabled:opacity-40"
              >
                Up
              </button>
              <button
                type="button"
                disabled={i === stops.length - 1}
                onClick={() => move(i, 1)}
                className="rounded border border-zinc-200 px-2 py-1 disabled:opacity-40"
              >
                Down
              </button>
              <button
                type="button"
                onClick={() => drop(i)}
                className="rounded border border-zinc-200 px-2 py-1 text-red-700"
              >
                Drop
              </button>
            </div>
          </li>
        ))}
      </ul>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            setMsg(null);
            const r = await savePlaybookStops(
              playbookId,
              stops.map((s) => s.id),
            );
            setMsg(r.error ?? r.success ?? null);
          })
        }
        className="mt-3 rounded-lg bg-zinc-900 px-3 py-2 text-sm text-white disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save stop order"}
      </button>
      {msg ? (
        <p className="mt-2 text-sm text-zinc-700" role="alert">
          {msg}
        </p>
      ) : null}
    </div>
  );
}
