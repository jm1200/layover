-- Phase 2.1: Important fixes — admin-only city/zone insert; non-admin status lock
-- Run after 002_content.sql (and ideally after 003 seed).

-- Cities: only admins create
drop policy if exists "cities_insert_auth" on public.cities;
create policy "cities_insert_admin"
  on public.cities for insert
  to authenticated
  with check (public.is_admin());

-- Zones: only admins create
drop policy if exists "zones_insert_auth" on public.zones;
create policy "zones_insert_admin"
  on public.zones for insert
  to authenticated
  with check (public.is_admin());

-- Non-admins cannot set status to hidden via API (defense in depth)
drop policy if exists "places_update" on public.places;
create policy "places_update"
  on public.places for update
  to authenticated
  using (author_id = auth.uid() or public.is_admin())
  with check (
    (author_id = auth.uid() or public.is_admin())
    and (
      public.is_admin()
      or status in ('draft', 'published')
    )
  );

drop policy if exists "playbooks_update" on public.playbooks;
create policy "playbooks_update"
  on public.playbooks for update
  to authenticated
  using (author_id = auth.uid() or public.is_admin())
  with check (
    (author_id = auth.uid() or public.is_admin())
    and (
      public.is_admin()
      or status in ('draft', 'published')
    )
  );
