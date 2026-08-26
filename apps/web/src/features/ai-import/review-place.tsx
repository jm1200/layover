"use client";

import { useState, useTransition } from "react";
import {
  attachPlaceImage,
  publishReviewed,
  savePlaceReview,
} from "@/features/ai-import/media-actions";
import { compressStill } from "@/features/ai-import/compress-still";
import { createClient } from "@/lib/supabase/client";
import { recKindFromCategory, REC_KIND_LABEL } from "@/features/places/kind";
import { PlatesEditor } from "@/features/places/plates-editor";
import type { Dish, Place } from "@/features/places/types";
import type { Playbook } from "@/features/playbooks/types";

export function ReviewQueue({
  places,
  playbook,
  authorId,
  logId,
  dishesByPlace,
}: {
  places: Place[];
  playbook: Playbook | null;
  authorId: string;
  logId: string;
  dishesByPlace: Record<string, Dish[]>;
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
          <LayoverPublish
            playbook={playbook}
            places={filed.length ? filed : places}
            logId={logId}
          />
        ) : total > 0 ? (
          <RecPublish logId={logId} />
        ) : (
          <p className="mt-8 text-sm text-zinc-500">
            Nothing new to file — that rec is already on the city.
          </p>
        )}
      </div>
    );
  }

  return (
    <section className="mt-8">
      <h2 className="font-semibold">Places first</h2>
      <p className="mt-1 text-sm text-zinc-600">
        I wrote the blurb. Edit if you want. Photo or AI still — then next.
      </p>
      <div className="mt-4">
        <ReviewPlaceCard
          key={current.id}
          place={current}
          authorId={authorId}
          logId={logId}
          index={done + 1}
          total={total}
          last={!left[1]}
          recOnly={!playbook}
          dishes={dishesByPlace[current.id] ?? []}
          onFiled={(next) => {
            setFiled((q) => [...q, next]);
            setLeft((q) => q.slice(1));
          }}
        />
      </div>
    </section>
  );
}

function RecPublish({ logId }: { logId: string }) {
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <div>
      <p className="text-zinc-700">Looks good. Publish when you’re ready.</p>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            setMsg(null);
            const r = await publishReviewed(logId, {}, new FormData());
            if (r?.error) setMsg(r.error);
          })
        }
        className="mt-4 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Publishing…" : "Publish"}
      </button>
      {msg ? (
        <p className="mt-3 text-sm text-red-800" role="alert">
          {msg}
        </p>
      ) : null}
    </div>
  );
}

function LayoverPublish({
  playbook,
  places,
  logId,
}: {
  playbook: Playbook;
  places: Place[];
  logId: string;
}) {
  const n = Math.min(Math.max(places.length, 1), 4);
  const tiles = places.slice(0, 4);
  const [title, setTitle] = useState(playbook.title);
  const [narrative, setNarrative] = useState(playbook.narrative ?? "");
  const [hours, setHours] = useState(
    playbook.hours_available != null ? String(playbook.hours_available) : "",
  );
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <section>
      <h2 className="font-semibold">Now the layover</h2>
      <p className="mt-1 text-sm text-zinc-600">
        The day that strings those recs. Publish when you’re ready — stills
        generate after that, if you asked for them.
      </p>
      <div className="mt-4 overflow-hidden rounded-2xl bg-white ring-1 ring-zinc-200">
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
              ) : (
                <span className="absolute inset-0 flex items-center justify-center px-2 text-center text-[11px] text-white/70">
                  AI still on publish
                </span>
              )}
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2 pb-2 pt-6 text-[11px] font-medium leading-tight text-white">
                {p.name}
              </span>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3 px-5 py-5">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-base"
            />
          </label>
          {playbook.hours_available != null || hours ? (
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">Hours</span>
              <input
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                type="number"
                min={1}
                max={72}
                className="rounded-lg border border-zinc-300 px-3 py-2 text-base"
              />
            </label>
          ) : null}
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">The day</span>
            <span className="text-xs font-normal text-zinc-500">
              Your dump, tightened. Edit if you want.
            </span>
            <textarea
              rows={5}
              value={narrative}
              onChange={(e) => setNarrative(e.target.value)}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-base leading-relaxed"
            />
          </label>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              start(async () => {
                setMsg(null);
                const fd = new FormData();
                fd.set("title", title);
                fd.set("narrative", narrative);
                if (hours) fd.set("hours_available", hours);
                const r = await publishReviewed(logId, {}, fd);
                if (r?.error) setMsg(r.error);
              })
            }
            className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
          >
            {pending ? "Publishing…" : "Publish"}
          </button>
          {msg ? (
            <p className="text-sm text-red-800" role="alert">
              {msg}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function ReviewPlaceCard({
  place,
  authorId,
  logId,
  index,
  total,
  last,
  recOnly,
  dishes: initialDishes,
  onFiled,
}: {
  place: Place;
  authorId: string;
  logId: string;
  index: number;
  total: number;
  last: boolean;
  recOnly: boolean;
  dishes: Dish[];
  onFiled: (filed: Place) => void;
}) {
  const [blurb, setBlurb] = useState(place.blurb ?? "");
  const [preview, setPreview] = useState(place.image_url ?? null);
  const [wantAi, setWantAi] = useState(
    !place.image_url && place.want_ai_still !== false,
  );
  const [msg, setMsg] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pending, start] = useTransition();
  const kind = recKindFromCategory(place.category);
  const showPlates = kind === "eat" || kind === "shop";
  const publishNow = recOnly && last;
  const nextLabel = publishNow
    ? "Publish"
    : last
      ? "Next — the layover"
      : total > 1
        ? "Next place"
        : "Next";

  async function persist() {
    const fd = new FormData();
    fd.set("blurb", blurb);
    fd.set("want_ai_still", wantAi && !preview ? "true" : "false");
    return savePlaceReview(place.id, {}, fd);
  }

  async function onFile(file: File) {
    setMsg(null);
    setUploading(true);
    try {
      let blob: Blob;
      try {
        blob = await compressStill(file);
      } catch (e) {
        const why = e instanceof Error ? e.message : "";
        setMsg(
          why === "too-large"
            ? "That file is huge. Try a photo from the camera roll."
            : "Couldn’t read that photo. JPEG or PNG is safest.",
        );
        return;
      }
      const supabase = createClient();
      const path = `${authorId}/${place.id}.jpg`;
      const { error } = await supabase.storage
        .from("place-stills")
        .upload(path, blob, {
          upsert: true,
          contentType: "image/jpeg",
        });
      if (error) {
        setMsg("Couldn’t upload that photo.");
        return;
      }
      const { data } = supabase.storage.from("place-stills").getPublicUrl(path);
      const result = await attachPlaceImage(place.id, data.publicUrl, "user");
      if (result.error) setMsg(result.error);
      else {
        setPreview(`${data.publicUrl}?t=${Date.now()}`);
        setWantAi(false);
        setMsg(result.success ?? "Photo saved.");
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
        Place {index} of {total} · {REC_KIND_LABEL[kind]}
      </p>
      <h3 className="mt-1 text-lg font-semibold">{place.name}</h3>

      <div className="mt-3 flex flex-col gap-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Why it’s a steal</span>
          <textarea
            name="blurb"
            rows={5}
            value={blurb}
            onChange={(e) => setBlurb(e.target.value)}
            className="rounded-xl border border-zinc-300 px-3 py-2 text-base leading-relaxed"
          />
        </label>
      </div>

      <div className="mt-4">
        <p className="text-sm font-medium">The place</p>
        <p className="mt-0.5 text-xs text-zinc-500">
          The outside — door, street, walk-up. This is the city card.
        </p>
        {preview ? (
          <div className="relative mt-2 aspect-[4/5] max-w-xs overflow-hidden rounded-xl bg-zinc-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt={place.name}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <p className="mt-1 text-sm text-zinc-500">
            Upload the place, or I’ll make one when you publish (~2¢).
          </p>
        )}
        {preview ? (
          <p className="mt-1 text-xs text-zinc-500">
            This is the city-card crop. Hate it — upload another.
          </p>
        ) : null}
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <label className="inline-block cursor-pointer rounded-lg border border-zinc-300 px-3 py-2 text-sm">
            {uploading ? "Uploading…" : "Upload the place"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void onFile(f);
                e.target.value = "";
              }}
            />
          </label>
          {!preview ? (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={wantAi}
                onChange={(e) => setWantAi(e.target.checked)}
              />
              AI still on publish
            </label>
          ) : null}
        </div>
      </div>

      {showPlates ? (
        <PlatesEditor
          placeId={place.id}
          authorId={authorId}
          initial={initialDishes}
        />
      ) : null}

      <button
        type="button"
        disabled={pending || uploading}
        onClick={() =>
          start(async () => {
            setMsg(null);
            if (!preview && !wantAi) {
              setMsg("Need a photo — upload one, or leave AI still checked.");
              return;
            }
            const r = await persist();
            if (r.error) {
              setMsg(r.error);
              return;
            }
            if (publishNow) {
              const pub = await publishReviewed(logId, {}, new FormData());
              if (pub?.error) setMsg(pub.error);
              return;
            }
            onFiled({
              ...place,
              blurb,
              image_url: preview,
              want_ai_still: wantAi && !preview,
            });
          })
        }
        className="mt-4 rounded-lg bg-zinc-900 px-3 py-2 text-sm text-white disabled:opacity-60"
      >
        {pending ? (publishNow ? "Publishing…" : "Saving…") : nextLabel}
      </button>

      {msg ? (
        <p className="mt-3 text-sm text-zinc-700" role="alert">
          {msg}
        </p>
      ) : null}
    </article>
  );
}
