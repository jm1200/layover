-- Rec blurbs stand alone. Transit belongs on the layover, not the place.
-- Run after 003 (and 013 if you have it).

update public.places
set blurb = 'Melted raclette scraped over potatoes, cornichons to cut it. Ask for truffle if they have it. Lava cake after.'
where id = 'c1000000-0000-4000-8000-000000000003';
