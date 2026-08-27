"use client";

import { useState, useTransition } from "react";
import {
  addPlacePhoto,
  attachPlaceStill,
  removePlacePhoto,
} from "@/features/places/actions";
import { compressStill } from "@/features/ai-import/compress-still";
import { createClient } from "@/lib/supabase/client";

const MAX = 3;

export type RecPhotoSlot = { id: string; src: string; alt: string };

export function RecPhotosEditor({
  placeId,
  authorId,
  heroSrc,
  photos: initial,
  onChange,
  className,
}: {
  placeId: string;
  authorId: string;
  heroSrc?: string | null;
  photos: RecPhotoSlot[];
  onChange?: (photos: RecPhotoSlot[], hero: string | null) => void;
  className?: string;
}) {
  const [photos, setPhotos] = useState((initial ?? []).slice(0, MAX));
  const [hero, setHero] = useState(heroSrc ?? initial?.[0]?.src ?? null);
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
      const path = `${authorId}/${placeId}-pic-${crypto.randomUUID()}.jpg`;
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
      const added = await addPlacePhoto(placeId, url);
      if (added.error) {
        setMsg(added.error);
        return;
      }
      const src = `${url}?t=${Date.now()}`;
      const next = [...photos, { id: added.photoId ?? src, src, alt: "Photo" }];
      const nextHero = hero ?? url;
      setPhotos(next);
      if (!hero) setHero(url);
      onChange?.(next, nextHero);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className={className ?? "mt-8 max-w-lg"}>
      <p className="text-sm font-medium">Photos</p>
      <p className="mt-0.5 text-xs text-zinc-500">
        Any pictures of this place. Tap one to use as the hero — that’s the
        city-page tile and the top of the page. Max {MAX}. Saves as you go.
      </p>
      <ul className="mt-3 grid grid-cols-3 gap-2">
        {photos.map((p) => {
          const selected = p.src.split("?")[0] === hero?.split("?")[0];
          return (
            <li key={p.id} className="relative">
              <button
                type="button"
                disabled={pending || uploading}
                onClick={() =>
                  startTx(async () => {
                    setMsg(null);
                    const r = await attachPlaceStill(
                      placeId,
                      p.src.split("?")[0],
                      "user",
                    );
                    if (r.error) setMsg(r.error);
                    else {
                      setHero(p.src);
                      setMsg("That’s the hero.");
                      onChange?.(photos, p.src);
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
              <button
                type="button"
                aria-label="Remove photo"
                disabled={pending || uploading}
                onClick={(e) => {
                  e.preventDefault();
                  startTx(async () => {
                    setMsg(null);
                    const r = await removePlacePhoto(placeId, p.id);
                    if (r.error) {
                      setMsg(r.error);
                      return;
                    }
                    const next = photos.filter((x) => x.id !== p.id);
                    const nextHero = selected
                      ? (next[0]?.src ?? null)
                      : hero;
                    setPhotos(next);
                    if (selected) setHero(nextHero);
                    onChange?.(next, nextHero);
                  });
                }}
                className="absolute right-1 top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-xs text-white"
              >
                ×
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
              {uploading ? "Uploading…" : "Add a photo"}
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
