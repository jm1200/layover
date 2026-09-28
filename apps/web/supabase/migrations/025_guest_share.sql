-- Guest share: talk or type a layover without an account; sign in to publish.
-- Guests never touch content tables. Lumen's draft waits here until a
-- signed-in user claims it with the token in their browser cookie.
-- Paste in the SQL Editor after 024. Needs GUEST_LOG_SECRET in Vercel env
-- (value from apps/web/.env.local) — without it guests just see "paused".

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.guest_drafts (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('stt', 'extract')),
  ip_hash text not null,
  token_hash text,
  story text,
  hint_slug text,
  extract jsonb,
  estimated_usd numeric not null default 0
    check (estimated_usd >= 0 and estimated_usd <= 0.25),
  claimed_by uuid references public.profiles (id) on delete set null,
  claimed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists guest_drafts_ip_idx
  on public.guest_drafts (ip_hash, kind, created_at desc);
create index if not exists guest_drafts_created_idx
  on public.guest_drafts (created_at desc);

-- No policies: only the security definer functions below read or write it.
alter table public.guest_drafts enable row level security;

insert into public.site_settings (key, value)
values ('guest_month_cap_usd', '5')
on conflict (key) do nothing;

create or replace function public.lumen_guest_cap_usd()
returns numeric
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select nullif(value, '')::numeric from public.site_settings
     where key = 'guest_month_cap_usd'),
    5
  );
$$;

-- Guest spend counts toward the $20, but never more than the guest cap.
create or replace function public.lumen_month_spend_usd()
returns numeric
language sql
stable
security definer
set search_path = public
as $$
  select
    coalesce((
      select sum(estimated_usd) from public.ai_import_logs
      where created_at >= date_trunc('month', now())
    ), 0)
    + least(
      coalesce((
        select sum(estimated_usd) from public.guest_drafts
        where created_at >= date_trunc('month', now())
      ), 0),
      public.lumen_guest_cap_usd()
    );
$$;

-- Only our server may write guest rows. It sends GUEST_LOG_SECRET (Vercel env);
-- only the sha256 lives here. Rotate: new env value + update this hash.
create table if not exists public.lumen_guest_key (
  id int primary key default 1 check (id = 1),
  secret_sha256 text not null
);
alter table public.lumen_guest_key enable row level security;
insert into public.lumen_guest_key (id, secret_sha256)
values (1, 'f3cfef165773e8b2dff3c36573f49d91cafd7863e6a4a010cff47409cca57c85')
on conflict (id) do update set secret_sha256 = excluded.secret_sha256;

create or replace function public.lumen_guest_key_ok(p_secret text)
returns boolean
language sql
stable
security definer
set search_path = public, extensions
as $$
  select exists (
    select 1 from public.lumen_guest_key
    where secret_sha256 = encode(digest(coalesce(p_secret, ''), 'sha256'), 'hex')
  );
$$;
revoke all on function public.lumen_guest_key_ok(text) from public, anon, authenticated;

-- Check the caps and hold the cost in one locked step, before the AI call.
-- Parallel requests queue on the lock, so they cannot all see "0 used".
-- Returns the row id, or raises 'guest:<reason>'.
create or replace function public.lumen_guest_reserve(
  p_secret text,
  p_ip_hash text,
  p_kind text,
  p_reserve_usd numeric,
  p_month_cap_usd numeric
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_per_ip int := case when p_kind = 'stt' then 12 else 3 end;
  v_reserve numeric := least(greatest(coalesce(p_reserve_usd, 0), 0), 0.25);
  v_id uuid;
begin
  if not public.lumen_guest_key_ok(p_secret) then
    raise exception 'guest:denied';
  end if;
  if p_kind not in ('stt', 'extract') or coalesce(p_ip_hash, '') = '' then
    raise exception 'guest:bad';
  end if;

  perform pg_advisory_xact_lock(hashtext('lumen_guest'));

  if exists (
    select 1 from public.site_settings
    where key = 'ai_killed' and value = 'true'
  ) then
    raise exception 'guest:nap';
  end if;
  if public.lumen_month_spend_usd() + v_reserve > coalesce(p_month_cap_usd, 20) then
    raise exception 'guest:nap';
  end if;
  if (
    select coalesce(sum(estimated_usd), 0) from public.guest_drafts
    where created_at >= date_trunc('month', now())
  ) + v_reserve > public.lumen_guest_cap_usd() then
    raise exception 'guest:nap';
  end if;
  if (
    select count(*) from public.guest_drafts
    where created_at > now() - interval '1 hour'
  ) >= 60 then
    raise exception 'guest:nap';
  end if;
  if (
    select count(*) from public.guest_drafts
    where ip_hash = p_ip_hash
      and kind = p_kind
      and created_at > now() - interval '24 hours'
  ) >= v_per_ip then
    raise exception 'guest:ip_limit';
  end if;

  insert into public.guest_drafts (kind, ip_hash, estimated_usd)
  values (p_kind, p_ip_hash, v_reserve)
  returning id into v_id;
  return v_id;
end;
$$;

revoke all on function public.lumen_guest_reserve(text, text, text, numeric, numeric) from public;
grant execute on function public.lumen_guest_reserve(text, text, text, numeric, numeric) to anon, authenticated;

-- After the AI call: real cost; keep story + extract + token only when usable.
create or replace function public.lumen_guest_settle(
  p_secret text,
  p_id uuid,
  p_usd numeric,
  p_token_hash text,
  p_story text,
  p_hint_slug text,
  p_extract jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.lumen_guest_key_ok(p_secret) then
    raise exception 'guest:denied';
  end if;
  update public.guest_drafts
  set estimated_usd = least(greatest(coalesce(p_usd, 0), 0), 0.25),
      token_hash = nullif(p_token_hash, ''),
      story = left(p_story, 4000),
      hint_slug = left(p_hint_slug, 80),
      extract = p_extract
  where id = p_id
    and token_hash is null
    and claimed_by is null;
end;
$$;

revoke all on function public.lumen_guest_settle(text, uuid, numeric, text, text, text, jsonb) from public;
grant execute on function public.lumen_guest_settle(text, uuid, numeric, text, text, text, jsonb) to anon, authenticated;

-- Guest preview: needs the token from their cookie. 24 hours, unclaimed.
create or replace function public.lumen_guest_get(
  p_id uuid,
  p_token_hash text
)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'story', story,
    'hint_slug', hint_slug,
    'extract', extract
  )
  from public.guest_drafts
  where id = p_id
    and kind = 'extract'
    and token_hash is not null
    and token_hash = p_token_hash
    and claimed_by is null
    and extract is not null
    and created_at > now() - interval '24 hours';
$$;

revoke all on function public.lumen_guest_get(uuid, text) from public;
grant execute on function public.lumen_guest_get(uuid, text) to anon, authenticated;

-- Signed-in claim. One use. Returns the draft to file under auth.uid().
create or replace function public.lumen_guest_claim(
  p_id uuid,
  p_token_hash text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.guest_drafts;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  update public.guest_drafts
  set claimed_by = auth.uid(), claimed_at = now()
  where id = p_id
    and kind = 'extract'
    and token_hash is not null
    and token_hash = p_token_hash
    and (claimed_by is null or claimed_by = auth.uid())
    and extract is not null
    and created_at > now() - interval '24 hours'
  returning * into v_row;

  if v_row.id is null then
    return null;
  end if;

  return jsonb_build_object(
    'story', v_row.story,
    'hint_slug', v_row.hint_slug,
    'extract', v_row.extract
  );
end;
$$;

revoke all on function public.lumen_guest_claim(uuid, text) from public, anon;
grant execute on function public.lumen_guest_claim(uuid, text) to authenticated;

notify pgrst, 'reload schema';
