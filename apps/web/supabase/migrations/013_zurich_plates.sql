-- Sample plates on the Zurich raclette rec. Adds image_url if 012 was skipped.
-- Public files: apps/web/public/landing/plate-zurich-*.jpg

alter table public.dishes
  add column if not exists image_url text;

insert into public.dishes (id, place_id, name, note, sort_order, image_url)
values (
  'd1000000-0000-4000-8000-000000000003',
  'c1000000-0000-4000-8000-000000000003',
  'Cornichons',
  'The acid against the cheese',
  3,
  '/landing/plate-zurich-pickles.jpg'
)
on conflict (id) do update
set
  name = excluded.name,
  note = excluded.note,
  image_url = excluded.image_url;

update public.dishes
set image_url = '/landing/plate-zurich-raclette.jpg'
where id = 'd1000000-0000-4000-8000-000000000001'
  and image_url is null;

update public.dishes
set image_url = '/landing/plate-zurich-lava.jpg'
where id = 'd1000000-0000-4000-8000-000000000002'
  and image_url is null;
