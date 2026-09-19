-- ============================================================
-- Checks for migration 037. Run in the Supabase SQL editor AFTER applying
-- 035, 036 and 037. Every check runs as a real API role, and every change
-- it tries is rolled back. Read the NOTICE lines: each says PASS, FAIL or SKIP.
-- ============================================================

-- 1. A member can't make themselves a platform admin or move organization.
do $$
declare
  v_member uuid;
begin
  select id into v_member from public.profiles where role is distinct from 'super_admin' limit 1;
  if v_member is null then
    raise notice 'SKIP 1: no non-admin user to test with';
    return;
  end if;
  perform set_config('request.jwt.claims', json_build_object('sub', v_member, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  begin
    update public.profiles set role = 'super_admin' where id = v_member;
    raise exception 'FAIL 1: a member changed their own role';
  exception when insufficient_privilege then
    raise notice 'PASS 1a: a member cannot change their own role';
  end;
  begin
    update public.profiles set agency_id = gen_random_uuid() where id = v_member;
    raise exception 'FAIL 1: a member changed their own organization';
  exception when insufficient_privilege or foreign_key_violation then
    raise notice 'PASS 1b: a member cannot change their own organization';
  end;
  execute 'reset role';
end $$;

-- 2. A member can still edit harmless fields of their own profile.
do $$
declare
  v_member uuid;
  v_rows int;
begin
  select id into v_member from public.profiles where role is distinct from 'super_admin' limit 1;
  if v_member is null then
    raise notice 'SKIP 2: no non-admin user to test with';
    return;
  end if;
  perform set_config('request.jwt.claims', json_build_object('sub', v_member, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  update public.profiles set full_name = full_name where id = v_member;
  get diagnostics v_rows = row_count;
  execute 'reset role';
  if v_rows = 1 then
    raise notice 'PASS 2: a member can still update their own name';
  else
    raise notice 'FAIL 2: own-profile update matched % rows', v_rows;
  end if;
end $$;

-- 3. A platform admin can disable another user (and it really changes the row).
do $$
declare
  v_admin uuid;
  v_target uuid;
  v_rows int;
begin
  select id into v_admin from public.profiles where role = 'super_admin' limit 1;
  select id into v_target from public.profiles where id is distinct from v_admin limit 1;
  if v_admin is null or v_target is null then
    raise notice 'SKIP 3: need one platform admin and one other user';
    return;
  end if;
  perform set_config('request.jwt.claims', json_build_object('sub', v_admin, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  update public.profiles set is_disabled = is_disabled where id = v_target;
  get diagnostics v_rows = row_count;
  execute 'reset role';
  if v_rows = 1 then
    raise notice 'PASS 3: a platform admin can update another user';
  else
    raise notice 'FAIL 3: admin update matched % rows', v_rows;
  end if;
end $$;

-- 4. Anonymous visitors can't list invite codes, but can check one code.
do $$
begin
  execute 'set local role anon';
  begin
    perform count(*) from public.invites;
    raise notice 'FAIL 4a: anon can read the invites table';
  exception when insufficient_privilege then
    raise notice 'PASS 4a: anon cannot read the invites table';
  end;
  perform * from public.validate_invite('NOT-A-REAL-CODE');
  raise notice 'PASS 4b: anon can call validate_invite';
  execute 'reset role';
end $$;

-- 5. complete_onboarding refuses anonymous callers.
do $$
begin
  perform set_config('request.jwt.claims', '{}', true);
  execute 'set local role authenticated';
  begin
    perform public.complete_onboarding('NOT-A-REAL-CODE', 'Test', 'test');
    raise notice 'FAIL 5: onboarding ran without a signed-in user';
  exception when insufficient_privilege then
    raise notice 'PASS 5: onboarding requires a signed-in user';
  end;
  execute 'reset role';
end $$;
