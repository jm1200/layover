-- Extra plates for the Geneva dim-sum rec so Edit rec can show 3 photos.
-- Files: public/landing/plate-dimsum-bao.jpg, plate-dimsum-cucumber.jpg
-- Run after 012. Matches place name containing "dim sum".

alter table public.dishes
  add column if not exists image_url text;

insert into public.dishes (place_id, name, note, sort_order, image_url)
select p.id, 'Char siu bao', null, 2, '/landing/plate-dimsum-bao.jpg'
from public.places p
where lower(p.name) like '%dim sum%'
  and not exists (
    select 1 from public.dishes d
    where d.place_id = p.id and d.name = 'Char siu bao'
  );

insert into public.dishes (place_id, name, note, sort_order, image_url)
select p.id, 'Chili cucumber', null, 3, '/landing/plate-dimsum-cucumber.jpg'
from public.places p
where lower(p.name) like '%dim sum%'
  and not exists (
    select 1 from public.dishes d
    where d.place_id = p.id and d.name = 'Chili cucumber'
  );
