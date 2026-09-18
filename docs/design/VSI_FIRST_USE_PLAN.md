# VSI first-use experience plan

Status: **proposal, waiting for approval.** No code has been changed for this plan.
Branch: `feat/redesign-geo` (the redesign from `VSI_REDESIGN_GEO_PLAN.md` is still uncommitted there).
Date: 2026-09-18

---

## 0. Design read and dials (Taste skill)

**Design read:** in-product first-use and onboarding screens for a B2B search-visibility product used by non-technical business owners. Calm, trust-first, explanatory language, built on the existing VSI tokens (Geist, ink neutrals, gold only for "you") with inline SVG product diagrams.

**Mode:** redesign, preserve. Brand, tokens, navigation labels, routes and data views stay. Only the no-data and first-use surfaces are recomposed, plus the setup flow.

**Dials:** `DESIGN_VARIANCE 4` (left-aligned, split heroes, some asymmetry, no artsy layouts). `MOTION_INTENSITY 2` (hover and focus only; nothing animates on its own). `VISUAL_DENSITY 4` (roomy, but every section carries information).

**Where this plan departs from the Taste skill, and why:**

| Taste skill rule | This plan | Reason |
|---|---|---|
| Hand-rolled SVG illustrations discouraged; use image generation or photos | Inline SVG diagrams | You asked for inline SVG and no external images. No image-generation tool is available here. The diagrams are schematic product drawings in one visual language, not decorative art (rules in section 7). |
| No "01 / 02 / 03" step labels | Numbered "How it works" steps | You asked for them. The number stays small and secondary; the verb is the label. |
| No three equal feature cards | No feature cards at all | "What we check" becomes an icon list and an annotated diagram, not a card row. |

---

## 1. Current UX problems

Taken from screenshots of every main page at 1440px and 390px in no-project mode.

1. **One empty state everywhere.** All nine pages render the same dashed box (about 190px tall) with a 160px thumbnail, one sentence and "Add project". Below it, roughly 500px of blank canvas at 1440px. Every page looks the same, so none of them explains itself.
2. **It says what is missing, not what the feature does.** "Add a project to audit your website" never tells a new user what an audit finds or why it matters.
3. **The copy is about our data model.** "Project" is an internal concept. The user's goal is "add my website".
4. **Diagrams are too small to explain anything.** They are 160px thumbnails next to text.
5. **Zero projects looks like an error.** The sidebar switcher shows an orange "?" tile with "No project yet".
6. **Reports has no first-use state.** With no project, the Reports link silently sends you to the Projects list.
7. **Chat contradicts itself.** The floating "Ask VSI" button is offered with no project, while the Chat page says chat needs one.
8. **The setup flow is not honest and not guided.**
   - The progress messages ("Analyzing website structure...", "Detecting services & niche...") tick on a 450ms timer. They are not real progress.
   - When the suggestion API fails, the page invents a list of searches ("best marketing & advertising in AE") and pre-selects them. This breaks the "real data or clear explanation" rule.
   - There is no competitor step, although the Competitors page depends on competitors.
   - It uses technical labels ("Default Search Location", "Industry / Niche", "Long-tail", "GEO / Location", "AI Prompts") and leftover visuals (pill button, heavy headings, card inside card).
9. **Pages with a project but no data are just as terse.** "Run your first audit" or "Run your first AI check" in the same small box, with no sense of what has been set up and what hasn't.
10. **No loading or error screens.** `/dashboard` has no `loading.tsx` or `error.tsx`, so server loads show nothing and unexpected errors fall through to the root error page.
11. **Nothing explains how the modules connect.** Nowhere does the product tell the "website → audit → search → AI → competitors → actions → tasks → reports" story.
12. **The client Reports page was only restyled.** It still reads "Executive Intelligence Reports" and "white-labeled", and uses cyan monospace links.

**Taste audit of what exists now:**
- The dashed "upload zone" box used as a universal empty state is a generic SaaS pattern.
- The setup form has a card inside a card, a pill button and bold headings.
- The biggest risk for this work is the opposite failure: turning every page into "hero + 3 feature cards + 4 step cards". The template below avoids cards.

---

## 2. Current information architecture

```
Overview                     /dashboard
Website
  Site Audit                 /dashboard/check
  Search Visibility          /dashboard/services/seo
  AI Visibility              /dashboard/geo
Competitors
  Competitors                /dashboard/competitors
Actions
  Next Actions               /dashboard/next-actions
  Tasks                      /dashboard/tasks
Insights
  Reports                    /dashboard/clients/<id>/reports   (no project: /dashboard/clients)
  AI Chat                    /dashboard/chat
Setup                        /dashboard/clients/new  (2 steps: website, searches)
Project context              vsi_project cookie, validated server-side, switcher in sidebar
```

## 3. Proposed information architecture

The same pages and routes, with three changes:

```
Overview                     /dashboard
Website
  Site Audit                 /dashboard/check
  Search Visibility          /dashboard/services/seo
  AI Visibility              /dashboard/geo
Competitors
  Competitors                /dashboard/competitors
Actions
  Next Actions               /dashboard/next-actions
  Tasks                      /dashboard/tasks
Insights
  Reports                    /dashboard/reports            <- NEW route
AI
  AI Chat                    /dashboard/chat               <- own group, as you asked
Setup                        /dashboard/clients/new        (4 steps: website, searches, competitors, start)
```

- `/dashboard/reports` is new. With an active project it redirects to `/dashboard/clients/<id>/reports`. With no project it shows the Reports first-use page.
- No new nesting. Every existing URL keeps working.

---

## 4. Visual direction

"A product that explains itself", not a marketing page. It is the same app shell, tokens and type, with one new layout: the **feature intro**.

**Feature intro, desktop (1440px):**

```
+-----------------------------------------------------------------------------+
| GEO: Generative Engine Optimization            (category line, only on GEO) |
|                                                                             |
| AI Visibility                                  +-------------------------+  |
| See whether AI systems mention your business.  |                         |  |
|                                                |   illustration on a     |  |
| Understand how your business appears in        |   flat surface-2 plate  |  |
| AI answers, and where competitors are          |   (about 440 x 300)     |  |
| mentioned instead.                             |                         |  |
|                                                +-------------------------+  |
| [ Add your website ]   See an example answer  ->                            |
|-----------------------------------------------------------------------------|
| What you'll discover                                                        |
|                                                                             |
|  (icon) AI mentions                    (icon) AI citations                  |
|  When your business appears in         When an answer links to your         |
|  an AI answer.                         website as a source.                 |
|                                                                             |
|  (icon) Competitor presence            (icon) Opportunities                 |
|  When a competitor appears             Searches where you could be          |
|  instead of you.                       more visible.                        |
|                                                                             |
|  Checked today in: Google AI Mode, ChatGPT, Google AI Overviews (optional)  |
|  Coming soon: Gemini, Perplexity                                            |
|=============================================================================|
| How it works                                    (full-width surface-2 band) |
|                                                                             |
|  01 ----------------- 02 ----------------- 03 ----------------- 04          |
|  Choose important     VSI checks           Compare your         Find ways   |
|  searches             AI answers           visibility           to improve  |
|=============================================================================|
| Where this fits                                                             |
| Website > Site Audit > Search > [AI Visibility] > Competitors > Actions ... |
|                                "Do AI systems mention me?"                  |
+-----------------------------------------------------------------------------+
```

**Rules:**
- **Hero:** split 7/5. Text on the left, illustration on the right. It must fit in the first viewport at 1440x900 with the CTA visible. The headline is at most 2 lines, and the description at most 25 words.
- **"What you can do":** a 2-column icon list separated by white space. No borders, no cards, and no tinted icon squares. Icons are lucide at 20px in ink-2.
- **"How it works":** the one full-width tinted band on the page, with a hairline joining the steps. Step numbers use Geist Mono in ink-3.
- **"Where this fits":** a single line of text links with the current page marked in gold.
- **Color:** ink primary button and neutral surfaces. Gold appears only for "you" and "current". No gradients, shadows, glows or badges. The one exception is the "Example" tag in Next Actions, where it carries meaning.
- **Shape:** keep the existing radii of 6px for controls and 10px for panels.
- **Type:** one new size, `--text-display` (32/40 on desktop, 26/32 on mobile, semibold, -0.02em), used only for intro headlines. Everything else uses the existing scale.
- **Length:** at most four sections, about 1.5 to 2 screens on desktop. Every section carries information. There is no "Why use this" section, because it would repeat the description. The "why" goes in the hero sentence instead.
- **Copy:** plain words, zero em-dashes, and one label per intent across the whole app.
- **Tablet (768 to 1023px):** the hero stacks with the text first and the illustration capped at 480px. The icon list stays 2 columns and the steps become 2x2.
- **Mobile (below 768px):** everything is one column. The steps stack vertically with the hairline running down the left, and "Where this fits" becomes a short vertical list. Text never shrinks below the existing caption size.

---

## 5. Empty-state strategy: three levels

Every main page decides which of these to render from real, server-side state.

| Level | When | What renders |
|---|---|---|
| **A. First use** | The user has no projects, or no active project | The full feature intro (section 4). CTA: **Add your website**, which goes to setup step 1. |
| **B. Set up, no data yet** | A project exists but this feature has nothing yet | A short intro header, then a real **setup checklist** built from the project's actual state, then "How it works". CTA: the next missing step, with its own label (for example "Add your first search"). |
| **C. Data** | Real results exist | Today's views, unchanged, plus a small "How this works" link in the page header that opens the intro in the existing Drawer. |

**Level B checklist (AI Visibility for Valgrow Labs; every line is real state):**

```
Set up AI Visibility for valgrowlabs.com
  (done) Website added                      valgrowlabs.com
  (done) Searches chosen                    12 searches
  (todo) First AI check                     Not run yet             [ Run first check ]
```

**Loading:** a new `src/app/dashboard/loading.tsx` shows skeletons in the page's shape using the existing `Skeleton`.

**Errors:** a new `src/app/dashboard/error.tsx` uses a plain `Notice` with "Try again". Module-level load errors keep the existing inline Notices.

**CTA label rule (decision D1):** with no project, every page's CTA reads **Add your website**, because that is what actually happens next. The feature-specific labels you wrote ("Add your first search", "Set up AI Visibility", "Add competitors") are used at level B, where they do exactly what they say. Using four different labels that all open the same setup form would be misleading.

---

## 6. Page-by-page changes

All copy below is the proposed on-screen text. Your wording is kept where it was given, with em-dashes removed.

### Overview (`/dashboard`)

**Zero projects: the welcome screen**
- **Hero:** "Welcome to VSI" / "Understand how your website appears across search and AI." CTA: Add your website. Illustration: the connected ecosystem (section 7).
- **"What you'll see":** the product story as five linked rows. Each links to that page's intro, so a new user can explore before adding anything:
  - Website health: "Is my website healthy?"
  - Search visibility: "Can people find me?"
  - AI visibility: "Do AI systems mention me?"
  - Competitor insights: "Where are competitors appearing?"
  - Recommended actions: "What should I improve?"
- **"How VSI works":** 01 Connect your website, 02 Add the searches that matter, 03 Track your visibility, 04 Improve what matters.

**Project, no data yet (right after setup)**
- **Header:** "Understand how your website is performing." / "See your website health, search visibility, AI visibility and the actions that can improve them, all in one place."
- **"Getting started" checklist (real state):**
  - Website added
  - Searches chosen (n)
  - Competitors added (n)
  - First site audit (running, done or not run)
  - First search and AI check (not run yet, with a button)
- The four overview modules then show their existing one-line empty text.

**Data:** unchanged.

### Site Audit (`/dashboard/check`)

- **Level A:**
  - "Find problems that could be hurting your website." / "VSI checks your website and shows you what needs attention."
  - Illustration: a browser with checked rows and one attention marker.
  - **"What we check"** is an annotated diagram. The four areas are pinned to parts of the illustration, and each names the real checks behind it:
    - **Website health:** "Make sure visitors can use your website easily." (secure connection, pages that fail to load, broken links, mobile layout)
    - **Search readiness:** "Help search engines understand your pages." (indexable pages, sitemap, page titles, descriptions)
    - **AI readiness:** "Help AI systems understand and use your content." (AI crawlers allowed, business details, answer-style content)
    - **Content:** "Find pages that could explain things more clearly." (headings, answer content, image descriptions)
  - How it works: Add your website, VSI checks your pages, We find important issues, You get simple recommendations.
- **Level B:** "Run your first audit" with "Checks up to 10 pages of valgrowlabs.com in about a minute" and the existing `RunAuditButton`.
- **Alignment:** regroup the results page under the same four area names, so the intro and the results match. This changes the labels and the check-to-area mapping in `lib/site-audit/copy.ts`. The checks themselves don't change.

### Search Visibility (`/dashboard/services/seo`)

- **Level A:**
  - "See how your website appears in search." / "Track the searches that matter to your business and understand where your website appears."
  - Illustration: a results page with your result marked and an up arrow.
  - What you can track:
    - **Search rankings:** "Track where your pages appear."
    - **Ranking changes:** "See what improved or dropped."
    - **Important searches:** "Focus on searches that matter to your business."
  - How it works: Add searches, VSI tracks your rankings, See changes over time, Find opportunities.
- **Level B:**
  - No searches: CTA **Add your first search**, which goes to `/dashboard/clients/<id>/keywords/new`.
  - Searches added but not checked yet: show "Waiting for the first check" and the Run button.
- **No empty chart is ever drawn.** The trend chart renders only with at least two real data points.

### AI Visibility (`/dashboard/geo`)

- **Level A:** as in the section 4 mockup.
  - The category line reads "GEO: Generative Engine Optimization". That is the only place the term appears. Everywhere else says "AI Visibility".
  - The "Checked today in" line lists only the engines that are really wired up, with Gemini and Perplexity marked "Coming soon".
- **Level B:**
  - No searches: CTA **Set up AI Visibility**, which goes to add searches.
  - Searches but no check yet: **Run first check**, using the existing `RunChecksButton`.

### Competitors (`/dashboard/competitors`)

- **Level A:**
  - "Understand where competitors are appearing and where you have opportunities." / "Compare your business with the competitors your customers are already considering."
  - Illustration: three rows, "you" in gold and two neutral competitors, each with a search mark and an AI mark. No names and no numbers.
  - What you can see:
    - **Search visibility:** who shows up on Google for your searches.
    - **AI visibility:** who AI answers mention or cite.
    - **Content opportunities:** searches where a competitor appears and you don't.
    - Mentions and citations are folded into AI visibility, so the list isn't padded.
  - How it works: Add competitors, VSI compares visibility, Find gaps, Turn gaps into actions.
- **Level B:** an inline **Add competitors** form, up to 5 domains (needs D2). A competitor you added that hasn't appeared in any check yet shows "Not seen in your checks yet", which is a true statement, not a zero.

### Next Actions (`/dashboard/next-actions`)

- **Level A:**
  - "Know what to work on next." / "VSI turns website, search and AI findings into clear actions you can take."
  - The centerpiece is the flow diagram: VSI finds something, Explains why it matters, Recommends what to do, You create a task, Track progress.
  - Four example actions, each tagged **Example** in a dashed outline, which is the one place dashed means "placeholder": Fix website issues, Improve important pages, Strengthen AI visibility, Improve search visibility. Their one-line text comes from the real finding templates, but none of them shows a number or a site.
- **Level B:** "No actions yet. Actions appear after your first site audit or AI check," with buttons to both.

### Tasks (`/dashboard/tasks`)

- **Level A:**
  - "Turn recommendations into work your team can complete." / "Create tasks from VSI findings and keep track of what has been completed."
  - Illustration: a three-column board outline with blank cards.
  - What you can do:
    - Create tasks from findings
    - Give each task an owner (writer, developer, SEO or outreach)
    - Track progress
    - Mark work as done
    - VSI re-checks when you finish
  - "Assign work" is described by role, because tasks store a role, not a person.
- **Level B:** the existing "No tasks yet" with **See Next Actions**.

### Reports (`/dashboard/reports`, new route)

- **Level A:**
  - "Understand your progress over time." / "Bring your website, search and AI visibility together in clear reports you can share."
  - Illustration: a document with a line chart outline.
  - The "What reports show" list only includes what reports really contain (see D3).
- **Level B:** the client Reports page is rebuilt on the design system and the leftover copy removed. Its empty state reads "No reports yet" with **Create report**.

### AI Chat (`/dashboard/chat`)

- **Level A:**
  - "Ask questions about your website and visibility." / "Ask VSI about your website, search visibility, AI visibility, competitors and recommended actions."
  - Illustration: a chat bubble with a source list.
  - Four example questions are shown as quotes, not buttons:
    - "What should I fix first?"
    - "Why did my visibility change?"
    - "Which pages need attention?"
    - "How visible is my business in AI answers?"
  - Then "Add a project first so VSI can answer questions about your website," with **Add your website**. There is no chat input.
  - The floating "Ask VSI" launcher is hidden until the user has a project.
- **With a project:** the same example questions become the existing starter buttons.

### Sidebar and project switcher

- With zero projects, the switcher becomes a quiet "Add your website" row with a plus icon, replacing the orange "?" tile.
- AI Chat moves into its own "AI" group.
- Reports points to `/dashboard/reports`.

---

## 7. Illustration strategy

- **Set:** one set of nine scenes in `src/components/illustrations/`, as server components with inline SVG, zero JavaScript and about 1 to 2 KB each.
  - **Overview:** the website in the middle, joined to four module marks (audit, search, AI answer, competitors) that feed a checklist.
  - **Site Audit:** a browser window, rows with check marks, one attention marker, and a magnifier.
  - **Search Visibility:** a results page of grey rows, one row in gold with an up arrow.
  - **AI Visibility:** an answer block with a gold highlight and numbered source dots, one of them gold.
  - **Competitors:** three stacked rows, "you" in gold, each with a search icon and an AI icon.
  - **Next Actions:** the find, explain, recommend, task, track flow.
  - **Tasks:** a three-column board.
  - **Reports:** a document with a heading, a line-chart outline and a checklist.
  - **AI Chat:** a question bubble, an answer bubble and a small source list.
- **One visual language:**
  - 1.5px strokes in `currentColor` (ink-3) and `surface-2` fills.
  - At most one gold mark (always "you" or "your site") and at most one status color (attention orange, only for "an issue").
  - Every scene has an `aria-label`. Dark mode works through the tokens.
- **Honesty rules:**
  - No numbers except step order, no percentages, no brand or site names, and no readable text.
  - Text is drawn as grey lines, so the drawings can never be mistaken for a screenshot or real data.
  - They appear only on first-use and setup screens, never beside real results.
- **Reuse:** the four existing diagrams (`SiteDiagram`, `AnswerDiagram`, `CompareDiagram`, `ChecklistDiagram`) become the small size of the matching new scenes, and `components/diagrams` is folded into the new folder. No duplicates.

---

## 8. Navigation changes

- `nav.ts`:
  - Add an "AI" group holding AI Chat.
  - Point Reports' `href` to `/dashboard/reports`.
  - Keep `isActive` for Reports true on both `/dashboard/reports` and `/dashboard/clients/<id>/reports`.
- `pageTitleFor`: add "Reports" and "Add your website" (the setup page).
- No other label or route changes.

---

## 9. Project-context strategy

Most of this already exists, and this plan keeps it:
- One active project in the `vsi_project` httpOnly cookie, validated server-side on every request.
- Deep links override it, and every module reads it through `getProjectContext`.

Additions:
1. **Setup finishes by selecting the new project.** It calls the existing `POST /api/project/select`, so Site Audit, Search, AI Visibility, Competitors, Next Actions, Tasks, Reports and Chat all show valgrowlabs.com immediately. The website is never asked for again.
2. **Level decision on the server.** A new `loadSetupStatus(project)` in `src/lib/setup-status.ts` gets head-only counts (searches, competitors, audits, checks run, tasks) in one parallel batch. Each page uses it to choose level B or C. This is cheap, so there's no extra waterfall.
3. **Zero, one or many projects.**
   - Zero: level A everywhere.
   - One: selected automatically (existing behavior).
   - Many: the switcher, plus a `router.refresh()` on switch (existing).
   - A deleted or forbidden project in the cookie already falls back to the first allowed project.

---

## 10. GEO integration

- **The term:** "GEO: Generative Engine Optimization" appears only as the category line on the AI Visibility intro and in the Overview ecosystem diagram's label. All headings, buttons, findings and chat copy say "AI Visibility", "AI answers", "mentions" and "citations".
- **Engine list:** the "Checked today in" line reads from the existing `ENGINES` / `COMING_SOON_ENGINES` in `lib/geo.ts`, so the intro can never claim more coverage than the product has.
- **In the setup flow:** step 2 explains that the searches chosen there are used for both Google rankings and AI answers, so the user sees that one list powers both.

---

## 11. Existing components to reuse

| Component | Where |
|---|---|
| `PageContainer`, `Section`, `TextLink` | All intros and level B pages |
| `ButtonLink` / `Button` | Every CTA |
| `Notice`, `StatusIcon` | Errors, setup checklist states |
| `Skeleton` | `loading.tsx` |
| `Drawer` | "How this works" on data pages |
| `Disclosure` | "More options" in setup step 1 |
| `RunAuditButton`, `RunChecksButton` | Level B actions |
| `ChatStarter` (`vsi:ask`) | Chat example questions once a project exists |
| `ENGINES`, `COMING_SOON_ENGINES`, `CHECK_COPY` | Truthful intro lists |
| `normaliseDomain` | Competitor and website validation |
| `/api/project/select`, `/api/site-audit`, `/api/clients/ai-keywords` | Setup flow |

`EmptyState` stays, but only for small in-page empties (an empty table or filter). It will no longer be used as a whole-page state.

## 12. New components

| New | Purpose |
|---|---|
| `components/intro/FeatureIntro.tsx` | The level A template: hero, capability list, steps, "Where this fits" |
| `components/intro/CapabilityList.tsx` | 2-column icon list, no cards |
| `components/intro/StepRail.tsx` | Numbered steps, horizontal on desktop and vertical on mobile |
| `components/intro/ProductStory.tsx` | The website-to-chat chain, with the current page marked |
| `components/intro/SetupChecklist.tsx` | Level B checklist from real status |
| `components/illustrations/*` | The nine scenes (section 7) |
| `content/intros.ts` | All intro copy in one typed registry, so it's reviewed and tested in one place |
| `lib/setup-status.ts` | Real setup counts per project |
| `app/dashboard/reports/page.tsx` | Reports route (redirect or intro) |
| `app/dashboard/loading.tsx`, `error.tsx` | Loading and error screens |
| `features/competitors/AddCompetitorsForm.tsx` | Level B and setup step 3 (needs D2) |

---

## 13. Data and API requirements

1. **Migration 036, `project_competitors` (D2).**
   - Columns: `id`, `client_id`, `agency_id`, `domain`, `name`, `created_at`, `created_by`, with a unique `(client_id, domain)` and a limit of 5 per project, checked in the API.
   - RLS matches `clients`: agency members read and write their own agency's rows, and super admins read everything.
   - It must be applied in Supabase, like migration 035.
2. **`POST` / `DELETE /api/projects/[id]/competitors`.**
   - Session required. Project access is checked server-side, the same way as `/api/project/select`. Domains are validated with `normaliseDomain` and your own domain is rejected.
3. **`mergeCompetitors` gains declared competitors.** It stays unit-tested. Declared competitors without results get `seen: false`, never zero counts.
4. **Setup flow API.**
   - The fake timed progress is removed and replaced by a single honest "Suggesting searches..." state.
   - The invented fallback searches are removed. If suggestions fail, the user sees "We couldn't suggest searches right now. Add a few yourself," with an input.
5. **"Start VSI"** does three things:
   - Creates the project, then saves its searches and competitors (the same Supabase calls as today).
   - Selects the project.
   - Starts the free site audit through `/api/site-audit`.
   Search and AI checks are not auto-run (D4). The Overview checklist offers **Run first check**.
6. **Reports content (D3).** Today reports contain only search rankings, AI Mode citations, wins, losses and competitor opportunities. They contain no website health, completed tasks or progress over time.
7. **No new external services and no new dependencies.**

---

## 14. Implementation phases

1. **Foundations.**
   - `content/intros.ts`, the intro components, the nine illustrations and the `--text-display` token.
   - `loading.tsx` and `error.tsx`.
   - Navigation changes and the `/dashboard/reports` route.
2. **Level A on all nine pages.** Includes the Overview welcome, the zero-project switcher and hiding the chat launcher.
3. **Level B.** `lib/setup-status.ts`, `SetupChecklist`, and the per-page "set up, no data" states. Also the "How this works" drawer on data pages.
4. **Setup flow.**
   - Four steps, with the fake progress and invented fallback removed.
   - Migration 036, the competitors API and `AddCompetitorsForm`.
   - Selecting the new project and starting the first audit.
5. **Reports.** Rebuild the client Reports page on the design system, plus the D3 work if approved.
6. **Verification, de-slop audit and refinement** (section 15).

## 15. Testing strategy

- **Unit tests (Vitest, added to the existing 66):**
  - The intro registry: every nav item has an intro, there are no em-dashes, CTA labels are 3 words or fewer, and there's one label per intent.
  - Engine lists match `ENGINES`.
  - `loadSetupStatus` maps to levels A, B and C.
  - Competitor domain validation (own domain rejected, duplicates rejected, a maximum of 5).
  - `mergeCompetitors` with declared-but-unseen competitors.
- **States, screenshotted at 1440, 1024, 768 and 390:**
  - No project and zero projects: real, because local dummy mode has no data.
  - One project with no data, one project with partial data, multiple projects, real data, loading and errors: through a temporary dev-only fixture route that renders each view with fixed props. It is deleted before finishing, as last time.
- **Project switching:** the API route's access checks are unit-tested and the switcher is checked with fixtures. The end-to-end switch needs a real Supabase login, which I can't do locally. Flagged for your test.
- **Every route** returns 200 with no horizontal scroll at any width, and every redirect still works.
- **Checks:** `npm run build`, `npm run lint`, `npm test`.
- **De-slop audit after implementation:** the Taste pre-flight checklist run mechanically:
  - em-dash grep, eyebrow count, card count per page, duplicate CTA intents
  - button contrast, CTA wrap at desktop, one accent, one radius system
  - then "audit this interface for generic AI design patterns", the biggest remaining problems, and visual-only fixes.

---

## Decisions needed

| # | Question | Recommendation |
|---|---|---|
| **D0** | Commit the finished redesign on `feat/redesign-geo` before starting, so this work is a separate, reviewable change? | **Yes** |
| **D1** | With no project, should every CTA read "Add your website", with feature-specific labels only once a project exists? | **Yes** (reasoning in section 5) |
| **D2** | Add a `project_competitors` table (migration 036) so users can add competitors in setup and on the Competitors page? The alternative is dropping the competitor step and only showing competitors VSI discovers. | **Add the table** |
| **D3** | Reports: add the website-health score and completed tasks to generated reports (both are real data), or describe only what reports contain today? | **Add them.** Otherwise the Reports intro can list only rankings, AI citations and competitor opportunities. |
| **D4** | "Start VSI" starts the free site audit automatically. Should it also auto-run the first search and AI checks, which cost API credits per search? | **Don't auto-run.** Offer "Run first check" on the Overview. |

Nothing will be implemented until you approve this plan and answer or accept these decisions.
