-- ============================================================
-- VSI development / staging seed.  TEST DATA ONLY.  Never run this on production.
-- ============================================================
-- Creates the minimum a signed-in user needs to use the product:
--
--   Organization -> User (linked) -> Project + website -> Searches -> Competitors
--
-- It creates NO results: no search results, audits, AI answers, tasks or reports.
-- Those come from the application when you press its buttons (Run site audit, Run check,
-- Generate report), so every number you see afterwards is real.
--
-- Cost control: the project is created with check_frequency = 'manual', so nothing is ever
-- run for it on a schedule. The column's database default is 'weekly' (migration_011).
--
-- Before running:
--   1. Apply schema.sql and the migrations (see docs/architecture/VSI_SUPABASE_SETUP.md).
--   2. In Supabase: Authentication -> Users -> Add user. Use the email in v_email below
--      (the app only accepts the address in src/lib/auth-config.ts), set a password,
--      and tick "Auto confirm user".
--   3. Edit the values in the "EDIT THESE" block, then run the whole file in the SQL editor.
--
-- Safe to run twice: fixed ids and "on conflict do nothing".
-- To remove everything it created, run the block at the bottom.
-- ============================================================

do $$
declare
  -- ---------------- EDIT THESE ----------------
  v_email       text := 'valgrowlabs444@gmail.com';   -- must match src/lib/auth-config.ts
  v_role        text := 'super_admin';                -- 'super_admin' also opens /admin; 'pilot' is an ordinary member
  v_website     text := 'https://valgrowlabs.com';    -- a site you own: Site Audit fetches its pages
  v_domain      text := 'valgrowlabs.com';            -- the same site, bare domain, lowercase
  v_brand       text := 'ValGrow Labs';
  v_location    text := 'ae';                         -- one of: ae, us, uk, in, lk
  v_searches    text[] := array[
    'seo agency dubai',
    'ai search optimization services',
    'generative engine optimization agency',
    'local seo services uae',
    'how to appear in ai answers'
  ];
  -- Reserved test domains. They can never appear in a real result, so comparisons against
  -- them stay empty. Replace them with real competitor domains to see real comparisons.
  v_competitors text[] := array['competitor-one.example', 'competitor-two.example', 'competitor-three.example'];
  -- --------------------------------------------

  v_agency_id constant uuid := '5eed0000-0000-4000-8000-000000000001';
  v_client_id constant uuid := '5eed0000-0000-4000-8000-000000000002';
  v_user_id   uuid;
  v_kw        text;
  v_comp      text;
begin
  select id into v_user_id from auth.users where lower(email) = lower(v_email);
  if v_user_id is null then
    raise exception 'No auth user with email %. Create it first: Authentication -> Users -> Add user.', v_email;
  end if;
  if v_role not in ('super_admin', 'pilot') then
    raise exception 'v_role must be super_admin or pilot';
  end if;

  -- Organization. max_clients stays null so the pilot one-project cap does not apply to it.
  insert into public.agencies (id, name, slug, max_keywords, is_pilot)
  values (v_agency_id, 'VSI Dev Test Organization (seed)', 'vsi-dev-test-seed', 50, false)
  on conflict (id) do nothing;

  -- The sign-up trigger normally creates the profile. Create it if it is missing, then link it.
  insert into public.profiles (id, full_name)
  values (v_user_id, 'VSI Test User (seed)')
  on conflict (id) do nothing;

  update public.profiles
  set agency_id = v_agency_id,
      role = v_role
  where id = v_user_id;

  -- Project and website. 'manual' means nothing runs on a schedule.
  insert into public.clients (id, agency_id, name, website, brand_name, service_type, default_location, check_frequency)
  values (v_client_id, v_agency_id, 'Seed Test Project', v_website, v_brand, 'seo_geo', v_location, 'manual')
  on conflict (id) do nothing;

  -- Searches, tracked on Google and in AI answers ('both').
  foreach v_kw in array v_searches loop
    insert into public.tracked_keywords (client_id, agency_id, keyword, track_type, domain, brand, location, is_active)
    values (v_client_id, v_agency_id, v_kw, 'both', v_domain, v_brand, v_location, true)
    on conflict (client_id, keyword, domain, location) do nothing;
  end loop;

  -- Competitors (table from migration_036; at most 10 per project).
  foreach v_comp in array v_competitors loop
    insert into public.project_competitors (agency_id, client_id, domain, name, created_by)
    values (v_agency_id, v_client_id, lower(v_comp), initcap(split_part(v_comp, '.', 1)) || ' (seed)', v_user_id)
    on conflict (client_id, domain) do nothing;
  end loop;

  raise notice 'Seed ready: organization %, project %, user % (%).', v_agency_id, v_client_id, v_email, v_role;
end $$;

-- What was created:
select 'organization' as item, name as value from public.agencies where id = '5eed0000-0000-4000-8000-000000000001'
union all
select 'project', name || '  ' || coalesce(website, '') || '  frequency=' || check_frequency from public.clients where id = '5eed0000-0000-4000-8000-000000000002'
union all
select 'searches', count(*)::text from public.tracked_keywords where client_id = '5eed0000-0000-4000-8000-000000000002'
union all
select 'competitors', count(*)::text from public.project_competitors where client_id = '5eed0000-0000-4000-8000-000000000002';

-- ------------------------------------------------------------
-- REMOVE THE SEED (run by hand when you want a clean database).
-- Deleting the organization removes its project, searches, results, audits, competitors,
-- tasks and reports with it. The auth user stays; its profile is left with no organization.
-- ------------------------------------------------------------
-- delete from public.agencies where id = '5eed0000-0000-4000-8000-000000000001';
