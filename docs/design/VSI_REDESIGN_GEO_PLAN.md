# VSI Redesign + GEO: Audit and Implementation Plan

Status: **implemented on branch `feat/redesign-geo` (uncommitted), 2026-09-18.** See "Implementation status" at the end.
Date: 2026-09-18
Scope: the signed-in product (`/dashboard/**`). Login, marketing (`components/valgrow`), and `/admin` are only touched where shared tokens reach them.

---

## 0. Design read and method

**Design read:** a redesign (overhaul) of a B2B product app for agency owners and the non-technical business owners they report to. The visual language should be calm, plain-spoken, and built around evidence. Implementation: Tailwind v4 tokens, Geist, restrained motion.

**Dials (taste skill):** `DESIGN_VARIANCE 4 · MOTION_INTENSITY 3 · VISUAL_DENSITY 5`. The layout is predictable because this is a daily-use tool, not a landing page. Motion is limited to state changes. Density is set for a daily app.

**Note on the taste skill.** `design-taste-frontend` says it is for landing pages and portfolios, and lists dashboards as out of scope (section 13). From it I applied the anti-slop rules: typography, color calibration, cards and shape locks, motion motivation, AI tells, the redesign audit protocol, and the copy self-audit. I did not apply its landing-page rules (hero composition, stock imagery, bento grids), because they would make a working tool worse.

**How the audit was done.** I read the shell, the navigation, every page the main nav links to, the data layer (`lib/`, `app/api/`, 33 Supabase migrations), and the two existing design docs (`docs/design/DESIGN_SYSTEM.md`, `CLAUDE_DESIGN_BRIEF.md`). The app uses real Supabase auth, so I could not view the signed-in screens in a browser. The visual findings come from the code and are counted where possible.

---

## 1. Current UX audit

### 1.1 Most of what the main nav shows is demo data

This is the finding that matters most, and it shapes the whole plan.

| Nav item | Route | What it shows today |
|---|---|---|
| Dashboard | `/dashboard` | **Mostly invented.** When there is no data it falls back to 12 keywords, 8 cited, 10 mentioned, and an average rank of 4.2. ChatGPT is hardcoded to `91`, competitor citations to `38`, next actions to `6`. The trends "+4%" and "+8%" are fixed. "Updated: Today, 2:30 PM" is fixed. Competitors are hardcoded to HubSpot, Monday.com, and Pipedrive for every client, and the activity feed is fixed. The results query is **not filtered by the selected project**, so it mixes every client in the agency. |
| Dashboard keyword research (`?q=`) | `/api/research` | **Seeded pseudo-random numbers.** AI visibility %, the per-engine inclusion rates (including Perplexity and Gemini, which VSI does not check), the 12-month trend, and part of the difficulty score are all generated from a hash of the keyword. |
| Site Audit | `/dashboard/check` | **Hardcoded.** The same 12 checks (`DEFAULT_AUDIT_ITEMS`) appear for every client. The hero always says **70**, while the page's own formula gives **48** for those checks. There is **no site audit engine or API** anywhere in the codebase. |
| Search & AI Check | `check?tab=quick-check` | **Real.** A live check through `/api/check`. |
| Next Actions | `check?tab=opportunities` | **Hardcoded** list (`ACTION_ITEMS`). |
| Rank Tracking | `/dashboard/services/seo` | **Hardcoded.** `ServiceModuleView` never uses its `moduleType`, so all six `services/*` routes render the same static "SEO Tracking Dashboard". |
| Competitor Analysis | `/dashboard/competitors` | **Hardcoded** (602 lines, no data fetch). |
| Pixel Rank Tracking | `check?tab=aivisibility` | **Hardcoded** (`DEFAULT_ROWS`). |
| Project Settings | `/dashboard/settings` | Real. |
| Action Board | `/dashboard/tasks` | **Real** (Supabase). |
| Client Reports | `/dashboard/clients` | **Real.** This is also the only way into the real per-project data pages. |
| AI Prompts & SERP | `/dashboard/prompts` | **Hardcoded** simulator (850 lines, no data fetch). |
| AI Chat | `/dashboard/chat` | Real (LLM). |

**The real product is hidden.** The genuine AI-visibility data (per-keyword snapshots, ChatGPT responses, citation strategy, keyword reports, and tasks tied to keywords) lives under `/dashboard/clients/[id]/…`. The only way to reach it is the "Client Reports" item.

### 1.2 Broken or misleading behaviour

1. **Creating tasks from Site Audit and Next Actions fails silently.** Those pages send `group_name: "technical_seo" | "on_page_seo" | "content_brief" | "citation_outreach"` and `effort: "medium" | "low"`. The database only accepts `Content | Technical | Off-page` and `S | M | L`, and the fallback `client_id` is `"valgrow-labs-001"`, which is not a UUID. So the insert fails, and the UI shows "Added" anyway.
2. **The project the user picks isn't used consistently.** The sidebar switcher navigates to `/dashboard?client=`. Site Audit reads the first client from `localStorage`. The other pages ignore the selection. When nothing is selected, pages fall back to a hardcoded "ValGrow Labs / valgrowlabs.com" (with the domain spelled three different ways).
3. **Scanning is simulated.** "Run AI Scan" and "Re-run audit" only run `setTimeout` animations. No check is performed.
4. **Some real pages likely have invisible text.** The app is locked to light mode (`ThemeProvider`), but the real per-keyword pages style their headings `text-white`. That is 11 instances on the keyword detail page.
5. **Nine routes are redirects or duplicates:** `services/{all, all-services, seo, seo-tracked, geo, geo-tracked}`, `research`, and `tasks-audits`.

### 1.3 The experience for someone new to SEO

- **The labels are jargon:** "Pixel Rank Tracking", "AI Prompts & SERP", "Intelligence Hub", "Citation share of voice", "Double Loss", "Aligned", "GEO Invisible", "No AIO Trigger", "SERP Rank", "AI Visibility Trigger", "Primary Intent".
- **The groups make no sense.** A group titled "AI Search Visibility" contains Action Board, Client Reports, and AI Prompts. Items carry "NEW!" and "REVAMPED" badges.
- **Nothing on a page says what to conclude.** The dashboard stacks 8 sections under an 8-column KPI row. None of them answers what is happening, why it matters, and what to do.
- **Recent work shows the right instincts.** The Site Audit redesign (`audit-translations.ts`, the issue drawer, "what we found / why it matters / what to do") and `lib/opportunities.ts` already hold the right plain-language model. They sit on top of fake data, or out of reach.

---

## 2. Current visual problems (measured across 120 dashboard files)

| Problem | Evidence |
|---|---|
| Four competing brand colors | `#FF5A1F` ×382, `#FF6B00` ×133, `#FF5500` ×110. The CSS token says `--primary: #FF2B2B` (red). The brief says amber `#F59E0B`. The design doc says `orange-500`. In total there are **175 distinct hex values** in the TSX files. |
| Text too small to read | **537** uses of 9 to 11px text. |
| Weight used for emphasis instead of hierarchy | `font-black` ×177, plus heavy use of `font-extrabold`. |
| Uppercase, letter-spaced micro-labels | **206** instances. |
| Rounded rectangles everywhere | `rounded-2xl/3xl` ×185, `rounded-xl` ×237, `rounded-full` ×403. The radius token is 20px, and buttons are pills. |
| Shadows everywhere | **446** shadow utilities. Cards lift on hover (`.enterprise-card:hover`, `.interactive-hover`). |
| Fonts loaded and barely used | Five families load: Inter, Outfit, Plus Jakarta, Geist Mono, and Instrument Serif. Three are used once or not at all. |
| Motion without a reason | `animate-pulse` ×23 (a pulsing "Live Tracking" dot, pulsing Sparkles on buttons). `globals.css` puts a color transition on **every `div`**, which is also a performance cost. |
| Decoration standing in for meaning | `Sparkles` icon ×83, icons in tinted squares, emoji status marks (✓ ✗ ⚠ 🚀 ⚡). |
| Dead dark mode | 873 `dark:` variants, but the theme is hard-locked to light. |
| Every section is a white rounded card with a shadow | The dashboard, the audit, and the competitor page are stacks of boxes. |

---

## 3. Generic AI design patterns found

1. Every section sits in a white `rounded-2xl` card with `shadow-sm`, and cards nest inside cards.
2. Rows of 4 to 8 equal KPI tiles, each with a big number, a colored delta pill, and a filled progress bar.
3. `Sparkles` used to mean "AI" (83 times), sometimes pulsing.
4. "NEW!", "REVAMPED", "PRO", and "Live Index" pills. Small uppercase eyebrows over every block.
5. Gradient avatar tiles (`from-[#FF5A1F] to-[#FFA17A]`) and gradient info banners (`from-orange-50 via-white to-amber-50`).
6. A fake progress modal that walks through "Connecting to live Google SERP… Extracting… Benchmarking…" on timers.
7. Fabricated precise numbers ("+4.2% vs prev. period", "91%", "38").
8. Hand-drawn illustrations with soft glow circles, sparkle glyphs, and six or more colors per drawing.
9. Every other link labelled "View All →" or "Analyze →" with arrow glyphs.
10. Marketing-style headings inside the app ("Real Live Google Organic Rankings & Indexing", "Suggested High-Potential AI Prompts & Variations").
11. A 16px icon in front of almost every heading.

---

## 4. Proposed visual direction: "Evidence, plainly stated"

**The idea:** VSI's distinctive visual is **the real AI answer itself**. Where other tools show a score inside a card, VSI shows the actual answer text: your business highlighted, competitors marked, and the sources listed with yours flagged. Everything else stays quiet, so the evidence and the conclusion carry the page.

Principles:
1. **One conclusion per page, stated in words, next to one number.** For example: "You appear in 13 of 18 AI answers we checked."
2. **Open canvas, not boxes.** Pages are made of sections separated by space and hairlines. Borders are kept for things you can act on (lists with actions), evidence (answer panels), and charts.
3. **"You" is always the brand color.** Wherever a chart or list compares your business with others, your business is the brand color and everyone else is neutral. That gives the brand color a meaning.
4. **Words first, jargon on request.** Every technical term moves into a "Technical details" disclosure.
5. **Honest states.** Every number traces to stored data. When there is no data, the page says so and says how to get it.

Dark mode: the product is light-only today. **Assumption:** this pass stays light-only, but everything is built on tokens so dark mode can be added later without rewriting components.

## 5. Typography

- **Family:** **Geist** for text and **Geist Mono** for numbers in tables and metrics (tabular figures). Drop Inter, Outfit, Plus Jakarta, and Instrument Serif from the app shell. Geist is available through `next/font/google`, so no new dependency is needed.
- **Scale.** Nothing goes below 12px.

| Role | Size / line height | Weight |
|---|---|---|
| Primary metric (one per page) | 44 / 48, tracking −0.02em, tabular | 600 |
| Page title | 22 / 28 | 600 |
| Section title | 15 / 22 | 600 |
| Body | 14 / 21 | 400 |
| Secondary / supporting | 13 / 19 | 400 |
| Caption, meta, table header | 12 / 16 | 500 |

- Only weights 400, 500, and 600 are used. No 800 or 900.
- Sentence case everywhere, with no uppercase letter-spaced labels. The one exception is a single category label per page (for example "GEO" above "AI Visibility").
- Reading width is capped at 65ch for explanatory text.

## 6. Spacing and proportion

- 4px base grid.
- Page gutter: 32px on desktop, 16px on mobile. Content max width: **1200px** (today it is 1440 to 1600, which makes lines too long).
- Vertical rhythm: 40px between sections, 16px inside a section, 8px between closely related items.
- Control heights: 32px compact and 36px default. The sidebar is 240px wide, or 56px collapsed.
- **Radius (one rule):** 6px for controls, inputs, buttons, and chips; 10px for panels, drawers, menus, and modals. Fully round only for avatars and toggles. **No pill buttons.**
- **Elevation:** panels have a hairline border and no shadow. One tinted shadow is reserved for overlays (menus, drawer, modal). Nothing lifts on hover.

## 7. Color strategy

Neutrals come from one cool family, with no mixing of warm and cool grays:

| Token | Value | Use |
|---|---|---|
| `canvas` | `#F6F7F9` | page background |
| `surface` | `#FFFFFF` | panels, sidebar |
| `ink` | `#14171F` | primary text, **primary buttons** |
| `ink-2` | `#4A5160` | secondary text |
| `ink-3` | `#7C8391` | tertiary text, axes |
| `line` | `#E3E6EB` | hairlines, borders |

Meaning:

| Token | Meaning | Use |
|---|---|---|
| `brand` | **VSI / "you"** (one orange, taken from the logo) | logo, active nav marker, focus ring, "your business" in every comparison. **Never used for status.** |
| `positive` | healthy / done | green |
| `attention` | needs attention | **amber**, kept visibly apart from the brand orange |
| `critical` | broken / urgent | red |
| `info` | neutral information, links | blue |

Rules: status is always an icon plus a word, never color alone. There are no gradients. The 175 hex values collapse into these tokens, and no raw hex remains in components.

> **Decision D2** (see section 18): brand orange is kept for identity and "you", primary buttons become ink, and attention becomes amber. This reverses today's orange buttons.

## 8. Illustration strategy

- **On pages with data, the illustration is the evidence.** An `AnswerEvidence` panel renders a real stored AI answer (`aio_full_text` / `chatgpt_response`) with your brand highlighted and the cited sources listed.
- **In empty states, first-run explanations, and "How this works" drawers:** four schematic diagrams, one per concept:
  - Site Audit: a page outline showing its structure (title, headings, answer block).
  - GEO: an AI answer with a numbered source list, with your source marked in brand.
  - Competitors: two answer source lists side by side.
  - Actions: a checklist with a "check again" loop.
- **Style:** 1.5px `ink` strokes, `line` fills, and at most one brand accent (always "you"). No glows, sparkles, gradients, or drop shadows. They are drawn from the same primitives, so they look like one set.
- The seven current illustrations (six or more colors each, glow circles, sparkles) are retired.
- **Icons:** keep `lucide-react`, which the project already uses throughout. Standardize on stroke 1.75 at 16px, or 20px in page headers. Remove `react-icons` (used once), `Sparkles` as an "AI" marker, emoji status marks, and icons placed in front of every heading.

## 9. Simplified navigation

**Nine items in five groups**, replacing twelve items plus badges. Group labels are small and in sentence case.

```
[VSI]  ValGrow Labs            ▾   ← project switcher (All projects · Project settings · Add project)

Overview

Website
  Site Audit
  Search Visibility
  AI Visibility          ← GEO

Competitors
  Competitors

Actions
  Next Actions
  Tasks

Insights
  Reports
  AI Chat
───────────────
Help · Feedback · (Admin: super admins only)
```

| New item | Route | Comes from | Data after the redesign |
|---|---|---|---|
| Overview | `/dashboard` | Dashboard | real summary of the sections below |
| Site Audit | `/dashboard/check` | Site Audit | depends on **D1** |
| Search Visibility | `/dashboard/services/seo` | Rank Tracking | real (`rank_position` history); includes a "Check a search" action (the real quick check) |
| AI Visibility | **`/dashboard/geo` (new)** | Pixel Rank Tracking + `services/geo` | real (section 10) |
| Competitors | `/dashboard/competitors` | Competitor Analysis | real (cited domains + ChatGPT competitor names). **Citation Comparison becomes a section on this page, not a second nav item.** |
| Next Actions | **`/dashboard/next-actions` (new)** | `check?tab=opportunities` | real (opportunities from all sources) |
| Tasks | `/dashboard/tasks` | Action Board | real (unchanged) |
| Reports | `/dashboard/clients/[active]/reports` | Client Reports | real |
| AI Chat | `/dashboard/chat` | AI Chat | real |

**Removed from the main nav. Every route keeps working.**
- Search & AI Check becomes a "Check a search" button on Search Visibility and AI Visibility.
- AI Prompts & SERP (a demo simulator) is hidden from the nav. The useful idea behind it, "the questions we check for you", becomes a section of AI Visibility.
- Project Settings and the projects list move into the project switcher. Super Admin moves to the footer.

**Redirects:**
- `services/geo`, `services/geo-tracked`, and `check?tab=aivisibility` go to `/dashboard/geo`.
- `services/{all, all-services, seo-tracked}` go to `/dashboard/services/seo`.
- `check?tab=opportunities` goes to `/dashboard/next-actions`.
- `check?tab=quick-check` stays as it is.

**Project context (fixes 1.2 #2):** the switcher writes a `vsi_project` cookie. A new server helper, `getActiveProject(session)`, reads it, **checks that the project belongs to the session's agency** (super admins excepted), and falls back to the first project. `?client=` still overrides it for deep links. Every page reads the project this way, and all hardcoded "ValGrow Labs" fallbacks are removed.

## 10. GEO product architecture

**Question the page answers:** "How likely is my business to appear in AI-generated answers, and what can I do to improve that?"

Naming: the nav and page title say **AI Visibility**. **GEO** is the single small category label above the title. Inside the page the words are *AI visibility, AI mentions, AI citations* ("linked as a source"), *competitor presence*, and *opportunities*. Nothing is called a "GEO score".

### Page composition (`/dashboard/geo`)

```
GEO
AI Visibility                                      [Check a search]  [Run AI check]
Help your business get discovered in AI answers.
ValGrow Labs · valgrowlabs.com · Last checked 12 Sep, 09:14

72%          You appear in 13 of 18 AI answers we checked.
AI visibility   Competitors appear more often for 5 searches.
             ─── trend line (only after 2 or more check dates) ───

Where you appear
  Google AI Mode     11 of 16 answers   named 9 · linked 7
  ChatGPT             6 of 18 answers   named 6 · linked 2
  AI Overviews       Not turned on for this project        [Turn on]
  Gemini, Perplexity Coming soon

What AI answers say about you            | Example answer                    (evidence panel)
  ✓ Your brand is named in 13 answers    | "best digital agency dubai"
  ✓ ChatGPT recognises your business     |  …answer text with [ValGrow Labs] highlighted…
  ! Competitors are linked more often    |  Sources  1 agencyx.com  2 valgrowlabs.com (you)
  ! 5 important searches don't mention you|  [See another example]

What you can improve                        ← the most prominent section on the page
  AI answers don't mention your business     5 searches   Customers may find competitors instead.   [See searches →]
  AI uses your pages but doesn't say your name 3 searches                                          [See searches →]
  AI relies on sites where you're not mentioned  Reddit, G2, Clutch                                [See sources →]

You and competitors (you plus the top 3, by answers that link to them)          [View gaps →]
  ValGrow Labs (you)   ██████  11
  agencyx.com          █████████ 19
  …

Searches we check (the 5 most important, "Show all 18")
  search · Google AI · ChatGPT · in words ("Named and linked", "Not mentioned")

▸ Technical details (engine definitions, raw status labels, cited URLs, methodology)
```

**Opportunity drawer** (reusing the existing `IssueDetailDrawer` pattern). It has five parts:
1. **What's happening:** plain language.
2. **Why it matters.**
3. **What to do:** from `lib/opportunities.ts` quick actions, plus citation-strategy actions if they have been generated.
4. **Searches affected:** a list, each linking to its keyword page.
5. **[Create task]**: creates a task in the **existing** task system through `/api/tasks`, with the `tracked_keyword_id` attached. That means the existing outcome check (`task-outcome.ts`) re-checks the search after the task is done and labels it verified, regressed, or neutral. This gives "verify later" with no new task system.

**Flow:** GEO finding → why it matters → recommended improvement → Create task → it appears in Next Actions and Tasks → checked again automatically on the next run.

### Opportunity types (all computed from stored data)

| Opportunity (user-facing) | Source | Task group / owner |
|---|---|---|
| AI answers don't mention your business | `gap_label ∈ {geo_invisible, search_strong_ai_invisible}` plus ChatGPT not mentioned | Content / Writer |
| AI uses your pages but doesn't say your name | `geo_cited_no_mention`, `aligned_no_mention` | Content / Writer |
| Competitors are linked instead of you | a question with cited domains where you are not cited | Off-page / Outreach |
| AI relies on sites where you're not mentioned | platform domains among the cited sources (Reddit, G2, Wikipedia, YouTube, and so on) | Off-page / Outreach |
| ChatGPT may be confusing you with another business | `chatgpt_entity_match = false` | Content / SEO |
| Some pages could answer questions more clearly | `citation_strategy.clientPageAudit.weaknesses` (links to Site Audit) | Content / Writer |

### Connections to other sections
- **GEO → Site Audit:** "Some pages could answer more clearly" uses the real per-page comparison VSI already produces (`clientPageAudit`: strengths, weaknesses, page changes). Site Audit gains a matching section, "Pages AI finds hard to use", so the two features share one finding.
- **GEO → Competitors:** the "You and competitors" block uses the same calculation as the Competitors page, which expands it with "Where competitors appear and you don't".
- **GEO → Overview:** the Overview shows the one-line conclusion and the percentage, linking here.

## 11. GEO data requirements (exact definitions)

These go in a new pure module, `lib/geo.ts`, with no I/O, so it can be tested.

- **Snapshot set:** the latest `search_results` row per `tracked_keyword_id` for the active project, where the keyword is active and `track_type ∈ {geo, both}`. If the newest row is more than 14 days old, show "These results are from N days ago".
- **Per engine:**

| Engine (label) | "Answered" when | "You appear" when | Named | Linked |
|---|---|---|---|---|
| Google AI Mode | `aio_present` | `mentioned_in_text OR client_cited` | `mentioned_in_text` | `client_cited` |
| AI Overviews | `ai_overview_present` | `ai_overview_client_cited` | not captured (shown as "only links are tracked") | `ai_overview_client_cited` |
| ChatGPT | `chatgpt_checked` | `chatgpt_brand_mentioned OR chatgpt_brand_cited` | `chatgpt_brand_mentioned` | `chatgpt_brand_cited` |
| Gemini, Perplexity, Claude | not collected | shown as **Coming soon** | none | none |

- **AI visibility %** = searches where you appear in at least one engine ÷ searches where at least one engine gave an answer. The fraction is always shown next to the percentage. With fewer than 5 searches the page shows "Early read" and leads with the fraction.
- **AI mentions / AI citations** = the number of answers (search × engine) that name you or link to you.
- **Competitor presence** = the number of answers that link to each domain, taken from `cited_domains`, `ai_overview_cited_domains`, and the domains in `chatgpt_cited_urls`. Your own domain is computed the same way, so the comparison is fair. ChatGPT's `chatgpt_competitors` names appear as "Named by ChatGPT".
- **Trend** = AI visibility % for each check date (grouped by `created_at` date). It needs at least 2 dates, otherwise the page says "A trend appears after your next check".
- **"Your website is understood"** = the share of ChatGPT checks where `chatgpt_entity_match` is true. If that column is missing (migration 029 not applied), the item is hidden.
- **Run AI check** = `POST /api/run-client` for the active project (real, existing). A confirmation step shows how many searches will run. Progress and the result come from the API response, not from timers.

**No schema change is required for GEO v1.**
Later, optionally: populate `ai_engine` for Gemini and Perplexity, and add `tasks.source` (`geo`, `site_audit`, `manual`) to show where a task came from. Until then the source goes in the task description.

## 12. Existing data that supports GEO

| Need | Already stored |
|---|---|
| Google AI answers | `aio_present`, `aio_full_text`, `mentioned_in_text`, `client_cited`, `cited_domains`, `citations_json` (AI Mode, on by default) |
| AI Overviews | `ai_overview_present/_full_text/_client_cited/_cited_domains/_citations_json` (opt-in per client) |
| ChatGPT | `chatgpt_checked/_response/_brand_mentioned/_brand_cited/_mention_count/_competitors/_cited_urls/_entity_match` |
| Status per search | the generated `gap_label` column (migration 028) |
| Plain-language advice | `lib/opportunities.ts` (headline, explanation, quick actions per status) |
| Page-level fixes | `search_results.citation_strategy` → `clientPageAudit`, `actions` |
| Tasks + verify later | the `tasks` table, `/api/tasks`, `task-outcome.ts` (verified / regressed / neutral) |
| Running checks | `/api/run-client`, `runKeywordsForClient`, the cron job |
| Engine toggles | `clients.ai_mode_enabled / ai_overview_enabled / chatgpt_enabled` |

## 13. New components

- **Primitives** (`components/ui/`): `Button` (primary ink / secondary / quiet / danger), `PageHeader`, `Section`, `StatStrip` + `Stat`, `Panel`, `StatusLabel` (icon + word + meaning color), `Fraction` ("11 of 16" with a thin bar), `EmptyState` (with a diagram slot), `Drawer` (generalized from `IssueDetailDrawer`), `Disclosure` ("Technical details"), `Rows` (a list with hairline dividers).
- **Shell:** a rebuilt `Sidebar`, `ProjectSwitcher`, and a slimmer `Topbar`.
- **GEO** (`features/geo/`): `GeoSummary`, `EngineCoverage`, `AnswerEvidence`, `AIChecklist`, `OpportunityList` + `OpportunityDrawer`, `CompetitorComparison`, `TrackedSearches`, `RunAICheckButton`.
- **Diagrams:** `SiteDiagram`, `AnswerDiagram`, `CompareDiagram`, `ChecklistDiagram`.
- **Libraries:**
  - `lib/geo.ts` (metrics).
  - `lib/project-context.ts` (the active project).
  - `lib/task-payload.ts`: one function that turns a finding into a *valid* task (group, owner, effort `S/M/L`). Every "Create task" button uses it, which fixes 1.2 #1.
  - `lib/plain-language.ts`: one vocabulary merging `audit-translations.ts` with the `opportunities.ts` wording, plus a map from every `gap_label` to words.

## 14. Existing components to reuse

`lib/opportunities.ts`, `lib/citation-strategy.ts` (`clientPageAudit`), `CitationStrategyPanel` (inside the drawer's technical details), `audit-translations.ts`, the `IssueDetailDrawer` pattern, `/api/tasks`, `/api/run-client`, `task-outcome.ts`, `TasksView` / `TaskCard` / `SortableTaskList` (restyled only), `LiveSearchCheckView` (the real quick check), `KeywordReport*`, `ChatFloating` / `AIChatHero` (restyled), and `StatusDot` (only for real states).

**Charts stay custom SVG, with no chart library added.** `TrajectoryChart` is currently unused and **invents its history** (current value minus 12, minus 8, and so on). It gets refactored into a `TrendLine` that takes real points, sharing the path builder already written in `DashboardClientView`. The rank-distribution bar in `DashboardChartsGrid` is reused for Search Visibility. `graphify-out/` is code-analysis output and is not used in the app.

## 15. Routes affected

| Route | Change |
|---|---|
| `app/layout.tsx`, `globals.css` | fonts, tokens, removal of the global transition and unused utilities (legacy classes kept until pages migrate) |
| `app/dashboard/layout.tsx` | new shell, project context |
| `/dashboard` | Overview rebuilt on real data. Keyword research mode kept, but its seeded numbers are removed or relabelled (**D3**). |
| `/dashboard/check` | Site Audit (**D1**). The `opportunities` and `aivisibility` tabs redirect. |
| `/dashboard/geo` | **new** |
| `/dashboard/next-actions` | **new** (real opportunities across GEO, audit, and search) |
| `/dashboard/services/seo` | Search Visibility on real data. The other `services/*` routes redirect. |
| `/dashboard/competitors` | rebuilt on real data |
| `/dashboard/tasks` | restyle; task source shown |
| `/dashboard/chat` | restyle |
| `/dashboard/clients/[id]/**` | restyle; fix the dark-only `text-white` text; keep as the per-search detail pages that GEO links into |
| `/dashboard/prompts` | hidden from nav, unchanged |
| APIs | **no API contract changes.** Callers are fixed to send valid task payloads. |

## 16. Implementation phases

Each phase can ship on its own and is verified with `npm run build`, `npm run lint`, and a run of the app before the next one starts. Before writing code I'll read the relevant Next.js 16 docs in `node_modules/next/dist/docs/`, as `AGENTS.md` requires.

| # | Phase | Contents | Size |
|---|---|---|---|
| 1 | **Design system** | Tokens, Geist, type scale, radius and elevation rules, the primitives in section 13, the four diagrams. Remove the global `div` transition. No page redesigns yet. | M |
| 2 | **App shell** | New sidebar, project switcher, topbar, `getActiveProject` (cookie + ownership check), removal of hardcoded fallbacks. | M |
| 3 | **Navigation** | New structure, redirects, `next-actions` and `geo` route stubs. | S |
| 4 | **Site Audit** | Per **D1**. In every case: fix task creation and add "Pages AI finds hard to use" from real `clientPageAudit` data. | M to L |
| 5 | **GEO** | `lib/geo.ts` (with tests for the calculations), the `/dashboard/geo` page, a real Run AI check, opportunities, a drawer that creates tasks. | L |
| 6 | **Overview** | Rebuild the dashboard with one real line each for Website health, Search, AI Visibility, and Competitors, plus the top three next actions. Remove every hardcoded module. Scope the results query to the project and a date window. | M |
| 7 | **Cross-feature** | Real Competitors page, real Next Actions, task source labels, `task-payload` used everywhere, Search Visibility on real data. | L |
| 8 | **Responsive** | A pass at 375, 768, 1024, and 1440px, with a sidebar drawer on mobile. | S |
| 9 | **De-slop audit** | Audit against sections 2 and 3 and the taste skill's pre-flight checks (no em-dashes in UI copy, eyebrow count, one accent, one radius system, copy self-audit), then refine. Only hierarchy, spacing, and consistency change, not functionality. | M |

## 17. Risks and possible regressions

1. **Removing demo numbers makes empty accounts look empty.** This is the right direction, but it changes what demos show. Mitigation: well-designed empty states that say how to get data, plus **D3**.
2. **The project cookie could expose another agency's project** if it is not validated. Mitigation: an ownership check in `getActiveProject`, with RLS as a second layer. Test with an agency user and with a super admin.
3. **Shared tokens reach the login and admin pages.** Mitigation: legacy utility classes stay until each page migrates; login and admin get checked after Phase 1.
4. **Bookmarked URLs:** every old URL gets a redirect (section 9).
5. **Run AI check costs API credits and time.** The code notes a proxy limit of about 60 to 90 seconds. Mitigation: a confirmation step showing the number of searches, handling of long runs and timeouts, and no automatic runs from the UI.
6. **Query load:** today the dashboard loads *every* agency result with no limit for non-admins. It will be scoped to the project and a time window.
7. **Mixed look during rollout:** pages that haven't been migrated will look old until their phase lands.
8. **Can't check signed-in screens myself** without test access (**D4**). Without it, verification is limited to the build, lint, public routes, and your review.
9. **Missing migrations in production** (for example 029, the entity columns). `lib/geo.ts` treats a missing field as unknown, never as false.
10. **Next.js 16 conventions:** the dev server already warns that `middleware` is deprecated in favour of `proxy`. I won't touch routing internals beyond redirects without reading the local docs first.

## 18. Decisions needed before implementation

- **D1: Site Audit has no engine.** Options:
  - **(A, recommended)** Build a small real audit. It fetches the homepage and up to about 10 pages from the sitemap and checks: whether AI crawlers are allowed in robots.txt, page titles and descriptions, heading structure, business schema, answer or FAQ blocks, broken internal links on the scanned pages, and image alt text. Results are stored in a new `site_audits` table (one migration), and it likely needs one small HTML-parser dependency.
  - **(B)** Keep the audit's design but show it as a clearly labelled example until an engine exists.
  - **(C)** Reduce Site Audit to what AI checks already know (`clientPageAudit`), which covers only pages that rank.
- **D2: Color.** Brand orange is used only for identity and "you". Primary buttons become ink. "Needs attention" becomes amber. (Recommended.)
- **D3: Demo data.** Either remove every fabricated number everywhere and use empty states (recommended), or keep a *clearly labelled* "Sample data" view for empty accounts.
- **D4: Test access.** Can you give me a test login (or a seeded dev account) so I can check signed-in pages in a browser after each phase?
- **D5: Testing.** Add `vitest` as a dev dependency so the GEO calculations in `lib/geo.ts` can be unit-tested. (Recommended; it is the only new dependency outside D1.)

---

## Implementation status (2026-09-18)

Decisions taken when the plan was approved without answers: D1 = A (real audit engine), D2 = recommended colors, D3 = no fabricated numbers, D5 = Vitest added. One change from the plan: the logo is **gold**, so brand = logo gold (`#B07F22` marks, `#8A6414` text) and **orange = "needs attention"**, matching the brief's color semantics.

**Done**
- Design system: tokens, Geist, type/radius/elevation scale, primitives (`components/ui/*`), four concept diagrams, `TrendLine` (TrajectoryChart rewritten to plot only real points).
- Shell: new sidebar (9 items, 5 groups), project switcher, topbar breadcrumb, `getProjectContext()` + `vsi_project` cookie (server-validated), deep links set the active project, localStorage projects removed.
- Navigation: redirects for every old URL; duplicate `services/*` pages removed.
- Site Audit: real crawler (`lib/site-audit/*`, SSRF-safe fetch), 13 checks, plain-language copy, history, `/api/site-audit` (+ status), "Pages AI finds hard to use" from citation strategy.
- GEO: `lib/geo.ts` (metrics), `lib/geo-findings.ts`, `/dashboard/geo` with real engine coverage (Gemini/Perplexity "Coming soon"), evidence panel, opportunities, competitor comparison, searches table, Run AI check.
- Overview, Search Visibility, Competitors, Next Actions, Tasks, Projects, AI Chat rebuilt on real data through one aggregation (`lib/project-summary.ts`).
- Tasks: every "Create task" goes through `lib/task-payload.ts` (valid values); task board uses the real API; status changes persist; outcomes shown.
- Honesty fixes: fabricated dashboard modules deleted; research API returns only real data; chat uses the active project + findings, requires a session, never invents numbers; pipeline refuses to store demo results.
- De-slop pass on remaining pages (styling only): brand colors, weights, radii, shadows, micro-labels, tiny text, gradients, em-dashes.
- Tests: 66 unit tests (`npm test`). Build passes.

**Needs action**
- Apply `supabase/migrations/migration_035_site_audits.sql` in Supabase before Site Audit can save results (the page shows a setup notice until then).
- Verified locally in dummy mode (empty states) and with a fixture preview (populated states); not yet with real data.

**Not done (out of this plan's scope)**
- Admin area is still largely mock data (see the architecture plan, Phase 12).
- Security findings in `docs/architecture/VSI_PRODUCTION_ARCHITECTURE_PLAN.md` §5 are unchanged.
- Project detail / keyword / reports / help / feedback / messages / settings pages were restyled by the de-slop pass, not redesigned. The prompts simulator (`/dashboard/prompts`) is still a demo and is hidden from the nav.
