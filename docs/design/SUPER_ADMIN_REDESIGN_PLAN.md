# Super Admin redesign plan

**Status:** proposal, waiting for approval. No code has been changed for this plan.

**Branch:** `feat/redesign-geo`, on top of `a0d92a4`. The Super Admin work will be separate commits, and nothing has been pushed.

**Date:** 2026-09-19

**Pending migrations:** `migration_035_site_audits.sql` and `migration_036_project_competitors.sql` are written but **not applied** in Supabase. Some sections below depend on them and say so. Nothing here assumes they are live.

**Scope:** Super Admin only. The customer-facing first-use redesign is approved and will not be touched, except where integration exposes a real problem.

---

## Summary

The Super Admin area is part real, part fake, and its protection can be bypassed.

- **Can't be trusted yet:** anyone can currently become a super admin in two ways: by setting two cookies, or by updating their own `profiles.role` through the public database API. Until both are fixed, every "super admin only" check (the layout, every admin API, every `is_super_admin()` RLS policy) is only as strong as those holes.
- **Fake:** the Overview (invented numbers), Agencies (`MOCK_AGENCIES`) and Users (`MOCK_USERS`).
- **Silently broken:** "Disable user" and "Delete user" report success but change nothing, because RLS blocks them.
- **Real and worth keeping:** invites, analytics events, feedback, prompts, cron runs, QA, system settings, the SerpAPI test and the per-project engine settings.
- **Missing:** Projects list, Jobs, System Health, Activity and Usage.

**The plan:**
1. **Close the access holes first** (phase 0).
2. **Build the new admin on real data** (phases 1 to 4), reusing the existing tables, RPCs, APIs and VSI UI components.
3. **Move the existing real tools** into the new structure instead of rewriting them.

---

## 1. Current Super Admin architecture

```
Browser ──► middleware.ts
             ├─ Supabase getUser()   OR   cookies vsi_session + vsi_user_email  ⚠
             └─ single allowed email (lib/auth-config.ts: valgrowlabs444@gmail.com)
         ──► app/admin/layout.tsx  → requireSuperAdmin()  (layout only ⚠)
               ├─ AdminNav (client): pill nav, fake search box, fake bell, "SEOTool" brand
               ├─ pages (mix of server and client components)
               └─ ChatFloating (customer AI chat, shown in admin ⚠)
         ──► app/api/admin/*  → requireSuperAdmin() in every handler ✓
lib/auth.getSession():  Supabase user → profiles.role
                        ELSE (and always in dummy mode) cookie email → hard-coded super_admin session ⚠
Supabase: anon key only (no service role). Cross-organization reads rely on
          RLS policies using public.is_super_admin() (SECURITY DEFINER).
```

- **Roles in code:** only `super_admin | pilot` (`lib/auth.ts`). There are no organization roles.
- **Org and project model:** organizations are the `agencies` table and projects are the `clients` table. Users belong to one organization through `profiles.agency_id`.

## 2. Current UX problems

1. **Fabricated data.**
   - The Overview shows "4,820 users", "$58,400 revenue" and "↑ +12% this month". The real counts are multiplied (`users = agencies × 650 + 270`), and one query reads a `keywords` table that doesn't exist.
   - Agencies and Users are entirely mock arrays.
2. **Wrong product.** The header says "SEOTool", the Overview says "ClearRank", and it has a "Download Weekly Summary" button that does nothing.
3. **Fake controls.**
   - The search box, bell and profile menu in `AdminNav` do nothing.
   - The footer links (Documentation, API Status, Privacy) go to `#`.
4. **Customer features leak in.** The admin layout renders the customer "Ask VSI" chat, and the Overview promotes Prompts and QA like marketing.
5. **Styling doesn't match the app.**
   - Its own shell: a 2.5rem rounded "card" page, pill navigation, slate colors and arbitrary hex values (`#F0F3F8`, `#e04800`).
   - Uppercase labels, orange badges and emerald pulsing "Live Platform Status" dots.
   - None of the VSI tokens or components are used.
6. **Navigation.** Ten flat pill tabs, including "Cron" and "QA", with no grouping. It collapses to nothing below `xl`, so **there is no admin navigation at all on tablet or mobile.**
7. **Missing screens.** Projects list, Jobs, System Health, Activity and Usage. Project detail (`/admin/clients/[id]`) only edits engine toggles and identity.
8. **Operational gaps.**
   - Failed audits, reports or strategies are invisible to the admin.
   - There's no way to see "what happened recently".
9. **States.** Mock pages have no loading or error states. Real pages mostly show raw `error.message` or blank tables.

## 3. Current routes

| Route | Type | Data | Status |
|---|---|---|---|
| `/admin` | client | browser Supabase counts, then multiplied | **Fabricated** |
| `/admin/agencies` | client | `MOCK_AGENCIES` | **Mock** (a real PATCH/DELETE API exists) |
| `/admin/users` | client | `MOCK_USERS` | **Mock** (the real `admin_list_users()` RPC is unused) |
| `/admin/invites` | server | `invites` | Real |
| `/admin/analytics` | server | `analytics_events` | Real (has its own `requireSuperAdmin`) |
| `/admin/feedback` | server | `feedback` | Real (has its own `requireSuperAdmin`) |
| `/admin/prompts`, `/admin/prompts/[key]` | server | `prompts` | Real |
| `/admin/cron-runs` | server | `cron_runs` | Real |
| `/admin/qa` | server | `qa_all_checks_admin()` RPC | Real (has its own `requireSuperAdmin`) |
| `/admin/settings` | server | `system_settings` | Real |
| `/admin/test-serpapi` | server | live SerpAPI call | Real tool |
| `/admin/clients/[id]` | server | `clients` | Real (engines and identity only) |

Only 4 of the 13 pages check the role themselves. The rest rely on the layout, which Next.js warns against (see section 13, G3).

## 4. Current data sources

| Need | Existing source | Notes |
|---|---|---|
| Organizations | `agencies` (name, branding, `is_pilot`, `max_keywords`, `max_clients`, `is_disabled`, `disabled_at/reason`, `created_at`) | Super admins can read and write them through RLS. |
| Users | `profiles` plus `auth.users`, through the `admin_list_users()` SECURITY DEFINER RPC | Returns email, name, role, organization, disabled flags and created date. **It doesn't return `last_sign_in_at`.** |
| Projects | `clients` | Plus `tracked_keywords`, `search_results`, `tasks`, `reports`. |
| Competitors | `project_competitors` | **Migration 036, pending.** |
| Site audits | `site_audits` (running / completed / failed, `error_message`) | **Migration 035, pending.** |
| Scheduled runs | `cron_runs` (started, finished, clients and keywords processed, `errors[]`) | Real. It currently **can't work in production**: the cron route uses the anon key, which RLS blocks (architecture plan). |
| Reports | `reports.status` (pending / ready / failed) | A real job-like status. |
| Citation strategies | `search_results.citation_strategy_status` (pending / ready / failed) | A real job-like status. |
| Search and AI checks | `/api/run-client` runs synchronously and only writes `search_results` rows | **No job record.** A failed or partial run leaves no trace. |
| Usage | `analytics_events` (hashed user, organization, event type, page) plus table counts | Real (the Analytics page). |
| Billing | none | **Not implemented.** |
| Admin or audit trail | none | **No `audit_log` table.** |
| Health | none | **No health checks exist.** The SerpAPI test tool is the only probe. |

## 5. Current authorization

**What works**
- Every `/api/admin/*` handler calls `requireSuperAdmin()`.
- Cross-organization reads are gated by `public.is_super_admin()` policies on `agencies`, `profiles` (select), `clients`, `tracked_keywords`, `search_results`, `tasks`, `reports`, `feedback`, `analytics_events`, `cron_runs`, `system_settings`, `prompts`, `site_audits` and `project_competitors`.
- `admin_list_users()` and `qa_all_checks_admin()` check `is_super_admin()` inside the function.

**What doesn't**

| # | Severity | Finding | Where |
|---|---|---|---|
| A1 | **Critical** | **Forged cookies give a super-admin session.** Setting `vsi_session=authenticated` and `vsi_user_email=valgrowlabs444@gmail.com` passes the middleware. `getSession()` falls back to a hard-coded `super_admin` session, **in production too**, whenever `supabase.auth.getUser()` has no user. The admin layout and every admin API accept it. (Database writes then run as anon and mostly fail under RLS, but every server-rendered admin page and non-RLS action is reachable.) | `lib/auth.ts` (end of `getSession`, `dynamicSession`), `middleware.ts` |
| A2 | **Critical** | **Any signed-in user can make themselves super admin.** `users_update_own_profile` allows `update` on your own row with no `WITH CHECK` and no column restriction, so `profiles.role = 'super_admin'` or another `agency_id` can be set through the public anon key. That then satisfies every `is_super_admin()` policy. | `migration_006_auth_invites.sql:116` |
| A3 | High | **The layout-only guard.** 9 admin pages don't check the role themselves. Next.js layouts don't re-run on client navigation (see the Next.js authentication guide, "Layouts and auth checks"), so the checks belong next to the data. | `app/admin/*` |
| A4 | High | **Disabling does nothing.** `is_disabled` on users and organizations is stored but never read outside admin: disabled users keep signing in and working. | `lib/auth.ts` |
| A5 | High | **Admin user actions silently no-op.** `profiles` has no super-admin UPDATE or DELETE policy, so "Disable user" and "Delete user" update 0 rows and return `{ ok: true }`. | `api/admin/users/[id]`, RLS on `profiles` |
| A6 | Medium | **Raw database errors** are returned to the browser (`error.message`) by the admin APIs. | `api/admin/*` |
| A7 | Medium | **No audit trail.** Disabling organizations, changing caps, editing prompts and creating super-admin invites are all unlogged. | none |
| A8 | Medium | **Anonymous users can list active invite codes,** including `super_admin` invites (`public_invite_validation` + `grant select … to anon`). | `migration_006:65-70` |
| A9 | Info | **No service-role key.** This is good for safety, but it means admin cross-organization reads depend entirely on A2 being fixed. | |

**Also relevant but outside this workstream:** the whole app is locked to one email address (`lib/auth-config.ts`). Until that product decision changes, the Users and Organizations pages will show very few rows. That is correct, not a bug.

## 6. Current database relationships

```
auth.users 1─1 profiles(role ⚠ self-editable, agency_id ⚠ self-editable, is_disabled ⚠ unenforced, full_name)
agencies 1─n profiles
agencies 1─n clients (projects)          ── triggers: enforce_agency_client_cap, enforce_keyword_limit
clients  1─n tracked_keywords 1─n search_results (rank, AI answers, citation_strategy_status)
clients  1─n tasks (created_by, completed_by, outcome_status)
clients  1─n reports (status, share_token, created_by)
clients  1─n site_audits (status, error_message, requested_by)      [035 pending]
clients  1─n project_competitors (created_by)                         [036 pending]
invites (created_by → profiles, used_by → profiles, role, max_keywords)
feedback · analytics_events(agency_id, user_hash) · cron_runs · system_settings · prompts · qa_testers/qa_checks
notifications · messages (in-memory fallbacks, outside admin scope)
✗ jobs   ✗ audit_log   ✗ organization roles/membership   ✗ billing
```

- **Live schema drift:** the architecture plan notes that `profiles.role`'s constraint differs between `schema.sql` and migration 006.
- **Pre-flight:** before migration 037 (section 12), dump the live `profiles` and `agencies` definitions and policies.

## 7. Current APIs

| API | Guard | Status |
|---|---|---|
| `POST /api/admin/invites` | super admin | Real. Can mint super-admin invites (should be audit-logged). |
| `PATCH/DELETE /api/admin/agencies/[id]` | super admin | Real: caps, pilot flag, disable. It blocks disabling your own organization. |
| `PATCH/DELETE /api/admin/users/[id]` | super admin | **Silently no-ops (A5).** |
| `POST /api/admin/clients/[id]/engines`, `…/identity` | super admin | Real. |
| `POST /api/admin/settings` | super admin | Real, with allow-listed keys. |
| `POST/DELETE /api/admin/prompts/[key]` | super admin | Real. |
| `PATCH /api/admin/feedback/[id]` | super admin | Real. |
| `GET /api/admin/analytics/export` | super admin | Real CSV. |
| `POST /api/admin/test-serpapi` | super admin | Real probe. |
| RPC `admin_list_users()`, `qa_all_checks_admin()` | `is_super_admin()` inside | Real. |

**No admin API exists for:** projects list, jobs, health, activity or usage. The plan adds them as **server-side data functions** called by server components. They are not new public endpoints, except `/api/admin/health`, which needs to be callable for "Check now".

---

## 8. Proposed information architecture

```
PLATFORM
  Overview            /admin
  Organizations       /admin/organizations          → /admin/organizations/[id]
  Users               /admin/users                  (tabs: Users · Invites)
  Projects            /admin/projects               → /admin/projects/[id]
OPERATIONS
  Jobs                /admin/jobs                   (includes scheduled runs)
  System Health       /admin/health                 (includes the SerpAPI test)
  Activity            /admin/activity
  Feedback            /admin/feedback
BUSINESS
  Usage               /admin/usage                  (from Analytics)
  Billing             hidden: not implemented
SYSTEM
  Settings            /admin/settings               (tabs: Pipeline · AI prompts · QA)
```

- **Where the existing real pages go:**
  - Invites becomes a tab of Users, Analytics becomes Usage, and Cron becomes part of Jobs.
  - The SerpAPI test moves into System Health.
  - Prompts and QA move under Settings.
  - Feedback stays under Operations because it's a customer inbox that needs triage.
- **Redirects** keep every old URL working (`next.config.ts`):
  - `/admin/agencies` → `/admin/organizations`
  - `/admin/cron-runs` → `/admin/jobs?type=scheduled`
  - `/admin/analytics` → `/admin/usage`
  - `/admin/test-serpapi` → `/admin/health`
  - `/admin/prompts[/key]` → `/admin/settings/prompts[/key]`
  - `/admin/qa` → `/admin/settings/qa`
  - `/admin/clients/[id]` → `/admin/projects/[id]`
- **Wording:** user-facing labels say "Organization" and "Project". The database keeps `agencies` and `clients`.
- **Leaving admin:** the admin shell has an "Open VSI app" link. Customer features (chat, project switcher) are not shown in admin.

## 9. Proposed visual direction

**Design read:** an operational control surface for one or a few platform operators. Calm, dense and trustworthy, built on the existing VSI tokens and components. It's closer to a status page plus a data console than to a dashboard.

- **Dials:** variance 2, motion 1, density 6.
- **Shell:**
  - It reuses the customer app's layout (sidebar + top bar + `PageContainer`) with its own sidebar, grouped as in section 8 and titled "VSI Platform" with a small "Admin" label.
  - It uses the same tokens, type scale, 6/10 radii and focus rings.
  - **There is no separate styling world:** no slate/hex palette, pill nav or rounded page card.
- **One accent:** the brand gold marks only the active nav item (as in the app).
  - Status uses the existing status colors: positive, attention (orange), critical and info.
  - "Attention" orange means "needs attention" everywhere, exactly as in the app.
- **Content forms:**
  - Tables for lists and definition lists for details.
  - Status labels are text with an icon (`StatusLabel` / `StatusIcon`), not colored pills.
  - At most one small stat strip per page (the Overview's three counts).
- **No:** heroes, illustrations, gradients, pulsing dots, badges on every row, sparkle icons, or KPI card grids.
- **Numbers:** tabular numerals. Times are relative within 24 hours ("12 min ago", "Today, 10:32") and absolute otherwise, with the full timestamp on hover.
- **Technical detail** (error text, IDs, payloads) sits behind the existing `Disclosure` ("Technical details"), never shown by default. **Stack traces are never shown at all:** they aren't stored today, and the plan stores only the error message.
- **Charts:** none unless a trend adds real information. Usage has one: events per day over 30 days, with the existing custom SVG `TrendLine` (no chart library; Graphify isn't a chart library).

## 10. Page-by-page redesign

Every page has four states, described per page below:
- **Loading:** a `loading.tsx` skeleton in the page's shape.
- **Empty:** a plain sentence and, where useful, one action.
- **Error:** a `Notice` with "Try again" (`error.tsx`), or an inline notice when only one section fails.
- **Success.**

A metric that can't be read shows **"Data unavailable"**, never 0.

### Overview (`/admin`)

"Is the platform operating correctly?"

```
Platform overview                                         Updated 10:32 · [Refresh]
─────────────────────────────────────────────────────────────────────────────
Organizations        Users              Projects
24                   186                57
22 active · 2 disabled   3 disabled     12 added in 30 days
─────────────────────────────────────────────────────────────────────────────
Needs attention                                    (only if something does)
  2 site audits failed in the last 24 hours                        View jobs →
  Scheduled runs: last run 26 hours ago (expected daily)           View jobs →
─────────────────────────────────────────────────────────────────────────────
Platform health                                           Full health check →
  Database           Healthy          38 ms
  Background jobs    Needs attention  2 failed in 24 h
  AI services        Configured       not tested   [Test]
  Search services    Configured       not tested   [Test]
─────────────────────────────────────────────────────────────────────────────
Recent activity                                                  All activity →
  Organization created   Acme Dental                            Today, 10:18
  Project created        acme.ae · Acme Dental                  Today, 10:20
  Site audit failed      acme.ae · "Couldn't reach the site"    Today, 10:24
```

- **Counts** come from head-count queries.
- **"Needs attention"** is computed from Jobs and Health. If nothing needs attention, it says "Nothing needs attention" in one line.

### Organizations (`/admin/organizations`)

- **Table:** Organization, Projects, Users, Status (Active / Pilot / Disabled), Created, Last activity, Actions (View).
- **Search** by name. **Filters:** status and pilot.
- **Server-side pagination** (25 per page) through URL params, so it's shareable and back-button safe.
- **Detail** (`/admin/organizations/[id]`), with tabs:
  - **Overview:** plan limits (max projects, max searches), pilot flag, branding summary, created date, disable/enable with a reason. The existing PATCH API gains an audit log.
  - **Users**
  - **Projects**
  - **Usage:** projects, searches, checks, audits and reports in the last 30 days.
  - **Activity:** this organization's slice of the activity feed.
- **"Last activity"** is the newest of project creation, check results, audits, tasks and reports. It comes from one SQL function (section 12) rather than N queries.
- **Empty state:** "No organizations yet. Organizations are created when someone accepts an invite." with the action **Create invite**.

### Users (`/admin/users`, tabs: Users · Invites)

- **Table:** User (name + email), Organization, Role, Status, Last active, Actions.
- **Roles in plain words:** "Platform admin" (`super_admin`) and "Member" (`pilot`). Raw role IDs are never shown.
- **Status:** Active, Disabled, or "Organization disabled".
- **Last active** comes from `auth.users.last_sign_in_at` via the extended `admin_list_users()`.
- **Actions:**
  - **Disable/Enable** with a reason. It becomes real and enforced (A4, A5).
  - **Remove from platform** requires typing the email to confirm.
  - You can't act on your own account (existing rule).
- **Invites tab:** the existing page restyled.
  - Creating a platform-admin invite shows a warning and is audit-logged.

### Projects (`/admin/projects`)

- **Table:** Project, Organization, Domain, Status (Active / Organization disabled), Created, Last activity. Search by name or domain; filter by organization.
- **Detail** (`/admin/projects/[id]`) is an **inspection view, not the customer dashboard.** It reads:
  - **Organization:** link to it.
  - **Domain.**
  - **Searches:** count, active count, list.
  - **Competitors:** 036; shows "Not available until migration 036" if missing.
  - **Latest checks:** last search/AI check time and how many results.
  - **Latest site audit:** 035; score and status only.
  - **Tasks:** open / done / verified.
  - **Recent jobs.**
  - **Activity.**
  - **Engine and identity settings:** the existing forms, moved here.
- **"Open as customer"** is not offered. It would need impersonation, which is out of scope and risky.

### Jobs (`/admin/jobs`)

- **Rows:** built from existing status sources. No new jobs table yet (D4).

  | Type | Source | Statuses available |
  |---|---|---|
  | Site audit | `site_audits` (035) | running, completed, failed |
  | Report | `reports.status` | pending (as Queued), ready (as Completed), failed |
  | Citation strategy | `search_results.citation_strategy_status` | pending, ready, failed |
  | Scheduled run | `cron_runs` | running (no `finished_at`), completed, completed with errors |
  | Search & AI check | none | **Not tracked yet.** Shown as a one-line note, not as fake rows. |

- **Table:** Job, Project, Organization, Type, Status, Started, Completed, Duration.
- **Filters:** status (Queued / Running / Completed / Failed), type, organization, last 24 h / 7 d / 30 d.
- **Failed rows** open a drawer showing what happened in plain words, when, the project and organization, and "Technical details" (stored error text and IDs).
- **Stuck jobs:** a site audit still "running" after 15 minutes shows as **Needs attention (stuck)**. This matches the existing cleanup rule in `/api/site-audit`.
- **Empty states:** "No jobs in the last 7 days." / "No failed jobs." / "Site audit history isn't available until migration 035 is applied."

### System Health (`/admin/health`)

Health is checked **now, when the page loads**. It isn't guessed from configuration. Each service only claims what a real check proves.

| Service | Check | Possible states |
|---|---|---|
| Database | a timed `select` on `system_settings` | Healthy (with latency) / Unavailable |
| API | the admin page itself rendered through the app server | Healthy ("Responding") |
| Background jobs | last `cron_runs` finish time vs the expected schedule; failed jobs in 24 h; stuck audits | Healthy / Needs attention / Not configured (no `CRON_SECRET`, or no run ever) |
| AI services | key present → **Configured**; "Test" runs a zero-cost call (`GET /v1/models`) | Configured / Healthy (after a passing test) / Unavailable / Not configured |
| Search services | SerpAPI key present → Configured; "Test" reuses the existing SerpAPI test (it uses one search credit, and the page says so) | same |
| Storage | list the agency-logo bucket | Healthy / Unavailable / Not configured |

- **Uptime history:** "Monitoring not configured". There is no stored monitoring, and the plan doesn't invent any.
- **Environment:** a small read-only section listing which **server** keys are set, as yes/no only. Values are never shown.
- **The SerpAPI test tool** lives here.

### Activity (`/admin/activity`)

- **Chronological list:** who, action, entity, when. Grouped by day, filterable by organization and action type, paginated.
- **Sources today (derived, real):** these are events with timestamps and, where stored, the person who did them.
  - `agencies.created_at` (organization created)
  - `clients.created_at` (project created)
  - `invites.used_at` + `used_by` (invite accepted)
  - `tasks.created_at` / `completed_at` + `created_by` / `completed_by`
  - `reports.generated_at` + `created_by`
  - `site_audits` + `requested_by` (035)
  - `project_competitors` + `created_by` (036)
  - `feedback.created_at`
- **When no one is recorded** it says "Someone in Acme Dental", never an invented name.
- **Admin actions** come from a new `audit_log` table (D3): disable/enable, cap changes, prompt edits, settings changes, invites created.
- **Empty state:** "No recent activity."

### Feedback (`/admin/feedback`)

The existing page restyled: a table plus a status filter. Unchanged behavior.

### Usage (`/admin/usage`)

- **Per organization for the last 30 days:** projects, active searches, check results stored, site audits run, reports created, and active users (distinct `user_hash` in `analytics_events`).
- **Platform:** events per day (one `TrendLine`).
- **The existing CSV export** stays.
- **Billing is not shown**, because it isn't implemented. The sidebar hides it.

### Settings (`/admin/settings`, tabs: Pipeline · AI prompts · QA)

- **Pipeline:** the existing toggles and enums, grouped (AI engines, models, check frequency) with plain descriptions.
- **AI prompts:** the existing prompt editor.
- **QA:** the existing QA checklist.
- **Every save writes `audit_log`.**

## 11. Reusable components

- **Reused as-is:**
  - `PageContainer`, `PageHeader`, `Section`, `TextLink`, `Panel`
  - `Button` / `ButtonLink`
  - `Notice`, `StatusLabel`, `StatusIcon`
  - `StatStrip` / `Stat`, `Skeleton`
  - `Drawer` (job and user details), `Disclosure` (technical details), `EmptyState` (without illustrations)
  - `TrendLine` (custom SVG)
  - `lib/format` (dates, `plural`)
  - The existing admin forms: `SettingsToggles`, `PromptEditor`, `InviteCreator`, `AdminClientEnginesForm`, `ClientIdentityForm`, `FeedbackAdminRow`
- **Restyled only:** `TestSerpApiClient` and `AgencyAdminRow` / `AdminUserRow` (the logic is kept).
- **New:**
  - `components/admin/AdminSidebar.tsx` (the grouped nav, reusing the customer `Sidebar` structure and styles; collapsible and mobile-ready)
  - `components/admin/DataTable.tsx` (header, rows, empty row, responsive stacked rows on mobile, no client-side data)
  - `components/admin/TableToolbar.tsx` (search, filters and pagination, all as URL params)
  - `components/admin/RelativeTime.tsx`
  - `components/admin/HealthRow.tsx`
- **New server code:**
  - `lib/admin/*`: data functions. Each one **calls `requireSuperAdmin()` first** (the data-access-layer pattern that fixes A3).
  - `lib/admin/health.ts`
  - `lib/admin/jobs.ts` (normalizes the five sources into one `AdminJob` shape)
  - `lib/admin/activity.ts` (merges derived events and `audit_log` into one `ActivityItem` shape)
  - `lib/admin/audit.ts` (`recordAdminAction()`)

## 12. Data and API gaps

All new database objects go in **one new migration, `migration_037_platform_admin.sql`**. It is pending like 035 and 036 until you apply it.

| Gap | Proposal |
|---|---|
| Who changed what | `audit_log(id, actor_id, agency_id, action, target_type, target_id, summary, meta jsonb, created_at)`, with RLS for super admins to read and insert. Written from admin APIs through `recordAdminAction()`. |
| Last sign-in | Extend `admin_list_users()` to return `last_sign_in_at` (same security-definer check). |
| Organization and project rows with counts | `admin_organization_summaries()` and `admin_project_summaries()`: security-definer functions that return one row per organization or project with counts and last activity. They check `is_super_admin()` inside and avoid N+1 queries. |
| Jobs | Read model in `lib/admin/jobs.ts` from existing tables (D4). The "Search & AI check" job type needs the jobs system in architecture plan phase 3. It's noted, not faked. |
| Health | `lib/admin/health.ts`, plus `GET /api/admin/health` (super admin) for "Test". |
| Usage | Aggregate queries on existing tables. No new tables. |
| Billing | None. Hidden. |

**Not adding:** a jobs table, a service-role client, organization roles, or impersonation. Those belong to the architecture plan and would be a duplicate or premature system here.

## 13. Security gaps and fixes (phase 0, before any UI)

| # | Fix | How |
|---|---|---|
| G1 (A1) | Stop trusting cookies as a session | `getSession()` returns only the Supabase-authenticated user. The dummy cookie session remains **only** when `isDummySupabase()` is true **and** `NODE_ENV !== "production"`, for local development. The middleware follows the same rule. |
| G2 (A2) | Stop self-promotion | In migration 037, add a `BEFORE UPDATE` trigger on `profiles`. When the change comes directly from the `authenticated` or `anon` role and the caller isn't a super admin, it rejects changes to `role`, `agency_id`, `is_disabled`, `disabled_at` and `disabled_reason`. Security-definer RPCs such as `claim_invite` run as the function owner, so they keep working. **Before writing it, check the onboarding path**, which may set `agency_id` directly. If it does, move that into `claim_invite`. |
| G3 (A3) | Guard next to the data | `requireSuperAdmin()` in every admin page and every `lib/admin/*` function, not only the layout. |
| G4 (A4) | Enforce disabling | `getSession()` treats a disabled user, or a user in a disabled organization, as signed out (super admins are exempt from the organization rule, so the platform can't lock itself out). |
| G5 (A5) | Make user actions real | In 037, add super-admin UPDATE (and DELETE) policies on `profiles`. APIs check the affected row count and return 404 when nothing changed, never a false `ok`. |
| G6 (A6) | No raw errors | Plain messages to the browser; details only in server logs. |
| G7 (A7) | Audit trail | `recordAdminAction()` on every admin mutation. |
| G8 (A8) | Invite listing | In 037, replace the anon `select` with a `validate_invite(code)` security-definer RPC and update the invite page to use it. |
| G9 | Customer features in admin | Remove `ChatFloating` from the admin layout. |

**Note:** G1, G2 and G8 also protect the customer app. They are the "stop-ship" items from the architecture plan and are included here because the admin area can't be secure without them.

## 14. Implementation phases

Each phase is its own commit (or commits), on top of `a0d92a4`. Nothing is squashed or pushed.

| Phase | Content | Depends on |
|---|---|---|
| **0. Security** | G1, G3, G4, G6, G9 in code; migration 037 part A (G2 trigger, G5 policies, G8 RPC). Tests for the session rules. | D1, D2 |
| **1. Shell** | `AdminSidebar`, admin layout on the VSI shell, redirects from old URLs, `loading.tsx` / `error.tsx`, no fake controls. Existing real pages moved into the new structure and restyled only. | 0 |
| **2. Platform** | Overview, Organizations (+ detail), Users (+ Invites tab), Projects (+ detail). Migration 037 part B (`audit_log`, summary functions, `last_sign_in_at`). Audit-log writes in the existing admin APIs. | 1, D3 |
| **3. Operations** | Jobs (read model), System Health (+ `/api/admin/health`), Activity, Feedback restyle. | 2, D4, D5 |
| **4. Business and System** | Usage (from Analytics), Settings tabs (Pipeline · AI prompts · QA). | 1 |
| **5. Verification and de-slop** | Full state matrix, responsive pass, visual consistency audit, docs. | all |

## 15. Testing strategy

- **Unit tests (Vitest):**
  - **Session rules:** a forged cookie in production gives no session; a disabled user gives no session; a disabled organization gives no session except for a super admin.
  - `requireSuperAdmin` redirects a member.
  - **Jobs read model:** status mapping, stuck detection, duration.
  - **Health mapping:** a key set but not tested gives "Configured", never "Healthy".
  - **Activity merge and ordering**, including the no-actor wording.
  - **Role labels.**
  - **Pagination and filter parsing.**
- **Database checks:** there's no local Supabase here. I'll ship `supabase/tests/037_platform_admin_checks.sql` for you to run in the SQL editor after applying 037. It checks that:
  - a member can't change their own `role` or `agency_id`
  - a super admin can disable a user
  - anon can't list invites
  - the summary functions refuse non-admins
- **Screens:**
  - Every admin page at 1440 / 1024 / 768 / 390, with no horizontal overflow.
  - Empty, loading and error states rendered from a temporary dev-only fixture route, deleted before commit, as in the previous work.
  - **Dummy mode has no data,** so real-data pages will show "Data unavailable" locally. Real data must be checked on your Supabase environment.
- **Access:**
  - As a member (unit-level, with a mocked session), every `/admin` page and `/api/admin` route is refused.
  - With forged cookies against a real Supabase URL, it's refused (unit test with an env override).
- **Build, lint** (no new errors in touched files) and **all existing tests** still pass.

## 16. Production-readiness checklist

- [ ] Migrations **035, 036 and 037 applied** in Supabase, and the SQL checks run and passing.
- [ ] No cookie-only session in production (G1); disabled users and organizations blocked (G4).
- [ ] Nobody can change their own role or organization (G2); verified with the SQL checks.
- [ ] Every admin page and data function checks super admin server-side (G3).
- [ ] Admin user actions change data or return an error; no false success (G5).
- [ ] Every admin mutation writes `audit_log` (G7).
- [ ] No mock data, multiplied numbers, fake controls or wrong product names anywhere in admin.
- [ ] Every metric shows real data or "Data unavailable" / "Monitoring not configured".
- [ ] Health says "Healthy" only after a real check.
- [ ] Every page has loading, empty, error and success states.
- [ ] Admin navigation works on phones and tablets.
- [ ] No customer features (chat, project switcher) inside admin.
- [ ] Old admin URLs redirect.
- [ ] `CRON_SECRET` set and scheduled runs actually running (today they can't: the cron route needs the service role, per the architecture plan). Until then, Jobs and Health say so.

---

## Decisions needed

| # | Question | Recommendation |
|---|---|---|
| **D1** | Include the security fixes G1 to G9 (including stopping cookie-only sessions in production) as phase 0 of this workstream? | **Yes.** The admin area can't be made secure without them. |
| **D2** | Keep the single-email login lock (`lib/auth-config.ts`) unchanged in this workstream? | **Yes, unchanged.** Opening sign-up is a product decision for the architecture plan. The admin pages will simply show few users until then. |
| **D3** | Add migration **037** (profile guard trigger, super-admin profile policies, invite validation RPC, `audit_log`, summary functions, `last_sign_in_at`)? | **Yes.** One migration, clearly marked pending until you apply it. |
| **D4** | Build Jobs as a read model over the existing status columns now, and leave a real `jobs` table (with tracked search/AI checks) to architecture phase 3? | **Yes.** No duplicate job system now. |
| **D5** | Allow the Health "Test" buttons to make live provider calls? (AI: `/v1/models`, no cost. Search: one SerpAPI search, **uses one credit**.) | **Yes, only on click, never automatically,** with the cost shown next to the button. |
| **D6** | Move the existing pages as proposed in section 8 (Invites → Users tab; Analytics → Usage; Cron → Jobs; SerpAPI test → Health; Prompts and QA → Settings; Feedback under Operations)? | **Yes.** Old URLs redirect. |

Nothing will be implemented until you approve this plan and answer or accept these decisions.
