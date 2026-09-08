"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { fillDraft, type ShareState } from "@/features/ai-import/actions";
import { MAX_STORY_CHARS } from "@/features/ai-import/schema";
import {
  foldTranscript,
  speechCtor,
  type SpeechEngine,
} from "@/features/ai-import/speech";

const initial: ShareState = {};

/** Browser speech dies after a short silence. Restart only inside this window. */
const LISTEN_GAP_MS = 4500;

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
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [live, setLive] = useState("");
  const [micError, setMicError] = useState<string | null>(null);
  const engine = useRef<SpeechEngine | null>(null);
  const wantListen = useRef(false);
  const committed = useRef("");
  /** Text already in the box when this recognition pass started. */
  const prior = useRef("");
  const startedAt = useRef(0);
  const lastResultAt = useRef(0);
  const restartTimer = useRef<number | null>(null);

  useEffect(() => {
    if (state.story) setDraft(state.story);
  }, [state.story]);

  useEffect(() => {
    return () => {
      wantListen.current = false;
      if (restartTimer.current) window.clearTimeout(restartTimer.current);
      engine.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!listening) {
      setElapsed(0);
      return;
    }
    const t0 = Date.now();
    const id = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - t0) / 1000));
    }, 250);
    return () => window.clearInterval(id);
  }, [listening]);

  const followUp = Boolean(state.question);
  const showBox = keyboard || Boolean(draft.trim()) || followUp;
  const shown = listening ? live || draft : draft;

  function finishTalk(opts?: { paused?: boolean }) {
    wantListen.current = false;
    setListening(false);
    const next = (committed.current || draft).trim();
    if (next) setDraft(next.slice(0, MAX_STORY_CHARS));
    setLive("");
    setPaused(Boolean(opts?.paused && next));
  }

  function stopTalk() {
    wantListen.current = false;
    if (restartTimer.current) {
      window.clearTimeout(restartTimer.current);
      restartTimer.current = null;
    }
    setPaused(false);
    engine.current?.stop();
    finishTalk();
  }

  function startTalk() {
    setMicError(null);
    setPaused(false);
    engine.current?.abort();
    const Ctor = speechCtor();
    if (!Ctor) {
      setKeyboard(true);
      setMicError("This browser won’t record. Type it, or try Safari or Chrome.");
      return;
    }
    prior.current = draft.trim();
    committed.current = prior.current;
    startedAt.current = Date.now();
    lastResultAt.current = 0;
    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = typeof navigator !== "undefined" ? navigator.language : "en-US";
    rec.onresult = (ev) => {
      lastResultAt.current = Date.now();
      const folded = foldTranscript(prior.current, ev.results);
      committed.current = folded.committed.slice(0, MAX_STORY_CHARS);
      setLive(folded.live.slice(0, MAX_STORY_CHARS));
    };
    rec.onerror = (ev) => {
      if (ev.error === "not-allowed" || ev.error === "service-not-allowed") {
        setMicError("Allow the microphone — or type it.");
        setKeyboard(true);
        stopTalk();
        return;
      }
      if (ev.error === "no-speech" || ev.error === "aborted") return;
      setMicError("Couldn’t hear that. Try again, or type it.");
    };
    rec.onend = () => {
      if (engine.current !== rec) return;
      if (!wantListen.current) {
        finishTalk();
        return;
      }
      prior.current = committed.current;
      const quietFor =
        lastResultAt.current === 0
          ? Date.now() - startedAt.current
          : Date.now() - lastResultAt.current;
      if (quietFor >= LISTEN_GAP_MS) {
        finishTalk({ paused: true });
        return;
      }
      restartTimer.current = window.setTimeout(() => {
        restartTimer.current = null;
        if (!wantListen.current || engine.current !== rec) return;
        try {
          rec.start();
        } catch {
          finishTalk({ paused: true });
        }
      }, 80);
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
                ? "Tap to stop listening"
                : draft.trim()
                  ? "Tap to add more"
                  : "Tap to talk. Don’t hold."
            }
            onClick={() => (listening ? stopTalk() : startTalk())}
            className={
              listening
                ? "flex min-h-28 w-full max-w-sm flex-col items-center justify-center rounded-2xl bg-red-600 px-6 py-5 text-white shadow-[0_0_0_8px_rgba(220,38,38,0.25)]"
                : `flex h-40 w-40 flex-col items-center justify-center rounded-full bg-zinc-950 text-white ${
                    paused ? "mic-halo-live" : "mic-halo"
                  }`
            }
          >
            {listening ? (
              <>
                <span className="font-mono text-xs uppercase tracking-[0.28em] text-white/80">
                  Listening
                </span>
                <span className="mt-1 font-mono text-3xl font-semibold tabular-nums">
                  {formatElapsed(elapsed)}
                </span>
                <span className="mt-2 text-sm font-bold">Tap to stop</span>
              </>
            ) : (
              <>
                <MicIcon live={false} />
                <span className="mt-2 max-w-[8.5rem] text-center text-sm font-bold leading-tight">
                  {draft.trim() ? "Tap to add more" : "Tap to talk"}
                </span>
              </>
            )}
          </button>
          {listening ? null : (
            <p className="max-w-xs text-center text-sm text-zinc-600">
              {paused
                ? "The mic paused. Tap to keep going — don’t hold it."
                : "Tap once to start. Tap again when you’re done. Don’t hold it."}
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
              <span className="block text-xs text-zinc-400">
                Your phone’s mic on the keyboard is often clearer.
              </span>
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

function formatElapsed(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
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
