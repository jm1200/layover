/** Cheap lodging leak check. Lumen’s extract does the real-place lookup. */

const LODGING =
  /\b(crew hotel|layover hotel|airline hotel|our hotel|the hotel|crew house|crash pad|where \w+ stays)\b/i;

export function lodgingLeak(text: string): boolean {
  return LODGING.test(text);
}

export function refusePublicCopy(
  name: string,
  blurb?: string | null,
): string | null {
  if (lodgingLeak(`${name}\n${blurb ?? ""}`)) {
    return "Zones, not hotels.";
  }
  return null;
}
