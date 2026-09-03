-- People roster without joining auth.users (that join is what broke the RPC).
-- Last seen lives on profiles. SQL Editor can backfill from auth.users.
-- Paste in the SQL Editor, then refresh Admin → People.

alter table public.profiles
  add column if not exists last_seen_at timestamptz;

update public.profiles p
set last_seen_at = u.last_sign_in_at
from auth.users u
where u.id = p.id
  and p.last_seen_at is null
  and u.last_sign_in_at is not null;

drop function if exists public.admin_people();

create or replace function public.admin_people()
returns table (
  id uuid,
  display_name text,
  email text,
  person_role public.user_role,
  person_status public.account_status,
  last_seen_at timestamptz,
  recs bigint,
  days bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    p.display_name,
    p.email::text,
    p.role,
    p.status,
    p.last_seen_at,
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
  where public.is_admin()
  order by p.last_seen_at desc nulls last, p.created_at desc;
$$;

revoke all on function public.admin_people() from public, anon;
grant execute on function public.admin_people() to authenticated;

create or replace function public.lumen_month_spend_usd()
returns numeric
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(sum(estimated_usd), 0)
  from public.ai_import_logs
  where created_at >= date_trunc('month', now());
$$;

notify pgrst, 'reload schema';
