-- Phase 4: Lumen may open a city from a dump (name + 3-letter IATA).
-- Does not reopen the public city form. Run after 008.

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

  return v_id;
end;
$$;

revoke all on function public.lumen_ensure_city(text, text, text, text) from public;
grant execute on function public.lumen_ensure_city(text, text, text, text) to authenticated;
