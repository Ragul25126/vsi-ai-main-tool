# VSI complete UI redesign plan

Status: in progress on `feat/redesign-geo`. Started 2026-09-19.
Scope: presentation layer only. No changes to Supabase, auth, RLS, API routes, project logic, audit execution, the onboarding state machine, or the performance fixes. No migrations.

This plan builds on `VSI_REDESIGN_GEO_PLAN.md` ("Evidence, plainly stated") and `SUPER_ADMIN_REDESIGN_PLAN.md`. Those passes gave VSI one token system and honest data states. This pass raises the visual level of that system and brings the remaining legacy areas onto it. It does not start again.

---

## 1. Audit summary

What was inspected: every route under `src/app/dashboard`, `src/app/admin`, `src/app/r`, login and onboarding; the shell (`layout.tsx`, `Sidebar`, `Topbar`, banners, floating chat); `src/components/ui`; `src/components/intro`; the illustration set; the SVG charts; `loading.tsx` / `error.tsx`; the project and onboarding providers.

### 1.1 What is already sound (keep, refine)

| Area | State |
|---|---|
| Tokens in `globals.css` | One neutral family, brand gold, four status colors, a type scale, two radii, one overlay shadow. Dark values exist. |
| Primitives in `components/ui` | `PageContainer`, `PageHeader`, `Section`, `Panel`, `StatStrip`/`Stat`, `Fraction`, `Notice`, `StatusLabel`, `Button`, `Drawer`, `Disclosure`, `EmptyState`, `Skeleton`. |
| Core pages | Overview, Site Audit, Search Visibility, AI Visibility, Competitors, Next Actions, Tasks (board), Reports list, AI Chat page, Projects, project setup, add searches: 0 legacy classes. |
| Data states | Every core page already separates no project / project without data / data / error, from real state. |
| First-use system | `INTROS` copy, `FeatureIntro`, `SetupPanel`, `GuideTarget`, `STORY_CHAINS`, covered by tests. |
| Charts | One custom SVG `TrendLine`. Bars are plain elements. No chart library. |
| Super Admin | Own shell and nav, server-side `requireSuperAdmin()` in the layout and in every page, 0 legacy classes. |

### 1.2 What makes the product feel basic

1. **Flat hierarchy.** Page title 22px, section title 15px, body 14px. Nothing on a page is clearly the most important thing except the one big metric.
2. **First-use pages read like documentation.** Small hero, plain icon list, grey step strip.
3. **The shell is quiet to the point of anonymous.** Weak active state, faint group labels, a top bar with no visual relation to the page.
4. **Same-weight sections.** Every section is "15px heading, then a bordered list". Good restraint, no rhythm.
5. **Loading is one generic skeleton** shaped like a metric grid, shown for boards, tables and detail pages alike.

### 1.3 Legacy islands (off the token system)

| File | Problem |
|---|---|
| `components/NotificationDropdown.tsx` | ~30 inline hex values, JS `isDark` branching, imperative hover styles |
| `features/assistant/components/ChatFloating.tsx` | ~83 alias classes, emoji as icons, class names inside a markdown HTML string |
| `dashboard/clients/[id]/keywords/[keywordId]` + `KeywordIntelligenceView`, `CitationStrategyPanel`, `OpportunityBriefButton`, `KeywordReportButton`, `KeywordTasksPanel`, `KeywordRunButton`, `GapMetrics`, `StatusDot` | raw palette colors, raw text sizes, a class-string mutation at `page.tsx:170` |
| `dashboard/clients/[id]/keywords/page.tsx` | alias classes, all-caps buttons, sparkle icon |
| `dashboard/clients/[id]/tasks` + `TaskCard`, `TaskFilterBar`, `SortableTaskList` | dark `#121215` cards, raw palette |
| `r/[token]` + `KeywordReportView` | grey palette, raw sizes; brand color inline styles are intentional white-labelling |
| `dashboard/prompts`, `help`, `settings`, `agency-settings`, `feedback`, `messages`, `notifications` | inline-markup pages, ~500 legacy class uses, none use the page primitives |
| `onboarding/page.tsx`, `components/ui/full-screen-signup.tsx`, `WelcomeToast` | amber/grey/emerald palette |

Dead code found (not imported anywhere): `layout/DashboardHeader`, `layout/DashboardNav`, `components/Dropdown`, `ui/demo`, `ui/aether-flow-hero`, `ui/spotlight-background`, `dashboard/clients/AddClientForm`, 11 of 13 files in `components/auth`. Removal is a separate, reviewed step; this plan does not depend on it.

### 1.4 Couplings a restyle must not break

`renderMarkdown` class strings in `ChatFloating`; `tt.color.replace(...)` in the keyword page; `.chip` strings in `lib/tasks`; `GAP_CLASSIFICATIONS[].dot` feeding `StatusDot`; print CSS classes in both report views; window events `vsi:ask` and `vsi:generate-task-list`; `data-scroll-container` on `<main>`; every `GuideTarget` anchor; dnd-kit reorder; URL-param filters; optimistic task status; report polling.

---

## 2. Global visual language

**Idea: calm surface, one confident voice per page.** Each page has one clearly dominant element (a headline, a number with its sentence, or the next action). Everything else is quiet and ruled, not boxed. Gold appears only where it means something.

### 2.1 Color

Tokens stay as they are. Rules for use:

| Token | Meaning | Where |
|---|---|---|
| `brand`, `brand-strong`, `brand-soft` | VSI and "you" | active nav, eyebrow labels, step marks, selected state, focus ring, progress, "your business" in comparisons, the plus mark in the main CTA |
| `ink` | primary text and primary buttons | unchanged decision from the previous plan |
| `positive` / `attention` / `critical` / `info` | status only, always icon plus word | never decoration |
| `surface` on `canvas` | the two planes | panels and the shell are `surface`; pages are `canvas` |
| `surface-2` | quiet bands | "Where this fits", table heads, hover |

**Decision D1: primary buttons stay ink.** White text on the brand gold (`#B07F22`) is 3.6:1 and fails AA for button text. Ink buttons pass, stay calm next to gold accents, and keep gold meaningful. The main first-use CTA carries a gold plus mark. If a gold CTA is wanted later, use `brand-strong` (`#8A6414`, 5.4:1 with white) in `Button.tsx` `variants.primary`; it is a one-line change.

**Decision D2: no per-module colors.** The supplied mockup tints each audit area differently (red, amber, green, blue). In VSI those hues mean critical, attention, positive and info, so a red "Website health" panel would read as a failure before any audit has run. Areas are told apart by icon, number and drawing instead.

### 2.2 Typography (Geist, Geist Mono)

| Role | Size / line | Weight | Note |
|---|---|---|---|
| First-use headline | 32 / 36, 40 / 45 from md, 44 / 49 from xl, tracking -0.025em | 600 | one per first-use page |
| Primary metric | 44 / 48 tabular | 600 | one per data page |
| Page title | 26 / 32, tracking -0.02em (`text-display`) | 600 | raised from 22px |
| Section headline (first-use) | 22 / 28, 26 / 32 from md | 600 | with an eyebrow |
| Section title (data pages) | 17 / 24 | 600 | raised from 15px |
| Body | 14 / 21, lead paragraphs 15 to 16 / 24 to 28 | 400 | |
| Supporting | 13 / 19 | 400 | |
| Caption, table head | 12 / 16 | 500 | |
| Eyebrow | 12 / 16 uppercase, tracking 0.14em, `brand-strong` | 600 | the only uppercase style; names a page or section, never data |

Numbers in tables and metrics use tabular figures. Step and index numbers use Geist Mono.

### 2.3 Spacing, shape, elevation

- 4px grid. Page gutter 16 / 32 / 40px. Content width 1240px (from 1200).
- Section rhythm 40px on data pages, 56 to 64px on first-use pages.
- Radius: 6px controls, 10px panels and icon tiles. Full round only for avatars, step marks and dots.
- Elevation: hairline borders, no shadows on panels. One overlay shadow for menus, drawers and modals. Nothing lifts on hover except the main CTA by 1px.
- Cards: a bordered `surface` panel is used for things you act on (lists with actions), evidence (answers, examples), charts, and capability panels. Everything else is open canvas with rules.

### 2.4 Motion

One-shot only. `rise-in` for the hero, `line-grow` for connectors, `scan-settle` for the audit drawing, `Reveal` for sections that start below the fold, 150 to 200ms color transitions on controls, the active nav bar scales in. No loops, no parallax. `prefers-reduced-motion` disables all of it. No animation library is added; `framer-motion` stays only where it already is.

---

## 3. Components

| Component | Change |
|---|---|
| `Eyebrow` (new, `ui/Page`) | the gold uppercase label, optional leading rule |
| `PageHeader` | 26px title, optional eyebrow, description at 15px, meta row with separators, actions right |
| `Section` | 17px title, clearer description, same API |
| `StatStrip` / `Stat` | larger value, label above in caption, optional trend sub-line |
| `Reveal` (new) | section fade-in, content visible without JS |
| `Skeleton` layouts | page-shaped loading for table, board, detail and chart pages |
| `EmptyState`, `Notice` | spacing and type pass only |
| Intro set (`FeatureIntro`) | `IntroHero`, `StepRail` (gold numbered strip), `CapabilityList` (panels with tick lists and optional drawing), `ProductStory` (ruled line with gold current step), `ClosingAction`, `SectionHeading` |
| Illustrations | same rules (1.5px strokes, neutral fills, gold = you, one attention mark, no readable text); new `AuditFlowScene`, `AuditAreaArt` |

APIs stay backward compatible so views that already use these components pick up the new look without edits.

---

## 4. Application shell

**Sidebar.** Same groups and links. Logo tile with a ring, "VSI" wordmark with a small uppercase descriptor. Uppercase group labels, 24px between groups, 36px rows. Active row: `brand-soft` fill, 3px gold bar that scales in, semibold label, gold icon at a heavier stroke. Project switcher and the account block get the same type pass. Collapsed and mobile behavior unchanged.

**Top bar.** Breadcrumb becomes project context: project name and domain, then the page. Notifications, messages and the account menu keep their behavior; the notification panel moves onto tokens. Quiet separators between the groups. Search is not added because the app has no global search.

**Project context.** The top bar names the project on every page; page headers show the domain in their meta row; first-use and setup states name the next step from real state. No page invents its own project chrome.

---

## 5. Page by page

Each page keeps its data loading, states and interactions. Only composition and styling change.

| # | Page | Dominant element | Changes |
|---|---|---|---|
| 1 | Overview | the one-sentence conclusion, then "Do these next" | header with project and domain; conclusion as the lead; "At a glance" as a ruled four-part strip with clearer numbers and per-part links; actions list directly under it; trends as three labelled charts; competitors line; search lookup last |
| 2 | Site Audit | first-use: headline and CTA. Data: health score with its sentence | first-use rebuilt (done); setup state picks up new panels; data state gets the new header, severity grouping with clearer rows, area summary strip |
| 3 | Search Visibility | "N of M searches on Google's first page" | hero metric block, five-bucket strip as `StatStrip`, searches table with plain-language position and change |
| 4 | AI Visibility | "You appear in N of M AI answers" | same hero pattern; engines list; the answer evidence panel stays the visual centre; examples labelled; "GEO" stays a category label only |
| 5 | Competitors | the sentence naming who appears where you don't | comparison table with you first in gold; gaps list with one action |
| 6 | Next Actions | the list itself | rows read finding, why, what to do; source filter as tabs; drawer unchanged in behavior |
| 7 | Tasks | the board | lighter column heads with counts, calmer cards, status control unchanged |
| 8 | Reports | the report list, and the public report as a document | list rows with type, period and state; public report moved to tokens with print CSS kept |
| 9 | AI Chat | the question box and what the chat knows | page pass; floating chat moved to tokens, lucide icons instead of emoji, answer / evidence / suggestion visually separated |
| 10 | First-use states | headline and one CTA | all eight intros on the new template; setup panels share the panel and tick styles; "Start here" arrow refined |
| 11 | Super Admin | tables and status | stays operational and separate; picks up the header, section and nav refinements only |
| 12 | Secondary pages | | settings, help, feedback, messages, notifications, prompts, keyword pages, legacy tasks page, onboarding and login move onto tokens and primitives |

"Where this fits" chains: core pages (Site Audit, Search Visibility, AI Visibility, Competitors, Next Actions) share Website, Site Audit, Search Visibility, AI Visibility, Competitors, Next Actions. Tasks and Reports use Website, Your checks, Next Actions, Tasks, Reports. AI Chat uses Website, Your checks, Next Actions, Reports, AI Chat. The current step is gold and underlined.

---

## 6. Content rules

- No fake scores, percentages, rankings, traffic or competitors anywhere. Examples are dashed and labelled "Example".
- First-use lists name only checks the audit really runs (13 checks in `lib/site-audit/copy.ts`). The mockup's "Structured data" under Search, "Content clarity", "Thin content" and "Duplicate content" are not VSI checks and are not shown.
- No robot imagery, sparkle icons, third-party logos in illustrations, or handwriting fonts.
- No em or en dashes in first-use copy (enforced by `intros.test.ts`).

---

## 7. Responsive

Checked at 390, 768, 1280 and 1440px.
- Desktop: 240px sidebar, 1240px canvas.
- Tablet: hero stacks under 1024px; step strips go two-up; capability panels one or two-up; drawings inside panels hide when narrow.
- Mobile: sidebar becomes the existing drawer; single column; tables collapse to labelled rows (existing pattern); no horizontal page scroll; CTA stays the first interactive element.

## 8. Accessibility

One `h1` per page (the eyebrow on first-use pages, the title elsewhere). Focus ring stays 2px gold. Status is icon plus word. Decorative drawings are `aria-hidden`; scenes have labels. Step and chain lists are ordered lists with screen-reader step text. Reduced motion respected. Contrast: `ink-3` on canvas is 4.6:1; `brand-strong` is 5.0:1 on canvas and 4.9:1 on `brand-soft`.

## 9. Performance

No new dependencies, fonts or image assets. All drawings are inline SVG. `Reveal` is a 40-line client component. New CSS is three keyframes and two attribute rules.

---

## 10. Verification

Local limits: `.env.local` runs in dummy mode, so only no-project states and Super Admin render with real code paths. Data states are checked with a temporary dev-only fixture route that renders views with fixed props and is deleted before commit.

Per phase: `tsc`, `eslint`, `vitest`, `next build`; screenshots at the four widths; overflow check; console errors; CTA, nav and "Start here" behavior.

## 11. Phases and status

| Phase | Content | Status |
|---|---|---|
| 0 | Audit and this plan | done |
| 1 | First-use system (all eight intros, Welcome, chains, "Start here") | done, checked at 390 / 768 / 1440 |
| 2 | Shell: sidebar, top bar, notification panel | done |
| 3 | Primitives: page header, section, stats, trend chart, `MetricHero`, loading skeleton | done |
| 4 | Overview (data state and setup state) | done, checked with fixed sample props |
| 5 | Site Audit, Search Visibility, AI Visibility, Competitors data states | done, checked with fixed sample props at 390 / 768 / 1440 |
| 6 | Next Actions, Tasks, floating chat | done. Floating chat is type-checked only: it needs an active project to render. Reports list and AI Chat page run on the new primitives; the reports page was being edited by another session and was left alone |
| 7 | Super Admin consistency pass | done (headers, sections, nav labels). Stays visually separate |
| 8 | Secondary and legacy pages, public report, onboarding, login | onboarding done (not viewable locally). Rest open |

The "Implementation status" section at the end of this file is updated as phases land.

---

## Status board (updated 2026-09-19, end of third batch)

Multi-session note: another session changed `clients/[id]/reports/page.tsx`, `messages/[id]/page.tsx`, `MessageActionMenu.tsx`, `FeedbackModal.tsx`, `NotificationsContext.tsx` and `src/lib/geo*` (performance and logic, not styling). Those changes are kept; edits in those files are class-level or confined to the render output.

| Area | State |
|---|---|
| First-use pages, shell, primitives, Overview, Site Audit, Search Visibility, AI Visibility, Competitors, Next Actions, Tasks board, notification panel, loading skeleton, Super Admin labels | Completed, checked in the browser |
| Settings, Help, Prompts (search simulator), Feedback, Messages, Notifications, Login, quick search check | Completed, checked in the browser at 390 / 768 / 1280 / 1440 |
| Unused components review | Completed (see "Removed" below) |
| Keyword list, keyword detail and its panels, per-client Tasks page and TaskCard, Reports list, public report and KeywordReportView, project page, check history, project settings forms | Completed in code, **needs staging verification** (need a real project or report token) |
| Floating chat, onboarding, message detail, notification detail, compose and message menus, feedback modal | Completed in code, **needs staging verification** |
| Remaining | Nothing planned. Follow-ups are listed under "Known follow-ups" |

## Implementation status (2026-09-19)

Done and verified (type-check, lint on changed files, 127 tests, production build, screenshots, no horizontal overflow, no console errors):

- **First-use template** in `components/intro/FeatureIntro.tsx`: `IntroHero`, `StepRail`, `CapabilityList`, `SectionHeading`, `ClosingAction`; `ProductStory` redrawn as a ruled line; `Reveal` for section entrances. All eight feature intros and the Welcome page use it. Setup states in the views pick up the new `CapabilityList` automatically.
- **Site Audit first-use**: new `AuditFlowScene`, four `AuditAreaArt` drawings, "What you'll get" strip with icons, tick lists that name only real checks, labelled example audit, "Why Site Audit comes first".
- **Overview hero drawing** replaced with an animated scene (scan, signal, four checks, one action). One 9s loop; off with reduced motion.
- **Chains**: core pages and Next Actions share Website, Site Audit, Search Visibility, AI Visibility, Competitors, Next Actions (`story.ts`, test updated).
- **Shell**: sidebar brand, group labels, gold active state with animated bar, account block; top bar project context with domain, separators, account chip.
- **Primitives**: `Eyebrow`; 26px page titles; 17px section titles; larger stats; meta separators; 1240px canvas; `TrendLine` with soft area, mid guide and a one-time draw.
- **Overview data state**: lead block (conclusion plus first actions), "at a glance" with meters from real values, chart panels with latest value and change, you-versus-competitor bars, setup progress from real state, restyled next-step box. No data, condition or link changed.

How data states were checked: a temporary dev-only route rendered `OverviewView` with fixed sample props. It was deleted after the check and is not in the tree.

Second batch, same day:

- **`MetricHero`** (`components/ui/MetricHero.tsx`): the number, its meter, the one-sentence conclusion and the trend in one panel. Used by Site Audit, Search Visibility and AI Visibility.
- **Site Audit data**: hero, pass count per area. **Search Visibility data**: hero, a position distribution bar from the real buckets, position badges, up and down arrows. **Competitors data**: lead sentence as a panel. Table heads get a quiet band.
- **Next Actions**: numbered rows that show the finding and "What to do" side by side; gold filter tabs. **Tasks**: summary strip from real counts, column heads marked by status.
- **Notification panel**: about 30 inline hex values and JS theme branching replaced by tokens. **Floating chat**: alias classes moved to tokens (also inside its markdown template), emoji and glyph buttons replaced with lucide icons.
- **Loading skeleton** matches the new page shape. **Onboarding** moved to tokens and says "organization".

Not done yet: settings, help, prompts, feedback, messages, notifications pages; the keyword list and keyword detail tree (`KeywordIntelligenceView`, `CitationStrategyPanel`, `OpportunityBriefButton`, `KeywordReportButton`, `StatusDot`); the legacy client tasks page and `TaskCard`; the public report and `KeywordReportView`; login; the reports page composition; removal of the dead components listed in 1.3.

Third batch, same day:

- **One scripted token pass** (about 4,000 class changes in roughly 50 files) mapped the old grey / slate / amber / emerald / rose / blue palette, alias classes, arbitrary hex colors, large radii, soft shadows, gradients, blur and raw text sizes onto the existing tokens. No new color, type size, card or button style was added. Old amber and orange fills became ink buttons; amber text became `brand-strong`; green, red, yellow and blue became the four status tokens; purple and pink became neutral.
- **Settings**: rebuilt as a settings page on `PageContainer` / `PageHeader` / `Section`: labelled rows for display name, contact email and logo, a quiet preview, `Notice` for saved and error states, and an honest "Not available yet" list. State, handlers and storage untouched.
- **Help**: hero and search kept, sparkle and robot icons replaced, heading now asks "What can we help you with?".
- **Prompts**: this page is a hard-coded simulator with no data fetch. It is now labelled "Example only", the fake "live", "Latency 1.2s", "Grounding Verified" and "Live Grounded Search" badges are gone, and it links to AI Visibility for real checks. Logic unchanged.
- **Feedback**: simple header and form. The hard-coded sample requests are labelled "Examples, not real requests".
- **Messages and Notifications**: tokens, icon empty states instead of emoji, sentence-case copy, standard button sizes.
- **Keyword list**: shared header, table with a quiet head band, status labels, `EmptyState`. It shows only what the page loads (search, where it is checked, location, status); positions live on Search Visibility and the detail page.
- **Keyword detail**: wider canvas, lead panel with the search as the title and the per-engine results as tiles, plain words instead of glyphs ("Cited", "Mentioned", "Not mentioned", "Up 3").
- **Per-client Tasks**: shared header with links to Next Actions and the task board, filter bar on a rule, groups as sections with status-style heads. Drag and drop, filters, delete and status changes untouched.
- **Shared chips** in `lib/tasks.ts` and `types/search.ts` moved to tokens; the class-string mutation on the keyword page was replaced by the plain value.
- **Reports**: summary strip from real counts, icon rows, status label for expired links. The other session's parallel loading is intact.
- **Public report**: tokens, a ruled key-figures strip, clearer titles, section accents from status tokens. Print CSS, white-label brand colors, the pending auto-refresh and the public access path are unchanged.
- **Login**: VSI brand, "Sign in", email and password with inline errors, loading state, and the product drawing on wide screens. No Google button or reset link was added because the form does not support them today. The mislabelled "Create new password" field is now "Password", and the self-linking "Already have account? Login" line is gone.
- **Toast** no longer bounces.

### Removed (verified unused)

Each file had no static import, no dynamic `import()`, no string reference and no route. The prototype in `apps/login-prototype` has its own copies and is excluded from the build.

| File | Why it was obsolete |
|---|---|
| `components/layout/DashboardHeader.tsx`, `components/DashboardHeader.tsx` | old "SearchIntel" top navigation, replaced by `Sidebar` and `Topbar` |
| `components/layout/DashboardNav.tsx`, `components/DashboardNav.tsx` | old pill navigation, same reason |
| `components/Dropdown.tsx` | unused dropdown with inline hex colors |
| `components/ui/demo.tsx`, `ui/aether-flow-hero.tsx`, `ui/spotlight-background.tsx` | component-library demo leftovers |
| `app/dashboard/clients/AddClientForm.tsx` | replaced by the `clients/new` setup flow |
| `components/auth/LoginCard.tsx`, `BrandHeader.tsx`, `FeatureList.tsx`, `StatsCard.tsx`, `MainHeadline.tsx`, `PillBadge.tsx`, `SignUpModal.tsx`, `PasswordField.tsx` | the previous login screen, replaced by `full-screen-signup` |
| `components/common/BackgroundGrid.tsx` | background of the previous login screen |

Kept on purpose: `components/auth/SocialLoginButton.tsx`, `ForgotPasswordModal.tsx` and `InputField.tsx`. They are unused today, but a Google callback route exists and is being worked on, so they may be wanted. `components/valgrow/*` is used by the public home page. 37 CSS rules that only the removed files used (spotlight, glass panel, cyber grid, red gradient, enterprise card, old button and type helpers) were deleted from `globals.css`.

### Needs staging verification

These render only with a real project, report or account, so they were type-checked, linted and built, not seen:

1. Keyword list, keyword detail (with its brief, strategy, report and task panels), check history, project page and project settings.
2. Per-client Tasks page: drag to reorder, filters, status change, delete.
3. Reports list with real rows, and a public report at `/r/<token>` on screen and in print preview, including a white-label brand color.
4. Floating chat: open, stream an answer, copy, thumbs, attach, minimize.
5. Onboarding with a real invite.
6. Message detail, compose, the message action menu, notification detail and the feedback modal.
7. Login with a real account, a wrong password and an unauthorized email.

### Known follow-ups

- Lint errors that predate this work remain in page logic (`any` types, `setState` inside effects, unescaped apostrophes). They were left alone because fixing them changes logic.
- `/dashboard/agency-settings` is an orphan route with mocked form state. It was moved to tokens but not redesigned; decide whether to keep it.
- The Feedback page's sample requests and the Prompts simulator are hard-coded. They are labelled as examples now; replacing or removing them is a product decision.
