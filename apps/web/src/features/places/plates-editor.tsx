"use client";

import { useEffect, useState, useTransition } from "react";
import {
  addPlaceDish,
  attachDishStill,
  deletePlaceDish,
  updatePlaceDish,
} from "@/features/places/actions";
import { MAX_PLATES } from "@/features/ai-import/schema";
import { compressStill } from "@/features/ai-import/compress-still";
import { createClient } from "@/lib/supabase/client";
import type { Dish } from "@/features/places/types";

export function PlatesEditor({
  placeId,
  authorId,
  initial,
  recStill: _recStill,
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
      setPlates((prev) =>
        prev.map((p) => (p.id === dish.id ? { ...p, image_url: url } : p)),
      );
    } finally {
      setUploadingId(null);
    }
  }

  function addPlate() {
    start(async () => {
      setMsg(null);
      const r = await addPlaceDish(placeId, name);
      if (r.error) setMsg(r.error);
      else if (r.dish) {
        setPlates((prev) => [...prev, r.dish!]);
        setName("");
      }
    });
  }

  return (
    <div className="mt-6 border-t border-zinc-200 pt-4">
      <p className="text-sm font-medium">Get this</p>
      <p className="mt-0.5 text-xs text-zinc-500">
        {namesOnly
          ? `Names on the rec page. Rename, add, or X to remove — saved as you go. Photos of the place live in the album above. Up to ${MAX_PLATES}.`
          : `The food. Not the building. This sits under Get this. Name it, then upload that plate. Up to ${MAX_PLATES}.`}
      </p>
      {plates.length > 0 ? (
        <ul className="mt-3 divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white">
          {plates.map((d) => (
            <PlateRow
              key={d.id}
              dish={d}
              namesOnly={Boolean(namesOnly)}
              pending={pending}
              uploadingId={uploadingId}
              onPlateFile={onPlateFile}
              onRename={async (next) => {
                setMsg(null);
                const r = await updatePlaceDish(d.id, next);
                if (r.error) {
                  setMsg(r.error);
                  return false;
                }
                setPlates((prev) =>
                  prev.map((p) =>
                    p.id === d.id ? { ...p, name: next } : p,
                  ),
                );
                return true;
              }}
              onDelete={() => {
                if (!confirm("Take this off Get this?")) return;
                start(async () => {
                  setMsg(null);
                  const r = await deletePlaceDish(d.id);
                  if (r.error) setMsg(r.error);
                  else setPlates((prev) => prev.filter((p) => p.id !== d.id));
                });
              }}
            />
          ))}
        </ul>
      ) : null}
      {plates.length < MAX_PLATES ? (
        <div className="mt-3 flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (!pending && name.trim()) addPlate();
              }
            }}
            placeholder="Filet, the dip…"
            className="min-w-0 flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-base"
          />
          <button
            type="button"
            disabled={pending}
            onClick={addPlate}
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

function PlateRow({
  dish,
  namesOnly,
  pending,
  uploadingId,
  onPlateFile,
  onRename,
  onDelete,
}: {
  dish: Dish;
  namesOnly: boolean;
  pending: boolean;
  uploadingId: string | null;
  onPlateFile: (dish: Dish, file: File) => Promise<void>;
  onRename: (name: string) => Promise<boolean>;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState(dish.name);

  useEffect(() => {
    setDraft(dish.name);
  }, [dish.name]);

  async function saveIfDirty() {
    const n = draft.trim();
    if (!n) {
      setDraft(dish.name);
      return;
    }
    if (n === dish.name) return;
    const ok = await onRename(n);
    if (!ok) setDraft(dish.name);
  }

  return (
    <li className="flex items-center gap-3 px-3 py-2">
      {!namesOnly && dish.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={dish.image_url}
          alt=""
          className="h-12 w-10 shrink-0 rounded object-cover"
        />
      ) : null}
      <input
        value={draft}
        aria-label="Plate name"
        disabled={pending}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => void saveIfDirty()}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            (e.target as HTMLInputElement).blur();
          }
        }}
        className="min-w-0 flex-1 rounded border border-transparent bg-transparent px-1 py-1 text-sm font-medium hover:border-zinc-200 focus:border-zinc-400 focus:outline-none"
      />
      {namesOnly ? null : (
        <div className="flex shrink-0 flex-wrap items-center gap-2 text-xs">
          <label className="cursor-pointer text-zinc-600 underline">
            {uploadingId === dish.id
              ? "Uploading…"
              : dish.image_url
                ? "Replace"
                : "Upload the plate"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={pending || Boolean(uploadingId)}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void onPlateFile(dish, f);
                e.target.value = "";
              }}
            />
          </label>
        </div>
      )}
      <button
        type="button"
        aria-label="Remove plate"
        disabled={pending}
        onClick={onDelete}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-800 disabled:opacity-60"
      >
        ×
      </button>
    </li>
  );
}
