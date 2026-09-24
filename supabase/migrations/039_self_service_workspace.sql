-- ============================================================
-- VSI Migration 039: Complete Self-Service Workspace, RPCs & Competitors
-- ============================================================
-- Safe, idempotent migration for all onboarding SQL functions & schema enhancements:
--   1. is_super_admin() helper
--   2. Profile role constraint repairs (super_admin, pilot)
--   3. Privileged column guard trigger on profiles
--   4. project_competitors table, triggers, RLS policies & grants
--   5. Safe column enhancements on agencies and profiles
--   6. validate_invite(p_code)
--   7. claim_invite(p_code, p_user)
--   8. complete_onboarding(p_code, p_agency_name, p_slug)
--   9. create_own_organization(p_agency_name, p_slug)
-- ============================================================

-- ─────────────────────────────────────────
-- 1. Helper: is_super_admin
-- ─────────────────────────────────────────
create or replace function public.is_super_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role = 'super_admin'
  );
$$;

grant execute on function public.is_super_admin() to anon, authenticated;

-- ─────────────────────────────────────────
-- 2. Repair profiles role constraint (super_admin, pilot)
-- ─────────────────────────────────────────
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

update public.profiles
set role = 'pilot'
where role is null or role not in ('super_admin', 'pilot');

alter table public.profiles alter column role set default 'pilot';
alter table public.profiles
  add constraint profiles_role_check check (role in ('super_admin', 'pilot'));

-- ─────────────────────────────────────────
-- 3. Guard profile privileged columns
-- ─────────────────────────────────────────
create or replace function public.guard_profile_privileged_columns()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_user in ('authenticated', 'anon') and not public.is_super_admin() then
    if new.role is distinct from old.role
       or new.agency_id is distinct from old.agency_id
       or new.is_disabled is distinct from old.is_disabled
       or new.disabled_at is distinct from old.disabled_at
       or new.disabled_reason is distinct from old.disabled_reason then
      raise exception 'Not allowed to change role, organization or account status'
        using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_guard_profile_privileged_columns on public.profiles;
create trigger trg_guard_profile_privileged_columns
  before update on public.profiles
  for each row execute function public.guard_profile_privileged_columns();

-- ─────────────────────────────────────────
-- 4. project_competitors Table & Policies
-- ─────────────────────────────────────────
create table if not exists public.project_competitors (
  id          uuid primary key default gen_random_uuid(),
  agency_id   uuid not null references public.agencies(id) on delete cascade,
  client_id   uuid not null references public.clients(id) on delete cascade,
  domain      text not null
              check (domain = lower(domain) and char_length(domain) between 4 and 253 and domain !~ '[/:\s]'),
  name        text check (name is null or char_length(name) <= 120),
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  unique (client_id, domain)
);

create index if not exists idx_project_competitors_client
  on public.project_competitors (client_id, created_at);

create or replace function public.enforce_project_competitor_limit()
returns trigger
language plpgsql
as $$
begin
  if (select count(*) from public.project_competitors where client_id = new.client_id) >= 10 then
    raise exception 'A project can have at most 10 competitors' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_project_competitor_limit on public.project_competitors;
create trigger trg_project_competitor_limit
  before insert on public.project_competitors
  for each row execute function public.enforce_project_competitor_limit();

alter table public.project_competitors enable row level security;

drop policy if exists "project_competitors_agency_select" on public.project_competitors;
create policy "project_competitors_agency_select"
  on public.project_competitors for select
  to authenticated
  using (agency_id = (select agency_id from public.profiles where id = auth.uid()));

drop policy if exists "project_competitors_agency_insert" on public.project_competitors;
create policy "project_competitors_agency_insert"
  on public.project_competitors for insert
  to authenticated
  with check (
    agency_id = (select agency_id from public.profiles where id = auth.uid())
    and exists (
      select 1 from public.clients c
      where c.id = client_id and c.agency_id = project_competitors.agency_id
    )
  );

drop policy if exists "project_competitors_agency_delete" on public.project_competitors;
create policy "project_competitors_agency_delete"
  on public.project_competitors for delete
  to authenticated
  using (agency_id = (select agency_id from public.profiles where id = auth.uid()));

drop policy if exists "project_competitors_super_admin_all" on public.project_competitors;
create policy "project_competitors_super_admin_all"
  on public.project_competitors for all
  to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

grant select, insert, delete on public.project_competitors to authenticated;
grant all on public.project_competitors to service_role;

-- ─────────────────────────────────────────
-- 5. Safe Column Enhancements
-- ─────────────────────────────────────────
alter table if exists public.agencies add column if not exists display_name text;
alter table if exists public.agencies add column if not exists logo_url text;
alter table if exists public.agencies add column if not exists primary_color text;
alter table if exists public.agencies add column if not exists support_email text;
alter table if exists public.agencies add column if not exists report_footer text;
alter table if exists public.agencies add column if not exists is_pilot boolean default true;
alter table if exists public.agencies add column if not exists max_keywords integer default 10;
alter table if exists public.agencies add column if not exists is_disabled boolean default false;

alter table if exists public.profiles add column if not exists is_disabled boolean default false;

-- ─────────────────────────────────────────
-- 6. validate_invite: check invite code status safely
-- ─────────────────────────────────────────
create or replace function public.validate_invite(p_code text)
returns table (role text, max_keywords integer)
language sql
security definer
stable
set search_path = public
as $$
  select i.role, i.max_keywords
  from public.invites i
  where i.code = upper(trim(p_code))
    and i.is_active is true
    and i.used_by is null
  limit 1;
$$;

grant execute on function public.validate_invite(text) to anon, authenticated;

-- ─────────────────────────────────────────
-- 7. claim_invite: atomic invite claiming
-- ─────────────────────────────────────────
create or replace function public.claim_invite(
  p_code text,
  p_user uuid
) returns table (
  invite_id      uuid,
  role           text,
  max_keywords   integer
) language plpgsql security definer set search_path = public as $$
declare
  v_row public.invites%rowtype;
begin
  select * into v_row
  from public.invites
  where code = upper(trim(p_code))
  for update;

  if not found then
    return;
  end if;

  if v_row.is_active is false or v_row.used_by is not null then
    return;
  end if;

  update public.invites
     set used_by = p_user,
         used_at = now(),
         is_active = false
   where id = v_row.id;

  return query select v_row.id, v_row.role, v_row.max_keywords;
end $$;

grant execute on function public.claim_invite(text, uuid) to authenticated;

-- ─────────────────────────────────────────
-- 8. complete_onboarding: onboarding with a valid invite code
-- ─────────────────────────────────────────
create or replace function public.complete_onboarding(p_code text, p_agency_name text, p_slug text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_claim record;
  v_agency uuid;
begin
  if v_uid is null then
    raise exception 'Not signed in' using errcode = '42501';
  end if;
  if exists (select 1 from public.profiles where id = v_uid and agency_id is not null) then
    raise exception 'Account is already set up' using errcode = '42501';
  end if;
  if coalesce(trim(p_agency_name), '') = '' then
    raise exception 'Organization name is required' using errcode = '22023';
  end if;

  select * into v_claim from public.claim_invite(p_code, v_uid);
  if v_claim.invite_id is null then
    raise exception 'This invite code is invalid or has already been used' using errcode = '22023';
  end if;

  insert into public.agencies (name, slug, max_keywords, is_pilot)
  values (trim(p_agency_name), p_slug, v_claim.max_keywords, v_claim.role = 'pilot')
  returning id into v_agency;

  update public.profiles
     set agency_id = v_agency,
         role = v_claim.role
   where id = v_uid;

  return v_agency;
end;
$$;

grant execute on function public.complete_onboarding(text, text, text) to authenticated;

-- ─────────────────────────────────────────
-- 9. create_own_organization: self-service workspace creation
-- ─────────────────────────────────────────
create or replace function public.create_own_organization(p_agency_name text, p_slug text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid     uuid := auth.uid();
  v_name    text := trim(coalesce(p_agency_name, ''));
  v_slug    text := coalesce(p_slug, '');
  v_profile record;
  v_agency  uuid;
begin
  -- 1. Must be signed in.
  if v_uid is null then
    raise exception 'Not signed in' using errcode = '42501';
  end if;

  -- 2. Validate input.
  if v_name = '' then
    raise exception 'Organization name is required' using errcode = '22023';
  end if;
  if char_length(v_name) > 80 then
    raise exception 'Organization name must be 80 characters or fewer' using errcode = '22023';
  end if;
  if v_name ~ '[[:cntrl:]]' then
    raise exception 'Organization name contains invalid characters' using errcode = '22023';
  end if;
  if v_slug !~ '^[a-z0-9]([a-z0-9-]{0,62}[a-z0-9])?$' then
    raise exception 'Organization slug is invalid' using errcode = '22023';
  end if;

  -- 3. Lock caller profile.
  select agency_id, is_disabled into v_profile
    from public.profiles
   where id = v_uid
   for update;

  if not found then
    raise exception 'Profile not found for this account' using errcode = 'P0002';
  end if;
  if v_profile.is_disabled then
    raise exception 'This account is disabled' using errcode = '42501';
  end if;
  if v_profile.agency_id is not null then
    raise exception 'Account is already set up' using errcode = '42501';
  end if;

  -- 4. Create agency.
  begin
    insert into public.agencies (name, slug)
    values (v_name, v_slug)
    returning id into v_agency;
  exception when unique_violation then
    raise exception 'Organization name or address is already in use' using errcode = '23505';
  end;

  -- 5. Link profile.
  update public.profiles
     set agency_id = v_agency
   where id = v_uid;

  return v_agency;
end;
$$;

comment on function public.create_own_organization(text, text) is
  'Self-service workspace creation: creates a new agency and links the calling user''s own profile to it.';

revoke all on function public.create_own_organization(text, text) from public, anon;
grant execute on function public.create_own_organization(text, text) to authenticated;

-- Refresh the API's view of the schema.
notify pgrst, 'reload schema';
