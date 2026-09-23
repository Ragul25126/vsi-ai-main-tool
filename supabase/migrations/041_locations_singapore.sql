-- Widen location check constraints to include Singapore ('sg')
-- matching the app-side LOCATIONS map (ae, us, uk, in, lk, sg).

alter table public.clients
  drop constraint if exists clients_default_location_check;
alter table public.clients
  add  constraint clients_default_location_check
  check (default_location in ('ae', 'us', 'uk', 'in', 'lk', 'sg'));

alter table public.tracked_keywords
  drop constraint if exists tracked_keywords_location_check;
alter table public.tracked_keywords
  add  constraint tracked_keywords_location_check
  check (location in ('ae', 'us', 'uk', 'in', 'lk', 'sg'));

alter table public.search_results
  drop constraint if exists search_results_location_check;
alter table public.search_results
  add  constraint search_results_location_check
  check (location in ('ae', 'us', 'uk', 'in', 'lk', 'sg'));
