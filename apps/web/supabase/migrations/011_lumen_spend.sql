-- Phase 4 harden: global $20 meter, city heroes, generate-on-publish, city-open quota.
-- Run in Supabase SQL Editor after 010.

alter table public.ai_import_logs
  add column if not exists search_calls int;

alter table public.places
  add column if not exists want_ai_still boolean not null default false;

alter table public.cities
  add column if not exists image_url text,
  add column if not exists image_source text;

alter table public.ai_import_logs
  drop constraint if exists ai_import_logs_usd_sane;
alter table public.ai_import_logs
  add constraint ai_import_logs_usd_sane
  check (estimated_usd is null or (estimated_usd >= 0 and estimated_usd <= 2));

-- One number: this month's AI spend across every user. RLS cannot see all rows.
create or replace function public.lumen_month_spend_usd()
returns numeric
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(sum(estimated_usd), 0)
  from public.ai_import_logs
  where created_at >= date_trunc('month', timezone('utc', now()));
$$;

revoke all on function public.lumen_month_spend_usd() from public;
grant execute on function public.lumen_month_spend_usd() to authenticated;

-- 1 hero per city. Does not overwrite an existing banner.
create or replace function public.lumen_set_city_hero(
  p_city uuid,
  p_url text,
  p_source text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  if p_url is null or trim(p_url) = '' then
    raise exception 'url required';
  end if;
  if p_source is null or p_source not in ('ai', 'user') then
    raise exception 'bad source';
  end if;

  update public.cities
  set image_url = p_url, image_source = p_source
  where id = p_city
    and image_url is null;

  return found;
end;
$$;

revoke all on function public.lumen_set_city_hero(uuid, text, text) from public;
grant execute on function public.lumen_set_city_hero(uuid, text, text) to authenticated;

create table if not exists public.lumen_city_opens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  city_id uuid not null references public.cities (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists lumen_city_opens_user_day_idx
  on public.lumen_city_opens (user_id, created_at desc);

alter table public.lumen_city_opens enable row level security;

create or replace function public.lumen_ensure_city(
  p_name text,
  p_slug text,
  p_airport text,
  p_country text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_id uuid;
  v_airport text;
  v_slug text;
  v_name text;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  v_name := trim(p_name);
  v_airport := upper(trim(p_airport));
  v_slug := lower(trim(coalesce(p_slug, '')));

  if v_name is null or v_name = '' then
    raise exception 'city name required';
  end if;
  if v_airport is null or v_airport !~ '^[A-Z]{3}$' then
    raise exception 'airport must be a 3-letter code';
  end if;

  if v_slug = '' then
    v_slug := regexp_replace(lower(v_name), '[^a-z0-9]+', '-', 'g');
    v_slug := trim(both '-' from v_slug);
  end if;
  v_slug := regexp_replace(v_slug, '[^a-z0-9-]', '', 'g');
  v_slug := trim(both '-' from v_slug);
  if v_slug = '' then
    v_slug := lower(v_airport);
  end if;

  select c.id into v_id
  from public.cities c
  where upper(coalesce(c.airport_code, '')) = v_airport
     or c.slug = v_slug
     or lower(c.name) = lower(v_name)
  order by
    case when upper(coalesce(c.airport_code, '')) = v_airport then 0 else 1 end
  limit 1;

  if v_id is not null then
    return v_id;
  end if;

  if (
    select count(*) from public.lumen_city_opens
    where user_id = v_uid and created_at > now() - interval '24 hours'
  ) >= 5 then
    raise exception 'city open limit';
  end if;

  if exists (select 1 from public.cities where slug = v_slug) then
    v_slug := v_slug || '-' || lower(v_airport);
  end if;

  insert into public.cities (slug, name, country, airport_code)
  values (v_slug, v_name, nullif(trim(coalesce(p_country, '')), ''), v_airport)
  returning id into v_id;

  insert into public.zones (city_id, type, name) values
    (v_id, 'airport_strip', 'Airport area'),
    (v_id, 'downtown', 'Downtown / centre'),
    (v_id, 'station', 'Station area')
  on conflict do nothing;

  insert into public.lumen_city_opens (user_id, city_id)
  values (v_uid, v_id);

  return v_id;
end;
$$;

revoke all on function public.lumen_ensure_city(text, text, text, text) from public;
grant execute on function public.lumen_ensure_city(text, text, text, text) to authenticated;
