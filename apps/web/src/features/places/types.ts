export type ZoneType = "airport_strip" | "downtown" | "station" | "other";
export type ContentStatus = "draft" | "published" | "hidden";

export type City = {
  id: string;
  slug: string;
  name: string;
  country: string | null;
  airport_code: string | null;
  image_url?: string | null;
  image_source?: string | null;
};

export type Zone = {
  id: string;
  city_id: string;
  type: ZoneType;
  name: string | null;
};

export type Place = {
  id: string;
  city_id: string;
  zone_id: string | null;
  name: string;
  blurb: string | null;
  category: string | null;
  status: ContentStatus;
  author_id: string | null;
  created_at?: string;
  image_url?: string | null;
  image_source?: string | null;
  want_ai_still?: boolean | null;
};

export type PlacePhoto = {
  id: string;
  place_id: string;
  image_url: string;
  sort_order: number;
};

export type Dish = {
  id: string;
  place_id: string;
  name: string;
  note: string | null;
  sort_order: number;
  image_url?: string | null;
};

export const ZONE_LABELS: Record<ZoneType, string> = {
  airport_strip: "Airport layover",
  downtown: "Downtown",
  station: "Station area",
  other: "Other area",
};

/** Public word. Downtown / airport layover, never a hotel name. */
export function zonePublicLabel(z: {
  type: string;
  name?: string | null;
}): string {
  if (z.type === "airport_strip") return ZONE_LABELS.airport_strip;
  if (z.type === "downtown") return ZONE_LABELS.downtown;
  if (z.type === "station") {
    return z.name?.trim() || ZONE_LABELS.station;
  }
  if (z.type === "other") {
    return z.name?.trim() || ZONE_LABELS.other;
  }
  return z.name?.trim() || z.type;
}
