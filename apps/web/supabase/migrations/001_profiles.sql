-- Phase 1: profiles for roles (user | sponsor | admin)
-- Run in Supabase SQL Editor once after creating the project.

create type public.user_role as enum ('user', 'sponsor', 'admin');
create type public.account_status as enum ('active', 'suspended');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  role public.user_role not null default 'user',
  status public.account_status not null default 'active',
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_role_idx on public.profiles (role);

alter table public.profiles enable row level security;

-- Users can read their own profile
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

-- Role/status changes only via SQL Editor or future admin API (service role).
-- No client update policy in Phase 1.

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role, status)
  values (
    new.id,
    new.email,
    'user',
    'active'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
