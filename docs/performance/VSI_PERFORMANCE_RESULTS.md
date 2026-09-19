# VSI Performance Results

Date: 2026-09-19 · Branch: `feat/redesign-geo` · Audit: [VSI_PERFORMANCE_AUDIT.md](VSI_PERFORMANCE_AUDIT.md)

**Status:**
- Phase 1 (the low-risk fixes) is complete.
- **No production performance improvement is claimed yet.** None has been measured, because no production or staging baseline exists.
- F1, F3 and F6 are on hold until that baseline has been taken.

---

## LOW-RISK FIXES COMPLETED

| Fix | Commit | What changed |
|---|---|---|
| F2 | `33efe46` | Messages polling pauses in hidden tabs. Notification Realtime is scoped to the user. Overlapping refreshes are coalesced. |
| F4 | `f6e7c6a` | Pages that show both AI and Search visibility read the project's recent checks once instead of twice. |
| F5 | `e65865e` | The two AI-answer evidence queries run in parallel instead of one after the other. |
| F7 | `94631cc` | The sidebar Reports link goes straight to the project's reports, skipping a redirect. |
| F8 | `3b265f7` | Removed the fixed 700 ms wait after sign-in and the 120 ms fake loading in the prompt tester. |

### F2: Messages and notifications (`33efe46`)

**Before:**
- `MessagesContext` fetched `/api/messages` every 15 s for as long as a dashboard tab was open, including hidden tabs.
- `NotificationsContext` refetched after **every** change anywhere in the `notifications` table.
- It refetched once per event, so "mark all read" on N rows caused N refetches.

**After:**
- **Messages:** the 15 s sync still runs while the tab is visible. It stops while the tab is hidden and refreshes immediately when the tab is shown again.
- **Notifications:** Realtime `INSERT` and `UPDATE` events are subscribed with `filter: user_id=eq.<signed-in user>`. That matches exactly what `/api/notifications` returns (`.eq("user_id", userId)`).
- **Deletes:** `DELETE` events stay unfiltered, as before, because Postgres can't filter delete events. Cross-device deletes therefore still sync.
- **Coalescing:** both contexts go through `coalesce()` (`src/lib/coalesce.ts`). Calls made during a fetch share it and schedule exactly one follow-up. A burst of N events now costs at most 2 requests, and the final state is still current.

**Functionality kept:**
- the unread badges;
- the Messages pages;
- notification create, read, delete and clear;
- the `new-notification-created` event;
- cross-device sync while the tab is visible;
- Realtime notifications.

**What I measured (dev, Playwright, 35 s hidden):**

| | Result |
|---|---|
| Visible tab | `/api/messages` at load, then 15 s later, same as before |
| Hidden tab | **0** requests (before: one every 15 s, so about 240 an hour) |
| Tab shown again | one request immediately |
| Sidebar navigation | no refetch of messages or notifications, because the providers live in the layout |

**Not verified locally:** the Realtime filter. The local copy has no Supabase Realtime, and the socket to the placeholder host fails exactly as it did before.

**Deviation from the audit:**
- I did **not** replace `select("*")` or add a `limit` to `/api/messages` and `/api/notifications`.
- The response mappers read nearly every column, so explicit columns would save almost nothing.
- The `messages` RLS policy in migration 033 refers to `sender_id` / `receiver_id`, which migration 031 doesn't create. So the production schema may differ from the migrations, and an explicit column list could break the read.
- A `limit` would hide older messages from the Messages pages, which is a functional change.

### F4: One read of recent checks per page (`f6e7c6a`)

**Before:** Overview, Next Actions and AI Chat (through `loadProjectOverview`) and Competitors each ran `loadGeo` and `loadSearch` side by side. Each did its own reads:
- `search_results`: same filter (project, last 120 days, newest first, up to 3000 rows) but different columns;
- `tracked_keywords`;
- `clients`.

**After:**
- `loadVisibility()` (`src/lib/visibility-load.ts`) reads each once, using the union of both column lists, and builds both summaries from the same rows.
- `clients` flags and `tracked_keywords` go through React `cache()` (`src/lib/project-data-load.ts`). That deduplicates within **one server request only**; nothing is shared between requests or users.
- AI Visibility and Search Visibility, which show one view each, keep their narrower column lists.

**Queries per page render (from the code; the same on every render):**

| Page | `search_results` 3000-row reads | `tracked_keywords` | `clients` |
|---|---|---|---|
| Overview, Next Actions, AI Chat | 2 → **1** | 2 → **1** | 2 → **1** |
| Competitors | 2 → **1** | 2 → **1** | 2 → **1** |
| AI Visibility, Search Visibility | 1 → 1 | 1 → 1 | 1 → 1 |

**Verification:**
- New tests with an in-memory query double show that `loadVisibility` returns **exactly** what the separate loaders return, in both the success and error cases, using one read of each table.
- A one-off comparison against the pre-change loaders from git gave identical results. It covered a missing project row, a failed keyword read and the evidence path. The comparison files were deleted afterwards.

**Not measured:** how much time this saves in production. It depends on `search_results` size and database latency.

### F5: AI answer evidence in parallel (`e65865e`)

**Before:** AI Visibility loaded its "you appear" and "you don't appear" answer examples one after the other: two sequential round trips after the summary.

**After:** both run at once. The queries and the output are unchanged.
- A test checks both examples come back in the same order, and that the two queries overlap (maximum in flight: 2).
- A one-off comparison with the sequential version matched.

**Deviation from the audit:** the audit proposed one query with `in(...)`. I didn't do that. Getting "the latest row per keyword" from a single query would mean fetching every stored AI answer, with its full text, for both keywords. Two queries at once, each limited to 1 row, stays small.

**Not measured:** the production saving. It removes one database round trip from the AI Visibility critical path whenever both examples exist.

### F7: Sidebar Reports link (`94631cc`)

**Before:** the sidebar linked to `/dashboard/reports`, which redirects to `/dashboard/clients/<id>/reports` when a project is active. Each click cost two server renders.

**After:**
- With a project, the link goes straight to `/dashboard/clients/<id>/reports`.
- Without one, it still opens `/dashboard/reports`, which shows the Reports introduction.
- The active-state highlighting is unchanged, and the navigation test was updated.

**Not verified locally:** the with-project click. The local copy has no projects. The unit test covers the link, and it points at the same URL the redirect already produced.

**Dropped from F7:** wrapping `getSetting()` in `cache()`. After checking the code, no render path calls it more than once. `loadGeo` calls it once, inside the existing `Promise.all`. So `cache()` would remove no request, and I left it out.

### F8: Artificial waits (`3b265f7`)

**Sign-in:**
- Removed the fixed 700 ms `setTimeout` between a successful sign-in and opening the dashboard.
- **Dev measurement (6 runs each, from submit until the dashboard URL loads):**

  | | Range | Median |
  |---|---|---|
  | Before | 1728–2426 ms | about 2140 ms |
  | After | 697–1733 ms | about 1190 ms |

  The spread comes from the local sign-in request to the placeholder host and dev compilation. The only certain saving is the 700 ms.
- **Trade-off:** the "Welcome back" toast used to show for the 700 ms wait. It now shows only while the next page loads. In the local runs it was **not seen** after the change (6 of 6), where before it was seen (6 of 6). See the open question at the end.

**Prompt tester:** removed the 120 ms "Simulating AI Answer..." state. The preview is built synchronously from the form. The button now shows the result at once and stays enabled.

**Kept, as the audit concluded:**
- retry backoff in `ChatFloating`;
- the 300 ms search debounce in `TableToolbar`;
- toast auto-dismiss timers;
- the user-initiated print and download delays in Messages, which are minor and outside the navigation path.

---

## Verification after each fix

Every fix was followed by `npm test`, `npm run lint`, `npm run build` and a browser smoke run.

| After | Tests | Lint errors / warnings | Build | Smoke |
|---|---|---|---|---|
| Baseline (`f088796`) | 118 passed | 52 / 110 | — | — |
| F2 | 122 passed | 50 / 110 | pass | F2 visibility check passed |
| F4 | 126 passed | 50 / 110 | pass | 20 pages, 9 sidebar navigations, 12 mobile pages: no problems |
| F5 | 127 passed | 50 / 110 | pass | no problems |
| F7 | 127 passed | 50 / 110 | pass | no problems |
| F8 | 127 passed | 50 / 108 | pass | no problems |

The remaining 50 lint errors all existed before this work. No fix added a lint error. Two errors and two warnings went away because code was removed.

**The smoke run checked:**
- **Rendering:** each page returns 200, shows its heading, has no error boundary and no page errors. This covers all nine dashboard pages, Messages, and all ten Super Admin sections (Overview, Organizations, Users, Projects, Jobs, System Health, Activity, Feedback, Usage, Settings).
- **Navigation:** sidebar clicks through every dashboard page.
- **Mobile:** no horizontal scroll at 390 px.
- **Auth:** a signed-out visit to `/dashboard` redirects to `/login`.

**Not verifiable on this machine:**
- **Project switching and states with data:** the local copy runs without a database, so only the no-project state renders. The changed data loaders return before any query in this mode, which is why they're covered by the mocked tests above.
- **Real sign-in, Realtime notifications and production auth:** these need the real Supabase project.
- **Loading skeleton on navigation:** in dev it appeared once in 9 warm navigations. In production it depends on prefetch (audit 4.2), so it must be checked on the baseline.

### Local dev timings are not a before/after comparison

In the re-run of the audit script, navigation and hard-load times dropped sharply. For example, median hard-load TTFB went from 1335 ms to 208 ms. **That is not an effect of these fixes.** The audit run started on a freshly compiled dev server, and this run found every route already compiled. None of the changed database code runs locally.

The comparison that counts is the production or staging one below.

---

## FIXES WAITING FOR PRODUCTION BASELINE

| Fix | What it would do | Why it waits |
|---|---|---|
| **F1** | Cut the Supabase Auth round trips made before any data loads (middleware matcher, `getClaims()`). | It changes authentication behaviour, and its value depends on real Auth latency and the project's JWT key type. |
| **F3** | Remove framer-motion from the Topbar and chat, and keep the browser Supabase client out of every page (about 104 KB gzip). | A large bundle change. It needs a real-device baseline and visual regression checks. |
| **F6** | Migration 038: `search_results (client_id, created_at desc)` index. | Needs `EXPLAIN ANALYZE` on real data. **Not created, not applied.** |
| **F9** | A pending state on sidebar links (`useLinkStatus`). | Only needed if production shows the loading skeleton late or not at all. |

**Baseline to take once a staging or production URL and test account are available.** Take it on the current branch, then again after each of F1, F3 and F6:
- **Navigation:** sidebar click to content for the 9 dashboard pages, and whether the loading skeleton appears and when.
- **Hard loads:** TTFB, load and LCP per page.
- **API timing:** `/api/messages` and `/api/notifications`.
- **Request counts:** per navigation and while idle, including duplicates.
- **Database time:** where Supabase or Vercel logs expose it, plus `EXPLAIN ANALYZE` for the main `search_results` query (for F6).
- **JavaScript:** size per route from the production build.

---

## Open questions for you

1. **Welcome toast after sign-in.** It no longer gets time to show on a fast load. There are two options:
   - leave it as is;
   - show the welcome on the dashboard after sign-in. That is a small addition, not a delay.
2. **Staging or production URL and a test account** for the baseline above.
3. **JWT signing keys** (Supabase → Settings → JWT Keys): asymmetric or legacy secret. This decides how much F1 can save.

Migrations 035, 036 and 037 are still **not applied**. Nothing has been pushed.
