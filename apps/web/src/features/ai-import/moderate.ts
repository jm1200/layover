import { NO_HOTELS } from "@/features/ai-import/copy";

/** Cheap lodging leak check. Lumen’s extract does the real-place lookup. */

const LODGING =
  /\b(crew hotel|layover hotel|airline hotel|our hotel|the hotel|crew house|crash pad|where \w+ stays)\b/i;

export function lodgingLeak(text: string): boolean {
  // "airport layover" / "downtown" are zones, not lodging.
  return LODGING.test(text);
}

export function refusePublicCopy(
  name: string,
  blurb?: string | null,
): string | null {
  if (lodgingLeak(`${name}\n${blurb ?? ""}`)) {
    return NO_HOTELS;
  }
  return null;
}

/** Take lodging phrases out of Lumen’s write-up. Do not refuse the dump. */
export function scrubLodging(text: string | null | undefined): string | null {
  if (text == null) return null;
  const next = text
    .replace(LODGING, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\s+([.,;:!?])/g, "$1")
    .trim();
  return next || null;
}

export function nameIsOnlyLodging(name: string): boolean {
  return lodgingLeak(name) && !scrubLodging(name);
}

/** Cheap PG-13 / hate check. Lumen’s extract does the real-place lookup for dumps. */
const PG13 =
  /\b(porn|porno|xxx|onlyfans|gore|behead(?:ing)?|rape|nigger|nigga|faggot|kike|spic|tranny)\b/i;

export function refuseComment(body: string): string | null {
  const lodging = refusePublicCopy(body, null);
  if (lodging) return lodging;
  if (PG13.test(body)) return "Keep it PG-13.";
  return null;
}
