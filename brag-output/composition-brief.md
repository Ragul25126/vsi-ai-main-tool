# Hyperframes Composition Brief: VSI (Search Intelligence)

## Objective
Create a short launch-style brag video for VSI: a premium product film built from the app's own questions and its own UI.

## Output
- Composition directory: `brag-output/composition/`
- Rendered video: `brag-output/brag.mp4`
- Format: landscape, 1920x1080
- Duration: 24.83 seconds

## Source Material
- Project root: `C:\Users\pc\vsi-ai-main-tool`
- Primary files read: `src/components/intro/story.ts` (the questions), `src/components/intro/intros.tsx` and `Welcome.tsx` (real headlines, labels, and the checks the audit runs), `src/components/layout/nav.ts` (the sidebar and its icons), `src/app/globals.css` (design tokens), `src/app/layout.tsx` (fonts), `src/components/ui/full-screen-signup.tsx` and `src/components/auth/LoginShowcase.tsx` (sign-in copy and the product preview), `src/lib/geo.test.ts` (example searches), `package.json`, `public/vg-logo.png`.
- Product name: VSI, with the descriptor "Search Intelligence"
- Tagline / strongest claim: "Turn search and AI visibility into real business growth."
- Key UI moment to recreate: a VSI window with the real sidebar, walking through five screens. It ends on an action being completed and verified.
- Copy that must appear verbatim:
  - "Is my website healthy?", "Can people find me?", "Do AI systems mention me?"
  - "Understand how your website appears across search and AI."
  - Sidebar: Overview, Site Audit, Search Visibility, AI Visibility, Competitors, Next Actions, Tasks, Reports
  - Screen titles: "Is my website healthy?", "Can people find me?", "Do AI systems mention me?", "Where are competitors appearing?", "Know what to work on next."
  - Audit checks: "Secure connection", "Mobile layout", "Page titles", "Broken links"
  - Action titles: "Fix website issues", "Improve important pages", "Strengthen AI visibility"
  - "Verified" and "VSI checks again."
  - "Turn search and AI visibility into real business growth."

## Creative Direction
- Tone preset: cinematic
- Creative direction: a premium product film. Questions in the dark, a gold scan, then a fast, confident tour where every screen answers one question.
- Interpretation: big kinetic type, decisive cuts locked to the music, one slow camera push, and rich but clean product recreations. Sound stays soft, so the confidence comes from precision.
- Angle: the app's own story is that each part of VSI answers one question about your website. Open on three of those questions in the dark, sweep them away with the gold scan the app's own illustration uses, then tour the real screens, and end on a finished, verified action.
- Hook: three questions, one at a time, words rising from masks on ink. The third ("Do AI systems mention me?") is the largest and holds longest.
- Outro / punchline: the tagline builds on a strong cue, then the music fades to near silence.
- Avoid:
  - Generic SaaS language
  - Abstract filler visuals
  - Invented metrics, numbers, scores or percentages. None appear anywhere.
  - Presenting example content as real data. The window carries an "Example data" chip.

## Visual Identity
- Background: hook `#14171F`. Product scenes `#F6F7F9` with a `#FBF4E2` glow, a dotted grid, and thin gold arcs.
- Text: `#14171F` on light, `#EDEFF3` on dark. Secondary `#4A5160`. Small labels `#5D6472`.
- Accent: brand gold `#B07F22`; `#8A6414` for text on light; `#D4A445` on dark; `#F0CC6C` for the scan line. Positive `#1E7D46` on `#EAF5EE`. Attention `#B4360A` on `#FFF1E8`.
- Display font: Geist (variable, bundled locally). Body font: Geist. Small labels: Geist Mono.
- Visual references from the project: the app's sidebar and nav icons (Lucide), white cards with a 2px border and a soft shadow, status pills, the gold logo mark, and the sign-in page's arcs and dotted grid.

## Storyboard
Use the storyboard in `brag-plan.md` as the creative contract. Timings are snapped to the music's beat grid:

1. Hook + scan — 5.8s (0.00–5.80) — three questions on ink, then a gold line sweeps the frame to light between 4.64 and 5.74.
2. Reveal — 3.85s (5.74–9.59) — the mark lands with rings at 6.29, then the headline builds word by word.
3. Tour — 11.55s (9.55–21.10) — a VSI window pushes in slowly across five panels, each cut on a beat: Site Audit (10.11), Search Visibility (12.29), AI Visibility (14.47), Competitors (16.66), Next Actions (18.28). A cursor presses the first action at 19.37 and "Verified" lands at 19.93.
4. Outro — 3.81s (21.02–24.83) — the window steps back, the mark returns, the tagline builds from 21.56, then a fade to the empty canvas.

## Audio
- Audio role: warm bed that builds with the picture, with sparse professional accents.
- Audio arc: quiet under the questions, a lift as the scan sweeps, a full bed under the tour with sparse accents, a bell on "Verified", a bell under the tagline, then a fade to near silence.
- Music: `happy-beats-business-moves-vol-12-by-ende-dot-app.mp3`, trimmed to `assets/music/bed-vol12.mp3` (starts 3s into the track, 24.83s long, faded over the last 1.83s). Clip volume 0.36.
- Music cue guidance: bundled preset `cues/happy-beats-business-moves-vol-12-by-ende-dot-app.music-cues.*`, with every time shifted by -3s to match the trim. Beat-locked moments are marked `// beat-locked` in the composition, and sequential events are marked `// beat-grid`.
- Audio-reactive treatment: subtle. A 20 Hz loudness envelope from the bed (`assets/audio-energy.js`, extracted with ffmpeg) drives the opacity of the warm glow behind the product scenes. No waveform or equalizer graphics.
- Audio-coupled moments:
  - The three questions — a very soft tick each
  - The scan, and the cut to light — a slide and a soft thud
  - The mark landing — a soft bell
  - The five panel cuts — a soft thud each
  - The audit checks resolving — a small tick each
  - The cursor press — a dry click
  - "Verified" — a gentle confirmation bell
  - The tagline — a soft bell
- SFX selection guidance: only low and medium high-frequency-risk files from `sfx-analysis.md`, all at 0.28–0.8 volume.
- SFX analysis guidance: `<skill-dir>/assets/sfx/sfx-analysis.md`
- Exact SFX choice: `ui/rollover2`, `ui/click2`, `casino/card-slide-1`, `impact/impactSoft_medium_000-003`, `impact/impactBell_heavy_000, _003, _004`, `interface/bong_001`, `interface/drop_001`, `interface/click_002`.
- Audio files: copied into `brag-output/composition/assets/`.

## Hyperframes Instructions
Build with the current Hyperframes conventions, and run `hyperframes check` as the single gate before render.

Notes on how this run was built:
- The CLI's `docs` command (data-attributes, compositions, gsap) and the bundled `hyperframes-cli` skill were the sources for the composition contract. The four other domain skills (`hyperframes-core`, `-animation`, `-creative`, `-keyframes`) are not bundled with the CLI, and their installer writes to every AI tool on the machine, so they were not installed.
- Only GSAP properties listed as supported are animated (opacity, x, y, scale, scaleX, width, height). Every timeline is paused and registered on `window.__timelines`. Words are animated with plain loops and explicit times, with no reliance on stagger helpers.
- All runtime dependencies are local: GSAP, the Geist fonts, the logo, the loudness data and the audio are in `assets/`. Nothing loads from a CDN.
- Rendering waits for review in the preview.

Requirements:
- Show real VSI copy and UI: yes (see Source Material).
- Keep all text readable in the final render, and keep the video within 15–25 seconds: 24.83s.
- Include the planned music and SFX layer.

Gate result: `hyperframes check` passes with 0 errors. Layout has 0 warnings, and contrast passes 49/49 text checks. There are 6 structural lint warnings about splitting scenes into sub-compositions, which only affect the Studio timeline view.
