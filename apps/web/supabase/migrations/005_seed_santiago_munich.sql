-- Thin seed so homepage Eat/Buy cards can point at real rows.
-- Zone-safe. No crew hotels. Run after 003 (and 004 if not yet).
-- Author_id null = editorial seed.

insert into public.cities (id, slug, name, country, airport_code)
values
  ('a1000000-0000-4000-8000-000000000003', 'santiago', 'Santiago', 'Chile', 'SCL'),
  ('a1000000-0000-4000-8000-000000000004', 'munich', 'Munich', 'Germany', 'MUC')
on conflict (slug) do nothing;

insert into public.zones (id, city_id, type, name) values
  ('b1000000-0000-4000-8000-000000000021', 'a1000000-0000-4000-8000-000000000003', 'downtown', 'Centre / Bellavista side'),
  ('b1000000-0000-4000-8000-000000000022', 'a1000000-0000-4000-8000-000000000003', 'airport_strip', 'Airport area'),
  ('b1000000-0000-4000-8000-000000000031', 'a1000000-0000-4000-8000-000000000004', 'downtown', 'Centre / Viktualienmarkt'),
  ('b1000000-0000-4000-8000-000000000032', 'a1000000-0000-4000-8000-000000000004', 'airport_strip', 'Airport area')
on conflict do nothing;

insert into public.places (id, city_id, zone_id, name, blurb, category, status, author_id) values
  (
    'c1000000-0000-4000-8000-000000000021',
    'a1000000-0000-4000-8000-000000000003',
    'b1000000-0000-4000-8000-000000000021',
    'Baseball steak (parrilla)',
    'Thick centre-cut top sirloin — the round “baseball” cut. Parrilla night in the centre. Check hours; this is a zone rec, not a hotel walk-out.',
    'eat',
    'published',
    null
  ),
  (
    'c1000000-0000-4000-8000-000000000031',
    'a1000000-0000-4000-8000-000000000004',
    'b1000000-0000-4000-8000-000000000031',
    'Bavarian sweet mustard',
    'Süßer Senf from the market stalls in the centre. Jar it if you have room in the bag. Not a brand endorsement.',
    'shop',
    'published',
    null
  )
on conflict do nothing;

insert into public.dishes (id, place_id, name, note, sort_order) values
  ('d1000000-0000-4000-8000-000000000021', 'c1000000-0000-4000-8000-000000000021', 'Baseball steak', 'Centre-cut top sirloin, thick, off the grill', 1),
  ('d1000000-0000-4000-8000-000000000031', 'c1000000-0000-4000-8000-000000000031', 'Süßer Senf', 'Sweet Bavarian mustard — jar it, take it home', 1)
on conflict do nothing;
