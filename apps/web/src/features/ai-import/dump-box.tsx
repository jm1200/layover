"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { fillDraft, type ShareState } from "@/features/ai-import/actions";
import { MAX_STORY_CHARS } from "@/features/ai-import/schema";

const initial: ShareState = {};
const MAX_SECONDS = 240;

const RECORDER_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/aac",
];

function pickMime() {
  if (typeof MediaRecorder === "undefined") return "";
  return RECORDER_TYPES.find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
}

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
  const [working, setWorking] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const stopTimer = useRef<number | null>(null);

  useEffect(() => {
    if (state.story) setDraft(state.story);
  }, [state.story]);

  useEffect(() => {
    return () => {
      tearDown();
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
  const busy = pending || working || listening;

  function tearDown() {
    if (stopTimer.current) {
      window.clearTimeout(stopTimer.current);
      stopTimer.current = null;
    }
    const rec = recorder.current;
    recorder.current = null;
    if (rec && rec.state !== "inactive") {
      try {
        rec.stop();
      } catch {
        /* already stopped */
      }
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  async function startTalk() {
    setMicError(null);
    if (typeof MediaRecorder === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setKeyboard(true);
      setMicError("This browser won’t record. Type it, or try Safari or Chrome.");
      return;
    }
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setKeyboard(true);
      setMicError("Allow the microphone — or type it.");
      return;
    }
    streamRef.current = stream;
    chunks.current = [];
    const mime = pickMime();
    const rec = mime
      ? new MediaRecorder(stream, { mimeType: mime })
      : new MediaRecorder(stream);
    recorder.current = rec;
    rec.ondataavailable = (e) => {
      if (e.data.size) chunks.current.push(e.data);
    };
    rec.onerror = () => {
      setMicError("Couldn’t start the mic. Type it.");
      setListening(false);
      tearDown();
    };
    rec.start(1000);
    setListening(true);
    stopTimer.current = window.setTimeout(() => {
      void stopTalk();
    }, MAX_SECONDS * 1000);
  }

  async function stopTalk() {
    const rec = recorder.current;
    if (!rec || rec.state === "inactive") {
      setListening(false);
      tearDown();
      return;
    }
    setListening(false);
    setWorking(true);
    const blob = await new Promise<Blob>((resolve) => {
      rec.onstop = () => {
        const type = rec.mimeType || chunks.current[0]?.type || "audio/webm";
        resolve(new Blob(chunks.current, { type }));
      };
      try {
        rec.stop();
      } catch {
        resolve(new Blob([]));
      }
    });
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    recorder.current = null;
    if (stopTimer.current) {
      window.clearTimeout(stopTimer.current);
      stopTimer.current = null;
    }
    if (blob.size < 200) {
      setWorking(false);
      setMicError("Didn’t catch that. Try again.");
      return;
    }
    try {
      const fd = new FormData();
      const name = blob.type.includes("mp4") ? "talk.m4a" : "talk.webm";
      fd.append("audio", blob, name);
      const res = await fetch("/api/share/transcribe", {
        method: "POST",
        body: fd,
      });
      const data = (await res.json()) as {
        text?: string;
        error?: string;
        nap?: boolean;
      };
      if (data.nap) {
        setMicError(data.error || "We’re paused. Try again in a bit.");
        return;
      }
      if (!data.text) {
        setMicError(data.error || "Didn’t catch that. Try again.");
        return;
      }
      const next = [draft.trim(), data.text.trim()]
        .filter(Boolean)
        .join(" ")
        .slice(0, MAX_STORY_CHARS);
      setDraft(next);
    } catch {
      setMicError("Couldn’t hear that. Try again, or type it.");
    } finally {
      setWorking(false);
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
            disabled={working}
            aria-label={
              listening
                ? "Tap to stop listening"
                : working
                  ? "Writing it down"
                  : draft.trim()
                    ? "Tap to add more"
                    : "Tap to talk. Don’t hold."
            }
            onClick={() => {
              if (working) return;
              if (listening) void stopTalk();
              else void startTalk();
            }}
            className={
              listening
                ? "flex min-h-28 w-full max-w-sm flex-col items-center justify-center rounded-2xl bg-red-600 px-6 py-5 text-white shadow-[0_0_0_8px_rgba(220,38,38,0.25)]"
                : "mic-halo flex h-40 w-40 flex-col items-center justify-center rounded-full bg-zinc-950 text-white disabled:opacity-60"
            }
          >
            {working ? (
              <span className="text-sm font-bold">Writing it down…</span>
            ) : listening ? (
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
                <MicIcon />
                <span className="mt-2 max-w-[8.5rem] text-center text-sm font-bold leading-tight">
                  {draft.trim() ? "Tap to add more" : "Tap to talk"}
                </span>
              </>
            )}
          </button>
          {listening || working ? null : (
            <p className="max-w-xs text-center text-sm text-zinc-600">
              Tap once to start. Tap again when you’re done. Don’t hold it.
              Pauses are fine.
            </p>
          )}
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
                  tearDown();
                  setListening(false);
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
            value={draft}
            readOnly={followUp || busy}
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
          disabled={busy}
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

function MicIcon() {
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
    >
      <path d="M12 2a3.5 3.5 0 0 0-3.5 3.5v6a3.5 3.5 0 1 0 7 0v-6A3.5 3.5 0 0 0 12 2Z" />
      <path d="M5 11.5a7 7 0 0 0 14 0" />
      <path d="M12 18.5v3.5" />
    </svg>
  );
}
