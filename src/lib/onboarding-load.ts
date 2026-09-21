import "server-only";
import { loadOnboardingCounts } from "@/lib/setup-status";
import { loadProjectCompetitors } from "@/lib/project-competitors-load";
import type { OnboardingState } from "@/lib/onboarding";
import type { ProjectSummary } from "@/lib/project-types";

/** Real setup state for first-use guidance, from the same searches and audit counts the setup checklists use. */
export async function loadOnboardingState(active: ProjectSummary | null): Promise<OnboardingState> {
  if (!active) {
    return { hasProject: false, known: true, searches: 0, competitors: null, auditDone: false, auditRunning: false };
  }
  const [status, competitors] = await Promise.all([loadOnboardingCounts(active.id), loadProjectCompetitors(active.id)]);
  return {
    hasProject: true,
    known: status.known,
    searches: status.searches,
    competitors: competitors.state === "ok" ? competitors.competitors.length : null,
    auditDone: status.audits > 0,
    auditRunning: status.auditRunning,
  };
}
