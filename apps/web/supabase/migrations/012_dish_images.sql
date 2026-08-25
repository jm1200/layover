-- Optional plate photos on dishes. Rec card still uses the place still.
-- Run after 011.

alter table public.dishes
  add column if not exists image_url text;
