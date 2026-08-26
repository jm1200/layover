"use client";

import { useState, useTransition } from "react";
import { addPlaceDish, attachDishStill } from "@/features/places/actions";
import { MAX_PLATES } from "@/features/ai-import/schema";
import { compressStill } from "@/features/ai-import/compress-still";
import { createClient } from "@/lib/supabase/client";
import type { Dish } from "@/features/places/types";

export function PlatesEditor({
  placeId,
  authorId,
  initial,
  recStill,
  namesOnly,
}: {
  placeId: string;
  authorId: string;
  initial: Dish[];
  recStill?: string | null;
  namesOnly?: boolean;
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
      const result = await attachDishStill(dish.id, data.publicUrl);
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
        {namesOnly
          ? `Names on Get this. Photos live in the album above. Up to ${MAX_PLATES}.`
          : `Name them first, then add photos. Up to ${MAX_PLATES}.`}
      </p>
      {plates.length > 0 ? (
        <ul className="mt-3 divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white">
          {plates.map((d) => (
            <li key={d.id} className="flex items-center gap-3 px-3 py-2">
              {!namesOnly && d.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={d.image_url}
                  alt=""
                  className="h-12 w-10 shrink-0 rounded object-cover"
                />
              ) : null}
              <p className="min-w-0 flex-1 truncate text-sm font-medium">
                {d.name}
              </p>
              {namesOnly ? null : (
              <div className="flex shrink-0 flex-wrap items-center gap-2 text-xs">
                <label className="cursor-pointer text-zinc-600 underline">
                  {uploadingId === d.id
                    ? "Uploading…"
                    : d.image_url
                      ? "Replace"
                      : "Add photo"}
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
                {!d.image_url && recStill ? (
                  <button
                    type="button"
                    className="text-zinc-600 underline"
                    disabled={pending}
                    onClick={() =>
                      start(async () => {
                        setMsg(null);
                        const r = await attachDishStill(d.id, recStill);
                        if (r.error) setMsg(r.error);
                        else
                          setPlates(
                            plates.map((p) =>
                              p.id === d.id
                                ? { ...p, image_url: recStill }
                                : p,
                            ),
                          );
                      })
                    }
                  >
                    Use rec photo
                  </button>
                ) : null}
              </div>
              )}
            </li>
          ))}
        </ul>
      ) : null}
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
                const r = await addPlaceDish(placeId, name);
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
