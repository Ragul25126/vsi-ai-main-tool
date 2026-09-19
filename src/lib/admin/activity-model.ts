/** Activity feed shape and rules. Pure functions (tested). */

export type ActivityKind =
  | "organization"
  | "project"
  | "invite"
  | "task"
  | "report"
  | "audit"
  | "competitor"
  | "admin";

export interface ActivityItem {
  id: string;
  at: string;
  kind: ActivityKind;
  /** Who did it, as far as VSI recorded it. */
  actor: string;
  /** Verb phrase, e.g. "created project". */
  action: string;
  /** What it happened to, e.g. a project name. */
  entity: string | null;
  entityHref: string | null;
  organization: string | null;
  organizationId: string | null;
  /** True for failures, shown with an attention marker. */
  problem?: boolean;
}

/**
 * Who did something. Never invented: a recorded name or email, else the
 * organization ("Someone at Acme"), else "Someone".
 */
export function actorLabel(recorded: string | null | undefined, organization: string | null | undefined): string {
  if (recorded && recorded.trim()) return recorded.trim();
  if (organization && organization.trim()) return `Someone at ${organization.trim()}`;
  return "Someone";
}

export function sortActivity(items: ActivityItem[]): ActivityItem[] {
  return [...items].sort((a, b) => b.at.localeCompare(a.at));
}

/** "Today", "Yesterday" or "12 Sep 2026" headings for grouping. */
export function dayHeading(iso: string, now: Date = new Date()): string {
  const d = new Date(iso);
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  if (d.getTime() >= start) return "Today";
  if (d.getTime() >= start - 86_400_000) return "Yesterday";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(d);
}

export const ACTIVITY_KIND_LABEL: Record<ActivityKind, string> = {
  organization: "Organizations",
  project: "Projects",
  invite: "Invites",
  task: "Tasks",
  report: "Reports",
  audit: "Site audits",
  competitor: "Competitors",
  admin: "Admin actions",
};
