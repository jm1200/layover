"use client";

import { useState } from "react";
import { attachPlaceImage } from "@/features/ai-import/media-actions";
import { compressStill } from "@/features/ai-import/compress-still";
import { createClient } from "@/lib/supabase/client";

export function RecStillEditor({
  placeId,
  authorId,
  src,
  alt,
}: {
  placeId: string;
  authorId: string;
  src?: string | null;
  alt: string;
}) {
  const [preview, setPreview] = useState(src ?? null);
  const [msg, setMsg] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function onFile(file: File) {
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
      const path = `${authorId}/${placeId}.jpg`;
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
      const result = await attachPlaceImage(placeId, data.publicUrl, "user");
      if (result.error) setMsg(result.error);
      else {
        setPreview(`${data.publicUrl}?t=${Date.now()}`);
        setMsg("Hero saved.");
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mt-8 max-w-lg">
      <p className="text-sm font-medium">Hero / city card</p>
      <p className="mt-0.5 text-xs text-zinc-500">
        Lumen uses this on the city card until likes exist.
      </p>
      <div className="relative mt-2 aspect-[4/5] max-w-xs overflow-hidden rounded-xl bg-zinc-100">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt={alt}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-xs text-zinc-400">
            No photo yet
          </span>
        )}
      </div>
      <label className="mt-2 inline-block cursor-pointer text-sm text-zinc-700 underline">
        {uploading ? "Uploading…" : preview ? "Replace" : "Upload"}
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
      {msg ? (
        <p className="mt-2 text-sm text-zinc-700" role="alert">
          {msg}
        </p>
      ) : null}
    </div>
  );
}
