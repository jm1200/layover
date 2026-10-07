import "server-only";

import OpenAI from "openai";

export const EXTRACT_MODEL = "grok-4.3";

/** grok-4.3 under 200k prompt: $1.25 / $2.50 per 1M. Web search: $5 / 1k calls. */
const INPUT_PER_M = 1.25;
const OUTPUT_PER_M = 2.5;
const SEARCH_PER_CALL = 0.005;
export const STILL_USD = 0.02;
export const STILL_MODEL = "grok-imagine-image";
/** xAI REST speech-to-text. Streaming is $0.20/hr — we use the file call. */
export const STT_USD_PER_HOUR = 0.10;
export const STT_RESERVE_USD = 0.02;
export const MAX_STT_SECONDS = 240;

export function estimateSttUsd(durationSec: number) {
  const s = Math.max(0, durationSec);
  return (s / 3600) * STT_USD_PER_HOUR;
}

/** Cap so a dump cannot browse the internet. */
export const MAX_SEARCH_CALLS = 8;

export function getXaiKey() {
  return process.env.XAI_API_KEY?.trim() ?? "";
}

export function monthlyCapUsd() {
  const n = Number(process.env.AI_MONTHLY_CAP_USD ?? "20");
  return Number.isFinite(n) && n > 0 ? n : 20;
}

export function estimateUsd(
  inputTokens: number,
  outputTokens: number,
  searchCalls = 0,
) {
  return (
    (inputTokens / 1_000_000) * INPUT_PER_M +
    (outputTokens / 1_000_000) * OUTPUT_PER_M +
    searchCalls * SEARCH_PER_CALL
  );
}

export const XAI_CONSOLE_URL = "https://console.x.ai";

/** xAI prepaid credit left, in USD. Needs a management key + team ID; null when unset or xAI won't say. */
export async function xaiCreditLeftUsd(): Promise<number | null> {
  const key = process.env.XAI_MANAGEMENT_KEY?.trim();
  const team = process.env.XAI_TEAM_ID?.trim();
  if (!key || !team) return null;
  try {
    const res = await fetch(
      `https://management-api.x.ai/v1/billing/teams/${encodeURIComponent(team)}/prepaid/balance`,
      {
        headers: { Authorization: `Bearer ${key}` },
        cache: "no-store",
        signal: AbortSignal.timeout(5_000),
      },
    );
    if (!res.ok) return null;
    const body = (await res.json()) as { total?: { val?: unknown } };
    const cents = Number(body.total?.val);
    // xAI books purchases as negative cents and spending as positive.
    return Number.isFinite(cents) ? -cents / 100 : null;
  } catch {
    return null;
  }
}

export function xaiClient() {
  const key = getXaiKey();
  if (!key) return null;
  return new OpenAI({ apiKey: key, baseURL: "https://api.x.ai/v1" });
}

/** Billable web-search / browse calls on a Responses payload. */
export function searchCallsFromResponse(response: unknown): number {
  const r = (response ?? {}) as Record<string, unknown>;
  const usageMap = r.server_side_tool_usage;
  if (usageMap && typeof usageMap === "object") {
    let n = 0;
    for (const [k, v] of Object.entries(usageMap as Record<string, unknown>)) {
      if (/WEB_SEARCH|web_search|BROWSE|browse_page|open_page/i.test(k)) {
        n += Number(v) || 0;
      }
    }
    if (n > 0) return n;
  }
  if (Array.isArray(r.output)) {
    const n = r.output.filter((item) => {
      if (!item || typeof item !== "object") return false;
      const t = (item as { type?: string }).type ?? "";
      return t === "web_search_call" || t === "web_search";
    }).length;
    if (n > 0) return n;
  }
  const usage = r.usage as Record<string, unknown> | undefined;
  if (!usage) return 0;
  const details = usage.server_side_tool_usage_details as
    | { web_search_calls?: number }
    | undefined;
  return (
    Number(details?.web_search_calls ?? usage.num_server_side_tools_used ?? 0) ||
    0
  );
}
