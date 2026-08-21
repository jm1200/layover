export type RecKind = "eat" | "do" | "shop";

export const REC_KINDS: RecKind[] = ["eat", "do", "shop"];

export const REC_KIND_LABEL: Record<RecKind, string> = {
  eat: "Eat",
  do: "Do",
  shop: "Shop",
};

export const REC_KIND_HINT: Record<RecKind, string> = {
  eat: "A restaurant, bar, or something to eat",
  do: "An activity — float, climb, walk, gym",
  shop: "A shop or a thing to buy",
};

const EAT = new Set(["eat", "restaurant", "bar", "cafe", "coffee", "food"]);
const SHOP = new Set(["shop", "grocery", "boutique", "store", "market"]);

/** Map stored category (including seed values) to a browse group. Unknown → Do. */
export function recKindFromCategory(
  category: string | null | undefined,
): RecKind {
  const c = (category ?? "").trim().toLowerCase();
  if (EAT.has(c)) return "eat";
  if (SHOP.has(c)) return "shop";
  return "do";
}

export function parseRecKind(
  value: string | null | undefined,
): RecKind | null {
  const c = (value ?? "").trim().toLowerCase();
  if (c === "eat" || c === "do" || c === "shop") return c;
  return null;
}
