-- Phase 3 v1: likes (rec or day), comments on days, byline label.
-- Paste in the Supabase SQL Editor after 017.

create or replace function public.byline_for(p_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(nullif(trim(display_name), ''), 'Crew')
  from public.profiles
  where id = p_id;
$$;

revoke all on function public.byline_for(uuid) from public;
grant execute on function public.byline_for(uuid) to anon, authenticated;

create table public.likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  place_id uuid references public.places (id) on delete cascade,
  playbook_id uuid references public.playbooks (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint likes_one_target check (
    (place_id is not null and playbook_id is null)
    or (place_id is null and playbook_id is not null)
  )
);

create unique index likes_user_place_uidx
  on public.likes (user_id, place_id)
  where place_id is not null;
create unique index likes_user_playbook_uidx
  on public.likes (user_id, playbook_id)
  where playbook_id is not null;
create index likes_place_idx on public.likes (place_id)
  where place_id is not null;
create index likes_playbook_idx on public.likes (playbook_id)
  where playbook_id is not null;

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  playbook_id uuid not null references public.playbooks (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  constraint comments_body_len check (
    char_length(trim(body)) between 1 and 500
  )
);

create index comments_playbook_idx
  on public.comments (playbook_id, created_at);

alter table public.likes enable row level security;
alter table public.comments enable row level security;

create policy "likes_select"
  on public.likes for select
  using (true);

create policy "likes_insert_own"
  on public.likes for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "likes_delete_own"
  on public.likes for delete
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy "comments_select"
  on public.comments for select
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

create policy "comments_insert_own"
  on public.comments for insert
  to authenticated
  with check (author_id = auth.uid());

create policy "comments_delete_own"
  on public.comments for delete
  to authenticated
  using (author_id = auth.uid() or public.is_admin());
