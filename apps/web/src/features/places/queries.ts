import { createClient } from "@/lib/supabase/server";
import type { City, Dish, Place, Zone } from "@/features/places/types";

const PLACE_COLS =
  "id, city_id, zone_id, name, blurb, category, status, author_id, image_url, image_source";
const PLACE_COLS_LEGACY =
  "id, city_id, zone_id, name, blurb, category, status, author_id";

export async function listCities(): Promise<City[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cities")
    .select("id, slug, name, country, airport_code")
    .order("name");
  if (error) {
    console.warn("[listCities]", error.message);
    return [];
  }
  return (data ?? []) as City[];
}

export async function getCityBySlug(slug: string): Promise<City | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cities")
    .select("id, slug, name, country, airport_code")
    .eq("slug", slug)
    .maybeSingle();
  if (error) {
    console.warn("[getCityBySlug]", error.message);
    return null;
  }
  return data as City | null;
}

export async function listZonesForCity(cityId: string): Promise<Zone[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("zones")
    .select("id, city_id, type, name")
    .eq("city_id", cityId)
    .order("type");
  if (error) {
    console.warn("[listZonesForCity]", error.message);
    return [];
  }
  return (data ?? []) as Zone[];
}

export async function listAllZones(): Promise<Zone[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("zones")
    .select("id, city_id, type, name")
    .order("type");
  if (error) {
    console.warn("[listAllZones]", error.message);
    return [];
  }
  return (data ?? []) as Zone[];
}

export async function listPublishedPlaces(): Promise<Place[]> {
  const supabase = await createClient();
  const first = await supabase
    .from("places")
    .select(PLACE_COLS)
    .eq("status", "published")
    .order("name");
  const { data, error } = first.error
    ? await supabase
        .from("places")
        .select(PLACE_COLS_LEGACY)
        .eq("status", "published")
        .order("name")
    : first;
  if (error) {
    console.warn("[listPublishedPlaces]", error.message);
    return [];
  }
  return (data ?? []) as Place[];
}

export async function listPlacesForCity(cityId: string): Promise<Place[]> {
  const supabase = await createClient();
  const first = await supabase
    .from("places")
    .select(PLACE_COLS)
    .eq("city_id", cityId)
    .order("name");
  const { data, error } = first.error
    ? await supabase
        .from("places")
        .select(PLACE_COLS_LEGACY)
        .eq("city_id", cityId)
        .order("name")
    : first;
  if (error) {
    console.warn("[listPlacesForCity]", error.message);
    return [];
  }
  return (data ?? []) as Place[];
}

export async function getPlace(id: string): Promise<Place | null> {
  const supabase = await createClient();
  const first = await supabase
    .from("places")
    .select(PLACE_COLS)
    .eq("id", id)
    .maybeSingle();
  if (!first.error) return first.data as Place | null;
  const retry = await supabase
    .from("places")
    .select(PLACE_COLS_LEGACY)
    .eq("id", id)
    .maybeSingle();
  if (retry.error) {
    console.warn("[getPlace]", retry.error.message);
    return null;
  }
  return retry.data as Place | null;
}

export async function listDishesForPlace(placeId: string): Promise<Dish[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("dishes")
    .select("id, place_id, name, note, sort_order")
    .eq("place_id", placeId)
    .order("sort_order");
  if (error) {
    console.warn("[listDishesForPlace]", error.message);
    return [];
  }
  return (data ?? []) as Dish[];
}
