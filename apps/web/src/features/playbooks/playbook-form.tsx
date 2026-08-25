"use client";

import { useActionState, useMemo, useState, useTransition } from "react";
import { sellPlaybookNarrative } from "@/features/ai-import/media-actions";
import type { PlaybookFormState } from "@/features/playbooks/actions";
import type { City, Place } from "@/features/places/types";

type Props = {
  action: (
    prev: PlaybookFormState,
    formData: FormData,
  ) => Promise<PlaybookFormState>;
  cities: City[];
  places: Place[];
  defaults?: {
    city_id?: string;
    title?: string;
    narrative?: string | null;
    hours_available?: number | null;
    status?: string;
  };
  submitLabel: string;
  allowHidden?: boolean;
  metaOnly?: boolean;
  playbookId?: string;
};

const initial: PlaybookFormState = {};

export function PlaybookForm({
  action,
  cities,
  places,
  defaults,
  submitLabel,
  allowHidden,
  metaOnly,
  playbookId,
}: Props) {
  const [state, formAction, pending] = useActionState(action, initial);
  const [cityId, setCityId] = useState(defaults?.city_id ?? "");
  const [narrative, setNarrative] = useState(defaults?.narrative ?? "");
  const [lumenMsg, setLumenMsg] = useState<string | null>(null);
  const [lumenPending, startLumen] = useTransition();

  const cityPlaces = useMemo(
    () => places.filter((p) => p.city_id === cityId),
    [places, cityId],
  );

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
        Start from airport / station / downtown zones — never “out the door of
        [crew hotel].”
      </p>

      {metaOnly && defaults?.city_id ? (
        <input type="hidden" name="city_id" value={defaults.city_id} />
      ) : null}
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">City</span>
        <select
          name={metaOnly ? undefined : "city_id"}
          required={!metaOnly}
          value={metaOnly ? defaults?.city_id ?? "" : cityId}
          onChange={(e) => setCityId(e.target.value)}
          disabled={metaOnly}
          className="rounded-lg border border-zinc-300 px-3 py-2 disabled:bg-zinc-100"
        >
          <option value="" disabled>
            Select city
          </option>
          {cities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Title</span>
        <input
          name="title"
          required
          defaultValue={defaults?.title}
          className="rounded-lg border border-zinc-300 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Hours available (optional)</span>
        <input
          name="hours_available"
          type="number"
          min={1}
          max={72}
          defaultValue={defaults?.hours_available ?? ""}
          className="rounded-lg border border-zinc-300 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">The day — story</span>
        <textarea
          name="narrative"
          rows={6}
          value={narrative}
          onChange={(e) => setNarrative(e.target.value)}
          className="rounded-lg border border-zinc-300 px-3 py-2"
        />
      </label>
      {playbookId ? (
        <button
          type="button"
          disabled={lumenPending}
          onClick={() =>
            startLumen(async () => {
              setLumenMsg(null);
              const r = await sellPlaybookNarrative(playbookId);
              setLumenMsg(r.error ?? r.success ?? null);
              if (r.blurb) setNarrative(r.blurb);
            })
          }
          className="self-start rounded-lg border border-zinc-300 px-3 py-2 text-sm disabled:opacity-60"
        >
          {lumenPending ? "Writing…" : "Lumen, write the day"}
        </button>
      ) : null}
      {lumenMsg ? <p className="text-sm text-zinc-600">{lumenMsg}</p> : null}

      {!metaOnly
        ? [1, 2, 3, 4].map((i) => (
            <fieldset
              key={i}
              className="rounded-lg border border-zinc-200 p-3"
            >
              <legend className="px-1 text-sm font-medium">Stop {i}</legend>
              <label className="mt-1 flex flex-col gap-1 text-sm">
                <span>Title</span>
                <input
                  name={`stop_${i}_title`}
                  className="rounded-lg border border-zinc-300 px-3 py-2"
                />
              </label>
              <label className="mt-2 flex flex-col gap-1 text-sm">
                <span>Linked rec (optional — same city only)</span>
                <select
                  name={`stop_${i}_place_id`}
                  className="rounded-lg border border-zinc-300 px-3 py-2"
                  defaultValue=""
                  disabled={!cityId}
                >
                  <option value="">— free-text only —</option>
                  {cityPlaces.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="mt-2 flex flex-col gap-1 text-sm">
                <span>Notes (transit, gear, tips)</span>
                <textarea
                  name={`stop_${i}_body`}
                  rows={2}
                  className="rounded-lg border border-zinc-300 px-3 py-2"
                />
              </label>
            </fieldset>
          ))
        : null}

      {state.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {state.success}
        </p>
      ) : null}

      <p className="text-sm text-zinc-600">
        <strong>Draft</strong> is only you — keep polishing.{" "}
        <strong>Publish</strong> puts the day <em>and</em> its recs on the
        city page (Eat / Do / Buy).
        {allowHidden ? (
          <>
            {" "}
            <strong>Hidden</strong> is admin: off the site, not deleted.
          </>
        ) : null}
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="submit"
          name="status"
          value="draft"
          disabled={pending}
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save draft — only you"}
        </button>
        <button
          type="submit"
          name="status"
          value="published"
          disabled={pending}
          className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
        >
          {pending ? "Saving…" : "Publish — live on the city"}
        </button>
        {allowHidden ? (
          <button
            type="submit"
            name="status"
            value="hidden"
            disabled={pending}
            className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-600 disabled:opacity-60"
          >
            Hide from the site
          </button>
        ) : null}
      </div>
    </form>
  );
}
