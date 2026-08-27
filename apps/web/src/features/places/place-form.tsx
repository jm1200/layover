"use client";

import { useActionState, useMemo, useState, type ReactNode } from "react";
import type { PlaceFormState } from "@/features/places/actions";
import {
  recKindFromCategory,
  REC_KIND_HINT,
  REC_KIND_LABEL,
  REC_KINDS,
  type RecKind,
} from "@/features/places/kind";
import type { City, Zone } from "@/features/places/types";
import { ZONE_LABELS, type ZoneType } from "@/features/places/types";

type Props = {
  action: (
    prev: PlaceFormState,
    formData: FormData,
  ) => Promise<PlaceFormState>;
  cities: City[];
  zones: Zone[];
  defaults?: {
    city_id?: string;
    zone_id?: string | null;
    name?: string;
    blurb?: string | null;
    category?: string | null;
    status?: string;
  };
  /** When set, category is locked (add chooser). */
  lockKind?: RecKind;
  submitLabel: string;
  showItemFields?: boolean;
  allowHidden?: boolean;
  /** Rendered above Save (photos, plates). Those editors persist on their own. */
  children?: ReactNode;
};

const initial: PlaceFormState = {};

export function PlaceForm({
  action,
  cities,
  zones,
  defaults,
  lockKind,
  submitLabel,
  showItemFields,
  allowHidden,
  children,
}: Props) {
  const [state, formAction, pending] = useActionState(action, initial);
  const [cityId, setCityId] = useState(defaults?.city_id ?? "");
  const [zoneId, setZoneId] = useState(defaults?.zone_id ?? "");
  const [kind, setKind] = useState<RecKind>(
    lockKind ?? recKindFromCategory(defaults?.category),
  );

  const cityZones = useMemo(
    () => zones.filter((z) => z.city_id === cityId),
    [zones, cityId],
  );

  const cityName = (id: string) =>
    cities.find((c) => c.id === id)?.name ?? "";

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-4">
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
        Use <strong>zones</strong> (airport strip, downtown, station) for
        logistics. Do not name crew hotels or airline lodging.
      </p>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">City</span>
        <select
          name="city_id"
          required
          value={cityId}
          onChange={(e) => {
            setCityId(e.target.value);
            setZoneId("");
          }}
          className="rounded-lg border border-zinc-300 px-3 py-2"
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
        <span className="font-medium">
          Cluster this sits in (downtown, airport, station)
        </span>
        <select
          name="zone_id"
          value={zoneId}
          onChange={(e) => setZoneId(e.target.value)}
          disabled={!cityId}
          className="rounded-lg border border-zinc-300 px-3 py-2 disabled:bg-zinc-100"
        >
          <option value="">— skip —</option>
          {cityZones.map((z) => (
            <option key={z.id} value={z.id}>
              {cityName(z.city_id)}:{" "}
              {z.name || ZONE_LABELS[z.type as ZoneType] || z.type}
            </option>
          ))}
        </select>
        {cityId && cityZones.length === 0 ? (
          <span className="text-xs text-zinc-500">
            No zones for this city yet (admin seeds zones).
          </span>
        ) : null}
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Name</span>
        <input
          name="name"
          required
          defaultValue={defaults?.name}
          className="rounded-lg border border-zinc-300 px-3 py-2"
        />
      </label>

      {lockKind ? (
        <p className="text-sm text-zinc-600">
          <input type="hidden" name="category" value={lockKind} />
          <span className="font-medium">{REC_KIND_LABEL[lockKind]}</span>
          <span className="text-zinc-500"> — {REC_KIND_HINT[lockKind]}</span>
        </p>
      ) : (
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Type</span>
          <select
            name="category"
            required
            value={kind}
            onChange={(e) => setKind(e.target.value as RecKind)}
            className="rounded-lg border border-zinc-300 px-3 py-2"
          >
            {REC_KINDS.map((k) => (
              <option key={k} value={k}>
                {REC_KIND_LABEL[k]}
              </option>
            ))}
          </select>
          <span className="text-xs text-zinc-500">{REC_KIND_HINT[kind]}</span>
        </label>
      )}

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Blurb</span>
        <textarea
          name="blurb"
          rows={4}
          defaultValue={defaults?.blurb ?? ""}
          className="rounded-lg border border-zinc-300 px-3 py-2"
        />
      </label>

      {defaults?.status ? (
        <input type="hidden" name="status" value={defaults.status} />
      ) : (
        <input type="hidden" name="status" value="published" />
      )}

      {showItemFields && kind === "eat" ? (
        <fieldset className="rounded-lg border border-zinc-200 p-3">
          <legend className="px-1 text-sm font-medium">
            Optional signature dish
          </legend>
          <label className="mt-2 flex flex-col gap-1 text-sm">
            <span>Dish name</span>
            <input
              name="dish_name"
              placeholder="Truffle raclette"
              className="rounded-lg border border-zinc-300 px-3 py-2"
            />
          </label>
          <label className="mt-2 flex flex-col gap-1 text-sm">
            <span>Note</span>
            <input
              name="dish_note"
              className="rounded-lg border border-zinc-300 px-3 py-2"
            />
          </label>
        </fieldset>
      ) : null}
      {showItemFields && kind === "shop" ? (
        <fieldset className="rounded-lg border border-zinc-200 p-3">
          <legend className="px-1 text-sm font-medium">
            Optional — what to get
          </legend>
          <label className="mt-2 flex flex-col gap-1 text-sm">
            <span>Item</span>
            <input
              name="dish_name"
              placeholder="Munich mustard, Roman wine…"
              className="rounded-lg border border-zinc-300 px-3 py-2"
            />
          </label>
          <label className="mt-2 flex flex-col gap-1 text-sm">
            <span>Note</span>
            <input
              name="dish_note"
              className="rounded-lg border border-zinc-300 px-3 py-2"
            />
          </label>
        </fieldset>
      ) : null}

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

      {children}

      {children ? (
        <p className="text-xs text-zinc-500">
          Photos and Get this save as you go. This button is for city, name,
          type, and blurb.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
