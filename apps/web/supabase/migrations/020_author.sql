-- Public author page: name + avatar, likes are a count (no who-list).
-- Paste after 019.

alter table public.profiles
  add column if not exists avatar_url text;

update public.profiles
set display_name = null
where display_name is not null and trim(display_name) = '';

alter table public.profiles
  drop constraint if exists profiles_display_name_len;
alter table public.profiles
  add constraint profiles_display_name_len check (
    display_name is null or char_length(trim(display_name)) between 1 and 80
  );

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role, status, display_name)
  values (
    new.id,
    new.email,
    'user',
    'active',
    nullif(
      left(
        trim(
          coalesce(
            new.raw_user_meta_data->>'full_name',
            new.raw_user_meta_data->>'name',
            ''
          )
        ),
        80
      ),
      ''
    )
  );
  return new;
end;
$$;

update public.profiles p
set display_name = nullif(
  left(
    trim(
      coalesce(
        u.raw_user_meta_data->>'full_name',
        u.raw_user_meta_data->>'name',
        ''
      )
    ),
    80
  ),
  ''
)
from auth.users u
where u.id = p.id
  and (p.display_name is null or trim(p.display_name) = '')
  and coalesce(
    nullif(trim(u.raw_user_meta_data->>'full_name'), ''),
    nullif(trim(u.raw_user_meta_data->>'name'), '')
  ) is not null;

create or replace function public.author_card(p_id uuid)
returns table (id uuid, display_name text, avatar_url text)
language sql
stable
security definer
set search_path = public
as $$
  select p.id, p.display_name, p.avatar_url
  from public.profiles p
  where p.id = p_id
    and p.status = 'active';
$$;

revoke all on function public.author_card(uuid) from public;
grant execute on function public.author_card(uuid) to anon, authenticated;

create or replace function public.like_count_of(p_place uuid, p_playbook uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::int
  from public.likes
  where (p_place is not null and place_id = p_place)
     or (p_playbook is not null and playbook_id = p_playbook);
$$;

revoke all on function public.like_count_of(uuid, uuid) from public;
grant execute on function public.like_count_of(uuid, uuid) to anon, authenticated;

drop policy if exists "likes_select" on public.likes;
create policy "likes_select_own"
  on public.likes for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create or replace function public.profiles_freeze_identity()
returns trigger
language plpgsql
as $$
begin
  -- Clients (JWT) cannot change identity. SQL Editor / service role have no uid.
  if auth.uid() is null then
    return new;
  end if;
  if new.id is distinct from old.id
     or new.role is distinct from old.role
     or new.status is distinct from old.status
     or new.email is distinct from old.email then
    raise exception 'Cannot change that.';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_freeze_identity on public.profiles;
create trigger profiles_freeze_identity
  before update on public.profiles
  for each row execute function public.profiles_freeze_identity();

notify pgrst, 'reload schema';
