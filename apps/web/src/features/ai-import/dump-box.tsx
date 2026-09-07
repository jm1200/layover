"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { fillDraft, type ShareState } from "@/features/ai-import/actions";
import { MAX_STORY_CHARS } from "@/features/ai-import/schema";
import { speechCtor, type SpeechEngine } from "@/features/ai-import/speech";

const initial: ShareState = {};

export function DumpBox({
  citySlug,
  cityName,
}: {
  citySlug?: string;
  cityName?: string;
}) {
  const [state, action, pending] = useActionState(fillDraft, initial);
  const [draft, setDraft] = useState(state.story ?? "");
  const [keyboard, setKeyboard] = useState(false);
  const [listening, setListening] = useState(false);
  const [live, setLive] = useState("");
  const [micError, setMicError] = useState<string | null>(null);
  const engine = useRef<SpeechEngine | null>(null);
  const wantListen = useRef(false);
  const committed = useRef("");

  useEffect(() => {
    if (state.story) setDraft(state.story);
  }, [state.story]);

  useEffect(() => {
    return () => {
      wantListen.current = false;
      engine.current?.abort();
    };
  }, []);

  const followUp = Boolean(state.question);
  const showBox = keyboard || Boolean(draft.trim()) || followUp;
  const shown = listening ? live || draft : draft;

  function stopTalk() {
    wantListen.current = false;
    setListening(false);
    engine.current?.stop();
    const next = (committed.current || draft).trim();
    if (next) setDraft(next.slice(0, MAX_STORY_CHARS));
    setLive("");
  }

  function startTalk() {
    setMicError(null);
    engine.current?.abort();
    const Ctor = speechCtor();
    if (!Ctor) {
      setKeyboard(true);
      setMicError("This browser won’t record. Type it, or try Safari or Chrome.");
      return;
    }
    committed.current = draft.trim();
    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = typeof navigator !== "undefined" ? navigator.language : "en-US";
    rec.onresult = (ev) => {
      let finals = "";
      let interim = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const piece = ev.results[i][0].transcript;
        if (ev.results[i].isFinal) finals += piece;
        else interim += piece;
      }
      if (finals) {
        committed.current = [committed.current, finals.trim()]
          .filter(Boolean)
          .join(" ")
          .slice(0, MAX_STORY_CHARS);
      }
      const next = [committed.current, interim.trim()].filter(Boolean).join(" ");
      setLive(next.slice(0, MAX_STORY_CHARS));
    };
    rec.onerror = (ev) => {
      if (ev.error === "not-allowed" || ev.error === "service-not-allowed") {
        setMicError("Allow the microphone — or type it.");
        setKeyboard(true);
        stopTalk();
        return;
      }
      if (ev.error === "no-speech") return;
      setMicError("Couldn’t hear that. Try again, or type it.");
    };
    rec.onend = () => {
      if (!wantListen.current) {
        setListening(false);
        const next = (committed.current || draft).trim();
        if (next) setDraft(next.slice(0, MAX_STORY_CHARS));
        setLive("");
        return;
      }
      try {
        rec.start();
      } catch {
        wantListen.current = false;
        setListening(false);
      }
    };
    engine.current = rec;
    wantListen.current = true;
    setListening(true);
    try {
      rec.start();
    } catch {
      wantListen.current = false;
      setListening(false);
      setKeyboard(true);
      setMicError("Couldn’t start the mic. Type it.");
    }
  }

  return (
    <form action={action} className="flex flex-col gap-5">
      {citySlug ? <input type="hidden" name="city" value={citySlug} /> : null}
      {followUp ? <input type="hidden" name="story" value={draft} /> : null}

      <div className="flex flex-col gap-2">
        <p className="text-lg text-zinc-800">What did you do?</p>
        {cityName ? (
          <p className="text-sm text-zinc-500">
            {cityName} is already on this one.
          </p>
        ) : null}
        <p className="text-sm text-zinc-600">
          Rant. Gab. Messy is fine — we’ll tidy it. Name the restaurant, the
          shop, the walk.
        </p>
      </div>

      {followUp ? null : (
        <div className="flex flex-col items-center gap-4 py-2">
          <button
            type="button"
            aria-pressed={listening}
            aria-label={
              listening
                ? "Stop recording"
                : "Tap to record your recommendation"
            }
            onClick={() => (listening ? stopTalk() : startTalk())}
            className={`flex h-40 w-40 flex-col items-center justify-center rounded-full bg-zinc-950 text-white ${
              listening ? "mic-halo-live" : "mic-halo"
            }`}
          >
            <MicIcon live={listening} />
            <span className="mt-2 max-w-[8.5rem] text-center text-sm font-bold leading-tight">
              {listening ? "Listening… tap to stop" : "Tap to record"}
            </span>
          </button>
          {listening ? null : (
            <p className="text-center text-sm font-medium text-zinc-800">
              your recommendation
            </p>
          )}
          {listening && live ? (
            <p className="max-w-lg text-center text-sm text-zinc-600">{live}</p>
          ) : null}
          {micError ? (
            <p className="max-w-sm text-center text-sm text-red-800" role="alert">
              {micError}
            </p>
          ) : null}
          {keyboard ? null : (
            <p className="text-center text-sm text-zinc-400">
              or{" "}
              <button
                type="button"
                className="font-medium text-zinc-600 underline decoration-zinc-300 underline-offset-4 hover:text-zinc-900"
                onClick={() => {
                  stopTalk();
                  setKeyboard(true);
                }}
              >
                use your keyboard
              </button>
            </p>
          )}
        </div>
      )}

      {showBox ? (
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-zinc-700">
            {followUp ? "What you said" : "What we heard"}
          </span>
          <textarea
            name={followUp ? undefined : "story"}
            required={!followUp}
            rows={keyboard && !draft ? 8 : 6}
            maxLength={MAX_STORY_CHARS}
            value={shown}
            readOnly={followUp || listening}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Los Caracoles in Barcelona — the snails. Or eight hours in BCN: Cal Pep, Ciutat Vella, Aire baths."
            className="rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-base leading-relaxed outline-none focus:border-zinc-900"
          />
        </label>
      ) : null}

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
        </p>
      ) : null}

      {showBox || followUp ? (
        <button
          type="submit"
          disabled={pending || listening}
          className="rounded-full bg-zinc-950 px-6 py-3 text-sm font-bold uppercase tracking-wider text-white disabled:opacity-60"
        >
          {pending ? "Writing…" : "Write it up"}
        </button>
      ) : null}
    </form>
  );
}

function MicIcon({ live }: { live: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="40"
      height="40"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={live ? "text-red-400" : "text-white"}
    >
      <path d="M12 2a3.5 3.5 0 0 0-3.5 3.5v6a3.5 3.5 0 1 0 7 0v-6A3.5 3.5 0 0 0 12 2Z" />
      <path d="M5 11.5a7 7 0 0 0 14 0" />
      <path d="M12 18.5v3.5" />
    </svg>
  );
}
