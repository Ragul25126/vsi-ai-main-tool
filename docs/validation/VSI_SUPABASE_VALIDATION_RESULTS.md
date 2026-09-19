# VSI Supabase Validation Results

Date: 2026-09-19 · Branch: `feat/redesign-geo` · Setup guide: [VSI_SUPABASE_SETUP.md](../architecture/VSI_SUPABASE_SETUP.md)

## Verdict

**VSI is not validated against a real Supabase environment, and it is not production ready.**

- No real Supabase project was connected. `.env.local` still has the placeholder URL `https://your-project.supabase.co`, so the app ran without a database for everything below.
- What was done: an audit of the code and the SQL, the preparation work for a real project, and every check that doesn't need a database.
- What was not done: anything with real data. Authentication against Supabase, RLS, Realtime, the data pages and the external APIs are all **untested**. Section 4 is the list to run once a project exists.

---

## 1. What was delivered

| File | What it is | State |
|---|---|---|
| `docs/architecture/VSI_SUPABASE_SETUP.md` | Setup guide, 14 sections | new |
| `.env.example` | Every variable the code reads, names only, with local / staging / production guidance | rewritten |
| `supabase/migrations/migration_038_fresh_install_repairs.sql` | Replaces the `profiles.role` constraint so a fresh database accepts `super_admin` and `pilot` | new, **not run** |
| `supabase/seed/dev_seed.sql` | Test organization → user link → project → 5 searches → 3 competitors. No results, no metrics. `check_frequency = 'manual'` | new, **not run** |
| `supabase/tests/tenant_isolation_checks.sql` | Two organizations, acts as a member of one and as a visitor, tries to read and write the other's rows in every tenant table, then rolls back | new, **not run** |
| `docs/deployment/DEPLOY.md` | Warning added: its database section removes tenant isolation | edited |

No application code was changed. No authentication, API, UI or performance change. Commits `033725b` and `0534847` are untouched. The Welcome Toast and the login redesign remain uncommitted, as before.

**The SQL files have not been executed.** No database was available: no Supabase project, and Docker was not running. They were written against the table definitions in the migrations and should be treated as unproven until they run cleanly on the development project.

## 2. Tested (no database needed)

| Check | Result |
|---|---|
| `npx tsc --noEmit` | pass |
| `npm test` | 127 / 127 pass |
| `npm run lint` | 46 errors, 105 warnings. None from this work: no source file was changed |
| `npx next build` | pass (compiled in 16.9 s, 36 static pages) |
| Browser smoke run, placeholder mode | no problems |
| Secrets in the browser bundle | none. 67 compiled client files searched for each server-only value in `.env.local`. Only the two `NEXT_PUBLIC_SUPABASE_*` values appear, as designed |
| Credentials in git | none. Only `.env.example` has ever been committed, and no `.env.local` value appears in a tracked file (its Supabase key and Google values are the example placeholders) |
| Signed-out access | `/dashboard`, `/api/messages`, `/api/notifications`, `/api/export`, `/api/search` all answer 307 to `/login` |
| Cron route with no secret | 503 `CRON_SECRET not configured` |

The smoke run covered:
- **Pages:** the nine dashboard pages (Overview, Site Audit, Search Visibility, AI Visibility, Competitors, Next Actions, Tasks, Reports, AI Chat), Messages, and the ten Super Admin sections. Each returns 200, shows its heading, and has no error boundary or page error.
- **Navigation:** sidebar clicks through all nine dashboard pages.
- **Mobile:** no horizontal overflow on 12 pages at 390 px.
- **Auth, placeholder mode only:** signed-out redirect to `/login`; sign-out reaches `/login` and clears the session cookie. The login page test from earlier today also passed 21 of 21, including the wrong-account error, the loading state, and the Welcome Toast appearing on the dashboard.

**Error states seen in placeholder mode,** which is the same code path as "Supabase unavailable": data pages show "VSI isn't connected to its database in this environment" or their no-project introduction, no page crashes, and no internal error text reaches the browser. The loaders log only an error code, on the server.

## 3. Audit findings (from code and SQL, not from a running database)

Full detail and file references are in the setup guide, sections 8 to 12.

**A fresh project can't be built from the repository without two corrections:**
1. `profiles.role` keeps its original constraint (`owner`, `analyst`, `viewer`), so `super_admin` and `pilot` are rejected. Migration 038 repairs it.
2. Migration 033 fails on a policy that names columns the `messages` table doesn't have. Skip it; nothing the app uses depends on it.

**Tenant isolation.** The core tables are correctly separated by organization: projects, searches, search results, site audits, competitors, tasks, signed-in reports, feedback, profiles, invites. Four gaps are open:

| Gap | Effect |
|---|---|
| `reports_public_read_by_token` never compares the token | Anyone with the public key can list every organization's shared reports |
| `client_keyword_analyses` has `USING (true)` on all four operations | Open to everyone for read and write. The app doesn't use the table |
| `notifications` and `messages`: `user_id IS NULL OR ...`, no role restriction | Rows with no user are readable and writable by anyone, including visitors. `/api/messages` stores every message that way |
| Two `agencies` insert policies with `WITH CHECK (true)` | Any signed-in user can create organization rows |

**Authentication against a real project:**
- Email and password: implemented, and the only path that can work.
- One hard-coded account (`src/lib/auth-config.ts`). No second user can sign in, so multi-tenant use is impossible today and RLS can't be tested from the browser with two users. The SQL isolation test does it in the database.
- Google sign-in: not possible against real Supabase. The custom flow is local-only by design, and nothing calls `signInWithOAuth`.
- Password reset: not usable. The modal is not shown anywhere and points at a page that doesn't exist.
- No sign-up page. Users are created in the Supabase dashboard.

**Realtime:** not enabled by any migration. The client code is correct (filtered to the signed-in user, one channel, cleaned up, bursts coalesced), but it receives nothing until `notifications` is added to the `supabase_realtime` publication.

**Paid API calls:** Site Audit is free. Checks, briefs, strategies and reports are click-only. Exceptions to "no automatic paid calls": a check adds an automatic entity check and one Firecrawl fetch per cited page, and keyword research spends one SerpAPI call when its results view opens and again on reload. The cron route can't spend anything today: nothing schedules it, its secret is empty, and RLS gives it no rows. New projects default to `weekly`, so enabling cron later would start unprompted spending.

**Invented results:** with no search key configured, three search helpers return made-up results. The saving pipeline refuses to store them and `/api/check` flags them, but `/api/research`, `/api/search` and `/api/prompts/simulate` return them unflagged.

**API routes:** 13 have no authentication of their own and rely on the middleware; several can spend paid credits with no rate limit. `/api/export` trusts an organization id from the query string, with RLS as the only guard.

**Confirmed good:** Super Admin is enforced on the server on every admin page and all 11 admin API routes. The active-project cookie can't select another organization's project. No secrets in source, in git, or in the browser bundle. The service-role key is not used. Loaders don't leak internal errors. Commit `033725b`'s retry rule is intact: retries off for a placeholder URL, default retries for a real one.

## 4. Not tested: run these once a real project is connected

Record the date, the environment and the result beside each.

**Database**
- [ ] `schema.sql`, migrations 002–037 without 033, then 038, apply with no error on an empty project
- [ ] `supabase/tests/037_platform_admin_checks.sql`: every line PASS
- [ ] `supabase/tests/tenant_isolation_checks.sql`: 0 FAIL. Note the KNOWN lines
- [ ] `supabase/seed/dev_seed.sql` runs and reports 1 project, 5 searches, 3 competitors

**Authentication**
- [ ] Sign in with the real password; a wrong password shows the error
- [ ] Session survives a reload and a browser restart
- [ ] Sign-out ends the session; the dashboard then redirects to `/login`
- [ ] An expired or revoked session redirects to `/login` with no error page
- [ ] A disabled account is signed out
- [ ] Welcome Toast appears once after sign-in and not on reload
- [ ] The Google button is absent
- [ ] Sign-in and per-request auth latency measured (input for F1)

**Pages with real data, after running a site audit and a check from the UI**
- [ ] Overview, Site Audit, Search Visibility, AI Visibility, Competitors, Next Actions, Tasks, Reports, AI Chat
- [ ] Keyword list, keyword detail, public report (`/r/<token>`), Messages, Notifications, Settings, Feedback, Onboarding, Login
- [ ] Project switching keeps the right project everywhere

**RLS from the application**
- [ ] A forged `vsi_project` cookie holding another project's id falls back to the user's own project
- [ ] `/api/export?agencyId=<another organization>` returns nothing
- [ ] A Super Admin page opened by a non-admin is refused. Needs a second account, which the single-email rule prevents today

**Realtime, after enabling the publication**
- [ ] A new notification for the signed-in user appears without a reload
- [ ] A notification for another user triggers nothing
- [ ] Marking read and clearing update the unread count
- [ ] One subscription per tab; none left after sign-out

**External APIs, each costs credits, run once each**
- [ ] Run check: a real ranking and AI result are stored. Count the SerpAPI and AI calls it made
- [ ] ChatGPT check and entity check
- [ ] Improvement brief, citation strategy, keyword report, weekly report
- [ ] AI Chat answers from project data
- [ ] Nothing paid runs on page load, apart from the keyword research case noted above
- [ ] With the search key removed: confirm which screens show invented results

**Failure handling**
- [ ] Supabase paused or unreachable: friendly state, no crash
- [ ] Missing project, empty project, no competitors, no audit
- [ ] Failed SerpAPI request, failed AI request, empty search results
- [ ] Notification API failure

**Performance, with real data**
- [ ] Rerun the measurement script: auth latency, database time, `search_results` payload size, `site_audits.checks` size, navigation times
- [ ] `EXPLAIN ANALYZE` on the main `search_results` query before deciding on any index

## 5. Remaining blockers

**Blocking the validation itself**
1. No development or staging Supabase project exists, or its URL and anon key are not in `.env.local`.
2. The SQL deliverables (038, the seed, the isolation test) have never been executed.

**Blocking production, and needing your decision because each changes behaviour**
3. Shared reports readable by anyone with the public key.
4. `notifications` and `messages` rows with no user, readable and writable by anyone. Together with messages rendered as raw HTML, this allows stored script injection.
5. `client_keyword_analyses` open to everyone: drop the table or lock it.
6. 13 API routes with no authentication of their own, several spending paid credits with no rate limit.
7. The single hard-coded account, which blocks multi-tenant use and two-user testing.
8. Password reset and Google sign-in don't work against real Supabase.
9. Invented search results returned unflagged when a search key is missing.
10. Scheduled checks can't work with the anon key, and new projects default to `weekly`. Decide whether scheduled checks exist at all; if they do, they need a server-only key or database functions, and the default should become `manual`.
11. Realtime for `notifications` is not enabled, and must wait for item 4.
12. Any signed-in user can create organization rows.
13. The QA login has no rate limit.

**Housekeeping**
14. `docs/deployment/DEPLOY.md` needs a rewrite of its database section; only a warning was added.
15. There is no migration tool: files are applied by hand, in order, with 033 skipped.
16. An existing live database may differ from these migrations. Compare before trusting it.
