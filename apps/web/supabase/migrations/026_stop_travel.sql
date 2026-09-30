-- Realistic day timing: Lumen estimates time at each stop (duration_minutes,
-- from 007) and the hop from the previous stop (travel_minutes). The "Time
-- this day" clock adds both. Paste in the SQL Editor after 025.

alter table public.playbook_stops
  add column if not exists travel_minutes int;

alter table public.playbook_stops
  drop constraint if exists playbook_stops_minutes_sane;
alter table public.playbook_stops
  add constraint playbook_stops_minutes_sane check (
    (duration_minutes is null or duration_minutes between 1 and 720)
    and (travel_minutes is null or travel_minutes between 0 and 240)
  );

-- One-off (John 2026-09-29): the Zurich day filed before Lumen pitched days.
update public.playbooks
set narrative = $$Start the layover on the walls at Minimum Boulder — two big halls and 200-plus problems, so a couple of hours disappears fast. Fifteen minutes down the road, refuel at Ooki Pavillon in Sihlfeld: ramen with local twists like Aargau miso, out on the terrace if the weather plays along. Then ride across town to Hürlimannbad, the thermal baths built into an old brewery's vaults, and soak your forearms back to life before pickup.$$
where id = '8d1dd200-db54-4579-a4e6-5413db949ccc';

update public.playbook_stops set duration_minutes = 120, travel_minutes = null
where id = 'e2d20ce3-aa9a-4975-a955-2547f645cf60';
update public.playbook_stops set duration_minutes = 60, travel_minutes = 15
where id = '766ad1b0-77ee-43ad-972a-e9c994dc1aa0';
update public.playbook_stops set duration_minutes = 150, travel_minutes = 20
where id = '6225e36a-bee6-4932-bc0b-53317a450b1d';

notify pgrst, 'reload schema';
