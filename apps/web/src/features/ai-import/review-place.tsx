"use client";

import { useActionState, useState, useTransition } from "react";
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

export function ReviewPlaceCard({
  place,
  authorId,
  index,
  total,
}: {
  place: Place;
  authorId: string;
  index: number;
  total: number;
}) {
  const [state, saveAction, saving] = useActionState(
    savePlaceBlurb.bind(null, place.id),
    {},
  );
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [preview, setPreview] = useState(place.image_url ?? null);
  const offers = lumenOffersStill(place.blurb);
  const kind = recKindFromCategory(place.category);

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
      .upload(path, file, { upsert: true, contentType: file.type || "image/jpeg" });
    if (error) {
      setMsg(error.message);
      return;
    }
    const { data } = supabase.storage.from("place-stills").getPublicUrl(path);
    const result = await attachPlaceImage(place.id, data.publicUrl, "user");
    if (result.error) setMsg(result.error);
    else {
      setPreview(data.publicUrl);
      setMsg(result.success ?? "Photo saved.");
    }
  }

  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
        Place {index} of {total} · {REC_KIND_LABEL[kind]}
      </p>
      <h3 className="mt-1 text-lg font-semibold">{place.name}</h3>

      <form action={saveAction} className="mt-3 flex flex-col gap-2">
        <textarea
          name="blurb"
          rows={5}
          defaultValue={place.blurb ?? ""}
          className="rounded-xl border border-zinc-300 px-3 py-2 text-sm leading-relaxed"
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-zinc-900 px-3 py-2 text-sm text-white disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save blurb"}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              start(async () => {
                setMsg(null);
                const r = await sellPlaceBlurb(place.id);
                setMsg(r.error ?? r.success ?? null);
              })
            }
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm disabled:opacity-60"
          >
            Make this sell
          </button>
        </div>
      </form>

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

      {state.error || state.success || msg ? (
        <p className="mt-3 text-sm text-zinc-700">
          {state.error ?? state.success ?? msg}
        </p>
      ) : null}
    </article>
  );
}
