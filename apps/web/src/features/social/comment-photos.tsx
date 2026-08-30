"use client";

import { useState, useTransition } from "react";
import { compressStill } from "@/features/ai-import/compress-still";
import { createClient } from "@/lib/supabase/client";
import {
  addCommentPhoto,
  removeCommentPhoto,
} from "@/features/social/actions";
import { ZoomPhoto } from "@/features/places/zoom-photo";
import {
  MAX_COMMENT_PHOTOS,
  type CommentPhoto,
  type SocialKind,
} from "@/features/social/types";

async function uploadStill(userId: string, file: File): Promise<string> {
  const blob = await compressStill(file);
  const supabase = createClient();
  const path = `${userId}/comment-${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage.from("place-stills").upload(path, blob, {
    upsert: true,
    contentType: "image/jpeg",
  });
  if (error) throw new Error("upload");
  return supabase.storage.from("place-stills").getPublicUrl(path).data.publicUrl;
}

function AddSlot({
  disabled,
  onFile,
  uploading,
}: {
  disabled: boolean;
  onFile: (file: File) => void;
  uploading: boolean;
}) {
  return (
    <label className="flex aspect-[4/5] cursor-pointer items-center justify-center rounded-lg bg-zinc-100 text-center text-[11px] text-zinc-500 ring-1 ring-zinc-200">
      {uploading ? "Uploading…" : "Add a photo"}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
    </label>
  );
}

export function DraftCommentPhotos({ userId }: { userId: string }) {
  const [urls, setUrls] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const empty = Math.max(0, MAX_COMMENT_PHOTOS - urls.length);
  const showGrid = open || urls.length > 0;

  async function onAdd(file: File) {
    if (urls.length >= MAX_COMMENT_PHOTOS) {
      setMsg("Three photos is enough.");
      return;
    }
    setMsg(null);
    setUploading(true);
    try {
      const url = await uploadStill(userId, file);
      setUrls((prev) => [...prev, url].slice(0, MAX_COMMENT_PHOTOS));
    } catch {
      setMsg("Couldn’t read that photo. JPEG or PNG is safest.");
    } finally {
      setUploading(false);
    }
  }

  if (!showGrid) {
    return (
      <button
        type="button"
        className="mt-3 text-sm text-zinc-600 underline"
        onClick={() => setOpen(true)}
      >
        Add a photo
      </button>
    );
  }

  return (
    <div className="mt-3">
      <p className="text-xs text-zinc-500">
        Up to {MAX_COMMENT_PHOTOS}. What you actually saw.
      </p>
      <ul className="mt-2 grid max-w-sm grid-cols-3 gap-2">
        {urls.map((url) => (
          <li key={url} className="relative">
            <input type="hidden" name="photo_url" value={url} />
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-zinc-100 ring-1 ring-zinc-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
            </div>
            <button
              type="button"
              aria-label="Remove photo"
              disabled={uploading}
              onClick={() => setUrls((prev) => prev.filter((u) => u !== url))}
              className="absolute right-1 top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-xs text-white"
            >
              ×
            </button>
          </li>
        ))}
        {Array.from({ length: empty }).map((_, i) => (
          <li key={`empty-${i}`}>
            <AddSlot
              disabled={uploading}
              uploading={uploading && i === 0}
              onFile={(f) => void onAdd(f)}
            />
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

export function OwnCommentPhotos({
  commentId,
  kind,
  targetId,
  photos: initial,
  userId,
}: {
  commentId: string;
  kind: SocialKind;
  targetId: string;
  photos: CommentPhoto[];
  userId: string;
}) {
  const [photos, setPhotos] = useState(initial.slice(0, MAX_COMMENT_PHOTOS));
  const [msg, setMsg] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pending, startTx] = useTransition();
  const empty = Math.max(0, MAX_COMMENT_PHOTOS - photos.length);

  async function onAdd(file: File) {
    if (photos.length >= MAX_COMMENT_PHOTOS) {
      setMsg("Three photos is enough.");
      return;
    }
    setMsg(null);
    setUploading(true);
    try {
      const url = await uploadStill(userId, file);
      const added = await addCommentPhoto(commentId, kind, targetId, url);
      if (added.error) {
        setMsg(added.error);
        return;
      }
      setPhotos((prev) =>
        [
          ...prev,
          { id: added.photoId ?? url, src: `${url}?t=${Date.now()}` },
        ].slice(0, MAX_COMMENT_PHOTOS),
      );
    } catch {
      setMsg("Couldn’t read that photo. JPEG or PNG is safest.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mt-2">
      <ul className="grid max-w-sm grid-cols-3 gap-2">
        {photos.map((p) => (
          <li key={p.id} className="relative aspect-[4/5] overflow-hidden rounded-lg bg-zinc-100">
            <ZoomPhoto src={p.src} alt="photo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.src}
                alt=""
                className="h-full w-full object-cover"
              />
            </ZoomPhoto>
            <button
              type="button"
              aria-label="Remove photo"
              disabled={pending || uploading}
              onClick={() =>
                startTx(async () => {
                  setMsg(null);
                  const r = await removeCommentPhoto(
                    commentId,
                    p.id,
                    kind,
                    targetId,
                  );
                  if (r.error) {
                    setMsg(r.error);
                    return;
                  }
                  setPhotos((prev) => prev.filter((x) => x.id !== p.id));
                })
              }
              className="absolute right-1 top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-xs text-white"
            >
              ×
            </button>
          </li>
        ))}
        {Array.from({ length: empty }).map((_, i) => (
          <li key={`empty-${i}`}>
            <AddSlot
              disabled={uploading || pending}
              uploading={uploading && i === 0}
              onFile={(f) => void onAdd(f)}
            />
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

export function CommentPhotoGrid({ photos }: { photos: CommentPhoto[] }) {
  if (photos.length === 0) return null;
  return (
    <ul className="mt-2 grid max-w-sm grid-cols-3 gap-2">
      {photos.slice(0, MAX_COMMENT_PHOTOS).map((p) => (
        <li
          key={p.id}
          className="relative aspect-[4/5] overflow-hidden rounded-lg bg-zinc-100"
        >
          <ZoomPhoto src={p.src} alt="photo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.src} alt="" className="h-full w-full object-cover" />
          </ZoomPhoto>
        </li>
      ))}
    </ul>
  );
}
