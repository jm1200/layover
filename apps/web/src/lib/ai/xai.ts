import OpenAI from "openai";

export const EXTRACT_MODEL = "grok-4.3";

/** grok-4.3 under 200k prompt: $1.25 / $2.50 per 1M. Web search: $5 / 1k calls. */
const INPUT_PER_M = 1.25;
const OUTPUT_PER_M = 2.5;
const SEARCH_PER_CALL = 0.005;
export const STILL_USD = 0.02;
export const STILL_MODEL = "grok-imagine-image";

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

export function xaiClient() {
  const key = getXaiKey();
  if (!key) return null;
  return new OpenAI({ apiKey: key, baseURL: "https://api.x.ai/v1" });
}
