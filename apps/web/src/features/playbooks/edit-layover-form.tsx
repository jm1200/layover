"use client";

import { useActionState, useState, useTransition } from "react";
import Link from "next/link";
import {
  deletePlaybook,
  savePlaybookEdit,
  type PlaybookFormState,
} from "@/features/playbooks/actions";
import type { PlaybookStop } from "@/features/playbooks/types";

type StopRow = PlaybookStop & {
  still?: string | null;
  placeName?: string | null;
};

const initial: PlaybookFormState = {};

export function EditLayoverForm({
  playbookId,
  defaults,
  initialStops,
}: {
  playbookId: string;
  defaults: {
    title: string;
    narrative: string | null;
    hours_available: number | null;
  };
  initialStops: StopRow[];
}) {
  const bound = savePlaybookEdit.bind(null, playbookId);
  const [state, formAction, pending] = useActionState(bound, initial);
  const [stops, setStops] = useState(initialStops);
  const [delErr, setDelErr] = useState<string | null>(null);
  const [deleting, startDel] = useTransition();

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= stops.length) return;
    const next = [...stops];
    const tmp = next[i];
    next[i] = next[j];
    next[j] = tmp;
    setStops(next);
  }

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      {stops.map((s) => (
        <input key={s.id} type="hidden" name="stop_id" value={s.id} />
      ))}

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Title</span>
        <input
          name="title"
          required
          defaultValue={defaults.title}
          className="rounded-lg border border-zinc-300 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Hours</span>
        <input
          name="hours_available"
          type="number"
          min={1}
          max={72}
          defaultValue={defaults.hours_available ?? ""}
          className="rounded-lg border border-zinc-300 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">The day</span>
        <textarea
          name="narrative"
          rows={5}
          defaultValue={defaults.narrative ?? ""}
          className="rounded-lg border border-zinc-300 px-3 py-2 leading-relaxed"
        />
      </label>

      <div>
        <p className="text-sm font-medium">Stops</p>
        <p className="mt-0.5 text-xs text-zinc-500">
          Tug the day. Recs stay on Eat / Do / Buy.
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
                    Rec
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
                  onClick={() =>
                    setStops(stops.filter((_, idx) => idx !== i))
                  }
                  className="rounded border border-zinc-200 px-2 py-1 text-red-700"
                >
                  Drop
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {state.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save"}
      </button>
      <p className="text-xs text-zinc-500">
        Saves the day and the stop order, then takes you back to the layover.
      </p>

      <button
        type="button"
        disabled={deleting}
        onClick={() => {
          if (
            !confirm(
              "This day leaves the city. Recs stay on Eat / Do / Buy.",
            )
          ) {
            return;
          }
          startDel(async () => {
            setDelErr(null);
            const r = await deletePlaybook(playbookId);
            if (r?.error) setDelErr(r.error);
          });
        }}
        className="mt-4 text-left text-sm text-red-700 underline disabled:opacity-60"
      >
        {deleting ? "Removing…" : "Take this day off"}
      </button>
      {delErr ? (
        <p className="text-sm text-red-700" role="alert">
          {delErr}
        </p>
      ) : null}
    </form>
  );
}
