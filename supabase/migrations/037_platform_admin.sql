-- ============================================================
-- VSI Migration 037: platform admin security (+ admin data, part B)
-- ============================================================
-- Part A closes access holes that made every "super admin only" check
-- bypassable, and moves onboarding into one server-side function.
-- Part B (below, added with the admin pages) adds the admin read model.
--
-- Apply after 035 and 036. Safe to re-run.

-- ─────────────────────────────────────────
-- A1. Nobody can change their own role, organization or account status
-- ─────────────────────────────────────────
-- users_update_own_profile (migration 006) allows any update to your own
-- row, including role = 'super_admin' or another agency_id. This trigger
-- rejects changes to those columns when they come straight from a signed-in
-- user (roles authenticated/anon) who isn't a platform admin.
-- SECURITY DEFINER functions (claim_invite, complete_onboarding) run as the
-- function owner, so they are not affected.
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

-- Own-profile updates stay limited to your own row.
drop policy if exists "users_update_own_profile" on public.profiles;
create policy "users_update_own_profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- ─────────────────────────────────────────
-- A2. Platform admins can disable, enable and remove users
-- ─────────────────────────────────────────
-- Without these, admin user actions matched 0 rows and looked successful.
drop policy if exists "super_admin_update_profiles" on public.profiles;
create policy "super_admin_update_profiles"
  on public.profiles for update
  to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

drop policy if exists "super_admin_delete_profiles" on public.profiles;
create policy "super_admin_delete_profiles"
  on public.profiles for delete
  to authenticated
  using (public.is_super_admin());

grant update, delete on public.profiles to authenticated;

-- ─────────────────────────────────────────
-- A3. Invite codes are checked one at a time, never listed
-- ─────────────────────────────────────────
-- migration 006 let anyone (including anon) select every active invite,
-- super-admin invites included.
drop policy if exists "public_invite_validation" on public.invites;
revoke select on public.invites from anon;

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
-- A4. Onboarding in one server-side step
-- ─────────────────────────────────────────
-- Replaces the browser writing its own profile.role and agency_id.
-- Claims the invite (locked, single use), creates the organization and
-- links the signed-in account to it with the invite's role.
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
    raise exception 'This invite is invalid or already used' using errcode = '22023';
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

-- ============================================================
-- Part B: platform admin read model and audit trail
-- ============================================================

-- ─────────────────────────────────────────
-- B1. Audit log of platform admin actions
-- ─────────────────────────────────────────
create table if not exists public.audit_log (
  id           uuid primary key default gen_random_uuid(),
  actor_id     uuid references public.profiles(id) on delete set null,
  actor_email  text,
  agency_id    uuid references public.agencies(id) on delete set null,
  action       text not null,
  target_type  text not null,
  target_id    text,
  summary      text not null,
  meta         jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);

create index if not exists idx_audit_log_created on public.audit_log (created_at desc);
create index if not exists idx_audit_log_agency on public.audit_log (agency_id, created_at desc);

alter table public.audit_log enable row level security;

drop policy if exists "audit_log_super_admin_select" on public.audit_log;
create policy "audit_log_super_admin_select"
  on public.audit_log for select
  to authenticated
  using (public.is_super_admin());

-- Admins can only write entries as themselves; entries are never edited.
drop policy if exists "audit_log_super_admin_insert" on public.audit_log;
create policy "audit_log_super_admin_insert"
  on public.audit_log for insert
  to authenticated
  with check (public.is_super_admin() and actor_id = auth.uid());

grant select, insert on public.audit_log to authenticated;
grant all on public.audit_log to service_role;

-- ─────────────────────────────────────────
-- B2. Users list with last sign-in
-- ─────────────────────────────────────────
drop function if exists public.admin_list_users();
create or replace function public.admin_list_users()
returns table (
  id uuid,
  email text,
  full_name text,
  role text,
  agency_id uuid,
  agency_name text,
  is_disabled boolean,
  agency_is_disabled boolean,
  created_at timestamptz,
  last_sign_in_at timestamptz
) language plpgsql security definer set search_path = public, auth as $$
begin
  if not public.is_super_admin() then
    raise exception 'Not authorised' using errcode = '42501';
  end if;
  return query
    select
      p.id,
      u.email::text,
      p.full_name,
      p.role,
      p.agency_id,
      a.name as agency_name,
      coalesce(p.is_disabled, false),
      coalesce(a.is_disabled, false),
      p.created_at,
      u.last_sign_in_at
    from public.profiles p
    left join auth.users u on u.id = p.id
    left join public.agencies a on a.id = p.agency_id
    order by p.created_at desc;
end $$;

grant execute on function public.admin_list_users() to authenticated;

-- ─────────────────────────────────────────
-- B3. One row per organization, with counts and last activity
-- ─────────────────────────────────────────
-- security invoker: RLS still applies, and the explicit check refuses
-- anyone who isn't a platform admin.
create or replace function public.admin_organization_summaries()
returns table (
  id uuid,
  name text,
  is_pilot boolean,
  is_disabled boolean,
  disabled_reason text,
  max_clients integer,
  max_keywords integer,
  created_at timestamptz,
  projects bigint,
  users bigint,
  searches bigint,
  last_activity timestamptz
) language plpgsql stable security invoker set search_path = public as $$
begin
  if not public.is_super_admin() then
    raise exception 'Not authorised' using errcode = '42501';
  end if;
  return query
    select
      a.id,
      a.name,
      coalesce(a.is_pilot, false),
      coalesce(a.is_disabled, false),
      a.disabled_reason,
      a.max_clients,
      a.max_keywords,
      a.created_at,
      (select count(*) from public.clients c where c.agency_id = a.id),
      (select count(*) from public.profiles p where p.agency_id = a.id),
      (select count(*) from public.tracked_keywords k where k.agency_id = a.id and k.is_active),
      greatest(
        a.created_at,
        (select max(c.created_at) from public.clients c where c.agency_id = a.id),
        (select max(r.created_at) from public.search_results r where r.agency_id = a.id),
        (select max(t.updated_at) from public.tasks t where t.agency_id = a.id),
        (select max(rp.generated_at) from public.reports rp where rp.agency_id = a.id)
      )
    from public.agencies a
    order by a.created_at desc;
end $$;

grant execute on function public.admin_organization_summaries() to authenticated;

-- ─────────────────────────────────────────
-- B4. One row per project, with counts and last activity
-- ─────────────────────────────────────────
create or replace function public.admin_project_summaries()
returns table (
  id uuid,
  name text,
  website text,
  agency_id uuid,
  agency_name text,
  agency_disabled boolean,
  created_at timestamptz,
  searches bigint,
  active_searches bigint,
  last_check timestamptz,
  open_tasks bigint,
  last_activity timestamptz
) language plpgsql stable security invoker set search_path = public as $$
begin
  if not public.is_super_admin() then
    raise exception 'Not authorised' using errcode = '42501';
  end if;
  return query
    select
      c.id,
      c.name,
      c.website,
      c.agency_id,
      a.name,
      coalesce(a.is_disabled, false),
      c.created_at,
      (select count(*) from public.tracked_keywords k where k.client_id = c.id),
      (select count(*) from public.tracked_keywords k where k.client_id = c.id and k.is_active),
      (select max(r.created_at) from public.search_results r where r.agency_id = c.agency_id and r.client_id = c.id),
      (select count(*) from public.tasks t where t.client_id = c.id and t.status in ('todo', 'in_progress')),
      greatest(
        c.created_at,
        (select max(r.created_at) from public.search_results r where r.agency_id = c.agency_id and r.client_id = c.id),
        (select max(t.updated_at) from public.tasks t where t.client_id = c.id),
        (select max(rp.generated_at) from public.reports rp where rp.client_id = c.id)
      )
    from public.clients c
    left join public.agencies a on a.id = c.agency_id
    order by c.created_at desc;
end $$;

grant execute on function public.admin_project_summaries() to authenticated;
