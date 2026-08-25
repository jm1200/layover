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
  const total = places.length;
  const done = total - left.length;
  const current = left[0];

  if (!current) {
    return (
      <div className="mt-8">
        {total > 0 ? (
          <p className="text-zinc-700">
            Places are filed
            {total > 1 ? ` (${total})` : ""}.
          </p>
        ) : null}
        {playbook ? <LayoverNext playbook={playbook} /> : null}
        {!playbook && total === 0 ? (
          <p className="mt-8 text-sm text-zinc-500">
            Nothing new to file — I linked an existing rec. Check Dashboard.
          </p>
        ) : null}
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
          onFiled={() => setLeft((q) => q.slice(1))}
        />
      </div>
    </section>
  );
}

function LayoverNext({ playbook }: { playbook: Playbook }) {
  return (
    <section className="mt-6">
      <h2 className="font-semibold">Now the layover</h2>
      <p className="mt-1 text-sm text-zinc-600">
        The day that strings those recs. Check it and publish when you’re
        happy.
      </p>
      <Link
        href={`/dashboard/playbooks/${playbook.id}/edit`}
        className="mt-3 block rounded-2xl border border-zinc-200 bg-white px-4 py-4 hover:border-zinc-400"
      >
        <span className="font-medium">{playbook.title}</span>
        <span className="ml-2 text-sm text-zinc-400">({playbook.status})</span>
        {playbook.narrative ? (
          <p className="mt-2 text-sm text-zinc-600">{playbook.narrative}</p>
        ) : null}
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
  onFiled: () => void;
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
                else onFiled();
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
