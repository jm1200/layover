"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { compressStill } from "@/features/ai-import/compress-still";
import { createClient } from "@/lib/supabase/client";
import {
  saveProfile,
  attachGooglePhoto,
  type SocialState,
} from "@/features/social/actions";
import { FaceCircle } from "@/features/social/face";

const initial: SocialState = {};

export function NamePhotoForm({
  userId,
  name,
  avatarUrl,
  hasGooglePhoto,
}: {
  userId: string;
  name: string;
  avatarUrl: string | null;
  hasGooglePhoto: boolean;
}) {
  const [state, action, pending] = useActionState(saveProfile, initial);
  const [preview, setPreview] = useState(avatarUrl);
  const [clear, setClear] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [googlePending, startGoogle] = useTransition();
  const router = useRouter();
  const shown = clear ? null : preview;
  const label = name.trim() || "Crew";

  async function onFile(file: File) {
    setMsg(null);
    setUploading(true);
    try {
      const blob = await compressStill(file);
      const supabase = createClient();
      const path = `${userId}/avatar.jpg`;
      const { error } = await supabase.storage
        .from("place-stills")
        .upload(path, blob, { upsert: true, contentType: "image/jpeg" });
      if (error) {
        setMsg("Couldn’t upload that photo.");
        return;
      }
      const url = supabase.storage.from("place-stills").getPublicUrl(path).data
        .publicUrl;
      setPreview(`${url}?t=${Date.now()}`);
      setClear(false);
    } catch {
      setMsg("Couldn’t read that photo. JPEG or PNG is safest.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={action} className="mt-8 max-w-md">
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Name</span>
        <input
          name="name"
          defaultValue={name}
          maxLength={80}
          className="rounded-lg border border-zinc-300 px-3 py-2"
        />
      </label>

      <div className="mt-6 flex items-center gap-4">
        <FaceCircle name={label} src={shown} size="lg" />
        <div className="flex flex-col gap-2 text-sm">
          <label className="cursor-pointer underline">
            {shown ? "Change photo" : "Add a photo"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading || pending || googlePending}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void onFile(f);
                e.target.value = "";
              }}
            />
          </label>
          {hasGooglePhoto ? (
            <button
              type="button"
              className="text-left underline"
              disabled={uploading || pending || googlePending}
              onClick={() =>
                startGoogle(async () => {
                  setMsg(null);
                  const r = await attachGooglePhoto();
                  if (r.error) {
                    setMsg(r.error);
                    return;
                  }
                  if (r.imageUrl) {
                    setPreview(`${r.imageUrl}?t=${Date.now()}`);
                    setClear(false);
                  }
                })
              }
            >
              Use my Google photo
            </button>
          ) : null}
          {shown ? (
            <button
              type="button"
              className="text-left text-zinc-500 underline"
              onClick={() => {
                setClear(true);
                setPreview(null);
              }}
            >
              Remove
            </button>
          ) : null}
        </div>
      </div>
      {shown && !clear ? (
        <input type="hidden" name="avatar_url" value={shown.split("?")[0]} />
      ) : null}
      {clear ? <input type="hidden" name="clear_photo" value="1" /> : null}

      {state.error || msg ? (
        <p className="mt-4 text-sm text-red-700" role="alert">
          {state.error ?? msg}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending || uploading || googlePending}
        className="mt-6 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save"}
      </button>
      {state.success ? (
        <SavedRedirect href={`/u/${userId}`} router={router} />
      ) : null}
    </form>
  );
}

function SavedRedirect({
  href,
  router,
}: {
  href: string;
  router: ReturnType<typeof useRouter>;
}) {
  useEffect(() => {
    router.replace(href);
  }, [href, router]);
  return null;
}
