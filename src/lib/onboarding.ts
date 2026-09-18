/**
 * First-use guidance: which single setup action to point at right now.
 * Driven only by stored project state. No server imports here.
 */

export type GuideStep = "website" | "searches" | "competitors" | "audit";

export interface OnboardingState {
  hasProject: boolean;
  /** False when the project's counts couldn't be read; then no guidance is shown rather than a guess. */
  known: boolean;
  searches: number;
  /** null when competitor storage isn't available (migration 036 not applied). */
  competitors: number | null;
  auditDone: boolean;
  auditRunning: boolean;
}

export const GUIDE_LABEL: Record<GuideStep, string> = {
  website: "Start here!",
  searches: "Next step",
  competitors: "Next step",
  audit: "Run your first check",
};

/**
 * The one next action, or null when setup is complete (or can't be known).
 * `skipped` holds optional steps the user chose "Not now" for; adding a
 * website can't be skipped because nothing works without it.
 */
export function nextGuideStep(s: OnboardingState, skipped: readonly GuideStep[] = []): GuideStep | null {
  if (!s.hasProject) return "website";
  if (!s.known) return null;
  if (s.searches === 0 && !skipped.includes("searches")) return "searches";
  if (s.competitors === 0 && !skipped.includes("competitors")) return "competitors";
  if (!s.auditDone && !s.auditRunning && !skipped.includes("audit")) return "audit";
  return null;
}
