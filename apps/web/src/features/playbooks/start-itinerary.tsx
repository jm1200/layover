"use client";

import { useMemo, useState } from "react";

type Stop = {
  title: string;
  duration_minutes: number | null;
};

function addMinutes(hhmm: string, minutes: number) {
  const [h, m] = hhmm.split(":").map(Number);
  const total =
    (((h * 60 + m + minutes) % (24 * 60)) + 24 * 60) % (24 * 60);
  const hh = Math.floor(total / 60);
  const mm = total % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

export function StartItinerary({ stops }: { stops: Stop[] }) {
  const [start, setStart] = useState("10:00");
  const [on, setOn] = useState(false);

  const timed = useMemo(() => {
    let t = start;
    return stops.map((s) => {
      const begin = t;
      const mins = s.duration_minutes ?? 60;
      t = addMinutes(t, mins);
      return { ...s, begin, end: t };
    });
  }, [start, stops]);

  return (
    <section className="mt-12 rounded-2xl bg-zinc-900 px-5 py-6 text-white">
      <h2 className="text-xl font-semibold tracking-tight">Time this day</h2>
      <p className="mt-2 text-sm text-white/70">
        When do you want to start? We line up the stops from that clock. Exact
        buses, tickets, and walking directions are the AI step — not live yet.
        We never ask for a hotel name.
      </p>
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-white/70">Start</span>
          <input
            type="time"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="rounded-lg border-0 bg-white px-3 py-2 text-zinc-900"
          />
        </label>
        <button
          type="button"
          onClick={() => setOn(true)}
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900"
        >
          Time my day
        </button>
      </div>
      {on ? (
        <ol className="mt-6 space-y-2 text-sm">
          {timed.map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="font-mono text-white/80">
                {s.begin}–{s.end}
              </span>
              <span>{s.title}</span>
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  );
}
