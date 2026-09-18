-- ============================================================
-- VSI Migration 035 — Site Audit history
-- ============================================================
-- One row per audit run of a project's website. `checks` holds the
-- structured result of every check (status, affected pages, measured
-- values); `pages` holds the per-page facts the checks were computed from.
-- Keeping every run gives the audit its history (score over time) and
-- lets a later run show which problems were fixed.

create table if not exists public.site_audits (
  id              uuid primary key default gen_random_uuid(),
  agency_id       uuid not null references public.agencies(id) on delete cascade,
  client_id       uuid not null references public.clients(id) on delete cascade,
  status          text not null default 'running'
                  check (status in ('running', 'completed', 'failed')),
  domain          text not null,
  score           integer check (score is null or (score between 0 and 100)),
  pages_scanned   integer not null default 0,
  checks          jsonb not null default '[]'::jsonb,
  pages           jsonb not null default '[]'::jsonb,
  error_message   text,
  requested_by    uuid references public.profiles(id) on delete set null,
  created_at      timestamptz not null default now(),
  completed_at    timestamptz
);

create index if not exists idx_site_audits_client_created
  on public.site_audits (client_id, created_at desc);

-- At most one audit running per project at a time (prevents duplicate jobs).
create unique index if not exists uq_site_audits_one_running
  on public.site_audits (client_id)
  where status = 'running';

alter table public.site_audits enable row level security;

drop policy if exists "site_audits_agency_select" on public.site_audits;
create policy "site_audits_agency_select"
  on public.site_audits for select
  to authenticated
  using (agency_id = (select agency_id from public.profiles where id = auth.uid()));

drop policy if exists "site_audits_agency_insert" on public.site_audits;
create policy "site_audits_agency_insert"
  on public.site_audits for insert
  to authenticated
  with check (agency_id = (select agency_id from public.profiles where id = auth.uid()));

drop policy if exists "site_audits_agency_update" on public.site_audits;
create policy "site_audits_agency_update"
  on public.site_audits for update
  to authenticated
  using (agency_id = (select agency_id from public.profiles where id = auth.uid()))
  with check (agency_id = (select agency_id from public.profiles where id = auth.uid()));

drop policy if exists "site_audits_super_admin_all" on public.site_audits;
create policy "site_audits_super_admin_all"
  on public.site_audits for all
  to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

grant select, insert, update on public.site_audits to authenticated;
grant all on public.site_audits to service_role;
