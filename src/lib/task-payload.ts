import type { AcceptanceCriterion, TaskEffort, TaskGroup, TaskImpact, TaskOwner } from "@/lib/tasks";

export type TaskSource = "site_audit" | "geo" | "search" | "competitors" | "manual";

export const TASK_SOURCE_LABEL: Record<TaskSource, string> = {
  site_audit: "Site Audit",
  geo: "AI Visibility",
  search: "Search Visibility",
  competitors: "Competitors",
  manual: "Added manually",
};

export interface TaskDraft {
  clientId: string;
  source: TaskSource;
  /** Stable key of the finding, e.g. "broken_links" or "geo:not_mentioned". */
  findingKey: string;
  title: string;
  whatWeFound: string;
  whyItMatters: string;
  whatToDo: string;
  group: TaskGroup;
  owner?: TaskOwner | null;
  impact: TaskImpact;
  effort?: TaskEffort | null;
  trackedKeywordId?: string | null;
  acceptance?: string[];
  affected?: string[];
}

/** Exactly what POST /api/tasks accepts. */
export interface CreateTaskPayload {
  client_id: string;
  tracked_keyword_id: string | null;
  group_name: TaskGroup;
  owner: TaskOwner | null;
  title: string;
  description: string;
  acceptance: AcceptanceCriterion[];
  effort: TaskEffort | null;
  impact: TaskImpact;
}

const SOURCE_LINE = /^Source: (.+?) \(([^)]+)\)$/m;

export function toTaskPayload(d: TaskDraft): CreateTaskPayload {
  const affected = (d.affected ?? []).slice(0, 15);
  const description = [
    `What we found:\n${d.whatWeFound}`,
    `Why it matters:\n${d.whyItMatters}`,
    `What to do:\n${d.whatToDo}`,
    affected.length ? `Affected:\n${affected.map((a) => `- ${a}`).join("\n")}` : null,
    `Source: ${TASK_SOURCE_LABEL[d.source]} (${d.findingKey})`,
  ]
    .filter(Boolean)
    .join("\n\n");

  return {
    client_id: d.clientId,
    tracked_keyword_id: d.trackedKeywordId ?? null,
    group_name: d.group,
    owner: d.owner ?? null,
    title: d.title.trim().slice(0, 200),
    description,
    acceptance: (d.acceptance ?? []).map((text) => ({ text, done: false })),
    effort: d.effort ?? null,
    impact: d.impact,
  };
}

/** Read back which module created a task, from its description. */
export function parseTaskSource(description: string | null | undefined): { label: string; findingKey: string } | null {
  const m = description?.match(SOURCE_LINE);
  return m ? { label: m[1], findingKey: m[2] } : null;
}

/** Effort estimate from impact when a module has no better signal. */
export function defaultEffort(group: TaskGroup): TaskEffort {
  return group === "Technical" ? "S" : "M";
}
