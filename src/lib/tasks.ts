// Shared types + UI metadata for the built-in task tracker.

export type TaskStatus = "todo" | "in_progress" | "done" | "skipped";
export type TaskGroup = "Content" | "Technical" | "Off-page";
export type TaskOwner = "Writer" | "Developer" | "SEO" | "Outreach";
export type TaskEffort = "S" | "M" | "L";
export type TaskImpact = "low" | "medium" | "high";

export interface AcceptanceCriterion {
  text: string;
  done: boolean;
}

export type TaskOutcome = "verified" | "regressed" | "neutral";

export interface TaskContextSnapshot {
  rankPosition: number | null;
  gapLabel: string;
  aioPresent: boolean | null;
  clientCited: boolean | null;
  citedDomainCount: number;
  capturedAt: string;
}

export interface TaskRow {
  id: string;
  agency_id: string;
  client_id: string;
  tracked_keyword_id: string | null;
  source_report_id: string | null;
  group_name: TaskGroup;
  owner: TaskOwner | null;
  title: string;
  description: string | null;
  acceptance: AcceptanceCriterion[];
  effort: TaskEffort | null;
  impact: TaskImpact | null;
  status: TaskStatus;
  priority: number;
  due_date: string | null;
  notes: string | null;
  context_snapshot: TaskContextSnapshot | null;
  outcome_status: TaskOutcome | null;
  outcome_checked_at: string | null;
  outcome_note: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export const STATUS_META: Record<TaskStatus, { label: string; chip: string; dot: string }> = {
  todo:         { label: "To do",        chip: "bg-surface-2 text-ink-2",   dot: "bg-ink-3"   },
  in_progress:  { label: "In progress",  chip: "bg-brand-soft text-brand-strong",   dot: "bg-brand"   },
  done:         { label: "Done",         chip: "bg-positive-soft text-positive", dot: "bg-positive"  },
  skipped:      { label: "Skipped",      chip: "bg-surface-2 text-ink-3",   dot: "bg-line-strong"   },
};

export const GROUP_META: Record<TaskGroup, { chip: string }> = {
  Content:     { chip: "bg-surface-2 text-ink-2 border-line" },
  Technical:   { chip: "bg-surface-2 text-ink-2 border-line" },
  "Off-page":  { chip: "bg-surface-2 text-ink-2 border-line" },
};

export const OWNER_META: Record<TaskOwner, { chip: string }> = {
  Writer:     { chip: "bg-surface-2 text-ink-2" },
  Developer:  { chip: "bg-surface-2 text-ink-2" },
  SEO:        { chip: "bg-surface-2 text-ink-2" },
  Outreach:   { chip: "bg-surface-2 text-ink-2" },
};

export const EFFORT_LABEL: Record<TaskEffort, string> = {
  S: "S · hours",
  M: "M · 1-2 days",
  L: "L · 3+ days",
};

export function acceptanceProgress(ac: AcceptanceCriterion[]): { done: number; total: number; pct: number } {
  const total = ac.length;
  const done = ac.filter((c) => c.done).length;
  return { done, total, pct: total === 0 ? 0 : Math.round((done / total) * 100) };
}

// ── Stale detection ──────────────────────────────────────────
// Mirrors the brief-staleness thresholds so the same "context shifted"
// signal feels consistent across the app.
const RANK_DELTA_THRESHOLD = 3;
const CITED_DELTA_THRESHOLD = 2;

export interface CurrentTaskSignals {
  rankPosition: number | null;
  gapLabel: string;
  aioPresent: boolean | null;
  clientCited: boolean | null;
  citedDomainCount: number;
}

export function isTaskStale(snapshot: TaskContextSnapshot | null | undefined, current: CurrentTaskSignals): boolean {
  if (!snapshot) return false;
  if (snapshot.gapLabel !== current.gapLabel) return true;
  if (snapshot.clientCited !== current.clientCited) return true;
  if (snapshot.aioPresent !== current.aioPresent) return true;

  const a = snapshot.rankPosition, b = current.rankPosition;
  if (a == null && b != null) return true;
  if (a != null && b == null) return true;
  if (a != null && b != null && Math.abs(a - b) >= RANK_DELTA_THRESHOLD) return true;

  if (Math.abs(snapshot.citedDomainCount - current.citedDomainCount) >= CITED_DELTA_THRESHOLD) return true;

  return false;
}
