"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { toggleLike } from "@/features/social/actions";

export function LikeButton({
  kind,
  id,
  count,
  liked,
  loggedIn,
  nextPath,
  tone = "light",
}: {
  kind: "place" | "playbook";
  id: string;
  count: number;
  liked: boolean;
  loggedIn: boolean;
  nextPath: string;
  tone?: "light" | "dark";
}) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [n, setN] = useState(count);
  const [on, setOn] = useState(liked);

  const idle =
    tone === "dark"
      ? "rounded-full border border-white/40 px-3 py-1 text-sm text-white hover:bg-white/10 disabled:opacity-60"
      : "rounded-full border border-zinc-300 px-3 py-1 text-sm text-zinc-800 hover:bg-zinc-100 disabled:opacity-60";
  const active =
    tone === "dark"
      ? "rounded-full border border-white bg-white px-3 py-1 text-sm font-medium text-zinc-950 disabled:opacity-60"
      : "rounded-full border border-zinc-900 bg-zinc-900 px-3 py-1 text-sm font-medium text-white disabled:opacity-60";

  if (!loggedIn) {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(nextPath)}`}
        className={idle}
      >
        Like{count > 0 ? ` · ${count}` : ""}
      </Link>
    );
  }

  return (
    <div>
      <button
        type="button"
        aria-pressed={on}
        aria-label={on ? "Unlike" : "Like"}
        disabled={pending}
        className={on ? active : idle}
        onClick={() =>
          start(async () => {
            setMsg(null);
            const r = await toggleLike(kind, id);
            if (r.error) {
              setMsg(r.error);
              return;
            }
            setOn(!on);
            setN((prev) => (on ? Math.max(0, prev - 1) : prev + 1));
          })
        }
      >
        {on ? "Liked" : "Like"}
        {n > 0 ? ` · ${n}` : ""}
      </button>
      {msg ? (
        <p className="mt-1 text-xs text-red-700" role="alert">
          {msg}
        </p>
      ) : null}
    </div>
  );
}
