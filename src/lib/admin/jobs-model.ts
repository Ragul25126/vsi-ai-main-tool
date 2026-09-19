/**
 * One shape for background work that VSI already records in different
 * tables. Pure functions only (tested). Nothing here invents a time or a
 * status: a missing timestamp stays null and is shown as "Not recorded".
 */

export type JobType = "site_audit" | "report" | "citation_strategy" | "scheduled_run";
export type JobStatus = "queued" | "running" | "completed" | "failed";

export const JOB_TYPE_LABEL: Record<JobType, string> = {
  site_audit: "Site audit",
  report: "Report",
  citation_strategy: "Citation strategy",
  scheduled_run: "Scheduled run",
};

export const JOB_STATUS_LABEL: Record<JobStatus, string> = {
  queued: "Queued",
  running: "Running",
  completed: "Completed",
  failed: "Failed",
};

export interface AdminJob {
  id: string;
  type: JobType;
  title: string;
  status: JobStatus;
  /** Running far longer than it should: probably died. */
  stuck: boolean;
  /** Completed, but with some errors (scheduled runs). */
  warnings: number;
  projectId: string | null;
  projectName: string | null;
  agencyId: string | null;
  agencyName: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  /** Plain-language summary of what went wrong. */
  problem: string | null;
  /** Stored error text and ids, shown only under "Technical details". */
  technical: { label: string; value: string }[];
}

/** Matches the stale-run cleanup rule in /api/site-audit. */
export const STUCK_AFTER_MS = 15 * 60 * 1000;
/** A scheduled run with no finish time after this long is treated as died. */
export const SCHEDULED_STUCK_AFTER_MS = 30 * 60 * 1000;

type Named = { name?: string | null } | { name?: string | null }[] | null | undefined;
const nameOf = (n: Named) => (Array.isArray(n) ? n[0]?.name : n?.name) ?? null;

export function auditJob(
  r: { id: string; client_id: string; agency_id: string; status: string; domain: string | null; error_message: string | null; created_at: string; completed_at: string | null; clients?: Named; agencies?: Named },
  now: number,
): AdminJob {
  const status: JobStatus = r.status === "completed" ? "completed" : r.status === "failed" ? "failed" : "running";
  return {
    id: `site_audit:${r.id}`,
    type: "site_audit",
    title: `Site audit${r.domain ? ` of ${r.domain}` : ""}`,
    status,
    stuck: status === "running" && now - new Date(r.created_at).getTime() > STUCK_AFTER_MS,
    warnings: 0,
    projectId: r.client_id,
    projectName: nameOf(r.clients),
    agencyId: r.agency_id,
    agencyName: nameOf(r.agencies),
    startedAt: r.created_at,
    finishedAt: r.completed_at,
    problem: status === "failed" ? r.error_message || "The audit didn't finish." : null,
    technical: [{ label: "Audit id", value: r.id }, ...(r.error_message ? [{ label: "Stored error", value: r.error_message }] : [])],
  };
}

export function reportJob(r: { id: string; client_id: string; agency_id: string; type: string; status: string | null; error_message: string | null; generated_at: string; clients?: Named; agencies?: Named }): AdminJob {
  const status: JobStatus = r.status === "failed" ? "failed" : r.status === "pending" ? "running" : "completed";
  return {
    id: `report:${r.id}`,
    type: "report",
    title: r.type === "weekly" ? "Weekly report" : "Search report",
    status,
    stuck: false,
    warnings: 0,
    projectId: r.client_id,
    projectName: nameOf(r.clients),
    agencyId: r.agency_id,
    agencyName: nameOf(r.agencies),
    startedAt: r.generated_at,
    // Reports don't record when generation finished.
    finishedAt: null,
    problem: status === "failed" ? r.error_message || "The report couldn't be generated." : null,
    technical: [{ label: "Report id", value: r.id }, { label: "Report type", value: r.type }, ...(r.error_message ? [{ label: "Stored error", value: r.error_message }] : [])],
  };
}

export function strategyJob(r: { id: string; client_id: string | null; agency_id: string | null; keyword: string; citation_strategy_status: string; citation_strategy_error: string | null; clients?: Named; agencies?: Named }): AdminJob {
  const status: JobStatus = r.citation_strategy_status === "failed" ? "failed" : r.citation_strategy_status === "pending" ? "running" : "completed";
  return {
    id: `citation_strategy:${r.id}`,
    type: "citation_strategy",
    title: `Citation strategy for "${r.keyword}"`,
    status,
    stuck: false,
    warnings: 0,
    projectId: r.client_id,
    projectName: nameOf(r.clients),
    agencyId: r.agency_id,
    agencyName: nameOf(r.agencies),
    // The strategy's own start and finish times aren't stored.
    startedAt: null,
    finishedAt: null,
    problem: status === "failed" ? r.citation_strategy_error || "The strategy couldn't be generated." : null,
    technical: [{ label: "Check result id", value: r.id }, ...(r.citation_strategy_error ? [{ label: "Stored error", value: r.citation_strategy_error }] : [])],
  };
}

export function scheduledJob(r: { id: string; started_at: string; finished_at: string | null; clients_processed: number | null; keywords_processed: number | null; errors: string[] | null }, now: number): AdminJob {
  const errors = (r.errors ?? []).filter(Boolean);
  const finished = !!r.finished_at;
  const processedNothing = (r.clients_processed ?? 0) === 0 && (r.keywords_processed ?? 0) === 0;
  const status: JobStatus = !finished ? "running" : errors.length > 0 && processedNothing ? "failed" : "completed";
  return {
    id: `scheduled_run:${r.id}`,
    type: "scheduled_run",
    title: `Scheduled run: ${r.clients_processed ?? 0} projects, ${r.keywords_processed ?? 0} searches`,
    status,
    stuck: !finished && now - new Date(r.started_at).getTime() > SCHEDULED_STUCK_AFTER_MS,
    warnings: status === "completed" ? errors.length : 0,
    projectId: null,
    projectName: null,
    agencyId: null,
    agencyName: null,
    startedAt: r.started_at,
    finishedAt: r.finished_at,
    problem: status === "failed" ? `The run stopped with ${errors.length} ${errors.length === 1 ? "error" : "errors"} and checked nothing.` : null,
    technical: [{ label: "Run id", value: r.id }, ...errors.slice(0, 10).map((e, i) => ({ label: `Error ${i + 1}`, value: e }))],
  };
}

/** Newest first; jobs without a start time go last. */
export function sortJobs(jobs: AdminJob[]): AdminJob[] {
  return [...jobs].sort((a, b) => (b.startedAt ?? "").localeCompare(a.startedAt ?? ""));
}

export function needsAttention(j: AdminJob): boolean {
  return j.status === "failed" || j.stuck;
}
