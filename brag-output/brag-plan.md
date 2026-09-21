# Brag Plan: VSI (Search Intelligence)

## What is this app?
VSI checks one website and answers the questions its owner actually has: is it healthy, can people find it on Google, do AI systems mention it, where do competitors appear, and what should be fixed first. It turns each finding into an action, then checks again to see whether the fix worked.

## The angle
**Questions in the dark, answers in the light, then a tour where every screen answers one question.**
The app's own story (`src/components/intro/story.ts`) is that each part of VSI answers one question about your website. The film opens on three of those questions, a gold scan line sweeps the dark away (the same "VSI scans your site" motif the app's own illustration uses), and a recreated VSI window walks through the real screens, each titled by its question. It ends on a finished, verified action.

## Hook (first ~5 seconds)
Ink black with a slow dotted grid. Three real questions, one at a time, each word rising out of its own line: "Is my website healthy?", "Can people find me?", then a much larger "Do AI systems mention me?" with a gold underline on "AI". The third holds longest, and the camera pushes in slightly on it.

## Key moments (the middle)
- **The scan (4.64–5.74).** A gold line sweeps top to bottom and the dark frame gives way to the warm product canvas. The sweep completes on the strongest cue of the build.
- **The mark lands (6.29).** The gold VSI mark arrives with two expanding rings, then the product's own headline builds word by word.
- **The window tour (9.55–20.7).** A recreated VSI window with the app's real sidebar. The highlight moves down the nav as each screen answers its question:
  - Site Audit: "Is my website healthy?" Checks resolve one by one.
  - Search Visibility: "Can people find me?" A ranking line draws in beside three searches.
  - AI Visibility: "Do AI systems mention me?" Two AI answers, one that mentions you and one where a competitor appears instead.
  - Competitors: "Where are competitors appearing?" Bars grow, with a "Content opportunity" flag.
  - Next Actions: "Know what to work on next." A cursor completes an action and it becomes "Verified".
- **The camera.** The whole window pushes in slowly across the tour, so the screen fills the frame as it goes.

## Outro / punchline
The window steps back. The mark returns with rings, then the tagline builds from the strong cue at 21.56s: "Turn search and AI visibility into real business growth." The music fades to near silence.

## User flow worth showing
1. **Entry:** a website is added once, and VSI checks it (the audit).
2. **Key action:** the checks answer the questions (search, AI, competitors).
3. **Result:** clear actions, one finished by a person, and VSI checks again and verifies it.

This is the app's real loop (finding → task → verified result).

## Tone
- Preset: cinematic
- Creative direction: a premium product film. Questions in the dark, a gold scan, then a fast, confident tour where every screen answers one question.
- Interpretation: big kinetic type in the hook, decisive beat-locked cuts, one camera push, and rich but clean product recreations. Sound stays soft and motion-matched, so the confidence comes from precision and not volume.

## Format: landscape — 1920x1080
## Duration: 24.83 seconds (every cut is snapped to the music's beat grid)

## Visual identity (from the project)
Taken from `src/app/globals.css` and `src/app/layout.tsx`.
- Background: hook `#14171F`. Product scenes `#F6F7F9` with a warm `#FBF4E2` glow, a dotted grid, and thin gold arcs (from the sign-in page).
- Accent: `#B07F22` brand gold, `#8A6414` for text on light, `#D4A445` on dark, `#F0CC6C` for the scan.
- Text: `#14171F` on light, `#EDEFF3` on dark. Secondary `#4A5160`. Small labels `#5D6472`.
- Status colors: positive `#1E7D46` on `#EAF5EE` (Passed, Improved, Mentioned, Verified). Attention `#B4360A` on `#FFF1E8` (Needs attention, Dropped, Competitor, Content opportunity).
- Display and body font: Geist. Small labels: Geist Mono (both bundled locally).
- Icons: Lucide, the same set the app uses. The sidebar, cards, row layout and pills follow the app's own components.
- Logo: `public/vg-logo.png`.

## Honesty rules for the picture
- No figures, scores or percentages appear anywhere.
- The window carries an "Example data" chip. The example searches ("best plumber", "emergency plumber", "plumber prices") come from the repository's own test fixtures. The business names are fictional.
- Every heading, question, label and status is real VSI copy. The example answers and the two rows of competitor names are illustrative.

## Share copy (draft)
Is my website healthy? Can people find me? Do AI systems mention me? Every screen in VSI answers one of them, then tells you what to work on next.

## Audio direction
- Role: warm bed that builds with the picture, with sparse professional accents.
- Music: bundled `happy-beats-business-moves-vol-12-by-ende-dot-app.mp3` (about 110 BPM), starting 3s into the track so its build lands exactly under the scan. The bed quietly builds through 5–8s, holds full through the tour, and fades over the last 1.8s.
- Music cue guidance: bundled preset `cues/happy-beats-business-moves-vol-12-by-ende-dot-app.music-cues.*`, shifted by -3s. Beat-locked moments: 4.09 (the underline lands), 5.74 (the scan completes), 6.29 (the mark lands), 9.55 (the window arrives), 10.11 / 12.29 / 14.47 / 16.66 / 18.28 (the five panel cuts), 15.56 ("Mentioned" pops), 19.93 ("Verified", the strongest cue in the window), 21.56 (the tagline). Sequential text is never revealed on consecutive beats.
- Audio-reactive treatment: subtle. A 20 Hz loudness envelope extracted from the bed drives the warm glow behind the product scenes. No waveform or equalizer graphics.
- SFX posture: sparse and motion-matched, all soft, low to medium high-frequency risk. Ticks on the questions, a slide for the scan, a soft thud on the cut and on each panel change, a bell on the mark, ticks as checks resolve, a dry click for the cursor, a confirmation bell for "Verified", a bell under the tagline.
- Restraint rule: no risers, no impacts loud enough to compete with the music, nothing bright or repeated loudly, and nothing plays over the final fade.

## Storyboard

### Scene 1 — Hook: three questions — 4.64s, then the scan — 5.8s total (0.00–5.80)
Ink black with a drifting dotted grid. Words rise from masks, one question at a time, each starting on a beat (0.27, 1.91, 3.56). "AI" turns gold and is underlined on the beat at 4.09. Then the scan: a gold line sweeps down from 4.64 to 5.74 and the light canvas is revealed behind it.
Sequential/interaction: yes. Words rise one by one and questions replace each other.
Audio intent: quiet and a little uncertain, then a lift as the scan sweeps.
Transition mood: the scan itself → Scene 2

### Scene 2 — Reveal — 3.85s (5.74–9.59)
Warm light canvas, dotted grid, gold arcs. The gold mark lands with two expanding rings on the strong cue at 6.29. The headline, "Understand how your website appears across search and AI.", builds word by word from 6.83.
Sequential/interaction: yes. The headline builds word by word.
Audio intent: relief and lift. A soft bell on the mark.
Transition mood: the window rises in on the strong cue at 9.55 → Scene 3

### Scene 3 — The product tour — 11.55s (9.55–21.10)
A recreated VSI window with the app's real sidebar, pushing in slowly. Five panels, each cut on a beat:
1. Site Audit (10.11): a progress bar fills and four checks land at 10.38 / 10.65 / 10.92 / 11.20, resolving to Passed, Passed, Passed, Needs attention.
2. Search Visibility (12.29): a ranking line draws in; three searches follow (Improved, Improved, Dropped).
3. AI Visibility (14.47): two AI answers build word by word. "Mentioned" and "Cited" pop on 15.56 and 15.72, and "Competitor instead" pops on the second answer.
4. Competitors (16.66): four bars grow on staggered starts, with a "Content opportunity" flag.
5. Next Actions (18.28): three actions arrive. A cursor travels in and presses the first checkbox on the beat at 19.37. It completes, and "Verified" lands on the strongest cue at 19.93 with "VSI checks again."
The highlight in the sidebar moves to match each screen.
Sequential/interaction: yes, throughout, including the simulated cursor click.
Audio intent: precise and satisfying. A soft thud on each cut, ticks as checks resolve, a dry click, then a confirmation bell.
Transition mood: hard cuts on beats between panels → Scene 4

### Scene 4 — Outro — 3.81s (21.02–24.83)
The window steps back. The mark returns with rings, and the tagline builds from 21.56: "Turn search and AI visibility / into real business growth." The music fades to near silence and everything eases to the empty canvas.
Sequential/interaction: yes. The tagline builds word by word.
Audio intent: resolution, then silence.
Transition mood: fade to canvas, end.

**Music mood for this video:** building, confident, warm.
**Audio summary:** a quiet bed under the questions, a lift on the scan, a full bed under the tour with sparse accents, a bell on "Verified", a bell under the tagline, and a fade to near silence.

## Things to keep true
- No credentials, keys, emails or environment values appear in the video.
- The bundled music license has not been verified (the skill's README says to verify and document it before publishing or redistributing). Confirm before posting publicly.
