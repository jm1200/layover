"use client";

import { useState, useTransition } from "react";
import {
  addPlaceDish,
  attachDishStill,
  attachPlaceStill,
} from "@/features/places/actions";
import { compressStill } from "@/features/ai-import/compress-still";
import { createClient } from "@/lib/supabase/client";

const MAX = 3;

export function RecPhotosEditor({
  placeId,
  authorId,
  heroSrc,
  extras,
}: {
  placeId: string;
  authorId: string;
  heroSrc?: string | null;
  extras: { src: string; alt: string }[];
}) {
  const start: { src: string; alt: string }[] = [];
  if (heroSrc) start.push({ src: heroSrc, alt: "Hero" });
  for (const e of extras) {
    if (!start.some((u) => u.src === e.src)) start.push(e);
  }
  const [photos, setPhotos] = useState(start.slice(0, MAX));
  const [hero, setHero] = useState(heroSrc ?? start[0]?.src ?? null);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTx] = useTransition();
  const [uploading, setUploading] = useState(false);
  const emptySlots = Math.max(0, MAX - photos.length);

  async function onAdd(file: File) {
    setMsg(null);
    setUploading(true);
    try {
      let blob: Blob;
      try {
        blob = await compressStill(file);
      } catch {
        setMsg("Couldn’t read that photo. JPEG or PNG is safest.");
        return;
      }
      const supabase = createClient();
      const id = crypto.randomUUID();
      const path = `${authorId}/${placeId}-pic-${id}.jpg`;
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
      const url = data.publicUrl;
      if (!hero) {
        const r = await attachPlaceStill(placeId, url, "user");
        if (r.error) {
          setMsg(r.error);
          return;
        }
        setHero(url);
      } else {
        const added = await addPlaceDish(placeId, "Plate");
        if (added.error || !added.dish) {
          setMsg(added.error ?? "Couldn’t add that photo.");
          return;
        }
        const att = await attachDishStill(added.dish.id, url);
        if (att.error) {
          setMsg(att.error);
          return;
        }
      }
      setPhotos((p) => [...p, { src: `${url}?t=${Date.now()}`, alt: "Photo" }]);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mt-8 max-w-lg">
      <p className="text-sm font-medium">Photos</p>
      <p className="mt-0.5 text-xs text-zinc-500">
        Tap one for the city card. Max {MAX}.
      </p>
      <ul className="mt-3 grid grid-cols-3 gap-2">
        {photos.map((p) => {
          const selected = p.src.split("?")[0] === hero?.split("?")[0];
          return (
            <li key={p.src}>
              <button
                type="button"
                disabled={pending || uploading}
                onClick={() =>
                  startTx(async () => {
                    setMsg(null);
                    const r = await attachPlaceStill(placeId, p.src.split("?")[0], "user");
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
        {Array.from({ length: emptySlots }).map((_, i) => (
          <li key={`empty-${i}`}>
            <label className="flex aspect-[4/5] cursor-pointer items-center justify-center rounded-lg bg-zinc-100 text-center text-[11px] text-zinc-500 ring-1 ring-zinc-200">
              {uploading ? "Uploading…" : "Add photo"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading || pending}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void onAdd(f);
                  e.target.value = "";
                }}
              />
            </label>
          </li>
        ))}
      </ul>
      {msg ? (
        <p className="mt-2 text-sm text-zinc-700" role="alert">
          {msg}
        </p>
      ) : null}
    </div>
  );
}
