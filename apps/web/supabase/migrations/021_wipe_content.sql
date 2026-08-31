-- 021 — Wipe demo intel. Paste once in the Supabase SQL Editor.
--
-- DESTRUCTIVE. Deletes recs, days, notes, likes, photos, dump logs.
-- Keeps: accounts (auth + profiles), cities, zones, site_settings
-- (kill switch / monthly cap).
--
-- Do not TRUNCATE … CASCADE. places.author_id → profiles, and CASCADE
-- would wipe accounts.
-- Do not re-run 003 / 005 / 006 / 013 / 014 / 015 after this unless you
-- want demo recs back.
-- Storage files in place-stills may be orphaned (left on purpose so
-- city heroes stay). Spend counter in ai_import_logs resets this month.

begin;

delete from public.comment_photos;
delete from public.comments;
delete from public.likes;
delete from public.place_photos;
delete from public.dishes;
delete from public.playbook_stops;
delete from public.playbooks;
delete from public.places;
delete from public.ai_import_logs;
delete from public.lumen_city_opens;

select
  (select count(*) from public.places) as places,
  (select count(*) from public.playbooks) as days,
  (select count(*) from public.comments) as notes,
  (select count(*) from public.likes) as likes,
  (select count(*) from public.profiles) as accounts,
  (select count(*) from public.cities) as cities;

commit;
