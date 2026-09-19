# VSI Local Performance Plan

Date: 2026-09-19 · Branch: `feat/redesign-geo` @ `997245e` · Follows: [VSI_PERFORMANCE_AUDIT.md](VSI_PERFORMANCE_AUDIT.md), [VSI_PERFORMANCE_RESULTS.md](VSI_PERFORMANCE_RESULTS.md)

VSI is not deployed yet, so there is no production baseline. This plan covers what can be proven on this machine, and says plainly what cannot.

---

## 1. Current state (checked)

F2, F4, F5, F7 and F8 are committed and present in the code. None of them is repeated here.

| Fix | Commit | Confirmed in code |
|---|---|---|
| F2 | `33efe46` | `MessagesContext` pauses the 15 s sync in hidden tabs. `NotificationsContext` filters Realtime by `user_id`. Both use `coalesce()`. |
| F4 | `f6e7c6a` | `loadVisibility()` reads `search_results`, `tracked_keywords` and `clients` once per render. |
| F5 | `e65865e` | `loadEvidence()` runs its two queries in `Promise.all`. |
| F7 | `94631cc` | The sidebar Reports link points at the project's reports URL. |
| F8 | `3b265f7` | No 700 ms sign-in wait, no 120 ms fake prompt-test wait. |

The Welcome Back toast (uncommitted) shows from the dashboard with no delay. It is left as it is.

The working tree also holds uncommitted UI redesign edits from other work (`Sidebar.tsx`, `globals.css`, `intro/*`, `Page.tsx` and others). This plan does not touch those files.

---

## 2. How this was measured

| Source | What it gives |
|---|---|
| Fresh `next dev` server with its log captured | Server time per request, split into compile (`next.js`), middleware (`proxy.ts`) and application code |
| `curl`, 3 requests per route | Server time with no browser involved |
| Playwright + Chrome, real sign-in through the form, 4 sidebar passes, 9 hard loads, 35 s idle | Time to content, requests per navigation, duplicates, long tasks |
| Code reading (three separate inspections) | Auth chain, every Supabase query and its columns, indexes and RLS, server `await` order, timers, import chains |

**Limits.**
- There is no database locally. `NEXT_PUBLIC_SUPABASE_URL` is the placeholder `https://your-project.supabase.co`, so database and Auth latency is absent from every number.
- Production mode can't be measured locally. It refuses the local cookie session by design, and that was not worked around.
- The machine was busy during measurement. Another editing session was saving files in this repo, which makes the dev server recompile, and other browsers were using the same dev server. Hard-load numbers swing because of that. The conclusions below only use differences far larger than the noise.

---

## 3. Confirmed bottlenecks (measured here)

### C1. Every Supabase query against the placeholder host takes 7 s

- `/api/messages` and `/api/notifications` took **7.1–9.1 s on every call**, in every run. The server log puts all of it in application code (for example `application-code: 7.2s`, `proxy.ts: 8ms`).
- Cause: the Supabase query library retries failed `GET` requests 3 times with waits of 1 s, 2 s and 4 s (`@supabase/postgrest-js`: `DEFAULT_MAX_RETRIES = 3`, `getRetryDelay = min(1000 * 2^n, 30000)`). The placeholder host does not exist. The DNS lookup fails in about 10 ms, and then the library waits 7 s before giving up. The routes then return their in-memory fallback, which is what they would have returned anyway.
- Where it is felt locally:
  - both calls fire on every hard page load, and `/api/messages` again every 15 s;
  - each one holds a browser connection and a server request open for 7 s;
  - pages never reach "network idle" for about 8 s after load;
  - the unread badges can't settle for 7 s.
- The page loaders don't have this problem. They already return early in placeholder mode (`if (isDummySupabase()) return …`), which is why a quiet server renders pages in 72–380 ms.

### C2. Local slowness that is the dev server, not the application

- First visit to a route compiles it: 0.6–2.3 s per route on a quiet server. The first request after a cold start took **39.9 s**, of which 38.3 s was compile.
- Every file save by any editor recompiles, and the next requests pay for it. Page renders that take 72–160 ms on a quiet server took 1–8 s while another session was saving files.
- The dev server that had been running for hours answered single requests in 41–90 s and then stopped. A fresh one answered the same requests in 0.13–0.4 s.
- Dev mode never prefetches links, so the loading skeleton rarely shows and clicks feel frozen. Production prefetches.
- Dev ships about 7 MB of unminified JavaScript per hard load.

None of this exists in a production build, and no application change removes it.

### C3. The browser Supabase client is in the JavaScript of every dashboard page

Import chains from the dashboard layout:
- `NotificationsContext.tsx:4` → `@/lib/supabase/client` (Realtime);
- `FeedbackContext` → `FeedbackModal.tsx:11` → `@/lib/supabase/client` (used only inside the submit handler);
- `Sidebar`, `Topbar`, `WelcomeToast` → `lib/auth-client.ts` → `@/lib/supabase/client` (used only inside `logoutAndRedirect`).

The audit measured this library at 245 KB raw / 65 KB gzip. All three uses can load it at the moment it is needed instead of with the page.

---

## 4. Confirmed by code, cost not measurable here

### K1. Auth and session chain (the request flow)

```
middleware.ts:54        supabase.auth.getUser()          HTTP call to Supabase Auth
  └ layout + page       requireAgency() → getSession()   cache()'d: runs once per request
       auth.ts:140        supabase.auth.getUser()        HTTP call to Supabase Auth (second)
       auth.ts:142        profiles + agencies select     DB round trip (role, disabled flags, branding)
  └ layout              getProjectContext → loadProjects (cache()'d) ‖ agencies.max_clients
  └ layout              loadOnboardingState → 5 head counts ‖ project competitors
  └ page                getProjectContext (shares loadProjects) → page loaders
/api/notifications      middleware getUser() → route getUser() → query
/api/messages           middleware getUser() → query   (the route itself has no auth check)
```

- Layout and page share one `getSession()` per request. Layout loaders don't re-run on soft navigation.
- The real repetition is the **two `getUser()` calls per request**: one in the middleware, one in the render. `/api/notifications` also pays two.
- Locally the middleware costs **4–27 ms**, because with no Supabase session cookie `getUser()` returns without a network call. So the cost is zero here and unknown in production.
- `/api/messages` relies on the middleware for authentication. Narrowing the middleware matcher to skip `/api/*`, as the old F1 proposed, would leave that route without a session check. F1 as written is not safe.

**Decision: no authentication change now.** There is nothing to measure locally, and nothing here can prove that sign-in, expiry, disabled accounts and the single-account rule still hold against a real Supabase project.

### K2. `search_results` volume

`loadRecentResults` (`project-data-load.ts:47`): `client_id = ? and created_at >= now-120d order by created_at desc limit 3000`.

- The summaries use the newest row per search and engine, plus the 12 most recent check dates for the trend (`search.ts:67-119`, `geo.ts:192`, `geo.ts:296-303`). Nothing reads first-seen dates or a longer history.
- The 120-day window still matters. A search that hasn't been checked recently has its newest row far back, and "newest row per search" can't be written as a plain Supabase filter. Reading less would need a SQL function, which means a migration. **Not changed.**
- Columns selected but never read on these pages:
  - `id` and `gap_label` in `GEO_COLUMNS` (`geo-load.ts:12`);
  - `mentioned_in_text` and `client_cited` in the evidence query (`geo-load.ts:104`);
  - `domain` in `site_audits` (`site-audit/load.ts:6`).

  Dropping `id` and `gap_label` removes roughly 75 bytes per row, so about 225 KB of JSON per render for a project at the 3000-row limit.
- Larger reads that are mostly discarded, left alone because trimming them needs an extra query or a SQL function:
  - `site_audits.checks` JSON for 12 audits, where 1 is used;
  - `serp_results_json` for 400 rows on Competitors, where only the newest per search is used.

### K3. Index on `search_results`

Existing indexes: `(agency_id, client_id, created_at desc)`, `(keyword, domain, location, created_at desc)`, `(gap_label, created_at desc)`, `(client_id, keyword, created_at desc)` from migration 003, partial `(citation_strategy_status)`, `(ai_engine, created_at desc)`.

- The old audit missed `idx_sr_client_keyword_date (client_id, keyword, created_at desc)`. Its leading column serves `client_id = ?`, so the main query is **not** a full table scan, as the audit feared. It reads every index entry for the project and then sorts.
- `(client_id, created_at desc)` would let Postgres read the rows already in order and stop at the date limit, with no sort. That is a real gain for projects with a long history. It is an improvement, not a rescue.
- The row-level security rule filters `agency_id` through a sub-select OR'd with `is_super_admin()`. The planner can't turn that into an index condition, so `idx_sr_agency_client` doesn't help project-scoped reads.
- There is **no index that starts with `tracked_keyword_id`**. Four call sites read the newest row for one search that way (`task-outcome.ts:51`, `keyword-report-builder.ts:294` and `:345`, `chat-context.ts:76`).

**Decision: migration 038 is not created.** The need can't be proven without `EXPLAIN ANALYZE` on real data. The SQL to test later:

```sql
create index concurrently if not exists idx_sr_client_created
  on public.search_results (client_id, created_at desc);
create index concurrently if not exists idx_sr_tk_created
  on public.search_results (tracked_keyword_id, created_at desc);
```

### K4. Server waterfalls

Every page already runs its independent loaders in `Promise.all`. One real case remains:
- `clients/[id]/reports/page.tsx:43-56` looks up the project, waits, and only then starts the reports query and the setup counts. Neither of those uses the project row. That is one extra database round trip on every Reports visit.

`tasks/page.tsx:84` awaits `loadSetupStatus` after the tasks query, but the layout has already loaded it in the same request (`cache()`), so it costs nothing.

### K5. Notification Realtime (verified, no change needed)

- Inserts and updates are filtered by `user_id=eq.<signed-in user>`. Deletes are unfiltered because Postgres can't filter them.
- One channel per provider, and the provider sits in the layout, so it mounts once per session. The effect cleans up with `removeChannel`. Bursts are coalesced.
- To check in production: no migration adds `notifications` to the `supabase_realtime` publication or sets `replica identity full`. Unless that was done by hand in the Supabase dashboard, these events never arrive.

### K6. Artificial waits still in the code

- `messages/[id]/page.tsx:71`: **400 ms** "Generating PDF document..." before a text file that is built instantly.
- `MessageActionMenu.tsx:442`: **600 ms**, the same fake wait.
- `MessageActionMenu.tsx:435`: 300 ms before `window.print()`, so the toast can paint before the print dialog blocks the page. Kept.
- `NotificationDropdown.tsx:107`: 200 ms so the fade-out finishes before the list empties. Kept, it belongs to the animation.
- Debounces, toast timers, polling intervals and retry backoff are legitimate. There is no fake progress timer anywhere.

---

## 5. Fixes

| # | Fix | Evidence | Risk | Expected effect | Files |
|---|---|---|---|---|---|
| **L1** | Turn off query retries when Supabase is the placeholder. Real projects keep retries. | C1, measured | Very low. One option on the server client, active only for a placeholder URL. | Local `/api/messages` and `/api/notifications`: 7 s → under 0.3 s. None in production. | `src/lib/supabase/server.ts` |
| **L2** | Load the browser Supabase client when it is used: on logout, on feedback submit, and after mount for Realtime. Skip Realtime for a placeholder URL. | C3, measurable in the build | Low. Same calls, same behaviour. | The Supabase client leaves the JavaScript every dashboard page loads first. Size measured before and after. | `src/lib/auth-client.ts`, `src/contexts/NotificationsContext.tsx`, `src/components/FeedbackModal.tsx` |
| **L3** | Reports page: run the project lookup, the reports query and the setup counts together. | K4, code | Low. The not-found check still runs before anything renders, and the reports query keeps its own agency filter and RLS. | One database round trip fewer on Reports. Production only. | `src/app/dashboard/clients/[id]/reports/page.tsx` |
| **L4** | Stop selecting columns no page reads. | K2, code | Low. Covered by the loader tests and the typecheck. | Smaller `search_results` payloads. Production only. | `src/lib/geo-load.ts`, `src/lib/site-audit/load.ts` |
| **L5** | Remove the two fake "Generating PDF" waits. | K6, code | Very low | The download starts at once. | `src/app/dashboard/messages/[id]/page.tsx`, `src/components/messages/MessageActionMenu.tsx` |

## 6. Not doing, and why

| Item | Why not |
|---|---|
| F1 / any auth change | No measurable cost locally, can't be verified against real Supabase here, and the matcher part is unsafe for `/api/messages`. |
| F6 / migration 038 | Not provable without real data. SQL recorded in K3. |
| Removing or splitting framer-motion | It reaches every page only through `NotificationDropdown`, a 456-line component where the bell and the animated panel share state. Splitting it risks visible changes. No blocking work was measured in the browser (total blocking time 0–65 ms), so nothing justifies that risk yet. |
| Fewer `search_results` rows, trimming `checks` / `serp_results_json` | Needs a SQL function (migration) or extra queries. Behaviour risk with no way to measure the gain locally. |
| Link pending state (F9) | Needs `Sidebar.tsx`, which has someone else's uncommitted edits, and the missing skeleton is a dev-mode effect. |
| Any caching | No evidence that calls for it. |
