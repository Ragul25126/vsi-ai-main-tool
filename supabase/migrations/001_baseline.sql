-- ============================================================
-- VSI Migration 001 — Baseline (base schema)
-- ============================================================
-- Migrations 002 onward assume five base tables already exist (agencies,
-- profiles, clients, tracked_keywords, search_results). Until now they were
-- created by hand from supabase/schema.sql, so a database built from the
-- migration folder alone (for example the shadow database used by
-- `supabase db diff`) failed at 002 because public.clients did not exist.
--
-- This file is supabase/schema.sql without its "0. CLEAN SLATE" block. It is
-- written to be safe on a database that already has these objects:
--   * no DROP TABLE, no CASCADE anywhere
--   * CREATE TABLE / CREATE INDEX use IF NOT EXISTS
--   * every policy is dropped by name and re-created
--   * the function and trigger are replaced in place
-- Nothing else was added, removed or changed. schema.sql is left as it was.
-- ============================================================

-- ─────────────────────────────────────────
-- 1. AGENCIES
-- ─────────────────────────────────────────
create table if not exists public.agencies (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text unique not null,
  created_at timestamptz not null default now()
);

alter table public.agencies enable row level security;

-- ─────────────────────────────────────────
-- 2. PROFILES (extends auth.users)
-- ─────────────────────────────────────────
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  agency_id  uuid references public.agencies (id) on delete set null,
  full_name  text,
  role       text not null default 'owner' check (role in ('owner', 'analyst', 'viewer')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select using (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update using (id = auth.uid());

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────
-- 3. AGENCIES RLS (profiles now exists)
-- ─────────────────────────────────────────
drop policy if exists "agency_members_select" on public.agencies;
create policy "agency_members_select"
  on public.agencies for select
  using (id in (select agency_id from public.profiles where id = auth.uid()));

-- ─────────────────────────────────────────
-- 4. CLIENTS
-- ─────────────────────────────────────────
create table if not exists public.clients (
  id               uuid primary key default gen_random_uuid(),
  agency_id        uuid not null references public.agencies (id) on delete cascade,
  name             text not null,
  website          text,
  brand_name       text,

  -- Service package
  service_type     text not null default 'seo_geo'
    check (service_type in ('seo', 'geo', 'seo_geo')),

  -- Client profile
  country          text,
  industry         text,
  default_location text not null default 'ae'
    check (default_location in ('ae', 'us', 'uk', 'in', 'lk')),

  created_at       timestamptz not null default now()
);

alter table public.clients enable row level security;

drop policy if exists "clients_agency_all" on public.clients;
create policy "clients_agency_all"
  on public.clients for all
  using      (agency_id in (select agency_id from public.profiles where id = auth.uid()))
  with check (agency_id in (select agency_id from public.profiles where id = auth.uid()));

-- ─────────────────────────────────────────
-- 5. TRACKED KEYWORDS
-- ─────────────────────────────────────────
create table if not exists public.tracked_keywords (
  id         uuid primary key default gen_random_uuid(),
  client_id  uuid not null references public.clients   (id) on delete cascade,
  agency_id  uuid not null references public.agencies  (id) on delete cascade,

  keyword    text not null,

  -- Which pipeline runs for this keyword
  track_type text not null default 'both'
    check (track_type in ('seo', 'geo', 'both')),

  domain     text not null,
  brand      text,
  location   text not null default 'ae' check (location in ('ae', 'us', 'uk', 'in', 'lk')),
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),

  unique (client_id, keyword, domain, location)
);

alter table public.tracked_keywords enable row level security;

drop policy if exists "tracked_keywords_agency_all" on public.tracked_keywords;
create policy "tracked_keywords_agency_all"
  on public.tracked_keywords for all
  using      (agency_id in (select agency_id from public.profiles where id = auth.uid()))
  with check (agency_id in (select agency_id from public.profiles where id = auth.uid()));

-- ─────────────────────────────────────────
-- 6. SEARCH RESULTS (daily snapshots)
-- ─────────────────────────────────────────
create table if not exists public.search_results (
  id                 uuid primary key default gen_random_uuid(),
  agency_id          uuid not null references public.agencies         (id) on delete cascade,
  client_id          uuid not null references public.clients          (id) on delete cascade,
  tracked_keyword_id uuid          references public.tracked_keywords (id) on delete set null,

  keyword            text not null,
  domain             text not null,
  brand              text,
  location           text not null check (location in ('ae', 'us', 'uk', 'in', 'lk')),
  track_type         text not null default 'both' check (track_type in ('seo', 'geo', 'both')),

  -- SERP data (null for geo-only runs)
  rank_position      integer,
  rank_url           text,
  rank_title         text,
  serp_features      text[] default '{}',

  -- AIO data (null for seo-only runs)
  aio_present        boolean,
  aio_snippet        text,
  cited_domains      text[]  default '{}',
  client_cited       boolean,
  mentioned_in_text  boolean,

  -- Gap classification (computed). "Winning" labels require BOTH a citation
  -- link AND the brand named in the AIO answer text — citation alone is
  -- treated as a partial win (aligned_no_mention / geo_cited_no_mention).
  gap_label text generated always as (
    case
      -- SEO + GEO winning: ranked top-10 + cited + named in text
      when rank_position is not null and rank_position <= 10
           and coalesce(client_cited, false)
           and coalesce(mentioned_in_text, false)                                  then 'aligned'
      -- SEO + GEO partial: ranked + cited as source, but not named in text
      when rank_position is not null and rank_position <= 10
           and coalesce(client_cited, false)                                       then 'aligned_no_mention'
      -- SEO + GEO partial: ranked + brand named, no source citation
      when rank_position is not null and rank_position <= 10
           and coalesce(mentioned_in_text, false)                                  then 'ai_mentioned'
      when rank_position is not null and rank_position <= 10
           and aio_present = true                                                  then 'search_strong_ai_invisible'

      -- GEO-only winning: cited + named in text
      when rank_position is null
           and coalesce(client_cited, false)
           and coalesce(mentioned_in_text, false)                                  then 'geo_cited'
      -- GEO-only partial: cited as source but brand not named
      when rank_position is null
           and coalesce(client_cited, false)                                       then 'geo_cited_no_mention'
      -- GEO-only partial: brand named but not a source link
      when rank_position is null
           and coalesce(mentioned_in_text, false)                                  then 'geo_mentioned'
      when rank_position is null
           and coalesce(aio_present, false)                                        then 'geo_invisible'

      -- SEO-only snapshots
      when rank_position is not null and rank_position <= 10 and aio_present is null then 'seo_ranked'
      when rank_position is not null and rank_position >  10 and aio_present is null then 'seo_not_ranked'

      else 'weak_double_loss'
    end
  ) stored,

  created_at timestamptz not null default now()
);

alter table public.search_results enable row level security;

drop policy if exists "search_results_agency_all" on public.search_results;
create policy "search_results_agency_all"
  on public.search_results for all
  using      (agency_id in (select agency_id from public.profiles where id = auth.uid()))
  with check (agency_id in (select agency_id from public.profiles where id = auth.uid()));

-- ─────────────────────────────────────────
-- 7. INDEXES
-- ─────────────────────────────────────────
create index if not exists idx_sr_agency_client  on public.search_results   (agency_id, client_id, created_at desc);
create index if not exists idx_sr_keyword_domain on public.search_results   (keyword, domain, location, created_at desc);
create index if not exists idx_sr_gap            on public.search_results   (gap_label, created_at desc);
create index if not exists idx_tk_client         on public.tracked_keywords (client_id, is_active);
create index if not exists idx_tk_track_type     on public.tracked_keywords (client_id, track_type, is_active);
