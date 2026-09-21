-- ============================================================
-- VSI Migration 036: competitors a project owner chooses
-- ============================================================
-- Until now VSI only knew the competitors it discovered in Google results
-- and AI answers. This table stores the competitors the user adds for a
-- project, so Competitor Analysis, AI Visibility, the Overview, Reports,
-- Next Actions and AI Chat can all compare against the same list.
--
-- One row per (project, domain). Domains are stored lowercase without
-- protocol or "www." (the API normalises them before insert).
-- At most 10 competitors per project, enforced below and in the API.

create table if not exists public.project_competitors (
  id          uuid primary key default gen_random_uuid(),
  agency_id   uuid not null references public.agencies(id) on delete cascade,
  client_id   uuid not null references public.clients(id) on delete cascade,
  domain      text not null
              check (domain = lower(domain) and char_length(domain) between 4 and 253 and domain !~ '[/:\s]'),
  name        text check (name is null or char_length(name) <= 120),
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  unique (client_id, domain)
);

create index if not exists idx_project_competitors_client
  on public.project_competitors (client_id, created_at);

-- Keep the list short and useful.
create or replace function public.enforce_project_competitor_limit()
returns trigger
language plpgsql
as $$
begin
  if (select count(*) from public.project_competitors where client_id = new.client_id) >= 10 then
    raise exception 'A project can have at most 10 competitors' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_project_competitor_limit on public.project_competitors;
create trigger trg_project_competitor_limit
  before insert on public.project_competitors
  for each row execute function public.enforce_project_competitor_limit();

alter table public.project_competitors enable row level security;

-- Organization members see and manage competitors for their own projects.
-- Insert also checks that the project really belongs to the caller's
-- organization, so a row can't be attached to another organization's project.
drop policy if exists "project_competitors_agency_select" on public.project_competitors;
create policy "project_competitors_agency_select"
  on public.project_competitors for select
  to authenticated
  using (agency_id = (select agency_id from public.profiles where id = auth.uid()));

drop policy if exists "project_competitors_agency_insert" on public.project_competitors;
create policy "project_competitors_agency_insert"
  on public.project_competitors for insert
  to authenticated
  with check (
    agency_id = (select agency_id from public.profiles where id = auth.uid())
    and exists (
      select 1 from public.clients c
      where c.id = client_id and c.agency_id = project_competitors.agency_id
    )
  );

drop policy if exists "project_competitors_agency_delete" on public.project_competitors;
create policy "project_competitors_agency_delete"
  on public.project_competitors for delete
  to authenticated
  using (agency_id = (select agency_id from public.profiles where id = auth.uid()));

drop policy if exists "project_competitors_super_admin_all" on public.project_competitors;
create policy "project_competitors_super_admin_all"
  on public.project_competitors for all
  to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

grant select, insert, delete on public.project_competitors to authenticated;
grant all on public.project_competitors to service_role;
