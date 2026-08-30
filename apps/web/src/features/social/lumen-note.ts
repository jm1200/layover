import "server-only";

import { refuseComment } from "@/features/ai-import/moderate";
import { aiBlocked } from "@/features/ai-import/spend";
import {
  EXTRACT_MODEL,
  estimateUsd,
  xaiClient,
} from "@/lib/ai/xai";
import type { createClient } from "@/lib/supabase/server";

type Db = Awaited<ReturnType<typeof createClient>>;

const NOTE_RESERVE_USD = 0.01;

const NOTE_PROMPT = `You check a layover note before it goes public.
PG-13. No porn, gore, hate.
No crew hotels, airline lodging, "where [airline] stays."
Photos of food, streets, public places, and real activities are fine.
Hotel rooms, crew housing, porn, gore, or hate: refuse.
ok=true if it can go on the site.
refuse=hotel|pg13|hate|other if not. Null when ok.
Never repeat a hotel or airline name.`;

const NOTE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    ok: { type: "boolean" },
    refuse: {
      anyOf: [
        { type: "string", enum: ["hotel", "pg13", "hate", "other"] },
        { type: "null" },
      ],
    },
  },
  required: ["ok", "refuse"],
};

function publicRefuse(kind: string | null): string {
  if (kind === "hotel") return "Zones, not hotels.";
  return "Keep it PG-13.";
}

async function logNote(
  supabase: Db,
  userId: string,
  row: {
    success: boolean;
    error_code: string;
    input_chars: number;
    input_tokens?: number;
    output_tokens?: number;
    estimated_usd?: number;
  },
) {
  const { error } = await supabase.from("ai_import_logs").insert({
    user_id: userId,
    model: EXTRACT_MODEL,
    success: row.success,
    error_code: row.error_code,
    input_chars: row.input_chars,
    input_tokens: row.input_tokens ?? null,
    output_tokens: row.output_tokens ?? null,
    estimated_usd: row.estimated_usd ?? 0,
    payload: { kind: "note" },
  });
  if (error) console.warn("[lumen-note log]", error.message);
}

/** Returns a public error, or null if the note can go up. */
export async function lumenCheckNote(
  supabase: Db,
  userId: string,
  body: string,
  imageUrls: string[],
): Promise<string | null> {
  const cheap = refuseComment(body);
  if (cheap) return cheap;

  const nap = await aiBlocked(supabase, NOTE_RESERVE_USD);
  if (nap) return nap;

  const client = xaiClient();
  if (!client) return "Lumen’s taking a nap.";

  const pics = imageUrls.slice(0, 3);
  const userContent =
    pics.length === 0
      ? `Note:\n${body}`
      : [
          ...pics.map((url) => ({
            type: "input_image" as const,
            image_url: url,
            detail: "low" as const,
          })),
          { type: "input_text" as const, text: `Note:\n${body}` },
        ];

  try {
    const response = await client.responses.create({
      model: EXTRACT_MODEL,
      input: [
        { role: "system", content: NOTE_PROMPT },
        { role: "user", content: userContent },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "lumen_note",
          schema: NOTE_SCHEMA,
          strict: true,
        },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const usage = response.usage as
      | { input_tokens?: number; output_tokens?: number }
      | undefined;
    const inputTokens = usage?.input_tokens ?? 0;
    const outputTokens = usage?.output_tokens ?? 0;
    const estimatedUsd = estimateUsd(inputTokens, outputTokens);

    let content = response.output_text ?? "";
    if (!content && Array.isArray(response.output)) {
      const msg = response.output.find((i) => i.type === "message");
      const block = msg?.content?.find((c) => c.type === "output_text");
      content = block && "text" in block ? String(block.text) : "";
    }

    let parsed: { ok?: boolean; refuse?: string | null } | null = null;
    try {
      parsed = JSON.parse(content) as { ok?: boolean; refuse?: string | null };
    } catch {
      parsed = null;
    }

    if (!parsed || typeof parsed.ok !== "boolean") {
      await logNote(supabase, userId, {
        success: false,
        error_code: "note_fail",
        input_chars: body.length,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        estimated_usd: estimatedUsd,
      });
      return "Lumen’s taking a nap.";
    }

    if (!parsed.ok) {
      await logNote(supabase, userId, {
        success: false,
        error_code: "note_blocked",
        input_chars: body.length,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        estimated_usd: estimatedUsd,
      });
      return publicRefuse(parsed.refuse ?? "other");
    }

    await logNote(supabase, userId, {
      success: true,
      error_code: "note_ok",
      input_chars: body.length,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      estimated_usd: estimatedUsd,
    });
    return null;
  } catch (e) {
    console.warn("[lumen-note]", e instanceof Error ? e.message : e);
    await logNote(supabase, userId, {
      success: false,
      error_code: "note_fail",
      input_chars: body.length,
    });
    return "Lumen’s taking a nap.";
  }
}
