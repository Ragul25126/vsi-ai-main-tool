# VSI Local Performance Results

Date: 2026-09-19 · Branch: `feat/redesign-geo` (changes uncommitted) · Plan: [VSI_LOCAL_PERFORMANCE_PLAN.md](VSI_LOCAL_PERFORMANCE_PLAN.md)

**Status**
- One local bottleneck was found, fixed and measured: every Supabase read against the placeholder host waited 7 s. With it fixed, local navigation is about 5× faster in a controlled comparison.
- Every dashboard page now loads 64 KB (gzip) less JavaScript up front, measured in the production build.
- Three further changes are correct by code inspection but only pay off with a real database. **Their effect is not measured, and no production improvement is claimed.**
- Authentication, the database schema, caching and the UI are unchanged. No migration was created.

---

## 1. What was slow

On a quiet, warmed dev server, with Supabase set to the placeholder URL:

| | Measured |
|---|---|
| `/api/messages`, `/api/notifications` | **7.1–9.1 s every call**, on every page load, and `/api/messages` again every 15 s |
| Hard page load | TTFB 2.1 s, LCP 3.4 s, `load` 6.0 s (medians over 9 pages) |
| Sidebar navigation, warm | 1089 ms to content (median), page data request 304 ms |
| Sign-in to dashboard | 7.3 s to the dashboard URL, 20.7 s until the page went quiet |

Also slow, but caused by the dev server and not by the application:
- first visit to each route compiles it (0.6–2.3 s; 39.9 s for the first request after a cold start);
- every file save, by any editor, recompiles, and the next requests wait;
- a dev server that had run for hours answered single requests in 41–90 s and then stopped; a fresh one answered in 0.13–0.4 s;
- dev mode never prefetches links, so the loading skeleton rarely shows.

## 2. Root cause

The Supabase query library retries a failed `GET` three times, waiting 1 s, 2 s and 4 s (`@supabase/postgrest-js`: `DEFAULT_MAX_RETRIES = 3`, `getRetryDelay`). The placeholder host `your-project.supabase.co` doesn't exist. Its DNS lookup fails in about 10 ms, and then each read waits 7 s before giving up.

- The page loaders already skip the database in placeholder mode (`if (isDummySupabase()) return …`).
- The two API routes that the dashboard layout calls on every page did not.

So at almost any moment the dev server had one or two requests parked in a retry wait. While they were parked, everything else the dev server did was slower too (see the comparison below). I measured that effect but did not find its mechanism.

## 3. What was changed

| # | Change | Files |
|---|---|---|
| **L1** | The server Supabase client turns off query retries when the URL is a placeholder. Real projects keep the default retries. | `src/lib/supabase/server.ts` |
| **L2** | The browser Supabase client loads when it is used: on sign-out, on feedback submit, and after mount for notification Realtime. Realtime is skipped for a placeholder URL, where it could never connect. The delayed setup also stops a second subscription attempt in React Strict Mode. | `src/lib/auth-client.ts`, `src/components/FeedbackModal.tsx`, `src/contexts/NotificationsContext.tsx` |
| **L3** | Reports page: the project lookup, the reports read and the setup counts run together, not one after another. The not-found check still runs before anything renders, and the reports read keeps its own organization filter and RLS. | `src/app/dashboard/clients/[id]/reports/page.tsx` |
| **L4** | The AI visibility read (up to 3000 rows) no longer selects `id` and `gap_label`, which no page reads. The row type and two test helpers were updated to match. | `src/lib/geo-load.ts`, `src/lib/geo.ts`, `src/lib/geo.test.ts`, `src/lib/competitors.test.ts` |
| **L5** | Removed two fake "Generating PDF document..." waits (400 ms and 600 ms) in front of a text file that is built instantly. | `src/app/dashboard/messages/[id]/page.tsx`, `src/components/messages/MessageActionMenu.tsx` |

**Checked and left alone**
- **Notification Realtime:** inserts and updates are filtered to the signed-in user, there is one channel per session, it is removed on unmount, and bursts are coalesced. No fault found.
- **Other timers:** the 300 ms before `window.print()` lets the toast paint before the dialog blocks the page. The 200 ms in `NotificationDropdown` belongs to its fade-out. Debounces, toast timers, polling and retry backoff are legitimate. There is no fake progress timer.
- **Welcome Back toast:** untouched. It still shows from the dashboard with no delay.

## 4. Before and after

### 4.1 L1, controlled comparison

Same machine, same warmed dev server, runs minutes apart. Only the retry setting differs. Chrome via Playwright, real sign-in through the form, 9 hard loads, 3 sidebar passes. All values are medians.

| | Retries on (before) | Retries off (after) |
|---|---|---|
| `/api/messages`, `/api/notifications` | 8755 ms | **46 ms** |
| Hard load: TTFB | 2115 ms | **303 ms** |
| Hard load: LCP | 3368 ms | **532 ms** |
| Hard load: `load` event | 6029 ms | **486 ms** |
| Sidebar click to content (warm) | 1089 ms | **214 ms** |
| Page data (RSC) request wait | 304 ms | **36 ms** |
| Sign-in: submit to dashboard URL | 7290 ms | 3157 ms |
| Sign-in: until the page is quiet | 20678 ms | **4368 ms** |

Warm sidebar click to content, per page:

| Page | Before | After |
|---|---|---|
| Overview | 803 ms | 186 ms |
| Site Audit | 1686 | 289 |
| Search Visibility | 1077 | 225 |
| AI Visibility | 872 | 203 |
| Competitors | 893 | 206 |
| Next Actions | 690 | 214 |
| Tasks | 721 | 222 |
| Reports | 1204 | 201 |

- An earlier, uncontrolled pair of 4-pass runs gave the same picture: APIs 7345 → 291 ms, warm navigation 510–1331 → 173–285 ms, idle `/api/messages` polls 7.2 s → 50–75 ms. That pair is not the headline because another session was saving files during its "before" run.
- The API responses are byte-for-byte the same before and after: `{"success":true,"messages":[]}` and `{"success":true,"notifications":[]}`.
- **This is a local-only gain.** With a real Supabase URL the setting stays on and nothing changes.

### 4.2 L2, JavaScript loaded up front (production build)

Client chunks per route, excluding the shared framework (446 KB raw / 130 KB gzip, unchanged).

| Route | Before raw / gzip | After raw / gzip |
|---|---|---|
| `/dashboard` | 604 / 175.1 KB | **359 / 110.7 KB** |
| `/dashboard/check` | 687 / 198.9 KB | **442 / 134.6 KB** |
| `/dashboard/geo` | 652 / 189.3 KB | **407 / 125.0 KB** |
| `/dashboard/tasks` | 635 / 184.7 KB | **390 / 120.3 KB** |
| Up-front chunks containing the Supabase client | 64.6 KB gzip | **0** |

- That is about 245 KB raw / 64 KB gzip (37 %) less on every dashboard page. The whole difference is the Supabase client chunk.
- With a real Supabase project the client still downloads once per page for Realtime, but after the page is up and off the hydration path. It is then cached.
- framer-motion is unchanged (73 KB gzip of chunks still contain it).
- What this buys on a phone is **not measured**. On this laptop the browser showed almost no blocking work either way (total blocking time 0–65 ms).

### 4.3 L3, L4, L5

- **L3:** one database round trip fewer on Reports. Not measurable without a database.
- **L4:** about 75 bytes less per row, so roughly 225 KB less JSON per render for a project at the 3000-row limit. Not measurable without a database.
- **L5:** the download starts 400 / 600 ms sooner. That is simply the removed wait.

## 5. Tests

| Check | Result |
|---|---|
| `npx tsc --noEmit` | pass |
| `npm test` | 127 / 127 pass |
| `npm run lint` | 50 errors, 108 warnings, the same as before this work. None is on a line I changed. |
| Browser smoke run | no problems |

The smoke run covered:
- **Rendering:** 20 pages (the nine dashboard pages, Messages, and the ten Super Admin sections) each return 200, show their heading, and have no error boundary or page errors.
- **Navigation:** sidebar clicks through all nine dashboard pages reach the right URL and heading, so project context holds.
- **Mobile:** no horizontal overflow on 12 pages at 390 px.
- **Auth:** a signed-out visit to `/dashboard` redirects to `/login`. Sign-out from the sidebar reaches `/login` and clears the session cookie. This exercises the on-demand Supabase client.
- **Feedback:** the modal opens from the pilot banner with no page errors.
- **Bundle:** a dashboard load does not request the Supabase library.

**Not verified:**
- Feedback submit and Realtime against a real Supabase project.
- The Reports page with real rows. Its only reachable state locally is not-found, which is unchanged.
- The with-data states of every page. Locally only the no-project state renders. The changed loaders are covered by the mocked loader tests.

## 6. Build result

`next build` passes: compiled in 44 s, 36 static pages generated. One earlier attempt stopped with "Another next build process is already running", because a second session was building at the same moment. It passed once that build finished.

## 7. Remaining bottlenecks (local)

- **Dev mode itself:** compile on first visit, recompile on every save, no prefetch, about 7 MB of unminified JavaScript per hard load. No application change removes this. A production build can't be used locally, because production mode refuses the local cookie session by design. To feel real speed locally, point `.env.local` at a real development Supabase project and run `next build && next start`.
- **A long-running dev server degrades.** Restart it when single requests start taking seconds.
- **Two sessions on one dev server** make each other slow: every save in one recompiles for the other.
- **framer-motion** still ships on every dashboard page, only through `NotificationDropdown`. Not changed: splitting that 456-line component risks visible differences, and no blocking work was measured that would justify it.

## 8. Still needs production measurement

| Item | State | What decides it |
|---|---|---|
| **F1 auth round trips** | Not implemented. The chain is mapped in the plan: two `getUser()` calls per request (middleware and render), and three network steps before page data. | Real Auth latency, and the JWT key type (asymmetric or legacy). Note `/api/messages` relies on the middleware for its session check, so the old "skip `/api/*` in the matcher" idea is unsafe as written. |
| **F6 index** | Not created. The old audit missed `idx_sr_client_keyword_date (client_id, keyword, created_at desc)`, so the main query is an index scan plus a sort, not a full table scan. | `EXPLAIN ANALYZE` on real data for `(client_id, created_at desc)`. Also test `(tracked_keyword_id, created_at desc)`: no index starts with that column, and four call sites filter on it. The SQL is in the plan. |
| **`search_results` volume** | Not changed. Pages read up to 3000 rows over 120 days and use the newest row per search plus 12 dates. | Reading less needs a SQL function, which means a migration. Measure the payload size and time first. |
| **`site_audits.checks` and `serp_results_json`** | Not changed. 12 and 400 rows of large JSON are read where 1 and the newest per search are used. | Payload sizes on real data. |
| **Realtime publication** | No migration adds `notifications` to `supabase_realtime` or sets `replica identity full`. | Check the Supabase dashboard. If it is missing, notification events never arrive. |
| **Loading skeleton on navigation (F9)** | Not changed. | Whether production prefetch shows it promptly. |
| **L2 on real devices** | Size measured, effect not. | LCP and blocking time on a mid-range phone. |

**Found on the way, not a performance item:** `chatgpt_entity_match` is read by `geo.ts:259` but is not in the selected columns, so the "entity" block on AI Visibility can never appear. It is left alone because fixing it changes what the page shows. This comes from reading the code and was not checked against real data.
