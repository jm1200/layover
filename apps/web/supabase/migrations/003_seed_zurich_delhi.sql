-- Phase 2 seed: Zurich + Delhi (zone-safe, no crew hotels)
-- Run after 002_content.sql. Safe to re-run only if you delete these slugs first.
-- Author_id null = "Layover" editorial seed.

-- Fixed IDs for stable references
-- Zurich
insert into public.cities (id, slug, name, country, airport_code)
values
  ('a1000000-0000-4000-8000-000000000001', 'zurich', 'Zurich', 'Switzerland', 'ZRH'),
  ('a1000000-0000-4000-8000-000000000002', 'delhi', 'Delhi', 'India', 'DEL')
on conflict (slug) do nothing;

insert into public.zones (id, city_id, type, name) values
  ('b1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 'airport_strip', 'Airport area'),
  ('b1000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000001', 'downtown', 'Old town / centre'),
  ('b1000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000001', 'station', 'Hauptbahnhof area'),
  ('b1000000-0000-4000-8000-000000000004', 'a1000000-0000-4000-8000-000000000001', 'other', 'Limmat waterfront'),
  ('b1000000-0000-4000-8000-000000000011', 'a1000000-0000-4000-8000-000000000002', 'airport_strip', 'Airport area'),
  ('b1000000-0000-4000-8000-000000000012', 'a1000000-0000-4000-8000-000000000002', 'downtown', 'Central Delhi / Connaught'),
  ('b1000000-0000-4000-8000-000000000013', 'a1000000-0000-4000-8000-000000000002', 'other', 'Aerocity / hospitality strip')
on conflict do nothing;

-- Zurich places
insert into public.places (id, city_id, zone_id, name, blurb, category, status, author_id) values
  (
    'c1000000-0000-4000-8000-000000000001',
    'a1000000-0000-4000-8000-000000000001',
    'b1000000-0000-4000-8000-000000000004',
    'Limmat river float (DIY)',
    'Pack an innertube + dry bag. Float the Limmat with gear stowed — classic summer move when you have hours to burn. Check conditions and local rules before you go.',
    'activity',
    'published',
    null
  ),
  (
    'c1000000-0000-4000-8000-000000000002',
    'a1000000-0000-4000-8000-000000000001',
    'b1000000-0000-4000-8000-000000000004',
    'Bouldering / climbing gym (riverside area)',
    'Common end-of-float target near the river corridor. Confirm hours; bring chalk if you have it.',
    'activity',
    'published',
    null
  ),
  (
    'c1000000-0000-4000-8000-000000000003',
    'a1000000-0000-4000-8000-000000000001',
    'b1000000-0000-4000-8000-000000000002',
    'Raclette factory (centre)',
    'Melted raclette scraped over potatoes, cornichons to cut it. Ask for truffle if they have it. Lava cake after.',
    'restaurant',
    'published',
    null
  ),
  (
    'c1000000-0000-4000-8000-000000000004',
    'a1000000-0000-4000-8000-000000000001',
    'b1000000-0000-4000-8000-000000000003',
    'Late grocery (station cluster)',
    'Useful if you are on the station / city-hotel side of the layover — not tied to any airline property.',
    'grocery',
    'published',
    null
  )
on conflict do nothing;

insert into public.dishes (id, place_id, name, note, sort_order) values
  ('d1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000003', 'Truffle raclette', 'Ask if in season / available', 1),
  ('d1000000-0000-4000-8000-000000000002', 'c1000000-0000-4000-8000-000000000003', 'Lava cake', 'Dessert staple on this run', 2)
on conflict do nothing;

insert into public.playbooks (id, city_id, title, narrative, hours_available, status, author_id) values
  (
    'e1000000-0000-4000-8000-000000000001',
    'a1000000-0000-4000-8000-000000000001',
    '22h Zurich: Limmat float → climb → truffle raclette',
    'What to do with roughly a day on the ground: gear up with an innertube and dry bag for climbing kit, float the Limmat toward the climbing gym area, streetcar into the centre, and finish at the raclette spot. Logistics use zones (waterfront → downtown), not hotel doors.',
    22,
    'published',
    null
  )
on conflict do nothing;

insert into public.playbook_stops (id, playbook_id, position, place_id, title, body) values
  (
    'f1000000-0000-4000-8000-000000000001',
    'e1000000-0000-4000-8000-000000000001',
    1,
    'c1000000-0000-4000-8000-000000000001',
    'Float the Limmat',
    'Start from a public river access (waterfront zone). Dry bag your shoes/phone/chalk. Check water level and local etiquette.'
  ),
  (
    'f1000000-0000-4000-8000-000000000002',
    'e1000000-0000-4000-8000-000000000001',
    2,
    'c1000000-0000-4000-8000-000000000002',
    'Climb / boulder',
    'Get dry, climb a session, then head for transit into the centre.'
  ),
  (
    'f1000000-0000-4000-8000-000000000003',
    'e1000000-0000-4000-8000-000000000001',
    3,
    null,
    'Streetcar downtown',
    'Tram/streetcar from riverside / gym corridor into old town / centre. No crew-hotel pin required.'
  ),
  (
    'f1000000-0000-4000-8000-000000000004',
    'e1000000-0000-4000-8000-000000000001',
    4,
    'c1000000-0000-4000-8000-000000000003',
    'Raclette + lava cake',
    'Order truffle raclette if available; lava cake for dessert. Slow meal — you earned it.'
  )
on conflict do nothing;

-- Delhi places + playbook
insert into public.places (id, city_id, zone_id, name, blurb, category, status, author_id) values
  (
    'c1000000-0000-4000-8000-000000000011',
    'a1000000-0000-4000-8000-000000000002',
    'b1000000-0000-4000-8000-000000000013',
    'The Only Bar',
    'Yes, that is the name. Long-running crew staple energy — the “everyone ends up here” bar. Confirm current hours and vibe; staples evolve.',
    'bar',
    'published',
    null
  ),
  (
    'c1000000-0000-4000-8000-000000000012',
    'a1000000-0000-4000-8000-000000000002',
    'b1000000-0000-4000-8000-000000000012',
    'Connaught Place wander + food',
    'If you have energy for the city side: walk the inner circle, people-watch, eat something that is not hotel buffet.',
    'activity',
    'published',
    null
  ),
  (
    'c1000000-0000-4000-8000-000000000013',
    'a1000000-0000-4000-8000-000000000002',
    'b1000000-0000-4000-8000-000000000011',
    'Airport-area late bite',
    'For short turns when downtown is too far: airport / Aerocity strip options without naming airline housing.',
    'restaurant',
    'published',
    null
  )
on conflict do nothing;

insert into public.playbooks (id, city_id, title, narrative, hours_available, status, author_id) values
  (
    'e1000000-0000-4000-8000-000000000011',
    'a1000000-0000-4000-8000-000000000002',
    'Delhi night: the Only Bar staple (+ optional city side)',
    'Classic crew word-of-mouth: when energy is low, the hospitality strip bar everyone names. If you have longer and want out of the bubble, push toward Connaught for a walk and different food. Framed by zones (Aerocity strip vs downtown), never by employer hotel.',
    12,
    'published',
    null
  ),
  (
    'e1000000-0000-4000-8000-000000000012',
    'a1000000-0000-4000-8000-000000000002',
    'Short turn DEL: airport strip only',
    'Under ~8 hours and wiped: stay in the airport / Aerocity zone. Late bite, shower, sleep if you can. Skip downtown traffic.',
    8,
    'published',
    null
  )
on conflict do nothing;

insert into public.playbook_stops (id, playbook_id, position, place_id, title, body) values
  (
    'f1000000-0000-4000-8000-000000000011',
    'e1000000-0000-4000-8000-000000000011',
    1,
    'c1000000-0000-4000-8000-000000000011',
    'The Only Bar',
    'The named staple. Go early if you hate queues; hydrate — Delhi nights are long.'
  ),
  (
    'f1000000-0000-4000-8000-000000000012',
    'e1000000-0000-4000-8000-000000000011',
    2,
    'c1000000-0000-4000-8000-000000000012',
    'Optional: Connaught wander',
    'Only if hours and energy allow. Transit + walk; no need for hotel-specific directions.'
  ),
  (
    'f1000000-0000-4000-8000-000000000021',
    'e1000000-0000-4000-8000-000000000012',
    1,
    'c1000000-0000-4000-8000-000000000013',
    'Airport-strip meal',
    'Eat close. Protect sleep. Downtown can wait for a longer layover.'
  ),
  (
    'f1000000-0000-4000-8000-000000000022',
    'e1000000-0000-4000-8000-000000000012',
    2,
    null,
    'Protect the rest window',
    'Set alarms, water, earplugs. Zone: airport_strip — not a property pin.'
  )
on conflict do nothing;
