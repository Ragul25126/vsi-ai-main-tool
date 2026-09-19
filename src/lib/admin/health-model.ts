/**
 * Health states and the rules that pick them. Pure functions (tested).
 * "Healthy" is only ever the result of a check that actually ran.
 */

export type HealthState = "healthy" | "attention" | "unavailable" | "not_configured" | "configured";

export const HEALTH_LABEL: Record<HealthState, string> = {
  healthy: "Healthy",
  attention: "Needs attention",
  unavailable: "Unavailable",
  not_configured: "Not configured",
  configured: "Configured, not tested",
};

export interface ServiceHealth {
  key: "database" | "api" | "jobs" | "ai" | "search" | "storage";
  name: string;
  state: HealthState;
  detail: string;
  /** Has a "Test" action that makes a live (free) provider call. */
  testable?: boolean;
  /** Per-provider lines for AI and search services. */
  providers?: { name: string; state: HealthState; detail: string }[];
}

export interface JobsHealthInput {
  cronSecretSet: boolean;
  lastRunStartedAt: string | null;
  lastRunFinishedAt: string | null;
  failedLast24h: number;
  stuck: number;
  now: number;
}

/** A daily schedule is expected; allow a couple of hours of slack. */
export const SCHEDULE_LATE_AFTER_MS = 26 * 60 * 60 * 1000;

export function jobsHealth(i: JobsHealthInput): { state: HealthState; detail: string } {
  const problems: string[] = [];
  if (i.failedLast24h > 0) problems.push(`${i.failedLast24h} failed in the last 24 hours`);
  if (i.stuck > 0) problems.push(`${i.stuck} stuck`);
  if (!i.cronSecretSet) {
    return problems.length
      ? { state: "attention", detail: `${problems.join(", ")}. Scheduled runs aren't configured (CRON_SECRET missing).` }
      : { state: "not_configured", detail: "Scheduled runs aren't configured (CRON_SECRET missing)." };
  }
  if (!i.lastRunStartedAt) {
    return problems.length
      ? { state: "attention", detail: `${problems.join(", ")}. No scheduled run has happened yet.` }
      : { state: "not_configured", detail: "No scheduled run has happened yet." };
  }
  const age = i.now - new Date(i.lastRunFinishedAt ?? i.lastRunStartedAt).getTime();
  if (age > SCHEDULE_LATE_AFTER_MS) problems.push(`last scheduled run was ${Math.round(age / 3_600_000)} hours ago`);
  if (problems.length) return { state: "attention", detail: capitalise(problems.join(", ")) + "." };
  return { state: "healthy", detail: "Scheduled runs are on time and nothing failed in the last 24 hours." };
}

/** Combine provider states into one row: the worst tested state wins; untested keys are "configured". */
export function combineProviders(providers: { state: HealthState }[]): HealthState {
  const set = providers.map((p) => p.state).filter((s) => s !== "not_configured");
  if (set.length === 0) return "not_configured";
  if (set.includes("unavailable")) return "unavailable";
  if (set.includes("attention")) return "attention";
  if (set.includes("configured")) return "configured";
  return "healthy";
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
