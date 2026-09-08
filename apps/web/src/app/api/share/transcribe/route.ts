import { NextResponse } from "next/server";
import { getProfile } from "@/features/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import { aiBlocked } from "@/features/ai-import/spend";
import { MAX_STORY_CHARS } from "@/features/ai-import/schema";
import {
  estimateSttUsd,
  getXaiKey,
  MAX_STT_SECONDS,
  STT_RESERVE_USD,
} from "@/lib/ai/xai";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 8 * 1024 * 1024;

function filenameFor(type: string) {
  if (type.includes("mp4") || type.includes("m4a") || type.includes("aac")) {
    return "talk.m4a";
  }
  if (type.includes("mpeg") || type.includes("mp3")) return "talk.mp3";
  if (type.includes("ogg") || type.includes("opus")) return "talk.ogg";
  if (type.includes("wav")) return "talk.wav";
  return "talk.webm";
}

export async function POST(req: Request) {
  const profile = await getProfile();
  if (!profile || profile.status === "suspended") {
    return NextResponse.json(
      { error: "Log in to dump a layover." },
      { status: 401 },
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Couldn’t read that." }, { status: 400 });
  }
  const audio = form.get("audio");
  if (!(audio instanceof File) || audio.size < 200) {
    return NextResponse.json(
      { error: "Didn’t catch that. Try again." },
      { status: 400 },
    );
  }
  if (audio.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Keep it to one layover." },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const nap = await aiBlocked(supabase, STT_RESERVE_USD);
  if (nap) {
    return NextResponse.json({ nap: true, error: nap }, { status: 503 });
  }

  const key = getXaiKey();
  if (!key) {
    return NextResponse.json(
      { nap: true, error: "Lumen’s taking a nap." },
      { status: 503 },
    );
  }

  const type = audio.type || "audio/webm";
  const name = filenameFor(type);
  const bytes = await audio.arrayBuffer();
  const blob = new Blob([bytes], { type });

  const xaiForm = new FormData();
  xaiForm.append("language", "en");
  xaiForm.append("format", "true");
  xaiForm.append("file", blob, name);

  let text = "";
  let durationSec = 0;
  try {
    const res = await fetch("https://api.x.ai/v1/stt", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}` },
      body: xaiForm,
    });
    const raw = await res.text();
    let parsed: { text?: string; duration?: number } = {};
    try {
      parsed = JSON.parse(raw) as { text?: string; duration?: number };
    } catch {
      parsed = {};
    }
    if (!res.ok) {
      console.warn("[stt]", res.status, raw.slice(0, 300));
      await logStt(supabase, profile.id, false, "stt", 0, 0);
      return NextResponse.json(
        { nap: true, error: "Lumen’s taking a nap." },
        { status: 502 },
      );
    }
    text = (parsed.text ?? "").trim().slice(0, MAX_STORY_CHARS);
    durationSec = Math.min(MAX_STT_SECONDS, Number(parsed.duration) || 0);
  } catch (e) {
    console.warn("[stt]", e instanceof Error ? e.message : e);
    await logStt(supabase, profile.id, false, "stt", 0, 0);
    return NextResponse.json(
      { nap: true, error: "Lumen’s taking a nap." },
      { status: 502 },
    );
  }

  const usd = estimateSttUsd(durationSec || 1);
  await logStt(
    supabase,
    profile.id,
    Boolean(text),
    text ? "stt" : "stt_empty",
    durationSec,
    usd,
  );

  if (!text) {
    return NextResponse.json({ error: "Didn’t catch that. Try again." });
  }
  return NextResponse.json({ text, duration: durationSec });
}

async function logStt(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  success: boolean,
  errorCode: string,
  durationSec: number,
  estimatedUsd: number,
) {
  const { error } = await supabase.from("ai_import_logs").insert({
    user_id: userId,
    model: "stt",
    success,
    error_code: errorCode,
    input_chars: 0,
    estimated_usd: estimatedUsd,
    payload: { kind: "stt", duration_sec: durationSec },
  });
  if (error) console.warn("[stt log]", error.message);
}
