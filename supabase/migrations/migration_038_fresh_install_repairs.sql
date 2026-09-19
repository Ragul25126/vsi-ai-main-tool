-- ============================================================
-- VSI Migration 038: make a fresh database installable
-- ============================================================
-- Not a feature and not a performance change. It repairs one thing that stops a
-- NEW Supabase project, built from schema.sql plus the migrations in order, from working.
--
-- The problem:
--   schema.sql creates profiles.role with
--     check (role in ('owner', 'analyst', 'viewer'))  and default 'owner'.
--   migration_006 meant to replace that with ('super_admin', 'pilot'), but it uses
--   "add column if not exists". The column already exists, so that statement does nothing,
--   and no migration ever drops the old constraint.
--   On a fresh database every write of 'super_admin' or 'pilot' is rejected. That breaks
--   complete_onboarding() (migration_037), the admin role changes, and is_super_admin(),
--   which can then never be true.
--
-- Safe to run on a database that already has the right constraint: it ends in the same state.
-- Run it in the Supabase SQL editor (as the default postgres role). The profile guard
-- trigger from migration_037 only restricts the API roles, so it does not block this.
-- ============================================================

-- 1. Drop every CHECK constraint on profiles that mentions the role column, whatever its name.
do $$
declare
  c record;
begin
  for c in
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace ns on ns.oid = rel.relnamespace
    where ns.nspname = 'public'
      and rel.relname = 'profiles'
      and con.contype = 'c'
      and pg_get_constraintdef(con.oid) ilike '%role%'
  loop
    execute format('alter table public.profiles drop constraint %I', c.conname);
  end loop;
end $$;

-- 2. Rows made by the sign-up trigger before this ran carry the old default ('owner').
--    They become ordinary members. Nobody is made a platform admin here.
update public.profiles
set role = 'pilot'
where role is null or role not in ('super_admin', 'pilot');

-- 3. The values the application uses (src/lib/auth.ts: UserRole).
alter table public.profiles alter column role set default 'pilot';
alter table public.profiles
  add constraint profiles_role_check check (role in ('super_admin', 'pilot'));

-- Refresh the API's view of the schema.
notify pgrst, 'reload schema';
