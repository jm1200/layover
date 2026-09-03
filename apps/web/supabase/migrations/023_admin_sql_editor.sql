-- SQL Editor runs as postgres but still has auth.uid() from the dashboard
-- login. Freeze must allow postgres so John can set role = admin.

create or replace function public.profiles_freeze_identity()
returns trigger
language plpgsql
as $$
begin
  -- JWT clients cannot change identity. SQL Editor / superuser can.
  if current_user in ('postgres', 'supabase_admin') then
    return new;
  end if;
  if auth.uid() is null then
    return new;
  end if;
  if new.id is distinct from old.id
     or new.role is distinct from old.role
     or new.status is distinct from old.status
     or new.email is distinct from old.email then
    raise exception 'Cannot change that.';
  end if;
  return new;
end;
$$;

notify pgrst, 'reload schema';
