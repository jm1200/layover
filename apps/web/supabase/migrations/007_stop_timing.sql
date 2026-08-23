-- Optional timing/cost on playbook stops (summary, not live transit).
alter table public.playbook_stops
  add column if not exists duration_minutes int,
  add column if not exists cost_note text;

-- Zurich 22h seed — rough crew-scale, not ticket prices.
update public.playbook_stops set
  duration_minutes = 90,
  cost_note = 'DIY tube; rental if you did not pack one'
where id = 'f1000000-0000-4000-8000-000000000001';

update public.playbook_stops set
  duration_minutes = 90,
  cost_note = 'Day pass / session'
where id = 'f1000000-0000-4000-8000-000000000002';

update public.playbook_stops set
  duration_minutes = 25,
  cost_note = 'Local tram ticket'
where id = 'f1000000-0000-4000-8000-000000000003';

update public.playbook_stops set
  duration_minutes = 90,
  cost_note = 'Raclette + dessert'
where id = 'f1000000-0000-4000-8000-000000000004';
