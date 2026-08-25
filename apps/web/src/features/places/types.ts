export type ZoneType = "airport_strip" | "downtown" | "station" | "other";
export type ContentStatus = "draft" | "published" | "hidden";

export type City = {
  id: string;
  slug: string;
  name: string;
  country: string | null;
  airport_code: string | null;
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
  image_url?: string | null;
  image_source?: string | null;
};

export type Dish = {
  id: string;
  place_id: string;
  name: string;
  note: string | null;
  sort_order: number;
};

export const ZONE_LABELS: Record<ZoneType, string> = {
  airport_strip: "Airport area",
  downtown: "Downtown / centre",
  station: "Station area",
  other: "Other area",
};
