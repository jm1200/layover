"use client";

import { useState, useTransition } from "react";
import {
  addReviewDish,
  attachDishImage,
} from "@/features/ai-import/media-actions";
import { MAX_PLATES } from "@/features/ai-import/schema";
import { compressStill } from "@/features/ai-import/compress-still";
import { createClient } from "@/lib/supabase/client";
import type { Dish } from "@/features/places/types";

export function PlatesEditor({
  placeId,
  authorId,
  initial,
}: {
  placeId: string;
  authorId: string;
  initial: Dish[];
}) {
  const [plates, setPlates] = useState(initial);
  const [name, setName] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  async function onPlateFile(dish: Dish, file: File) {
    setMsg(null);
    setUploadingId(dish.id);
    try {
      let blob: Blob;
      try {
        blob = await compressStill(file);
      } catch {
        setMsg("Couldn’t read that photo. JPEG or PNG is safest.");
        return;
      }
      const supabase = createClient();
      const path = `${authorId}/${placeId}-dish-${dish.id}.jpg`;
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
      const result = await attachDishImage(dish.id, data.publicUrl);
      if (result.error) {
        setMsg(result.error);
        return;
      }
      const url = `${data.publicUrl}?t=${Date.now()}`;
      setPlates(
        plates.map((p) => (p.id === dish.id ? { ...p, image_url: url } : p)),
      );
    } finally {
      setUploadingId(null);
    }
  }

  return (
    <div className="mt-6 border-t border-zinc-200 pt-4">
      <p className="text-sm font-medium">Plates</p>
      <p className="mt-0.5 text-xs text-zinc-500">
        Up to {MAX_PLATES}. These sit on the rec page, not the city card.
      </p>
      <ul className="mt-3 grid grid-cols-3 gap-2">
        {plates.map((d) => (
          <li key={d.id}>
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-zinc-100">
              {d.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={d.image_url}
                  alt={d.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center px-1 text-center text-[11px] text-zinc-400">
                  {uploadingId === d.id ? "Uploading…" : "Add a photo"}
                </span>
              )}
            </div>
            <p className="mt-1 truncate text-xs font-medium">{d.name}</p>
            <label className="mt-1 inline-block cursor-pointer text-xs text-zinc-600 underline">
              {d.image_url ? "Replace" : "Photo"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={pending || Boolean(uploadingId)}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void onPlateFile(d, f);
                  e.target.value = "";
                }}
              />
            </label>
          </li>
        ))}
      </ul>
      {plates.length < MAX_PLATES ? (
        <div className="mt-3 flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Filet, the dip…"
            className="min-w-0 flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-base"
          />
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              start(async () => {
                setMsg(null);
                const r = await addReviewDish(placeId, name);
                if (r.error) setMsg(r.error);
                else if (r.dish) {
                  setPlates([...plates, r.dish]);
                  setName("");
                }
              })
            }
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm disabled:opacity-60"
          >
            {pending ? "Adding…" : "Add plate"}
          </button>
        </div>
      ) : null}
      {msg ? (
        <p className="mt-2 text-sm text-zinc-700" role="alert">
          {msg}
        </p>
      ) : null}
    </div>
  );
}
