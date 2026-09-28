import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cookies, headers } from "next/headers";
import type { createClient } from "@/lib/supabase/server";
import type { LumenExtract } from "@/features/ai-import/schema";
import { getXaiKey, monthlyCapUsd } from "@/lib/ai/xai";

type Db = Awaited<ReturnType<typeof createClient>>;

/** Guest draft handle. httpOnly: `${id}.${token}`. Token is only stored hashed. */
export const GUEST_COOKIE = "lo_guest";
const GUEST_COOKIE_MAX_AGE = 60 * 60 * 24;

export type GuestKind = "stt" | "extract";

/** Held before a guest write-up; settled to the real cost (~2–5¢) after. */
export const GUEST_EXTRACT_RESERVE_USD = 0.08;

export type GuestDraft = {
  story: string | null;
  hint_slug: string | null;
  extract: LumenExtract;
};

function sha256(s: string) {
  return createHash("sha256").update(s).digest("hex");
}

/** Hashed client IP. Vercel sets x-forwarded-for / x-real-ip. Raw IP is never stored. */
export async function guestIpHash(): Promise<string> {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip")?.trim() ||
    "local";
  return sha256(`layover-guest:${ip}`);
}

function guestSecret() {
  return process.env.GUEST_LOG_SECRET?.trim() ?? "";
}

export type GuestStop = { nap?: boolean; signIn?: boolean; error: string };

/**
 * Check the guest caps and hold `reserveUsd` in one locked DB step, before any AI call.
 * Returns the row id to settle, or the copy to show.
 */
export async function reserveGuest(
  supabase: Db,
  ipHash: string,
  kind: GuestKind,
  reserveUsd: number,
): Promise<{ id: string } | GuestStop> {
  const secret = guestSecret();
  if (!secret || !getXaiKey()) return { nap: true, error: "Lumen’s taking a nap." };
  const { data, error } = await supabase.rpc("lumen_guest_reserve", {
    p_secret: secret,
    p_ip_hash: ipHash,
    p_kind: kind,
    p_reserve_usd: reserveUsd,
    p_month_cap_usd: monthlyCapUsd(),
  });
  if (error || !data) {
    if (error?.message.includes("guest:ip_limit")) {
      return {
        signIn: true,
        error: "That’s a few from here today. Sign in to keep going.",
      };
    }
    if (!error?.message.includes("guest:nap")) {
      console.warn("[lumen_guest_reserve]", error?.message);
    }
    return { nap: true, error: "Lumen’s taking a nap." };
  }
  return { id: data as string };
}

/** Real cost after the call. With `keep`, stores the draft and hands the browser its cookie. */
export async function settleGuest(
  supabase: Db,
  id: string,
  row: {
    usd: number;
    story?: string | null;
    hintSlug?: string | null;
    extract?: LumenExtract | null;
    keep?: boolean;
  },
): Promise<boolean> {
  const token = row.keep ? randomBytes(32).toString("base64url") : null;
  const { error } = await supabase.rpc("lumen_guest_settle", {
    p_secret: guestSecret(),
    p_id: id,
    p_usd: row.usd,
    p_token_hash: token ? sha256(token) : null,
    p_story: row.keep ? (row.story ?? null) : null,
    p_hint_slug: row.keep ? (row.hintSlug ?? null) : null,
    p_extract: row.keep ? (row.extract ?? null) : null,
  });
  if (error) {
    console.warn("[lumen_guest_settle]", error.message);
    return false;
  }
  if (token) await setGuestCookie(`${id}.${token}`);
  return true;
}

/** The guest draft handle from the cookie, if any. */
export async function guestHandle(): Promise<{
  id: string;
  tokenHash: string;
} | null> {
  const raw = (await cookies()).get(GUEST_COOKIE)?.value ?? "";
  const dot = raw.indexOf(".");
  if (dot < 1) return null;
  const id = raw.slice(0, dot);
  const token = raw.slice(dot + 1);
  if (!/^[0-9a-f-]{36}$/i.test(id) || token.length < 20) return null;
  return { id, tokenHash: sha256(token) };
}

export async function readGuestDraft(
  supabase: Db,
  id: string,
): Promise<GuestDraft | null> {
  const handle = await guestHandle();
  if (!handle || handle.id !== id) return null;
  const { data, error } = await supabase.rpc("lumen_guest_get", {
    p_id: handle.id,
    p_token_hash: handle.tokenHash,
  });
  if (error) console.warn("[lumen_guest_get]", error.message);
  return (data as GuestDraft | null) ?? null;
}

/** Signed-in only. The same user may claim again (a failed filing can retry). */
export async function claimGuestDraft(
  supabase: Db,
): Promise<{ draft: GuestDraft | null; failed?: boolean }> {
  const handle = await guestHandle();
  if (!handle) return { draft: null };
  const { data, error } = await supabase.rpc("lumen_guest_claim", {
    p_id: handle.id,
    p_token_hash: handle.tokenHash,
  });
  if (error) {
    console.warn("[lumen_guest_claim]", error.message);
    return { draft: null, failed: true };
  }
  return { draft: (data as GuestDraft | null) ?? null };
}

/** Deletes the handle; returns the old value so a failed filing can put it back. */
export async function clearGuestCookie(): Promise<string | null> {
  const jar = await cookies();
  const raw = jar.get(GUEST_COOKIE)?.value ?? null;
  jar.delete(GUEST_COOKIE);
  return raw;
}

export async function restoreGuestCookie(raw: string | null) {
  if (raw) await setGuestCookie(raw);
}

async function setGuestCookie(value: string) {
  (await cookies()).set(GUEST_COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: GUEST_COOKIE_MAX_AGE,
  });
}
