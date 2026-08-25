"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  attachPlaceImage,
  generatePlaceStill,
  savePlaceBlurb,
  sellPlaceBlurb,
} from "@/features/ai-import/media-actions";
import { lumenOffersStill } from "@/features/ai-import/quality";
import { createClient } from "@/lib/supabase/client";
import { recKindFromCategory, REC_KIND_LABEL } from "@/features/places/kind";
import type { Place } from "@/features/places/types";
import type { Playbook } from "@/features/playbooks/types";

export function ReviewQueue({
  places,
  playbook,
  authorId,
}: {
  places: Place[];
  playbook: Playbook | null;
  authorId: string;
}) {
  const [left, setLeft] = useState(places);
  const [filed, setFiled] = useState<Place[]>([]);
  const total = places.length;
  const done = total - left.length;
  const current = left[0];

  if (!current) {
    return (
      <div className="mt-8">
        {playbook ? (
          <LayoverNext playbook={playbook} places={filed.length ? filed : places} />
        ) : total > 0 ? (
          <p className="text-zinc-700">Places are filed.</p>
        ) : (
          <p className="mt-8 text-sm text-zinc-500">
            Nothing new to file — I linked an existing rec. Check Dashboard.
          </p>
        )}
      </div>
    );
  }

  return (
    <section className="mt-8">
      <h2 className="font-semibold">Places first</h2>
      <p className="mt-1 text-sm text-zinc-600">
        One rec at a time. Save when this one is good — then the next.
      </p>
      <div className="mt-4">
        <ReviewPlaceCard
          key={current.id}
          place={current}
          authorId={authorId}
          index={done + 1}
          total={total}
          last={!left[1] && Boolean(playbook)}
          onFiled={(next) => {
            setFiled((q) => [...q, next]);
            setLeft((q) => q.slice(1));
          }}
        />
      </div>
    </section>
  );
}

function LayoverNext({
  playbook,
  places,
}: {
  playbook: Playbook;
  places: Place[];
}) {
  const n = Math.min(Math.max(places.length, 1), 4);
  const tiles = places.slice(0, 4);

  return (
    <section>
      <h2 className="font-semibold">Now the layover</h2>
      <p className="mt-1 text-sm text-zinc-600">
        The day that strings those recs. The strip is their stills.
      </p>
      <Link
        href={`/dashboard/playbooks/${playbook.id}/edit`}
        className="mt-4 block overflow-hidden rounded-2xl bg-white ring-1 ring-zinc-200 hover:ring-zinc-400"
      >
        <div
          className="grid gap-0.5 bg-zinc-950"
          style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
        >
          {tiles.map((p) => (
            <div key={p.id} className="relative aspect-square bg-zinc-800">
              {p.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.image_url}
                  alt={p.name}
                  className="h-full w-full object-cover"
                />
              ) : null}
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2 pb-2 pt-6 text-[11px] font-medium leading-tight text-white">
                {p.name}
              </span>
            </div>
          ))}
        </div>
        <div className="px-5 py-5">
          {playbook.hours_available ? (
            <p className="font-mono text-4xl font-semibold tracking-tight">
              ~{playbook.hours_available}h
            </p>
          ) : null}
          <p className="mt-2 text-lg font-semibold tracking-tight">
            {playbook.title}
          </p>
          {playbook.narrative ? (
            <p className="mt-2 text-sm leading-relaxed text-zinc-600">
              {playbook.narrative}
            </p>
          ) : null}
          <p className="mt-4 text-sm font-medium text-zinc-900">
            Edit & publish the day →
          </p>
        </div>
      </Link>
    </section>
  );
}

function ReviewPlaceCard({
  place,
  authorId,
  index,
  total,
  last,
  onFiled,
}: {
  place: Place;
  authorId: string;
  index: number;
  total: number;
  last: boolean;
  onFiled: (filed: Place) => void;
}) {
  const [blurb, setBlurb] = useState(place.blurb ?? "");
  const [preview, setPreview] = useState(place.image_url ?? null);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const offers = lumenOffersStill(blurb);
  const kind = recKindFromCategory(place.category);
  const saveLabel = last
    ? "Save — then the layover"
    : total > 1
      ? "Save — next place"
      : "Save this place";

  async function onFile(file: File) {
    setMsg(null);
    if (file.size > 2_000_000) {
      setMsg("Keep it under 2 MB.");
      return;
    }
    const supabase = createClient();
    const path = `${authorId}/${place.id}.jpg`;
    const { error } = await supabase.storage
      .from("place-stills")
      .upload(path, file, {
        upsert: true,
        contentType: file.type || "image/jpeg",
      });
    if (error) {
      setMsg(error.message);
      return;
    }
    const { data } = supabase.storage.from("place-stills").getPublicUrl(path);
    const result = await attachPlaceImage(place.id, data.publicUrl, "user");
    if (result.error) setMsg(result.error);
    else {
      setPreview(`${data.publicUrl}?t=${Date.now()}`);
      setMsg(result.success ?? "Photo saved.");
    }
  }

  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
        Place {index} of {total} · {REC_KIND_LABEL[kind]}
      </p>
      <h3 className="mt-1 text-lg font-semibold">{place.name}</h3>

      <div className="mt-3 flex flex-col gap-2">
        <textarea
          name="blurb"
          rows={5}
          value={blurb}
          onChange={(e) => setBlurb(e.target.value)}
          className="rounded-xl border border-zinc-300 px-3 py-2 text-sm leading-relaxed"
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              start(async () => {
                setMsg(null);
                const fd = new FormData();
                fd.set("blurb", blurb);
                const r = await savePlaceBlurb(place.id, {}, fd);
                if (r.error) setMsg(r.error);
                else
                  onFiled({
                    ...place,
                    blurb,
                    image_url: preview,
                  });
              })
            }
            className="rounded-lg bg-zinc-900 px-3 py-2 text-sm text-white disabled:opacity-60"
          >
            {pending ? "Saving…" : saveLabel}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              start(async () => {
                setMsg(null);
                const r = await sellPlaceBlurb(place.id);
                setMsg(r.error ?? r.success ?? null);
                if (r.blurb) setBlurb(r.blurb);
              })
            }
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm disabled:opacity-60"
          >
            Make this sell
          </button>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-sm font-medium">Photo</p>
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt=""
            className="mt-2 h-40 w-full rounded-xl object-cover"
          />
        ) : (
          <p className="mt-1 text-sm text-zinc-500">None yet.</p>
        )}
        <label className="mt-2 inline-block cursor-pointer rounded-lg border border-zinc-300 px-3 py-2 text-sm">
          Upload yours
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onFile(f);
            }}
          />
        </label>
        {offers ? (
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              start(async () => {
                setMsg(null);
                const r = await generatePlaceStill(place.id);
                setMsg(r.error ?? r.success ?? null);
                if (r.imageUrl) setPreview(r.imageUrl);
              })
            }
            className="ml-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm disabled:opacity-60"
          >
            Lumen, generate one (~2¢)
          </button>
        ) : (
          <p className="mt-2 text-xs text-zinc-500">
            I won’t spend on a still until this rec sells — tap Make this sell,
            or upload a photo.
          </p>
        )}
      </div>

      {msg ? <p className="mt-3 text-sm text-zinc-700">{msg}</p> : null}
    </article>
  );
}
