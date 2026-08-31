-- Extra Zurich recs so the city page can show a dense Eat/Do/Buy preview.
-- Zone-safe. Run after 003. Editorial seed (author_id null).
-- After 021_wipe_content.sql do not re-run unless you want demo recs back.

insert into public.places (id, city_id, zone_id, name, blurb, category, status, author_id) values
  (
    'c1000000-0000-4000-8000-000000000005',
    'a1000000-0000-4000-8000-000000000001',
    'b1000000-0000-4000-8000-000000000002',
    'Morning bun + coffee (centre)',
    'If you land early: crusty bun, butter, apricot jam, coffee on a small table. Downtown / old town, not a hotel breakfast.',
    'eat',
    'published',
    null
  ),
  (
    'c1000000-0000-4000-8000-000000000006',
    'a1000000-0000-4000-8000-000000000001',
    'b1000000-0000-4000-8000-000000000002',
    'Tram-side cafe',
    'Sit, watch the street, reset after the river. Centre cluster.',
    'eat',
    'published',
    null
  ),
  (
    'c1000000-0000-4000-8000-000000000007',
    'a1000000-0000-4000-8000-000000000001',
    'b1000000-0000-4000-8000-000000000002',
    'Old town wander',
    'When the water is too cold to float: walk the limestone streets, no itinerary required.',
    'do',
    'published',
    null
  ),
  (
    'c1000000-0000-4000-8000-000000000008',
    'a1000000-0000-4000-8000-000000000001',
    'b1000000-0000-4000-8000-000000000002',
    'Chocolate to take home',
    'Small bars, not a duty-free haul. Centre.',
    'shop',
    'published',
    null
  ),
  (
    'c1000000-0000-4000-8000-000000000009',
    'a1000000-0000-4000-8000-000000000001',
    'b1000000-0000-4000-8000-000000000003',
    'Station snacks / alpine cheese',
    'If you only have the station cluster: cheese, a roll, something for the jumpseat.',
    'shop',
    'published',
    null
  )
on conflict do nothing;
