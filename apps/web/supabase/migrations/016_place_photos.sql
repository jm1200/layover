-- One rec album (max 3 in app). Hero is places.image_url, one of these URLs.
-- Run after 012. Plates stay names; they do not store the album.

create table if not exists public.place_photos (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places (id) on delete cascade,
  image_url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists place_photos_place_idx
  on public.place_photos (place_id, sort_order);

alter table public.place_photos enable row level security;

drop policy if exists "place_photos_select" on public.place_photos;
create policy "place_photos_select"
  on public.place_photos for select
  using (
    exists (
      select 1 from public.places p
      where p.id = place_id
        and (
          p.status = 'published'
          or p.author_id = auth.uid()
          or public.is_admin()
        )
    )
  );

drop policy if exists "place_photos_insert" on public.place_photos;
create policy "place_photos_insert"
  on public.place_photos for insert
  to authenticated
  with check (
    exists (
      select 1 from public.places p
      where p.id = place_id
        and (p.author_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists "place_photos_update" on public.place_photos;
create policy "place_photos_update"
  on public.place_photos for update
  to authenticated
  using (
    exists (
      select 1 from public.places p
      where p.id = place_id
        and (p.author_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists "place_photos_delete" on public.place_photos;
create policy "place_photos_delete"
  on public.place_photos for delete
  to authenticated
  using (
    exists (
      select 1 from public.places p
      where p.id = place_id
        and (p.author_id = auth.uid() or public.is_admin())
    )
  );

insert into public.place_photos (place_id, image_url, sort_order)
select y.place_id, y.image_url, y.sort_order
from (
  select place_id, image_url, min(sort_order) as sort_order
  from (
    select id as place_id, image_url, 0 as sort_order
    from public.places
    where image_url is not null and image_url <> ''
    union all
    select place_id, image_url, 1
    from public.dishes
    where image_url is not null and image_url <> ''
  ) x
  group by place_id, image_url
) y
where not exists (
  select 1 from public.place_photos pp
  where pp.place_id = y.place_id and pp.image_url = y.image_url
);
