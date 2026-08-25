/** Lumen spends on a still only if the rec can brief a picture. */
export function lumenOffersStill(blurb: string | null | undefined): boolean {
  const t = (blurb ?? "").trim();
  if (t.length < 80) return false;
  const limp = /^(classic|nice|great|awesome|cool)\s+spot\b/i;
  if (limp.test(t) && t.length < 140) return false;
  return true;
}
