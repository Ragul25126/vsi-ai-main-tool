-- ============================================================
-- VSI tenant isolation checks.  Run on DEVELOPMENT or STAGING, not production.
-- ============================================================
-- Question answered: can a signed-in user of organization A read or change anything that
-- belongs to organization B through the public API? It tests the database rules (RLS)
-- directly, which is the layer that matters: the browser holds the anon key, so anything
-- RLS allows is reachable no matter what the application code filters.
--
-- How it works:
--   * Builds two throw-away organizations, each with a user, a project and one row in every
--     tenant table.
--   * Switches to the real API roles (authenticated as user A, then anon) and tries to read
--     and write organization B's rows.
--   * ENDS BY RAISING AN ERROR ON PURPOSE. The error text is the report, and the error rolls
--     the whole run back, so nothing it created is kept, including the two auth users.
--
-- How to run: paste the whole file into the Supabase SQL editor and run it. Read the result
-- in the red error box. "PASS" is good. "FAIL" is a leak. "KNOWN" marks leaks that the audit
-- already found from the migrations (docs/architecture/VSI_SUPABASE_SETUP.md, section 8);
-- they show what the current rules allow and turn into PASS once those rules are fixed.
--
-- Needs: schema.sql and the migrations applied, including migration_038 (without it the
-- role value 'pilot' used below is rejected).
--
-- Status: written from the migrations. It has NOT been run yet, because no real Supabase
-- project was connected when it was written. If it stops with a different error, that error
-- names the statement to fix.
-- ============================================================

do $$
declare
  v_agency_a uuid := gen_random_uuid();
  v_agency_b uuid := gen_random_uuid();
  v_user_a   uuid := gen_random_uuid();
  v_user_b   uuid := gen_random_uuid();
  v_client_a uuid := gen_random_uuid();
  v_client_b uuid := gen_random_uuid();
  v_kw_b     uuid := gen_random_uuid();
  v_tag      text := 'iso-' || substr(md5(random()::text), 1, 8);
  v_has_audits      boolean := to_regclass('public.site_audits') is not null;
  v_has_competitors boolean := to_regclass('public.project_competitors') is not null;
  v_has_analyses    boolean := to_regclass('public.client_keyword_analyses') is not null;
  v_out  text := '';
  v_n    bigint;
  v_fail int := 0;
  v_known int := 0;
  r record;
begin
  -- ---------- setup, as the database owner ----------
  insert into auth.users (id, instance_id, aud, role, email, created_at, updated_at)
  values
    (v_user_a, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', v_tag || '-a@isolation.test', now(), now()),
    (v_user_b, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', v_tag || '-b@isolation.test', now(), now());

  insert into public.agencies (id, name, slug) values
    (v_agency_a, 'Isolation test A', v_tag || '-a'),
    (v_agency_b, 'Isolation test B', v_tag || '-b');

  -- The sign-up trigger creates the profiles. Make sure they exist, then link them.
  insert into public.profiles (id, full_name) values (v_user_a, 'Iso A'), (v_user_b, 'Iso B')
  on conflict (id) do nothing;
  update public.profiles set agency_id = v_agency_a, role = 'pilot' where id = v_user_a;
  update public.profiles set agency_id = v_agency_b, role = 'pilot' where id = v_user_b;

  insert into public.clients (id, agency_id, name, website, check_frequency) values
    (v_client_a, v_agency_a, 'Iso project A', 'https://a.isolation.test', 'manual'),
    (v_client_b, v_agency_b, 'Iso project B', 'https://b.isolation.test', 'manual');

  insert into public.tracked_keywords (id, client_id, agency_id, keyword, domain, location)
  values (v_kw_b, v_client_b, v_agency_b, 'iso keyword b', 'b.isolation.test', 'ae');

  insert into public.search_results (agency_id, client_id, tracked_keyword_id, keyword, domain, location)
  values (v_agency_b, v_client_b, v_kw_b, 'iso keyword b', 'b.isolation.test', 'ae');

  insert into public.tasks (agency_id, client_id, group_name, title)
  values (v_agency_b, v_client_b, 'Content', 'Iso task B');

  insert into public.reports (agency_id, client_id, share_token, content)
  values (v_agency_b, v_client_b, v_tag || '-token-b', '{"iso": true}'::jsonb);

  insert into public.notifications (user_id, agency_id, title, message)
  values (v_user_b, v_agency_b, 'Iso notification B', 'for user B only'),
         (null,     v_agency_b, 'Iso notification B (no user)', 'system row of organization B');

  insert into public.messages (id, user_id, subject) values
    (v_tag || '-msg-b', v_user_b, 'Iso message B'),
    (v_tag || '-msg-b-null', null, 'Iso message B (no user)');

  insert into public.feedback (agency_id, user_id, category, message)
  values (v_agency_b, v_user_b, 'general', 'Iso feedback B');

  if v_has_audits then
    insert into public.site_audits (agency_id, client_id, status, domain)
    values (v_agency_b, v_client_b, 'completed', 'b.isolation.test');
  end if;
  if v_has_competitors then
    insert into public.project_competitors (agency_id, client_id, domain)
    values (v_agency_b, v_client_b, 'rival.isolation.test');
  end if;
  if v_has_analyses then
    -- This table is unused by the application and its required columns are not pinned down,
    -- so a failed insert only skips its check.
    begin
      execute format('insert into public.client_keyword_analyses (client_id) values (%L)', v_client_b);
    exception when others then
      v_has_analyses := false;
    end;
  end if;

  -- ---------- act as user A (organization A) ----------
  perform set_config('request.jwt.claims',
    json_build_object('sub', v_user_a, 'role', 'authenticated', 'email', v_tag || '-a@isolation.test')::text, true);
  execute 'set local role authenticated';

  -- Sanity: A must see its own project, or every "PASS" below would be meaningless.
  select count(*) into v_n from public.clients where id = v_client_a;
  if v_n = 1 then
    v_out := v_out || E'\nPASS   sanity: user A sees its own project';
  else
    v_out := v_out || E'\nFAIL   sanity: user A cannot see its OWN project (rows: ' || v_n || '), so the results below prove nothing';
    v_fail := v_fail + 1;
  end if;

  -- Reads of organization B's rows. Each must return 0.
  for r in
    select * from (values
      ('projects (clients)',     'clients',              format('id = %L', v_client_b),        true),
      ('searches',               'tracked_keywords',     format('client_id = %L', v_client_b), true),
      ('search results',         'search_results',       format('client_id = %L', v_client_b), true),
      ('site audits',            'site_audits',          format('client_id = %L', v_client_b), v_has_audits),
      ('competitors',            'project_competitors',  format('client_id = %L', v_client_b), v_has_competitors),
      ('tasks',                  'tasks',                format('client_id = %L', v_client_b), true),
      ('reports',                'reports',              format('client_id = %L', v_client_b), true),
      ('notifications (user B)', 'notifications',        format('user_id = %L', v_user_b),     true),
      ('messages (user B)',      'messages',             format('user_id = %L', v_user_b),     true),
      ('feedback',               'feedback',             format('agency_id = %L', v_agency_b), true),
      ('profile of user B',      'profiles',             format('id = %L', v_user_b),          true),
      ('organization B',         'agencies',             format('id = %L', v_agency_b),        true)
    ) as t(label, tbl, cond, present)
  loop
    if not r.present then
      v_out := v_out || E'\nSKIP   read  ' || r.label || ' (table not installed)';
      continue;
    end if;
    execute format('select count(*) from public.%I where %s', r.tbl, r.cond) into v_n;
    if v_n = 0 then
      v_out := v_out || E'\nPASS   read  ' || r.label;
    else
      v_out := v_out || E'\nFAIL   read  ' || r.label || ': user A can read ' || v_n || ' row(s) of organization B';
      v_fail := v_fail + 1;
    end if;
  end loop;

  -- Writes into organization B. Each must be refused.
  begin
    insert into public.clients (agency_id, name) values (v_agency_b, 'planted by A');
    v_out := v_out || E'\nFAIL   write create a project inside organization B';
    v_fail := v_fail + 1;
  exception when others then
    v_out := v_out || E'\nPASS   write create a project inside organization B (refused)';
  end;

  begin
    insert into public.tracked_keywords (client_id, agency_id, keyword, domain, location)
    values (v_client_b, v_agency_b, 'planted by A', 'b.isolation.test', 'ae');
    v_out := v_out || E'\nFAIL   write add a search to B''s project';
    v_fail := v_fail + 1;
  exception when others then
    v_out := v_out || E'\nPASS   write add a search to B''s project (refused)';
  end;

  begin
    insert into public.tasks (agency_id, client_id, group_name, title)
    values (v_agency_b, v_client_b, 'Content', 'planted by A');
    v_out := v_out || E'\nFAIL   write add a task to B''s project';
    v_fail := v_fail + 1;
  exception when others then
    v_out := v_out || E'\nPASS   write add a task to B''s project (refused)';
  end;

  if v_has_competitors then
    begin
      -- Own organization id, someone else's project: the policy must check the project too.
      insert into public.project_competitors (agency_id, client_id, domain)
      values (v_agency_a, v_client_b, 'planted.isolation.test');
      v_out := v_out || E'\nFAIL   write add a competitor to B''s project using A''s organization id';
      v_fail := v_fail + 1;
    exception when others then
      v_out := v_out || E'\nPASS   write add a competitor to B''s project using A''s organization id (refused)';
    end;
  end if;

  update public.clients set name = 'renamed by A' where id = v_client_b;
  get diagnostics v_n = row_count;
  if v_n = 0 then
    v_out := v_out || E'\nPASS   write rename B''s project (0 rows changed)';
  else
    v_out := v_out || E'\nFAIL   write rename B''s project: ' || v_n || ' row(s) changed';
    v_fail := v_fail + 1;
  end if;

  delete from public.tasks where client_id = v_client_b;
  get diagnostics v_n = row_count;
  if v_n = 0 then
    v_out := v_out || E'\nPASS   write delete B''s tasks (0 rows deleted)';
  else
    v_out := v_out || E'\nFAIL   write delete B''s tasks: ' || v_n || ' row(s) deleted';
    v_fail := v_fail + 1;
  end if;

  begin
    update public.profiles set role = 'super_admin' where id = v_user_a;
    v_out := v_out || E'\nFAIL   write user A made itself a platform admin';
    v_fail := v_fail + 1;
  exception when others then
    v_out := v_out || E'\nPASS   write user A cannot make itself a platform admin';
  end;

  begin
    update public.profiles set agency_id = v_agency_b where id = v_user_a;
    v_out := v_out || E'\nFAIL   write user A moved itself into organization B';
    v_fail := v_fail + 1;
  exception when others then
    v_out := v_out || E'\nPASS   write user A cannot move itself into organization B';
  end;

  -- Rows with no user: the audit expects these to leak between organizations.
  select count(*) into v_n from public.notifications where user_id is null and agency_id = v_agency_b;
  if v_n = 0 then
    v_out := v_out || E'\nPASS   read  B''s notifications that have no user';
  else
    v_out := v_out || E'\nKNOWN  read  B''s notifications that have no user: user A reads ' || v_n || ' (policy "user_id IS NULL", migration_030)';
    v_known := v_known + 1;
  end if;

  select count(*) into v_n from public.messages where id = v_tag || '-msg-b-null';
  if v_n = 0 then
    v_out := v_out || E'\nPASS   read  messages that have no user';
  else
    v_out := v_out || E'\nKNOWN  read  messages that have no user: user A reads ' || v_n || ' (policy "user_id IS NULL", migration_031)';
    v_known := v_known + 1;
  end if;

  if v_has_analyses then
    execute format('select count(*) from public.client_keyword_analyses where client_id = %L', v_client_b) into v_n;
    if v_n = 0 then
      v_out := v_out || E'\nPASS   read  B''s keyword analyses';
    else
      v_out := v_out || E'\nKNOWN  read  B''s keyword analyses: user A reads ' || v_n || ' (policies "USING (true)", migration_032)';
      v_known := v_known + 1;
    end if;
  end if;

  -- ---------- act as a visitor who is not signed in ----------
  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);
  execute 'set local role anon';

  for r in
    select * from (values
      ('projects',       'clients',          format('id = %L', v_client_b)),
      ('searches',       'tracked_keywords', format('client_id = %L', v_client_b)),
      ('search results', 'search_results',   format('client_id = %L', v_client_b)),
      ('tasks',          'tasks',            format('client_id = %L', v_client_b))
    ) as t(label, tbl, cond)
  loop
    begin
      execute format('select count(*) from public.%I where %s', r.tbl, r.cond) into v_n;
    exception when insufficient_privilege then
      v_n := 0;
    end;
    if v_n = 0 then
      v_out := v_out || E'\nPASS   anon  ' || r.label;
    else
      v_out := v_out || E'\nFAIL   anon  ' || r.label || ': a visitor reads ' || v_n || ' row(s)';
      v_fail := v_fail + 1;
    end if;
  end loop;

  -- A visitor who does NOT know the share link asks for every report.
  begin
    select count(*) into v_n from public.reports where client_id = v_client_b;
  exception when insufficient_privilege then
    v_n := 0;
  end;
  if v_n = 0 then
    v_out := v_out || E'\nPASS   anon  reports without knowing the share link';
  else
    v_out := v_out || E'\nKNOWN  anon  reports without knowing the share link: a visitor reads ' || v_n || ' (policy "reports_public_read_by_token" never compares the token, migration_014)';
    v_known := v_known + 1;
  end if;

  begin
    select count(*) into v_n from public.notifications where user_id is null and agency_id = v_agency_b;
  exception when insufficient_privilege then
    v_n := 0;
  end;
  if v_n = 0 then
    v_out := v_out || E'\nPASS   anon  notifications that have no user';
  else
    v_out := v_out || E'\nKNOWN  anon  notifications that have no user: a visitor reads ' || v_n || ' (migration_030 policies have no role clause)';
    v_known := v_known + 1;
  end if;

  execute 'reset role';

  -- ---------- report, and roll everything back ----------
  raise exception E'VSI TENANT ISOLATION REPORT  (this error is intentional: it rolls the test data back)\n%\n\nSummary: % FAIL, % KNOWN.  FAIL = a leak the audit did not expect.  KNOWN = a leak already documented, still open.',
    v_out, v_fail, v_known;
end $$;
