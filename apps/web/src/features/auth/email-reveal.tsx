"use client";

import { useState, type ReactNode } from "react";

export function EmailReveal({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full py-2 text-center text-sm text-white/70 underline decoration-white/30 underline-offset-4 hover:text-white"
      >
        Use email instead
      </button>
    );
  }

  return <div className="rounded-2xl bg-white p-5 text-zinc-900">{children}</div>;
}
