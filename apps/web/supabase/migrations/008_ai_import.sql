-- Phase 4: Lumen extract logs + kill switch
-- Run in Supabase SQL Editor after 007.
-- No hotel-name fields. Do not store API keys.

create table public.site_settings (
  key text primary key,
  value text not null
);

insert into public.site_settings (key, value)
values ('ai_killed', 'false')
on conflict (key) do nothing;

alter table public.site_settings enable row level security;

create policy "site_settings_select_auth"
  on public.site_settings for select
  to authenticated
  using (true);

create policy "site_settings_update_admin"
  on public.site_settings for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create table public.ai_import_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  model text,
  success boolean not null default false,
  error_code text,
  followup boolean not null default false,
  input_chars int not null default 0,
  input_tokens int,
  output_tokens int,
  estimated_usd numeric(10, 6),
  city_id uuid references public.cities (id) on delete set null,
  payload jsonb,
  created_place_ids uuid[] not null default '{}',
  created_playbook_id uuid references public.playbooks (id) on delete set null
);

create index ai_import_logs_user_day_idx
  on public.ai_import_logs (user_id, created_at desc);

alter table public.ai_import_logs enable row level security;

create policy "ai_import_logs_select_own"
  on public.ai_import_logs for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy "ai_import_logs_insert_own"
  on public.ai_import_logs for insert
  to authenticated
  with check (user_id = auth.uid() or public.is_admin());
