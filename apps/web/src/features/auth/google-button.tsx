"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function GoogleButton({ next }: { next?: string | null }) {
  const [err, setErr] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function go() {
    setErr(null);
    setPending(true);
    const supabase = createClient();
    const origin =
      process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
    const redirectTo = next
      ? `${origin}/auth/callback?next=${encodeURIComponent(next)}`
      : `${origin}/auth/callback`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) {
      setErr(
        error.message.includes("provider")
          ? "Google isn’t on yet. Use email, or enable Google in Supabase Auth → Providers."
          : error.message,
      );
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => void go()}
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/20 bg-white px-4 py-2.5 text-sm font-medium text-zinc-950 hover:bg-white/90 disabled:opacity-60"
      >
        {pending ? "Opening Google…" : "Continue with Google"}
      </button>
      {err ? (
        <p className="text-sm text-red-200" role="alert">
          {err}
        </p>
      ) : null}
    </div>
  );
}
