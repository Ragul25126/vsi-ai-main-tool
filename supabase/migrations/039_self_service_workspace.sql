-- ============================================================
-- VSI Migration 039: self-service workspace creation
-- ============================================================
-- A new account made from the "Create account" form has a profile (handle_new_user) but no
-- organization. Until now the only functions that create an organization and link a profile,
-- complete_onboarding() and claim_invite(), required an invite code. The browser cannot do it
-- itself: trg_guard_profile_privileged_columns (migration 037) rejects a signed-in user changing
-- their own role or agency_id.
--
-- This adds ONE narrow function for the case with no invite. It does not change tables, policies,
-- triggers or the invite flow (complete_onboarding, claim_invite, validate_invite are untouched).
--
-- What the caller can and cannot do:
--   * The caller is always auth.uid(). There is no user id, role, agency id or permission argument,
--     so nobody can link, promote or move another account, join an existing organization, or pick a role.
--   * It never writes profiles.role. A new account keeps the role it was created with ('pilot', the
--     column default), and an existing platform admin keeps 'super_admin'. There is no way to become
--     super_admin through it.
--   * It only INSERTs a brand-new agencies row and links the caller's own profile to it. It does not
--     depend on the broad agencies INSERT policies (WITH CHECK (true)) and does not use them.
--   * Limits are not invented here. The new agency gets the column defaults that already exist:
--     max_keywords = 10, is_pilot = true, max_clients = null (no project cap), so the keyword-limit
--     trigger (006) and the client-cap trigger (020) apply exactly as they do to any other agency.
--   * Repeat and concurrent calls are safe: the caller's profile row is locked, and a second call
--     finds agency_id already set and is rejected, so one account can never end up with two organizations.
--
-- Runs as SECURITY DEFINER (like complete_onboarding), so the profile guard trigger, which only limits
-- the authenticated and anon roles, does not block the link. search_path is locked to public.
--
-- Not applied anywhere. Review, then apply with `supabase db push`.
-- ============================================================

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
  -- 1. Must be signed in. The caller is always the authenticated user, never a client-supplied id.
  if v_uid is null then
    raise exception 'Not signed in' using errcode = '42501';
  end if;

  -- 2. Validate the input before touching any row.
  if v_name = '' then
    raise exception 'Organization name is required' using errcode = '22023';
  end if;
  if char_length(v_name) > 80 then
    raise exception 'Organization name must be 80 characters or fewer' using errcode = '22023';
  end if;
  if v_name ~ '[[:cntrl:]]' then
    raise exception 'Organization name contains invalid characters' using errcode = '22023';
  end if;
  -- The slug is the organization's unique address: lowercase letters, digits and single hyphens.
  if v_slug !~ '^[a-z0-9]([a-z0-9-]{0,62}[a-z0-9])?$' then
    raise exception 'Organization slug is invalid' using errcode = '22023';
  end if;

  -- 3. The caller's own profile, locked so repeated or concurrent submissions queue here.
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
  -- One organization per account. Same message as complete_onboarding().
  if v_profile.agency_id is not null then
    raise exception 'Account is already set up' using errcode = '42501';
  end if;

  -- 4. Create the organization. The slug is unique; a clash is reported plainly so the caller can retry.
  begin
    insert into public.agencies (name, slug)
    values (v_name, v_slug)
    returning id into v_agency;
  exception when unique_violation then
    raise exception 'Organization slug is already in use' using errcode = '23505';
  end;

  -- 5. Link the caller's own profile. The role is deliberately left alone.
  update public.profiles
     set agency_id = v_agency
   where id = v_uid;

  return v_agency;
end;
$$;

comment on function public.create_own_organization(text, text) is
  'Self-service workspace creation: creates a new agency and links the calling user''s own profile to it. Never sets a role. See migration 039.';

-- Signed-in users only. Supabase's default privileges also grant EXECUTE to anon, so revoke it explicitly.
revoke all on function public.create_own_organization(text, text) from public, anon;
grant execute on function public.create_own_organization(text, text) to authenticated;

-- Refresh the API's view of the schema.
notify pgrst, 'reload schema';
