-- Admin roster: who signed in, last seen, what they published.
-- Paste after 021. No service_role in the app. is_admin() only.

create or replace function public.admin_people()
returns table (
  id uuid,
  display_name text,
  email text,
  role public.user_role,
  status public.account_status,
  last_seen_at timestamptz,
  recs bigint,
  days bigint
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Not allowed.';
  end if;

  return query
  select
    p.id,
    p.display_name,
    coalesce(u.email, p.email),
    p.role,
    p.status,
    u.last_sign_in_at,
    (
      select count(*)
      from public.places pl
      where pl.author_id = p.id and pl.status = 'published'
    ),
    (
      select count(*)
      from public.playbooks pb
      where pb.author_id = p.id and pb.status = 'published'
    )
  from public.profiles p
  left join auth.users u on u.id = p.id
  order by u.last_sign_in_at desc nulls last, p.created_at desc;
end;
$$;

revoke all on function public.admin_people() from public, anon;
grant execute on function public.admin_people() to authenticated;

create or replace function public.admin_new_intel()
returns table (
  kind text,
  id uuid,
  title text,
  city_name text,
  author_name text,
  author_id uuid,
  posted_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Not allowed.';
  end if;

  return query
  select q.kind, q.id, q.title, q.city_name, q.author_name, q.author_id, q.posted_at
  from (
    select
      'rec'::text as kind,
      pl.id,
      pl.name as title,
      c.name as city_name,
      coalesce(nullif(trim(pr.display_name), ''), 'Crew') as author_name,
      pl.author_id,
      pl.created_at as posted_at
    from public.places pl
    left join public.cities c on c.id = pl.city_id
    left join public.profiles pr on pr.id = pl.author_id
    where pl.status = 'published'

    union all

    select
      'day'::text,
      pb.id,
      pb.title,
      c.name,
      coalesce(nullif(trim(pr.display_name), ''), 'Crew'),
      pb.author_id,
      pb.created_at
    from public.playbooks pb
    left join public.cities c on c.id = pb.city_id
    left join public.profiles pr on pr.id = pb.author_id
    where pb.status = 'published'
  ) q
  order by q.posted_at desc
  limit 30;
end;
$$;

revoke all on function public.admin_new_intel() from public, anon;
grant execute on function public.admin_new_intel() to authenticated;

notify pgrst, 'reload schema';
