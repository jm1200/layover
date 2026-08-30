-- Hygiene: only admin, or someone who filed a rec in that city, may set
-- the city banner. URL must be our stills bucket (or a site path).
-- Does not overwrite an existing banner.

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
  if p_url not like '%/place-stills/%' and left(p_url, 1) <> '/' then
    raise exception 'bad url';
  end if;
  if not (
    public.is_admin()
    or exists (
      select 1 from public.places
      where city_id = p_city and author_id = auth.uid()
    )
  ) then
    raise exception 'not allowed';
  end if;

  update public.cities
  set image_url = p_url, image_source = p_source
  where id = p_city
    and image_url is null;

  return found;
end;
$$;
