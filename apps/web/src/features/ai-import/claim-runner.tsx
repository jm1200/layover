"use client";

import { useActionState, useEffect, useRef, startTransition } from "react";
import { claimGuestShare, type ShareState } from "@/features/ai-import/actions";
import { DumpBox } from "@/features/ai-import/dump-box";

/** Files the guest write-up once, then lands on review (redirect) or asks one more thing. */
export function ClaimRunner() {
  const [state, run, pending] = useActionState(
    (): Promise<ShareState | null> => claimGuestShare(),
    null,
  );
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    startTransition(() => run());
  }, [run]);

  if (!state || pending) {
    return (
      <p className="text-zinc-600" role="status">
        Filing your write-up…
      </p>
    );
  }
  return <DumpBox citySlug={state.hintSlug} initialState={state} />;
}
