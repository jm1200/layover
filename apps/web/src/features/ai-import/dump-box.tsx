"use client";

import { useActionState } from "react";
import { fillDraft, type ShareState } from "@/features/ai-import/actions";
import { MAX_STORY_CHARS } from "@/features/ai-import/schema";

const initial: ShareState = {};

export function DumpBox({
  citySlug,
  cityName,
}: {
  citySlug?: string;
  cityName?: string;
}) {
  const [state, action, pending] = useActionState(fillDraft, initial);
  const story = state.story ?? "";

  return (
    <form action={action} className="flex flex-col gap-4">
      {citySlug ? <input type="hidden" name="city" value={citySlug} /> : null}
      <label className="flex flex-col gap-2">
        <span className="text-lg text-zinc-800">
          What did you do?
        </span>
        {cityName ? (
          <span className="text-sm text-zinc-500">{cityName} is already on this one.</span>
        ) : null}
        {state.question ? (
          <input type="hidden" name="story" value={story} />
        ) : null}
        <textarea
          name={state.question ? undefined : "story"}
          required={!state.question}
          rows={8}
          maxLength={MAX_STORY_CHARS}
          defaultValue={story}
          readOnly={Boolean(state.question)}
          placeholder="Los Caracoles in Barcelona — the snails. Or eight hours in BCN: Cal Pep, Ciutat Vella, Aire baths."
          className="rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-base leading-relaxed outline-none focus:border-zinc-900"
        />
        <span className="text-xs text-zinc-500">
          Type or dictate using your mic. Name the restaurant, the shop,
          the walk.
        </span>
      </label>

      {state.question ? (
        <label className="flex flex-col gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <span className="font-medium text-amber-950">{state.question}</span>
          <input
            name="answer"
            required
            autoFocus
            placeholder="Los Caracoles"
            className="rounded-xl border border-amber-300 bg-white px-3 py-2"
          />
        </label>
      ) : null}

      {state.nap ? (
        <p className="rounded-xl bg-zinc-100 px-4 py-3 text-sm text-zinc-700">
          We’re paused. Try again in a bit.
        </p>
      ) : null}
      {state.error && !state.nap ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.error}
          {state.alreadyHref ? (
            <>
              {" "}
              <a href={state.alreadyHref} className="underline">
                Open it
              </a>
            </>
          ) : null}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-zinc-950 px-6 py-3 text-sm font-bold uppercase tracking-wider text-white disabled:opacity-60"
      >
        {pending ? "Writing…" : "Write it up"}
      </button>
    </form>
  );
}
