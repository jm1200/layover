-- Rec comments, edit own, comment photos (max 3 in app). Paste after 018.

alter table public.comments
  alter column playbook_id drop not null;

alter table public.comments
  add column if not exists place_id uuid references public.places (id) on delete cascade;

alter table public.comments
  add column if not exists updated_at timestamptz not null default now();

alter table public.comments
  drop constraint if exists comments_one_target;

alter table public.comments
  add constraint comments_one_target check (
    (place_id is not null and playbook_id is null)
    or (place_id is null and playbook_id is not null)
  );

create index if not exists comments_place_idx
  on public.comments (place_id, created_at)
  where place_id is not null;

drop policy if exists "comments_select" on public.comments;
create policy "comments_select"
  on public.comments for select
  using (
    (
      playbook_id is not null
      and exists (
        select 1 from public.playbooks pb
        where pb.id = playbook_id
          and (
            pb.status = 'published'
            or pb.author_id = auth.uid()
            or public.is_admin()
          )
      )
    )
    or (
      place_id is not null
      and exists (
        select 1 from public.places p
        where p.id = place_id
          and (
            p.status = 'published'
            or p.author_id = auth.uid()
            or public.is_admin()
          )
      )
    )
  );

drop policy if exists "comments_update_own" on public.comments;
create policy "comments_update_own"
  on public.comments for update
  to authenticated
  using (author_id = auth.uid() or public.is_admin())
  with check (author_id = auth.uid() or public.is_admin());

create or replace function public.comments_freeze_target()
returns trigger
language plpgsql
as $$
begin
  if new.author_id is distinct from old.author_id
     or new.place_id is distinct from old.place_id
     or new.playbook_id is distinct from old.playbook_id then
    raise exception 'Cannot move a comment.';
  end if;
  return new;
end;
$$;

drop trigger if exists comments_freeze_target on public.comments;
create trigger comments_freeze_target
  before update on public.comments
  for each row execute function public.comments_freeze_target();

create table if not exists public.comment_photos (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.comments (id) on delete cascade,
  image_url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists comment_photos_comment_idx
  on public.comment_photos (comment_id, sort_order);

alter table public.comment_photos enable row level security;

drop policy if exists "comment_photos_select" on public.comment_photos;
create policy "comment_photos_select"
  on public.comment_photos for select
  using (
    exists (
      select 1 from public.comments c
      where c.id = comment_id
    )
  );

drop policy if exists "comment_photos_insert" on public.comment_photos;
create policy "comment_photos_insert"
  on public.comment_photos for insert
  to authenticated
  with check (
    exists (
      select 1 from public.comments c
      where c.id = comment_id
        and (c.author_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists "comment_photos_delete" on public.comment_photos;
create policy "comment_photos_delete"
  on public.comment_photos for delete
  to authenticated
  using (
    exists (
      select 1 from public.comments c
      where c.id = comment_id
        and (c.author_id = auth.uid() or public.is_admin())
    )
  );

notify pgrst, 'reload schema';
