-- Place stills: user upload or Lumen Imagine. Run after 009.
-- Also create a public Storage bucket named place-stills
-- (Dashboard → Storage → New bucket, public) if this insert is not allowed.

alter table public.places
  add column if not exists image_url text,
  add column if not exists image_source text;

insert into storage.buckets (id, name, public)
values ('place-stills', 'place-stills', true)
on conflict (id) do nothing;

drop policy if exists "place_stills_select" on storage.objects;
create policy "place_stills_select"
  on storage.objects for select
  using (bucket_id = 'place-stills');

drop policy if exists "place_stills_insert_own" on storage.objects;
create policy "place_stills_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'place-stills'
    and split_part(name, '/', 1) = auth.uid()::text
  );

drop policy if exists "place_stills_update_own" on storage.objects;
create policy "place_stills_update_own"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'place-stills'
    and split_part(name, '/', 1) = auth.uid()::text
  );
