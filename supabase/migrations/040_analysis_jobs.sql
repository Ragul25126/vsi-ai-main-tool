-- ============================================================
-- VSI Migration 040 — Analysis Jobs tracking for 5-stage setup
-- ============================================================

create table if not exists public.analysis_jobs (
  id              uuid primary key default gen_random_uuid(),
  agency_id       uuid not null references public.agencies(id) on delete cascade,
  client_id       uuid not null references public.clients(id) on delete cascade,
  status          text not null default 'in_progress'
                  check (status in ('in_progress', 'completed', 'failed')),
  stage           text not null default 'website_analysis'
                  check (stage in ('website_analysis', 'seo_analysis', 'competitor_analysis', 'geo_analysis', 'results_prep', 'completed')),
  stage_statuses  jsonb not null default '{"website_analysis": "pending", "seo_analysis": "pending", "competitor_analysis": "pending", "geo_analysis": "pending", "results_prep": "pending"}'::jsonb,
  error_message   text,
  stages_data     jsonb not null default '{}'::jsonb,
  requested_by    uuid references public.profiles(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  completed_at    timestamptz
);

create index if not exists idx_analysis_jobs_client_created
  on public.analysis_jobs (client_id, created_at desc);

alter table public.analysis_jobs enable row level security;

drop policy if exists "analysis_jobs_agency_all" on public.analysis_jobs;
create policy "analysis_jobs_agency_all"
  on public.analysis_jobs for all
  to authenticated
  using (agency_id = (select agency_id from public.profiles where id = auth.uid()))
  with check (agency_id = (select agency_id from public.profiles where id = auth.uid()));

drop policy if exists "analysis_jobs_super_admin_all" on public.analysis_jobs;
create policy "analysis_jobs_super_admin_all"
  on public.analysis_jobs for all
  to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

grant select, insert, update on public.analysis_jobs to authenticated;
grant all on public.analysis_jobs to service_role;
