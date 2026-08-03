-- Phase 2: cities, zones, places, dishes, playbooks, stops
-- Run in Supabase SQL Editor after 001_profiles.sql
-- No hotel-name fields. Zones only for logistics.

create type public.zone_type as enum (
  'airport_strip',
  'downtown',
  'station',
  'other'
);

create type public.content_status as enum (
  'draft',
  'published',
  'hidden'
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and p.status = 'active'
  );
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Cities (all public; no draft)
create table public.cities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  country text,
  airport_code text,
  created_at timestamptz not null default now()
);

create table public.zones (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references public.cities (id) on delete cascade,
  type public.zone_type not null,
  name text,
  unique (city_id, type, name)
);

create table public.places (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references public.cities (id) on delete cascade,
  zone_id uuid references public.zones (id) on delete set null,
  name text not null,
  blurb text,
  category text,
  status public.content_status not null default 'draft',
  author_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index places_city_idx on public.places (city_id);
create index places_status_idx on public.places (status);

create table public.dishes (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places (id) on delete cascade,
  name text not null,
  note text,
  sort_order int not null default 0
);

create table public.playbooks (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references public.cities (id) on delete cascade,
  title text not null,
  narrative text,
  hours_available int,
  status public.content_status not null default 'draft',
  author_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index playbooks_city_idx on public.playbooks (city_id);
create index playbooks_status_idx on public.playbooks (status);

create table public.playbook_stops (
  id uuid primary key default gen_random_uuid(),
  playbook_id uuid not null references public.playbooks (id) on delete cascade,
  position int not null default 0,
  place_id uuid references public.places (id) on delete set null,
  title text,
  body text,
  unique (playbook_id, position)
);

create trigger places_updated_at
  before update on public.places
  for each row execute function public.set_updated_at();

create trigger playbooks_updated_at
  before update on public.playbooks
  for each row execute function public.set_updated_at();

-- RLS
alter table public.cities enable row level security;
alter table public.zones enable row level security;
alter table public.places enable row level security;
alter table public.dishes enable row level security;
alter table public.playbooks enable row level security;
alter table public.playbook_stops enable row level security;

-- Cities: anyone can read; authenticated can insert; admin update/delete
create policy "cities_select_all"
  on public.cities for select
  using (true);

create policy "cities_insert_auth"
  on public.cities for insert
  to authenticated
  with check (auth.uid() is not null);

create policy "cities_update_admin"
  on public.cities for update
  to authenticated
  using (public.is_admin());

create policy "cities_delete_admin"
  on public.cities for delete
  to authenticated
  using (public.is_admin());

-- Zones
create policy "zones_select_all"
  on public.zones for select
  using (true);

create policy "zones_insert_auth"
  on public.zones for insert
  to authenticated
  with check (auth.uid() is not null);

create policy "zones_update_admin"
  on public.zones for update
  to authenticated
  using (public.is_admin());

create policy "zones_delete_admin"
  on public.zones for delete
  to authenticated
  using (public.is_admin());

-- Places
create policy "places_select"
  on public.places for select
  using (
    status = 'published'
    or author_id = auth.uid()
    or public.is_admin()
  );

create policy "places_insert"
  on public.places for insert
  to authenticated
  with check (author_id = auth.uid() or public.is_admin());

create policy "places_update"
  on public.places for update
  to authenticated
  using (author_id = auth.uid() or public.is_admin())
  with check (author_id = auth.uid() or public.is_admin());

create policy "places_delete"
  on public.places for delete
  to authenticated
  using (author_id = auth.uid() or public.is_admin());

-- Dishes: visible if parent place is
create policy "dishes_select"
  on public.dishes for select
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

create policy "dishes_insert"
  on public.dishes for insert
  to authenticated
  with check (
    exists (
      select 1 from public.places p
      where p.id = place_id
        and (p.author_id = auth.uid() or public.is_admin())
    )
  );

create policy "dishes_update"
  on public.dishes for update
  to authenticated
  using (
    exists (
      select 1 from public.places p
      where p.id = place_id
        and (p.author_id = auth.uid() or public.is_admin())
    )
  );

create policy "dishes_delete"
  on public.dishes for delete
  to authenticated
  using (
    exists (
      select 1 from public.places p
      where p.id = place_id
        and (p.author_id = auth.uid() or public.is_admin())
    )
  );

-- Playbooks
create policy "playbooks_select"
  on public.playbooks for select
  using (
    status = 'published'
    or author_id = auth.uid()
    or public.is_admin()
  );

create policy "playbooks_insert"
  on public.playbooks for insert
  to authenticated
  with check (author_id = auth.uid() or public.is_admin());

create policy "playbooks_update"
  on public.playbooks for update
  to authenticated
  using (author_id = auth.uid() or public.is_admin())
  with check (author_id = auth.uid() or public.is_admin());

create policy "playbooks_delete"
  on public.playbooks for delete
  to authenticated
  using (author_id = auth.uid() or public.is_admin());

-- Stops follow parent playbook
create policy "stops_select"
  on public.playbook_stops for select
  using (
    exists (
      select 1 from public.playbooks pb
      where pb.id = playbook_id
        and (
          pb.status = 'published'
          or pb.author_id = auth.uid()
          or public.is_admin()
        )
    )
  );

create policy "stops_insert"
  on public.playbook_stops for insert
  to authenticated
  with check (
    exists (
      select 1 from public.playbooks pb
      where pb.id = playbook_id
        and (pb.author_id = auth.uid() or public.is_admin())
    )
  );

create policy "stops_update"
  on public.playbook_stops for update
  to authenticated
  using (
    exists (
      select 1 from public.playbooks pb
      where pb.id = playbook_id
        and (pb.author_id = auth.uid() or public.is_admin())
    )
  );

create policy "stops_delete"
  on public.playbook_stops for delete
  to authenticated
  using (
    exists (
      select 1 from public.playbooks pb
      where pb.id = playbook_id
        and (pb.author_id = auth.uid() or public.is_admin())
    )
  );
