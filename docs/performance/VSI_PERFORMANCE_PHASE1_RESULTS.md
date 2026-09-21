# VSI performance, Phase 1 results

Date: 2026-09-20. Branch `feat/redesign-geo`. Nothing was committed or pushed. No database change, no authentication change, no middleware change.

Evidence labels: **[M]** measured, **[V]** verified in code, **[D]** derived by arithmetic, **[T]** covered by a test in the repository.

## 1. Summary

The dashboard now makes **one fewer sequential round trip** on every page except the empty Tasks state, and **two fewer requests** on most pages.

| | Before | After |
|---|---|---|
| Sequential server round trips per dashboard page load (layout + page, middleware included) | **5** | **4** (Tasks empty state: 5 -> 5) |
| Data requests in the layout | 10 | 8 |
| Requests for a typical page (layout + page) | 13-17 | 11-15 |

At the audit's measured cost of about 170 ms per trip from India to Tokyo, one trip is roughly **170 ms less per dashboard page load** [D]. The change is independent of that distance: it removes a trip whatever the trip costs.

**What this phase could not measure.** The before/after numbers below come from a **deterministic trace** that runs the real layout and page code against a recording stand-in for Supabase (a fixed 100 ms per request). They are exact for request counts and for the number of sequential trips, but they are **not** timings against the real Supabase project: no login was available (`VSI_PERF_EMAIL` / `VSI_PERF_PASSWORD` were never added) and the real database has no projects. Section 7 says how to take the real measurement.

## 2. A correction to the audit

The audit counted the page's own reads as a sixth trip after the layout's five. That was an over-count. Next.js renders a layout and its page **in parallel** (`node_modules/next/dist/docs/01-app/01-getting-started/06-fetching-data.md`: "By default, layouts and pages are rendered in parallel"), and the trace confirms it. The layout and every page share one chain of dependencies, so the real wait is the depth of that shared chain:

Before: `middleware getUser` -> `getUser` -> `profile` -> `projects list` -> (layout counts and the page's own reads, in parallel) = **5 trips**.

The two things that were **not** on that critical chain in any useful way were the projects read (it needs nothing from the profile) and, for the layout, the two counts nobody used. This phase fixes the first and removes the second.

## 3. What changed, request by request

### 3.1 The projects list (`clients`) ran after the profile lookup, and nothing needed it to

- **What it was doing:** `getProjectContext` read every project the user can see so the sidebar and every page know the active project. It was called only after `requireAgency()` had finished the `getUser` and profile requests, so it waited two trips for no reason. [V]
- **Redundant or sequential:** sequential. The only things it took from the session were the organization id and role, and they were used only to choose whether to add `.eq("agency_id", ...)` to the query and to label rows for platform admins. The query itself needs only the request's own credentials.
- **What changed:** `src/lib/project-context.ts`. The read is now `loadVisibleClients()` (no organization filter in the query), started by `startProjectLoad()` at the top of the layout and of every page, so it runs **alongside** `getUser` and the profile lookup. `getProjectContext` still needs the verified session, and it applies the same organization filter to the rows in code (`isSuperAdmin || !agencyId ? rows : rows.filter(c => c.agency_id === agencyId)`). A new helper `requireProjectContext()` does "start the read, verify the session, build the context" in one call; the ten pages that started with `requireAgency()` then `getProjectContext()` now use it.
- **Why the result is the same:** the columns, ordering, mapping and error handling are unchanged. For a member the database's row-level rules already return only their organization's projects, and the code filter reproduces the old query filter exactly; for a platform admin the query was already unfiltered. Nothing from the read is used until the session has been verified. [T] `project-context.test.ts` covers member, platform admin, load failure, cookie and override selection, one read per request, and that the read starts before the session lookup finishes.

### 3.2 Two counts in the layout that the layout never used

- **What they were doing:** the layout's onboarding state called `loadSetupStatus`, which runs five counts: active searches, stored results (`search_results`, exact), completed audits, running audits, and tasks. [V]
- **Consumers, traced:**

| Field | Read by |
|---|---|
| searches, completed audits, running audit, `known` | the layout's onboarding state (`onboarding-load.ts`) |
| stored results count | the client Reports page and the Tasks page (empty state only) |
| tasks count | the client Reports page only |

- **Redundant or sequential:** unused by the layout. It ran on every dashboard page, and the exact count over `search_results` is the most expensive of the five as data grows (30 ms for 3,600 rows in the audit's local test [M]).
- **What changed:** `src/lib/setup-status.ts` gains `loadOnboardingCounts` (searches and both audit counts, three queries). `loadSetupStatus` still returns exactly the same five fields, built from `loadOnboardingCounts` plus the two counts, so the pages that need all five ask for them and the shared three are read once. `src/lib/onboarding-load.ts` now calls `loadOnboardingCounts`.
- **Why the result is the same:** every field each consumer reads is computed as before [T `setup-status.test.ts`]. The pages that need the two counts now request them themselves in their own parallel batch.

### 3.3 The organization limit read started later than it needed to

- **What it was doing:** `loadAgencyLimits` reads `agencies.max_clients` (for the "add another website" cap). It shared a `Promise.all` with the projects read, which meant the onboarding step could not start until both finished. [V]
- **What changed:** `src/app/dashboard/layout.tsx`. The limits read now starts right after the session resolves and runs **alongside** the onboarding state instead of ahead of it. The query is unchanged.
- **Why the result is the same:** same query, same value, used the same way (`atClientCap`).
- **Not done here:** that same value could be read for free if `max_clients` were added to the profile lookup inside `getSession`. That is the authentication path, which is out of scope for this phase, so it is left for the next one.

### 3.4 The Reports page read the project twice

- **What it was doing:** `src/app/dashboard/clients/[id]/reports/page.tsx` ran `clients.select("id, name, website").eq("id", id)` although the layout had already loaded that row in the project list. [V]
- **What changed:** the page now looks the project up in the list from `requireProjectContext()`. If that list failed to load, it falls back to the original direct query, so a transient error behaves as before.
- **Why the result is the same:** the list holds exactly the projects this user is allowed to see, so "found in the list" and "the old query returned a row" are the same condition, including `notFound()` for a project the user cannot see.

### 3.5 What was not touched

`getSession`, the middleware, all row-level policies, the schema, the paid-API routes and their triggers, the polling endpoints, and every page's own data reads. No new cache was added; the only sharing is React's existing per-request `cache()`.

## 4. Requests before and after

**Method.** `src/app/dashboard/request-sequence.test.ts` and a larger one-off harness run the real layout and the page component together (as Next does) with a fake Supabase client that records each request's start and end and delays each by a fixed time. Auth is replaced by a stand-in that makes the same two requests `getSession` makes. The middleware's own `getUser` is one more trip before all of this, on both sides. Each scenario was run 7 times for timing; request counts and trip counts are deterministic. Pages return empty data, so page-internal steps that only occur with data (for example AI Visibility's second read) are not shown.

| Page | Requests before | after | Sequential trips before | after | Median wall at 100 ms/trip, before | after |
|---|---|---|---|---|---|---|
| Layout only | 10 | 8 | 4 | 3 | 435 ms | 326 ms |
| Overview | 17 | 15 | 4 | 3 | 432 | 323 |
| Site Audit | 12 | 10 | 4 | 3 | 432 | 328 |
| Search Visibility | 13 | 11 | 4 | 3 | 434 | 326 |
| AI Visibility | 15 | 13 | 4 | 3 | 433 | 324 |
| Competitors | 15 | 13 | 4 | 3 | 434 | 326 |
| Next Actions | 17 | 15 | 4 | 3 | 435 | 327 |
| Tasks (tasks exist) | 11 | 9 | 4 | 3 | 434 | 329 |
| Tasks (empty state) | 11 | 11 | 4 | **4** | 434 | 432 |
| Reports | 12 | 11 | 4 | 3 | 435 | 329 |
| AI Chat | 17 | 15 | 4 | 3 | 434 | 332 |
| Projects list | 13 | 11 | 4 | 3 | 433 | 326 |

Add one trip (the middleware's `getUser`) to every trip count: **5 -> 4**.

**The sequence for a typical page (Search Visibility), in ms from the start, at 100 ms per request:**

| Before | After |
|---|---|
| 0-107 `auth.getUser` | 0-106 `auth.getUser` and `clients` (projects), together |
| 107-214 `profiles` | 106-214 `profiles` |
| 214-324 `clients` (projects) and `agencies` | 215-322 everything else together: `agencies`, 3 counts, `project_competitors`, and the page's 3 reads |
| 324-433 everything else together: 5 counts, `project_competitors`, and the page's 3 reads | (done) |

**Why the empty Tasks state does not improve.** With no tasks it needs the stored-results count, which it can only know to ask for after the list came back empty. Before, that count came free from the layout; now it is a second small read. The result is the same length as before (4 trips), so it is no worse and only the first-time empty state is affected.

## 5. Functionality verification

- **Typecheck:** clean. **Lint** on all changed files: clean. **Production build:** succeeds (`next build`, 119 s); all dashboard routes remain dynamic.
- **Tests:** 201 pass (180 before this phase, plus 21 new: 8 in `project-context.test.ts`, 6 in `setup-status.test.ts`, 7 in `request-sequence.test.ts`). One unrelated existing test (`auth-session`, "admin APIs answer 401/403") timed out once in a busy run and passed 3 of 3 alone and in the next full run, so it is load-sensitive rather than broken.
- **The regression test really detects the old behaviour.** The same `request-sequence.test.ts` run against the original code fails 6 of 7 checks (trips 4 instead of 3, and the unused `search_results` count present) and passes on the new code. The seventh, the empty Tasks state, is identical by design.
- **Smoke test of the new production build:** `/login` returns 200; `/dashboard`, `/dashboard/tasks` and `/api/messages` without a session still redirect (307); a forged session cookie is still rejected. The only server errors logged were Supabase rejecting that forged cookie.
- **Not verified:** the authenticated pages in a browser against the real project (no login). The page components were exercised through the trace with empty data.

### Behaviour that is different, in full

1. **The layout's first-use guidance no longer depends on the results and tasks counts.** Before, if the stored-results or tasks count failed, the layout treated the whole setup state as unknown and showed no guidance. Now guidance depends only on the counts it actually uses (searches and audits). In the normal case nothing differs; in that rare error case the guidance still appears (correctly, from real counts) instead of being hidden.
2. **The empty Tasks state and the Reports page fetch two counts themselves** (results and tasks) instead of receiving them from the layout. Same values, requested later and only where they are shown.
3. **The organization filter moved from the query to the code** for the projects list (section 3.1). Rows returned to a member are identical. The database's row-level rules are untouched and still decide what any query can return.
4. **The projects read now starts before the session has been verified.** It runs under the caller's own credentials and the database's row-level rules, its result is unused until the session is verified, and unauthenticated requests never reach the layout because the middleware redirects them first.

## 6. Remaining bottlenecks (not addressed in Phase 1)

In the order the audit ranks them, updated:

1. **Distance to Supabase.** Each remaining trip still costs the full round trip to Tokyo (about 170 ms from India [M]). Running the app server in the same region remains the largest single gain and needs no code.
2. **Authentication is 2 of the 4 remaining trips.** The middleware calls `getUser`, then `getSession` calls it again and then reads the profile. Removing the duplicate is the next real win, and it is authentication work, deferred as instructed.
3. **The dashboard still cannot paint before its data arrives.** Nothing streams; all routes are dynamic.
4. **The messages and notifications polling** (unbounded `select *`, every 15 s, each request also paying the middleware's Auth call).
5. **Row-level policies that evaluate per row** (30 ms vs about 4 ms for a 3,600-row read locally [M]); a scaling issue that grows with data.
6. **Page-internal repeats, not touched:** Overview and Next Actions read `search_results` three times; the AI Chat page runs the whole overview fan-out to fill four checklist rows; AI Visibility makes a second sequential read for evidence when data exists; `/dashboard/reports` still runs the layout twice when reached through its redirect. Each needs its own equivalence check.
7. **Bundle size and the `/dashboard?q=` paid lookup**, as in the audit.

## 7. Taking the real-environment measurement

1. Add `VSI_PERF_EMAIL` and `VSI_PERF_PASSWORD` for an account that has an organization to the gitignored `.env.local`, and create one project (through the app or the reviewed seed).
2. Run the instrumented production server and the browser harness from the audit (instrumentation logs each incoming request and each server-side Supabase call, and blocks paid hosts).
3. Compare the per-request Supabase calls for `/dashboard`, `/dashboard/tasks`, `/dashboard/geo` and the Reports page against the counts in section 4. The expected change is one fewer sequential wave and two fewer requests.

## 8. Files changed

- `src/lib/project-context.ts`: session-independent projects read, `startProjectLoad`, `requireProjectContext`.
- `src/lib/setup-status.ts`, `src/lib/onboarding-load.ts`: layout counts split from the full status.
- `src/app/dashboard/layout.tsx`: start the projects read first; run limits alongside onboarding.
- `src/app/dashboard/page.tsx`, `check`, `services/seo`, `geo`, `competitors`, `next-actions`, `reports`, `chat`, `tasks`, `clients` (each `page.tsx`): use `requireProjectContext()`.
- `src/app/dashboard/clients/[id]/reports/page.tsx`: project taken from the list; direct read kept as a fallback.
- New tests: `src/lib/project-context.test.ts`, `src/lib/setup-status.test.ts`, `src/app/dashboard/request-sequence.test.ts`.

The trace harness used for the larger comparison (and the copy of the original sources it ran against) is in the session scratchpad, outside the repository.
