import { createClient } from "@/lib/supabase/server";
import type { Playbook, PlaybookStop } from "@/features/playbooks/types";

export async function listPlaybooksForCity(cityId: string): Promise<Playbook[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("playbooks")
    .select(
      "id, city_id, title, narrative, hours_available, status, author_id",
    )
    .eq("city_id", cityId)
    .order("title");
  if (error) {
    console.error("[listPlaybooksForCity]", error.message);
    return [];
  }
  return (data ?? []) as Playbook[];
}

export async function getPlaybook(id: string): Promise<Playbook | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("playbooks")
    .select(
      "id, city_id, title, narrative, hours_available, status, author_id",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("[getPlaybook]", error.message);
    return null;
  }
  return data as Playbook | null;
}

export async function listStopsForPlaybook(
  playbookId: string,
): Promise<PlaybookStop[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("playbook_stops")
    .select("id, playbook_id, position, place_id, title, body")
    .eq("playbook_id", playbookId)
    .order("position");
  if (error) {
    console.error("[listStopsForPlaybook]", error.message);
    return [];
  }
  return (data ?? []) as PlaybookStop[];
}

export async function listMyPlaybooks(authorId: string): Promise<Playbook[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("playbooks")
    .select(
      "id, city_id, title, narrative, hours_available, status, author_id",
    )
    .eq("author_id", authorId)
    .order("updated_at", { ascending: false });
  if (error) {
    console.error("[listMyPlaybooks]", error.message);
    return [];
  }
  return (data ?? []) as Playbook[];
}

export async function listMyPlaces(authorId: string): Promise<
  {
    id: string;
    name: string;
    status: string;
    city_id: string;
  }[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("places")
    .select("id, name, status, city_id")
    .eq("author_id", authorId)
    .order("updated_at", { ascending: false });
  if (error) {
    console.error("[listMyPlaces]", error.message);
    return [];
  }
  return data ?? [];
}
