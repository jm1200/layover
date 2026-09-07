/** Browser speech only. No paid STT. Chrome may use Google’s recognizer; Safari uses Apple. */

export type SpeechEngine = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((ev: SpeechResultEvent) => void) | null;
  onerror: ((ev: { error: string }) => void) | null;
  onend: (() => void) | null;
};

export type SpeechResultEvent = {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    0: { transcript: string };
  }>;
};

type SpeechCtor = new () => SpeechEngine;

export function speechCtor(): SpeechCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: SpeechCtor;
    webkitSpeechRecognition?: SpeechCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** Join talk without stacking “okay” + “okay I’m” + “okay I’m just”. */
export function joinTalk(base: string, add: string): string {
  const a = base.replace(/\s+/g, " ").trim();
  const b = add.replace(/\s+/g, " ").trim();
  if (!a) return b;
  if (!b) return a;
  if (a === b) return a;
  if (b.startsWith(a)) return b;
  if (a.startsWith(b)) return a;
  if (a.endsWith(b)) return a;
  if (b.endsWith(a)) return b;
  return `${a} ${b}`;
}

/** Rebuild this recognition pass from the results list. Do not append deltas. */
export function foldTranscript(
  prior: string,
  results: SpeechResultEvent["results"],
): { committed: string; live: string } {
  let finals = "";
  let interim = "";
  for (let i = 0; i < results.length; i++) {
    const piece = results[i][0].transcript.replace(/\s+/g, " ").trim();
    if (!piece) continue;
    if (results[i].isFinal) finals = joinTalk(finals, piece);
    else interim = joinTalk(interim, piece);
  }
  const committed = joinTalk(prior, finals);
  return { committed, live: joinTalk(committed, interim) };
}
