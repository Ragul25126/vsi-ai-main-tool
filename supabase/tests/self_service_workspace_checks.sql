-- ============================================================
-- VSI self-service workspace checks (migration 039: create_own_organization).
-- Run on a THROW-AWAY local database, or on development/staging. Never on production.
-- ============================================================
-- Question answered: does create_own_organization() do exactly what it is meant to and nothing
-- else? It tests the real function, the real profile guard trigger (migration 037) and the real
-- invite functions, as the real API roles (authenticated / anon), not by reading the SQL.
--
-- How it works:
--   * Creates throw-away users (through the auth.users insert that fires handle_new_user()) and one
--     throw-away organization.
--   * Switches to the authenticated role, and sets the JWT subject the way PostgREST does, to act as
--     each user.
--   * ENDS BY RAISING AN ERROR ON PURPOSE. The error text is the report, and the error rolls the whole
--     run back, so nothing it created is kept.
--
-- Local run (nothing remote is touched):
--   docker run -d --name vsi-mig-test -e POSTGRES_PASSWORD=x -p 127.0.0.1:54399:5432 \
--     public.ecr.aws/supabase/postgres:17.6.1.166
--   ...apply migrations 001-039 in order with psql (each file in one transaction)...
--   psql -h 127.0.0.1 -p 54399 -U postgres -v ON_ERROR_STOP=0 -f supabase/tests/self_service_workspace_checks.sql
--   Read the result in the "SELF-SERVICE WORKSPACE CHECKS" error. Every line should start with PASS.
--
-- Needs: schema + migrations 001-039 applied.
-- ============================================================

do $$
declare
  v_tag      text := substr(md5(random()::text), 1, 8);
  v_a        uuid := gen_random_uuid();   -- new account, no organization
  v_b        uuid := gen_random_uuid();   -- new account, redeems an invite
  v_c        uuid := gen_random_uuid();   -- already belongs to an organization
  v_s        uuid := gen_random_uuid();   -- existing platform admin, no organization yet
  v_d        uuid := gen_random_uuid();   -- disabled account
  v_e        uuid := gen_random_uuid();   -- repeats the request
  v_c_agency uuid := gen_random_uuid();
  v_agency   uuid;
  v_before   integer;
  v_after    integer;
  v_msg      text;
  v_role     text;
  v_out      text := '';
  v_row      record;
  v_fail     integer;
begin
  -- ---------- set up (as the database owner) ----------
  insert into auth.users (id, email) values
    (v_a, 'a-' || v_tag || '@example.test'), (v_b, 'b-' || v_tag || '@example.test'),
    (v_c, 'c-' || v_tag || '@example.test'), (v_s, 's-' || v_tag || '@example.test'),
    (v_d, 'd-' || v_tag || '@example.test'), (v_e, 'e-' || v_tag || '@example.test');   -- handle_new_user() makes the profiles

  insert into public.agencies (id, name, slug) values (v_c_agency, 'Existing Org ' || v_tag, 'existing-' || v_tag);
  update public.profiles set agency_id = v_c_agency where id = v_c;
  update public.profiles set role = 'super_admin' where id = v_s;
  update public.profiles set is_disabled = true where id = v_d;
  insert into public.invites (code, role, max_keywords) values ('VG-' || upper(v_tag), 'pilot', 25);

  select count(*) into v_before from public.agencies;

  -- ---------- 0. the function itself ----------
  select p.prosecdef, p.proconfig::text, pg_get_function_arguments(p.oid) as args into v_row
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.proname = 'create_own_organization';
  v_out := v_out || format(E'%s function is SECURITY DEFINER with search_path locked to public\n', case when v_row.prosecdef and v_row.proconfig like '%search_path=public%' then 'PASS' else 'FAIL' end);
  v_out := v_out || format(E'%s the only inputs are a name and a slug: no user id, role, agency id or permission (%s)\n', case when v_row.args = 'p_agency_name text, p_slug text' then 'PASS' else 'FAIL' end, v_row.args);
  v_out := v_out || format(E'%s anon has no EXECUTE, signed-in users do\n', case when not has_function_privilege('anon', 'public.create_own_organization(text,text)', 'execute')
    and has_function_privilege('authenticated', 'public.create_own_organization(text,text)', 'execute') then 'PASS' else 'FAIL' end);

  -- ---------- 1-2. a signed-in user without an organization can create one, and stays a pilot ----------
  perform set_config('request.jwt.claim.sub', v_a::text, true);
  set local role authenticated;
  v_agency := public.create_own_organization('  Acme Plumbing  ', 'acme-plumbing-' || v_tag);
  reset role;
  select a.* into v_row from public.agencies a where a.id = v_agency;
  v_out := v_out || format(E'%s creates the organization with the trimmed name and the given slug\n', case when v_row.name = 'Acme Plumbing' and v_row.slug = 'acme-plumbing-' || v_tag then 'PASS' else 'FAIL' end);
  v_out := v_out || format(E'%s the profile is linked to the new organization\n', case when (select agency_id from public.profiles where id = v_a) = v_agency then 'PASS' else 'FAIL' end);
  select role into v_role from public.profiles where id = v_a;
  v_out := v_out || format(E'%s the creator is a pilot (role=%s), not an owner or super_admin\n', case when v_role = 'pilot' then 'PASS' else 'FAIL' end, v_role);
  v_out := v_out || format(E'%s no limits invented: new organization has the existing defaults (keywords %s, pilot %s, project cap %s)\n',
    case when v_row.max_keywords = 10 and v_row.is_pilot is true and v_row.max_clients is null then 'PASS' else 'FAIL' end, v_row.max_keywords, v_row.is_pilot, coalesce(v_row.max_clients::text, 'none'));

  -- ---------- 3. cannot become super_admin through it ----------
  v_out := v_out || format(E'%s role is never written: the new user is not a super admin\n', case when not exists (select 1 from public.profiles where id = v_a and role = 'super_admin') then 'PASS' else 'FAIL' end);
  perform set_config('request.jwt.claim.sub', v_s::text, true);
  set local role authenticated;
  perform public.create_own_organization('Platform Team', 'platform-team-' || v_tag);
  reset role;
  select role into v_role from public.profiles where id = v_s;
  v_out := v_out || format(E'%s an existing super_admin keeps super_admin (not upgraded, not downgraded)\n', case when v_role = 'super_admin' then 'PASS' else 'FAIL' end);
  perform set_config('request.jwt.claim.sub', v_s::text, true);
  set local role authenticated;
  v_out := v_out || format(E'%s is_super_admin() is still true for the platform admin\n', case when public.is_super_admin() then 'PASS' else 'FAIL' end);
  reset role;
  perform set_config('request.jwt.claim.sub', v_a::text, true);
  set local role authenticated;
  v_out := v_out || format(E'%s is_super_admin() is false for the new workspace creator\n', case when not public.is_super_admin() then 'PASS' else 'FAIL' end);
  reset role;

  -- ---------- 4. unauthenticated callers are rejected ----------
  perform set_config('request.jwt.claim.sub', '', true);
  set local role authenticated;
  v_msg := null;
  begin perform public.create_own_organization('Nobody Inc', 'nobody-' || v_tag); exception when others then v_msg := sqlerrm; end;
  reset role;
  v_out := v_out || format(E'%s signed-in role with no user is rejected (%s)\n', case when v_msg ilike '%not signed in%' then 'PASS' else 'FAIL' end, v_msg);
  set local role anon;
  v_msg := null;
  begin perform public.create_own_organization('Nobody Inc', 'nobody-' || v_tag); exception when others then v_msg := sqlerrm; end;
  reset role;
  v_out := v_out || format(E'%s the anon role is rejected outright (%s)\n', case when v_msg ilike '%permission denied%' then 'PASS' else 'FAIL' end, v_msg);

  -- ---------- 5. a user who already has an organization cannot create another ----------
  select count(*) into v_before from public.agencies;
  perform set_config('request.jwt.claim.sub', v_c::text, true);
  set local role authenticated;
  v_msg := null;
  begin perform public.create_own_organization('Second Org', 'second-org-' || v_tag); exception when others then v_msg := sqlerrm; end;
  reset role;
  select count(*) into v_after from public.agencies;
  v_out := v_out || format(E'%s already-set-up account is rejected (%s)\n', case when v_msg ilike '%already set up%' then 'PASS' else 'FAIL' end, v_msg);
  v_out := v_out || format(E'%s no extra organization was created\n', case when v_before = v_after then 'PASS' else 'FAIL' end);
  v_out := v_out || format(E'%s and their organization link did not change\n', case when (select agency_id from public.profiles where id = v_c) = v_c_agency then 'PASS' else 'FAIL' end);

  -- ---------- 6. cannot act for another user ----------
  perform set_config('request.jwt.claim.sub', v_e::text, true);
  set local role authenticated;
  v_msg := null;
  begin execute format('select public.create_own_organization(%L, %L, p_user_id => %L)', 'Hijack', 'hijack-' || v_tag, v_b); exception when others then v_msg := sqlerrm; end;
  reset role;
  v_out := v_out || format(E'%s there is no way to pass a user id (%s)\n', case when v_msg ilike '%does not exist%' then 'PASS' else 'FAIL' end, v_msg);
  v_out := v_out || format(E'%s another user''s profile was not touched\n', case when (select agency_id from public.profiles where id = v_b) is null then 'PASS' else 'FAIL' end);

  -- ---------- 7. cannot join an existing organization ----------
  perform set_config('request.jwt.claim.sub', v_e::text, true);
  set local role authenticated;
  v_msg := null;
  begin perform public.create_own_organization('Existing Org', 'existing-' || v_tag); exception when others then v_msg := sqlerrm; end;
  reset role;
  v_out := v_out || format(E'%s asking for an existing organization''s slug is rejected, not joined (%s)\n', case when v_msg ilike '%already in use%' then 'PASS' else 'FAIL' end, v_msg);
  v_out := v_out || format(E'%s the caller still has no organization and the existing one is unchanged\n', case when (select agency_id from public.profiles where id = v_e) is null
    and (select name from public.agencies where id = v_c_agency) = 'Existing Org ' || v_tag then 'PASS' else 'FAIL' end);

  -- direct writes from the browser are still blocked by the migration 037 guard
  perform set_config('request.jwt.claim.sub', v_e::text, true);
  set local role authenticated;
  v_msg := null;
  begin update public.profiles set agency_id = v_c_agency where id = v_e; exception when others then v_msg := sqlerrm; end;
  v_out := v_out || format(E'%s a user still cannot link themselves to an organization directly (%s)\n', case when v_msg ilike '%not allowed%' then 'PASS' else 'FAIL' end, v_msg);
  v_msg := null;
  begin update public.profiles set role = 'super_admin' where id = v_e; exception when others then v_msg := sqlerrm; end;
  reset role;
  v_out := v_out || format(E'%s a user still cannot make themselves super_admin directly (%s)\n', case when v_msg ilike '%not allowed%' then 'PASS' else 'FAIL' end, v_msg);

  -- ---------- 8. the invite flow still works ----------
  perform set_config('request.jwt.claim.sub', v_b::text, true);
  set local role authenticated;
  v_agency := public.complete_onboarding('VG-' || upper(v_tag), 'Invited Org', 'invited-org-' || v_tag);
  reset role;
  select role into v_role from public.profiles where id = v_b;
  v_out := v_out || format(E'%s complete_onboarding() with a valid invite still creates and links the organization\n', case when (select agency_id from public.profiles where id = v_b) = v_agency and v_role = 'pilot' then 'PASS' else 'FAIL' end);
  v_out := v_out || format(E'%s the invite is consumed and its limit is applied (keywords %s)\n', case when (select used_by from public.invites where code = 'VG-' || upper(v_tag)) = v_b
    and (select max_keywords from public.agencies where id = v_agency) = 25 then 'PASS' else 'FAIL' end, (select max_keywords from public.agencies where id = v_agency));

  -- ---------- 9. validation ----------
  perform set_config('request.jwt.claim.sub', v_e::text, true);
  set local role authenticated;
  for v_row in select * from (values
      ('empty name', '', 'ok-slug', 'name is required'),
      ('blank name', '   ', 'ok-slug', 'name is required'),
      ('null name', null, 'ok-slug', 'name is required'),
      ('81-character name', repeat('x', 81), 'ok-slug', '80 characters'),
      ('control character in the name', E'Bad\nName', 'ok-slug', 'invalid characters'),
      ('empty slug', 'Fine Name', '', 'slug is invalid'),
      ('null slug', 'Fine Name', null, 'slug is invalid'),
      ('uppercase slug', 'Fine Name', 'Upper-Case', 'slug is invalid'),
      ('slug with a space', 'Fine Name', 'has space', 'slug is invalid'),
      ('slug with an underscore', 'Fine Name', 'has_underscore', 'slug is invalid'),
      ('slug starting with a hyphen', 'Fine Name', '-leading', 'slug is invalid'),
      ('65-character slug', 'Fine Name', repeat('a', 65), 'slug is invalid')
    ) as t(label, name, slug, expected) loop
    v_msg := null;
    begin perform public.create_own_organization(v_row.name, v_row.slug); exception when others then v_msg := sqlerrm; end;
    v_out := v_out || format(E'%s rejects: %s\n', case when v_msg ilike '%' || v_row.expected || '%' then 'PASS' else 'FAIL' end, v_row.label);
  end loop;
  reset role;
  v_out := v_out || format(E'%s none of the invalid attempts created an organization or linked the caller\n', case when (select agency_id from public.profiles where id = v_e) is null then 'PASS' else 'FAIL' end);

  -- ---------- 10. repeated submission ----------
  perform set_config('request.jwt.claim.sub', v_e::text, true);
  set local role authenticated;
  perform public.create_own_organization('Repeat Co', 'repeat-co-' || v_tag);
  v_msg := null;
  begin perform public.create_own_organization('Repeat Co', 'repeat-co-' || v_tag); exception when others then v_msg := sqlerrm; end;
  reset role;
  v_out := v_out || format(E'%s the repeated request is rejected (%s)\n', case when v_msg ilike '%already set up%' then 'PASS' else 'FAIL' end, v_msg);
  v_out := v_out || format(E'%s and only one organization exists for it\n', case when (select count(*) from public.agencies where name = 'Repeat Co') = 1 then 'PASS' else 'FAIL' end);
  perform set_config('request.jwt.claim.sub', v_e::text, true);
  set local role authenticated;
  v_msg := null;
  begin perform public.create_own_organization('Repeat Co Again', 'repeat-co-again-' || v_tag); exception when others then v_msg := sqlerrm; end;
  reset role;
  v_out := v_out || format(E'%s a repeat with a new name and slug is rejected too, so it cannot make a second organization\n', case when v_msg ilike '%already set up%' then 'PASS' else 'FAIL' end);

  -- ---------- 11. a disabled account is rejected ----------
  perform set_config('request.jwt.claim.sub', v_d::text, true);
  set local role authenticated;
  v_msg := null;
  begin perform public.create_own_organization('Disabled Co', 'disabled-co-' || v_tag); exception when others then v_msg := sqlerrm; end;
  reset role;
  v_out := v_out || format(E'%s disabled account is rejected (%s)\n', case when v_msg ilike '%disabled%' then 'PASS' else 'FAIL' end, v_msg);

  -- ---------- 12. the new organization behaves like any other for the existing limits ----------
  perform set_config('request.jwt.claim.sub', v_a::text, true);
  set local role authenticated;
  v_out := v_out || format(E'%s the new pilot can see their own organization and nobody else''s\n', case when (select count(*) from public.agencies) = 1 then 'PASS' else 'FAIL' end);
  reset role;

  select count(*) into v_fail from regexp_matches(v_out, '(^|\n)FAIL', 'g');
  raise exception E'SELF-SERVICE WORKSPACE CHECKS (%): % failed\n%\n(this error is deliberate: it rolls everything back)', case when v_fail = 0 then 'ALL PASS' else 'FAILURES' end, v_fail, v_out;
end $$;
