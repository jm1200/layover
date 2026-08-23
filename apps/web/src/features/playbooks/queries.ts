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
    console.warn("[listPlaybooksForCity]", error.message);
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
    console.warn("[getPlaybook]", error.message);
    return null;
  }
  return data as Playbook | null;
}

export async function listStopsForPlaybook(
  playbookId: string,
): Promise<PlaybookStop[]> {
  const supabase = await createClient();
  const full = await supabase
    .from("playbook_stops")
    .select(
      "id, playbook_id, position, place_id, title, body, duration_minutes, cost_note",
    )
    .eq("playbook_id", playbookId)
    .order("position");
  if (!full.error) return (full.data ?? []) as PlaybookStop[];

  const basic = await supabase
    .from("playbook_stops")
    .select("id, playbook_id, position, place_id, title, body")
    .eq("playbook_id", playbookId)
    .order("position");
  if (basic.error) {
    console.warn("[listStopsForPlaybook]", basic.error.message);
    return [];
  }
  return (basic.data ?? []).map((row) => ({
    ...row,
    duration_minutes: null,
    cost_note: null,
  })) as PlaybookStop[];
}

export async function listPublishedPlaybooks(): Promise<Playbook[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("playbooks")
    .select(
      "id, city_id, title, narrative, hours_available, status, author_id",
    )
    .eq("status", "published")
    .order("title");
  if (error) {
    console.warn("[listPublishedPlaybooks]", error.message);
    return [];
  }
  return (data ?? []) as Playbook[];
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
    console.warn("[listMyPlaybooks]", error.message);
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
    category: string | null;
  }[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("places")
    .select("id, name, status, city_id, category")
    .eq("author_id", authorId)
    .order("updated_at", { ascending: false });
  if (error) {
    console.warn("[listMyPlaces]", error.message);
    return [];
  }
  return data ?? [];
}
