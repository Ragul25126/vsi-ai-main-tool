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
