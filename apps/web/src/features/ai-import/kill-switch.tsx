"use client";

import { useActionState } from "react";
import { setAiKilled } from "@/features/ai-import/actions";

export function KillSwitch({ killed }: { killed: boolean }) {
  const [state, action, pending] = useActionState(setAiKilled, {});
  return (
    <form action={action} className="mt-4 rounded-xl border border-zinc-200 p-4">
      <p className="font-medium">Lumen</p>
      <p className="mt-1 text-sm text-zinc-600">
        {killed ? "Off (kill switch)." : "On — extract is live if the key is set."}
      </p>
      <input type="hidden" name="killed" value={killed ? "false" : "true"} />
      <button
        type="submit"
        disabled={pending}
        className="mt-3 rounded-lg bg-zinc-900 px-3 py-2 text-sm text-white disabled:opacity-60"
      >
        {killed ? "Turn Lumen on" : "Kill Lumen"}
      </button>
      {state.error ? (
        <p className="mt-2 text-sm text-red-700">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="mt-2 text-sm text-emerald-800">{state.success}</p>
      ) : null}
    </form>
  );
}
