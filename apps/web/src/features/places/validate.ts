import type { SupabaseClient } from "@supabase/supabase-js";

/** Zone must belong to city when set. */
export async function assertZoneInCity(
  supabase: SupabaseClient,
  cityId: string,
  zoneId: string | null,
): Promise<string | null> {
  if (!zoneId) return null;
  const { data, error } = await supabase
    .from("zones")
    .select("id, city_id")
    .eq("id", zoneId)
    .maybeSingle();
  if (error) return error.message;
  if (!data) return "Selected zone was not found.";
  if (data.city_id !== cityId) {
    return "Zone must belong to the selected city.";
  }
  return null;
}

/** Place must exist, be readable, and match city. */
export async function assertPlaceInCity(
  supabase: SupabaseClient,
  cityId: string,
  placeId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("places")
    .select("id, city_id")
    .eq("id", placeId)
    .maybeSingle();
  if (error) return error.message;
  if (!data) return "Linked place was not found or is not available.";
  if (data.city_id !== cityId) {
    return "Linked place must be in the same city as the layover plan.";
  }
  return null;
}
