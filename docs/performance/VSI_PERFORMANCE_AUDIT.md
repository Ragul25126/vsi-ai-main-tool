# VSI Performance Audit

Status: audit only. No performance code has been changed yet. Every fix below is a proposal waiting for approval.

Date: 2026-09-19 · Branch: `feat/redesign-geo` @ `ddb4710`

---

## 1. How this was measured, and what it cannot tell us

| Source | What it measures | Environment |
|---|---|---|
| Playwright script (Chrome, 1440×900) | Hard loads, sidebar navigations (2 passes), 35 s idle, requests per navigation | `next dev` (Turbopack), localhost:3000 |
| Dev server log | Server time per request, split into Next.js / proxy / application code | `next dev` |
| `next build` output + client reference manifests | JS shipped for `/dashboard` routes | Production build |
| Code reading | Query shapes, request waterfalls, layout providers, indexes | Source + `supabase/migrations` |

**Limits. Read these before the numbers.**

1. **No real database was involved.** Locally, `NEXT_PUBLIC_SUPABASE_URL` is a placeholder, so pages render their "not connected" or empty states. The measured server times therefore **leave out all Supabase latency**, which in production is likely the largest cost (see section 4). The RSC payloads (5.6–8.1 KB) are also far smaller than a project with real data would produce.
2. **Production navigation was not measured.** Production mode refuses the local cookie session by design (this is the fix from `98e3303`). A temporary override for measurement was blocked as a security weakening, and I did not work around it. Section 9 lists two ways to get production numbers.
3. **Dev mode differs from production in ways that matter here:**
   - `<Link>` prefetching is **production only** (`node_modules/next/dist/docs/01-app/03-api-reference/02-components/link.md`).
   - In dev, every first visit to a route compiles it (890–1926 ms in the log).
   - Dev chunks are unminified.

   Dev timings are an upper bound for the parts they cover, and a lower bound overall because the database is missing.

---

## 2. Observed problem

The user-visible complaint is that "everything feels slow". Here is what reproduces locally.

- **Clicks feel frozen.** After a sidebar click, nothing changes on screen for 320–821 ms. Then the whole page swaps in at once. In the 18 measured navigations the `loading.tsx` skeleton **never appeared**.
- **Hard loads take 1.5–2.6 s to `load`**. They do not reach network idle for about **10 s**, because two background API calls hang (below).
- **Background traffic never stops.** Every page load fires `/api/messages` and `/api/notifications`. `/api/messages` then fires again every 15 s for as long as the tab is open.

---

## 3. Measurements (development, no database)

### 3.1 Hard loads (full document request)

| Page | TTFB | DOMContentLoaded | load | Until network idle |
|---|---|---|---|---|
| Overview | 703 ms | 1191 | 1719 | 9921 |
| Site Audit | 2196 ms | 2344 | 2579 | 10541 |
| Search Visibility | 1507 ms | 2012 | 2029 | 10005 |
| AI Visibility | 1506 ms | 1641 | 1931 | 9900 |
| Competitors | 1318 ms | 1485 | 1651 | 9511 |
| Next Actions | 1714 ms | 1892 | 2131 | 10029 |
| Tasks | 1114 ms | 1253 | 1517 | 9388 |
| Reports | 1190 ms | 1387 | 1567 | 9479 |
| AI Chat | 1335 ms | 1478 | 1780 | 9646 |

The TTFB column includes first-visit dev compilation. The roughly 7.5 s gap between `load` and network idle is `/api/messages` and `/api/notifications`, **7.1–7.2 s each**. Locally they are waiting on the unreachable placeholder Supabase host. In production they will be faster, but they still run on every page load (section 4.3).

### 3.2 Client navigation (sidebar clicks, pass 2 = warm)

| Target | URL changes | Content shown | Skeleton shown | RSC request |
|---|---|---|---|---|
| Site Audit | 694 ms | 767 ms | never | 367 ms |
| Search Visibility | 760 | 785 | never | 480 |
| AI Visibility | 543 | 558 | never | 280 |
| Competitors | 479 | 498 | never | 234 |
| Next Actions | 432 | 450 | never | 228 |
| Tasks | 472 | 486 | never | 288 |
| Reports | 408 | 421 | never | 187 |
| AI Chat | 320 | 331 | never | 150 |
| Overview | 424 | 445 | never | 151 |

Every navigation made:
- one RSC request (5.6–8.1 KB);
- 4–6 static chunk requests, which are dev-only and would be prefetched or cached in production;
- one `/logo.png` request. In dev this is not served from cache, so check it in production before acting on it.

The dev server log puts warm application code for these requests at **88–350 ms**, which is time spent in auth and layout work with *no* database round trips.

### 3.3 Idle (35 s on Site Audit)

Two `/api/messages` requests (the 15 s poll) and nothing else. Each took about 7.2 s locally.

### 3.4 JavaScript shipped (production build)

| | Raw | Gzip |
|---|---|---|
| Framework (`rootMainFiles`) | 446 KB | 130 KB |
| `/dashboard` route client chunks (10 files) | 602 KB | 174 KB |
| of which: Supabase JS client (GoTrue + Realtime + PostgREST) | 245 KB | 65 KB |
| of which: framer-motion | 117 KB | 39 KB |
| of which: AnimatePresence + Supabase + ChatFloating chunk | 63 KB | — |
| of which: AnimatePresence + lucide chunk | 46 KB | — |

Roughly **104 KB gzip (about 60 %) of the dashboard's route JS** is the browser Supabase client and framer-motion. Both load on **every** dashboard page, because providers in the shared layout and the Topbar pull them in (section 4.4).

---

## 4. Bottlenecks, ranked

Each item is marked with the kind of evidence behind it:

- **[measured]**: seen in the numbers above
- **[code]**: found by reading the code, cost not measured here
- **[prod-unknown]**: its real cost depends on production latency we don't have

### 4.1 Serial server work before any page data loads [code + prod-unknown] (highest impact)

Every dashboard request, including each soft navigation, runs this chain **in order** before the page's own queries start:

```
middleware.ts        supabase.auth.getUser()        → HTTP call to Supabase Auth
getSession()         supabase.auth.getUser()        → HTTP call to Supabase Auth (again)
                     profiles + agencies select      → DB round trip
getProjectContext()  clients select  ‖  agencies.max_clients      → DB round trip (layout, parallel)
loadOnboardingState  5 head counts  ‖  project competitors        → DB round trip (layout, hard loads)
page loader          search_results / tracked_keywords / ...      → DB round trip(s)
```

- `getSession` and `loadProjects` are wrapped in React `cache()`, so layout and page share one call **within a request**. The two `getUser()` calls are still separate network requests: one in middleware, one in the render.
- The middleware matcher covers everything except static files. So `/api/messages` polls, `/api/notifications` and every RSC request also pay a Supabase Auth round trip, and API routes then call `getUser()` a second time.
- That makes **4–5 sequential network round trips on a soft navigation and 5–6 on a hard load**, before counting anything a page adds. Given Vercel and Supabase region placement, each is typically tens of ms and sometimes more. This is the most likely main cause of production slowness, but we have **not measured it** (section 9).

`@supabase/auth-js` 2.112.4 (installed) supports `auth.getClaims()`. It verifies the JWT signature locally when the project uses asymmetric JWT signing keys, which removes the Auth HTTP call. It falls back to a network call on legacy HS256 secrets, so the gain depends on the project's JWT key setting (section 9).

### 4.2 No immediate feedback on navigation [measured in dev, production unverified]

- The skeleton never appeared, and the screen stayed frozen for 320–821 ms. `src/app/dashboard/loading.tsx` exists and is correct.
- The docs explain why: dynamic routes show `loading.tsx` instantly only when it has been **prefetched**, and prefetching only runs in production. So in production the skeleton *should* appear. **This must be verified in production before any change is made.**
- If it is confirmed working in production, the only remaining gap is slow networks, where the prefetch hasn't finished yet. The documented tool for that is `useLinkStatus` on the sidebar links: a small pending state on the clicked item, not a spinner.

### 4.3 Layout-level background traffic on every page [measured + code]

| Source | What it does | Problem |
|---|---|---|
| `MessagesContext` (dashboard layout) | `GET /api/messages` on mount, then **`setInterval` every 15 s** | Polls forever, even on pages that don't show messages. Only the Topbar badge and the Messages pages use it. |
| `/api/messages` GET | `messages.select("*")` with **no limit** | Returns every message and every column on each poll. |
| `NotificationsContext` (dashboard layout) | `GET /api/notifications` on mount **plus** a Realtime subscription | Subscribes to `postgres_changes` on the **whole `notifications` table** with no `user_id` filter, so any row change for any user triggers a refetch for every open tab. |
| `/api/notifications` GET | `notifications.select("*")`, no limit | Same as above. |

Each poll also pays the middleware Auth call (4.1). Over one hour, an idle tab makes about 240 message requests.

### 4.4 Heavy client JS on every page [measured]

About 104 KB gzip of dashboard JS comes from two libraries, loaded app-wide.

**The browser Supabase client (65 KB gzip)** reaches every page through two layout-level imports:
- `NotificationsContext` (Realtime);
- `lib/auth-client` → `logoutAndRedirect` (Sidebar).

It is also imported by `FeedbackModal` (a layout provider), `AgencySettingsForm`, `FrequencySelector`, `AddSearchesForm`, `AddClientForm` and a few pages. Only logout and Realtime need it on every page. Logout could be a server route. Realtime is questionable anyway (4.3).

**framer-motion (39 KB gzip)**:
- `NotificationDropdown` (in the Topbar on every page) and `ChatFloating` pull it in;
- used for dropdown and panel enter/exit animations that CSS transitions already in the design system can do.

The JS has to download, parse and hydrate on every hard load. This hurts most on mid-range phones.

### 4.5 Repeated large reads of `search_results` [code + prod-unknown]

`search_results` is the largest table (one row per keyword per engine per check). Pages read it like this:

| Page | Reads of `search_results` | Rows each |
|---|---|---|
| Overview | `loadGeo` + `loadSearch` + `loadPageComparisons` | up to 3000 + 3000 + 60 |
| Next Actions, AI Chat | `loadProjectOverview`, the **same** reads as Overview | same |
| Competitors | `loadGeo` + `loadSearch` + `loadSerpSnapshots` (includes the large `serp_results_json`) | 3000 + 3000 + 400 |
| AI Visibility | `loadGeo` + `loadPageComparisons`, then `loadEvidence` (below) | 3000 + 60 + N |
| Search Visibility | `loadSearch` | 3000 |

There are two duplicate reads on the same pages:
- `loadGeo` and `loadSearch` each read `clients` and `tracked_keywords` for the same project;
- they read `search_results` twice with overlapping filters.

`loadEvidence` (`src/lib/geo-load.ts:76`) runs **after** the summary resolves, and then runs one query per picked keyword **inside a `for` loop with `await`**. That makes a serial waterfall of 1 + N round trips on AI Visibility.

### 4.6 Missing index for the most common filter [code]

Almost every per-project query filters `search_results` by `client_id = ? and created_at >= ? order by created_at desc`. The existing indexes are:
- `idx_sr_agency_client (agency_id, client_id, created_at desc)`, which leads with `agency_id` and so is not usable for a `client_id`-only predicate without a skip scan (Postgres doesn't do skip scans before v18);
- `idx_sr_keyword_domain`, `idx_sr_gap`, `idx_sr_ai_engine`.

So with real data these queries likely do a sequential or bitmap scan of the table, filtered by RLS. A `(client_id, created_at desc)` index is justified. It should be confirmed with `EXPLAIN ANALYZE` on production data, which I cannot run.

### 4.7 Smaller items [code]

- **`getSetting()`** (`src/lib/settings.ts`): one uncached query per call. `loadGeo` calls it once per render, so pages that call `loadGeo` pay it every time. Wrapping it in `cache()` is a safe per-request dedupe.
- **Reports redirect hop**: `/dashboard/reports` redirects to `/dashboard/clients/<id>/reports`. The sidebar links to the first URL, so each click costs one extra server render and round trip before the real page starts. The nav can link straight to the project URL (`nav.ts:97`).
- **Tasks**: `limit(1000)` with the full column list. This is acceptable for now; no change is proposed without data showing it's slow.

### 4.8 Artificial delays on the critical path [code]

| Where | Delay | Verdict |
|---|---|---|
| `LoginPage.tsx:45` | **700 ms** `setTimeout` before redirecting after a successful login | Remove it. It's pure waiting, and the success toast can show on the next page instead. |
| `dashboard/prompts/page.tsx:211` | 120 ms fake "simulation" loading | Remove it. It fakes work that is synchronous. |
| `NotificationDropdown.tsx:107` | 200 ms before clearing, to let a fade-out finish | Minor, but user-initiated. Fold it into the CSS transition when framer-motion is removed. |
| `MessageActionMenu` / `messages/[id]` print and download | 300 ms before `window.print()` / download | Minor, user-initiated. Can go. |
| `ChatFloating` retry backoff, `TableToolbar` 300 ms search debounce, toast auto-dismiss timers | — | Legitimate. Keep them. |

---

## 5. Not a problem (checked)

- **Layouts are not refetched on soft navigation.** The dashboard layout's `getProjectContext`, agency limits and onboarding state do not re-run on sidebar clicks. Only the page segment is requested, as the single 5–8 KB RSC request per click shows.
- **Per-request dedup already exists** for `getSession`, `loadProjects`, `loadSetupStatus` and `loadProjectCompetitors` (React `cache()`).
- **Page loaders already run in parallel** where they are independent (`Promise.all` on Overview, Site Audit, AI Visibility, Competitors). `loadEvidence` is the exception.
- **Super Admin** pages use paginated queries and summary RPCs, and none of the layout-level providers above apply to them. `ChatFloating` was already removed from the admin layout.

---

## 6. Proposed fixes, in order

Each fix below states its expected effect as a direction, not a number. The measured before/after goes in `VSI_PERFORMANCE_RESULTS.md`.

| # | Fix | Addresses | Risk |
|---|---|---|---|
| **F1** | **Middleware:** narrow the matcher so `/api/*` routes (which authenticate themselves) and prefetch-irrelevant paths skip the middleware Auth call. Switch the middleware session check from `getUser()` to `getClaims()`. Keep `getUser()` in `getSession()`, so the authoritative check, including disabled accounts, still happens server-side on every render. | 4.1 | Medium. It's security-sensitive, so it needs tests that show forged, expired and disabled sessions are still rejected. |
| **F2** | **Messages and notifications:** stop the 15 s poll. Load the unread count once, then refresh it on window focus or visibility and after the user's own actions. Scope the Realtime subscription to `user_id=eq.<id>`, or drop Realtime in favour of the same focus refresh. Replace `select("*")` with explicit columns and add a `limit`. | 4.3 | Low |
| **F3** | **Client bundle:** remove framer-motion from the Topbar dropdown and ChatFloating in favour of the existing CSS transitions, keeping the same look. Move logout to a server route so the Sidebar doesn't need the browser Supabase client. Lazy-load the browser client only where it is used, such as forms and FeedbackModal on open. | 4.4 | Low to medium. Needs visual regression screenshots. |
| **F4** | **Shared project data per request:** have `loadGeo` and `loadSearch` share one `clients` / `tracked_keywords` read through a `cache()`'d loader, and trim `search_results` selects to the columns each view uses. | 4.5 | Low |
| **F5** | **`loadEvidence`:** fetch the evidence rows for all picked keywords in **one** query (`in("tracked_keyword_id", ids)`), not an awaited loop. | 4.5 | Low |
| **F6** | **Migration 038:** `create index concurrently if not exists idx_sr_client_created on search_results (client_id, created_at desc)`. Delivered as a migration file only; **you** apply it. | 4.6 | Low. Additive index. |
| **F7** | `cache()` around `getSetting`, and link the sidebar Reports item straight to the project URL. | 4.7 | Low |
| **F8** | Remove the 700 ms login delay and the 120 ms fake prompt-test delay. | 4.8 | Low |
| **F9** | **Navigation feedback:** only if production shows the skeleton doesn't appear or appears late, add a `useLinkStatus` pending state to the sidebar items. Otherwise nothing. | 4.2 | Low |

**Explicitly not proposed:**
- `memo` or `useMemo` sweeps (no render cost was measured);
- caching page data across users or requests (it's per-tenant data under RLS);
- raising timeouts;
- adding spinners;
- removing illustrations or any redesign UI.

---

## 7. Dev vs production summary

| Finding | Seen in dev | Expected in production |
|---|---|---|
| No skeleton on navigation | Yes, every time | Probably shown, since prefetch is production only. **Verify.** |
| Dev compile / chunk loads per navigation | Yes (890–1926 ms first visit) | No |
| Auth round trips before data (4.1) | Hidden (placeholder DB) | Yes. Likely the dominant cost. |
| `search_results` scans (4.5, 4.6) | Hidden | Yes, and grows with data volume |
| Messages poll and notifications Realtime (4.3) | Yes | Yes |
| 104 KB gzip of Supabase + framer-motion on every page (4.4) | Yes (production build) | Yes |

---

## 8. Plan for proving the fixes

1. **Before any fix:** capture a production baseline for the same 9 routes, covering:
   - hard-load TTFB and LCP;
   - soft-navigation time to content;
   - requests per navigation and idle requests.
2. **One logical commit per fix (F1–F8).** After each commit:
   - `npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run build`;
   - check the bundle sizes from the build manifest.
3. **Regression pass** with screenshots at desktop and mobile widths:
   - every dashboard page in its three data states;
   - Super Admin pages;
   - login and logout;
   - notifications and messages badges.
4. **Results:** write `docs/performance/VSI_PERFORMANCE_RESULTS.md` with the before and after tables. Only measured numbers go in it. Anything unmeasured is marked as such.

---

## 9. What I need from you

The database-bound costs (4.1, 4.5, 4.6) are the likely main cause of production slowness, and **I can't measure them from this machine**. Choose one:

- **A. (Recommended) A staging or production URL plus a test account** (any non-admin user with one project that has data). I run the same Playwright script against it before and after.
- **B. Approve a local-only measurement override:** an env flag that only works on `localhost` with `next start`. You would need to approve it explicitly, because the auto-mode check blocked it as a security weakening.

Also, for F1: in the Supabase dashboard under **Settings → JWT Keys**, does the project use the new **asymmetric signing keys** or the **legacy JWT secret**? With the legacy secret, `getClaims()` still calls the Auth server, and F1 falls back to matcher narrowing only.

Migrations 035, 036 and 037 are still **not applied**. F6 would add 038, which is also not applied until you run it.
