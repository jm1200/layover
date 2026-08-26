import "server-only";

import type { City, Place, Zone, ZoneType } from "@/features/places/types";
import {
  EXTRACT_MODEL,
  estimateUsd,
  MAX_SEARCH_CALLS,
  searchCallsFromResponse,
  xaiClient,
} from "@/lib/ai/xai";
import { lumenSystemPrompt } from "@/features/ai-import/prompt";
import {
  LUMEN_JSON_SCHEMA,
  type LumenExtract,
} from "@/features/ai-import/schema";

function asExtract(raw: unknown): LumenExtract | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const status = o.status;
  const postKind = o.post_kind;
  if (
    status !== "draft" &&
    status !== "need_city" &&
    status !== "need_name" &&
    status !== "blocked"
  ) {
    return null;
  }
  if (
    postKind !== "place" &&
    postKind !== "places" &&
    postKind !== "playbook"
  ) {
    return null;
  }
  const cat = o.category;
  const category =
    cat === "eat" || cat === "do" || cat === "shop" ? cat : null;
  const stopsIn = Array.isArray(o.stops) ? o.stops : [];
  return {
    status,
    question: typeof o.question === "string" ? o.question : null,
    post_kind: postKind,
    city_slug: typeof o.city_slug === "string" ? o.city_slug : null,
    city_name: typeof o.city_name === "string" ? o.city_name : null,
    city_airport: typeof o.city_airport === "string" ? o.city_airport : null,
    city_country: typeof o.city_country === "string" ? o.city_country : null,
    category,
    name: typeof o.name === "string" ? o.name : null,
    title: typeof o.title === "string" ? o.title : null,
    blurb: typeof o.blurb === "string" ? o.blurb : null,
    narrative: typeof o.narrative === "string" ? o.narrative : null,
    hours_available:
      typeof o.hours_available === "number" ? o.hours_available : null,
    zone_type: parseZone(o.zone_type),
    dish_name: typeof o.dish_name === "string" ? o.dish_name : null,
    dish_note: typeof o.dish_note === "string" ? o.dish_note : null,
    found: o.found === true,
    stops: stopsIn.slice(0, 4).map((s) => {
      const st = (s ?? {}) as Record<string, unknown>;
      const sc = st.category;
      return {
        name: typeof st.name === "string" ? st.name : "",
        category: sc === "eat" || sc === "do" || sc === "shop" ? sc : null,
        blurb: typeof st.blurb === "string" ? st.blurb : null,
        body: typeof st.body === "string" ? st.body : null,
        zone_type: parseZone(st.zone_type),
        dish_name: typeof st.dish_name === "string" ? st.dish_name : null,
        found: st.found === true,
      };
    }),
  };
}

function parseZone(v: unknown): ZoneType | null {
  if (
    v === "airport_strip" ||
    v === "downtown" ||
    v === "station" ||
    v === "other"
  ) {
    return v;
  }
  return null;
}

export type ExtractResult = {
  extract: LumenExtract | null;
  inputTokens: number;
  outputTokens: number;
  searchCalls: number;
  estimatedUsd: number;
  error?: string;
};

export async function extractWithLumen(opts: {
  story: string;
  cities: City[];
  hintSlug?: string | null;
}): Promise<ExtractResult> {
  const client = xaiClient();
  if (!client) {
    return {
      extract: null,
      inputTokens: 0,
      outputTokens: 0,
      searchCalls: 0,
      estimatedUsd: 0,
      error: "missing_key",
    };
  }

  const hint = opts.hintSlug
    ? `\nHint: they opened share from city slug "${opts.hintSlug}" unless they clearly named another city on the list.`
    : "";
  const user = `Story:\n${opts.story}${hint}`;

  try {
    const response = await client.responses.create({
      model: EXTRACT_MODEL,
      tools: [{ type: "web_search" }],
      input: [
        { role: "system", content: lumenSystemPrompt(opts.cities) },
        { role: "user", content: user },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "lumen_extract",
          schema: LUMEN_JSON_SCHEMA,
          strict: true,
        },
      },
      // xAI Responses: hard cap on server-side tool calls (not just a prompt).
      max_tool_calls: MAX_SEARCH_CALLS,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const usage = response.usage as
      | { input_tokens?: number; output_tokens?: number }
      | undefined;
    const inputTokens = usage?.input_tokens ?? 0;
    const outputTokens = usage?.output_tokens ?? 0;
    const searchCalls = searchCallsFromResponse(response);
    let content = response.output_text ?? "";
    if (!content && Array.isArray(response.output)) {
      const msg = response.output.find((i) => i.type === "message");
      const block = msg?.content?.find((c) => c.type === "output_text");
      content = block && "text" in block ? String(block.text) : "";
    }
    let parsed: unknown = null;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = null;
    }
    const extract = asExtract(parsed);
    return {
      extract,
      inputTokens,
      outputTokens,
      searchCalls: Number(searchCalls) || 0,
      estimatedUsd: estimateUsd(
        inputTokens,
        outputTokens,
        Number(searchCalls) || 0,
      ),
      error: extract ? undefined : "parse",
    };
  } catch (e) {
    console.warn("[extractWithLumen]", e instanceof Error ? e.message : e);
    return {
      extract: null,
      inputTokens: 0,
      outputTokens: 0,
      searchCalls: 0,
      estimatedUsd: 0,
      error: "xai",
    };
  }
}

export function zoneIdFor(
  zones: Zone[],
  cityId: string,
  type: ZoneType | null,
): string | null {
  if (!type) return null;
  return zones.find((z) => z.city_id === cityId && z.type === type)?.id ?? null;
}

export function normalizeIata(code: string | null | undefined): string | null {
  const c = (code ?? "").trim().toUpperCase();
  return /^[A-Z]{3}$/.test(c) ? c : null;
}

export function matchCity(
  cities: City[],
  extract: LumenExtract,
  hintSlug?: string | null,
): City | undefined {
  const iata = normalizeIata(extract.city_airport);
  if (iata) {
    const byAir = cities.find(
      (c) => (c.airport_code ?? "").toUpperCase() === iata,
    );
    if (byAir) return byAir;
  }
  if (extract.city_slug) {
    const bySlug = cities.find((c) => c.slug === extract.city_slug);
    if (bySlug) return bySlug;
  }
  if (extract.city_name) {
    const n = extract.city_name.trim().toLowerCase();
    const byName = cities.find((c) => c.name.trim().toLowerCase() === n);
    if (byName) return byName;
  }
  if (hintSlug) {
    const byHint = cities.find((c) => c.slug === hintSlug);
    if (byHint) return byHint;
  }
  return undefined;
}

export function matchPlace(
  places: Place[],
  cityId: string,
  name: string,
): Place | undefined {
  const n = normName(name);
  if (!n) return undefined;
  return places.find(
    (p) => p.city_id === cityId && normName(p.name) === n,
  );
}

export function normName(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function sameStopSet(a: string[], b: string[]): boolean {
  const A = a.map(normName).filter(Boolean).sort();
  const B = b.map(normName).filter(Boolean).sort();
  if (A.length < 2 || A.length !== B.length) return false;
  return A.join("\0") === B.join("\0");
}

export function titlesMatch(a: string, b: string): boolean {
  const A = normName(a);
  const B = normName(b);
  return Boolean(A) && A === B;
}
