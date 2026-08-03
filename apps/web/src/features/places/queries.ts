import { createClient } from "@/lib/supabase/server";
import type { City, Dish, Place, Zone } from "@/features/places/types";

export async function listCities(): Promise<City[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cities")
    .select("id, slug, name, country, airport_code")
    .order("name");
  if (error) {
    console.error("[listCities]", error.message);
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
    console.error("[getCityBySlug]", error.message);
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
    console.error("[listZonesForCity]", error.message);
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
    console.error("[listAllZones]", error.message);
    return [];
  }
  return (data ?? []) as Zone[];
}

export async function listPublishedPlaces(): Promise<Place[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("places")
    .select(
      "id, city_id, zone_id, name, blurb, category, status, author_id",
    )
    .eq("status", "published")
    .order("name");
  if (error) {
    console.error("[listPublishedPlaces]", error.message);
    return [];
  }
  return (data ?? []) as Place[];
}

export async function listPlacesForCity(cityId: string): Promise<Place[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("places")
    .select(
      "id, city_id, zone_id, name, blurb, category, status, author_id",
    )
    .eq("city_id", cityId)
    .order("name");
  if (error) {
    console.error("[listPlacesForCity]", error.message);
    return [];
  }
  return (data ?? []) as Place[];
}

export async function getPlace(id: string): Promise<Place | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("places")
    .select(
      "id, city_id, zone_id, name, blurb, category, status, author_id",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("[getPlace]", error.message);
    return null;
  }
  return data as Place | null;
}

export async function listDishesForPlace(placeId: string): Promise<Dish[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("dishes")
    .select("id, place_id, name, note, sort_order")
    .eq("place_id", placeId)
    .order("sort_order");
  if (error) {
    console.error("[listDishesForPlace]", error.message);
    return [];
  }
  return (data ?? []) as Dish[];
}
