import type { ContentStatus } from "@/features/places/types";

export type Playbook = {
  id: string;
  city_id: string;
  title: string;
  narrative: string | null;
  hours_available: number | null;
  status: ContentStatus;
  author_id: string | null;
};

export type PlaybookStop = {
  id: string;
  playbook_id: string;
  position: number;
  place_id: string | null;
  title: string | null;
  body: string | null;
  duration_minutes: number | null;
  cost_note: string | null;
};
