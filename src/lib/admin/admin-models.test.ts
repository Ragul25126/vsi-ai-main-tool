import { describe, expect, it } from "vitest";
import { auditJob, needsAttention, reportJob, scheduledJob, sortJobs, strategyJob, STUCK_AFTER_MS } from "./jobs-model";
import { combineProviders, jobsHealth, SCHEDULE_LATE_AFTER_MS } from "./health-model";
import { actorLabel, dayHeading, sortActivity } from "./activity-model";
import { hrefWith, pageOf, paginate, roleLabel } from "./common";
import { formatDuration, formatWhen } from "@/lib/format";

const NOW = new Date("2026-09-19T12:00:00Z").getTime();
const ago = (ms: number) => new Date(NOW - ms).toISOString();

describe("jobs model", () => {
  const audit = { id: "a1", client_id: "c1", agency_id: "g1", domain: "acme.ae", error_message: null, completed_at: null, clients: { name: "Acme" }, agencies: [{ name: "Acme Group" }] };

  it("maps site audit statuses and flags stuck runs", () => {
    expect(auditJob({ ...audit, status: "running", created_at: ago(60_000) }, NOW)).toMatchObject({ status: "running", stuck: false, projectName: "Acme", agencyName: "Acme Group" });
    expect(auditJob({ ...audit, status: "running", created_at: ago(STUCK_AFTER_MS + 1) }, NOW).stuck).toBe(true);
    const failed = auditJob({ ...audit, status: "failed", error_message: "DNS failed", created_at: ago(1000) }, NOW);
    expect(failed.status).toBe("failed");
    expect(failed.problem).toBe("DNS failed");
    expect(needsAttention(failed)).toBe(true);
  });

  it("never invents finish times for reports or strategies", () => {
    const r = reportJob({ id: "r1", client_id: "c1", agency_id: "g1", type: "weekly", status: "ready", error_message: null, generated_at: ago(5000) });
    expect(r).toMatchObject({ status: "completed", finishedAt: null });
    const s = strategyJob({ id: "s1", client_id: "c1", agency_id: "g1", keyword: "seo dubai", citation_strategy_status: "pending", citation_strategy_error: null });
    expect(s).toMatchObject({ status: "running", startedAt: null, finishedAt: null });
  });

  it("treats a scheduled run with errors and no work as failed, and partial errors as warnings", () => {
    const base = { id: "k1", started_at: ago(3_600_000), finished_at: ago(3_500_000) };
    expect(scheduledJob({ ...base, clients_processed: 0, keywords_processed: 0, errors: ["RLS blocked"] }, NOW).status).toBe("failed");
    expect(scheduledJob({ ...base, clients_processed: 3, keywords_processed: 20, errors: ["one timeout"] }, NOW)).toMatchObject({ status: "completed", warnings: 1 });
    expect(scheduledJob({ ...base, finished_at: null, clients_processed: 0, keywords_processed: 0, errors: null }, NOW)).toMatchObject({ status: "running", stuck: true });
  });

  it("sorts newest first with unknown start times last", () => {
    const a = strategyJob({ id: "s", client_id: null, agency_id: null, keyword: "k", citation_strategy_status: "ready", citation_strategy_error: null });
    const b = reportJob({ id: "r", client_id: "c", agency_id: "g", type: "weekly", status: "ready", error_message: null, generated_at: ago(10) });
    expect(sortJobs([a, b]).map((j) => j.type)).toEqual(["report", "citation_strategy"]);
  });
});

describe("health model", () => {
  const base = { cronSecretSet: true, lastRunStartedAt: ago(3_600_000), lastRunFinishedAt: ago(3_500_000), failedLast24h: 0, stuck: 0, now: NOW };

  it("is healthy only when runs are on time and nothing failed", () => {
    expect(jobsHealth(base).state).toBe("healthy");
    expect(jobsHealth({ ...base, failedLast24h: 2 }).state).toBe("attention");
    expect(jobsHealth({ ...base, lastRunFinishedAt: ago(SCHEDULE_LATE_AFTER_MS + 60_000), lastRunStartedAt: ago(SCHEDULE_LATE_AFTER_MS + 120_000) }).state).toBe("attention");
  });

  it("says not configured without CRON_SECRET or without any run", () => {
    expect(jobsHealth({ ...base, cronSecretSet: false }).state).toBe("not_configured");
    expect(jobsHealth({ ...base, lastRunStartedAt: null, lastRunFinishedAt: null }).state).toBe("not_configured");
    expect(jobsHealth({ ...base, cronSecretSet: false, failedLast24h: 1 }).state).toBe("attention");
  });

  it("never reports untested keys as healthy", () => {
    expect(combineProviders([{ state: "configured" }, { state: "not_configured" }])).toBe("configured");
    expect(combineProviders([{ state: "healthy" }, { state: "configured" }])).toBe("configured");
    expect(combineProviders([{ state: "healthy" }, { state: "not_configured" }])).toBe("healthy");
    expect(combineProviders([{ state: "healthy" }, { state: "unavailable" }])).toBe("unavailable");
    expect(combineProviders([{ state: "not_configured" }])).toBe("not_configured");
  });
});

describe("activity model", () => {
  it("never invents a person", () => {
    expect(actorLabel("Pat Lee", "Acme")).toBe("Pat Lee");
    expect(actorLabel(null, "Acme")).toBe("Someone at Acme");
    expect(actorLabel("  ", null)).toBe("Someone");
  });

  it("sorts newest first and groups by day", () => {
    const items = sortActivity([
      { id: "1", at: ago(90_000_000), kind: "project", actor: "x", action: "a", entity: null, entityHref: null, organization: null, organizationId: null },
      { id: "2", at: ago(1000), kind: "project", actor: "x", action: "a", entity: null, entityHref: null, organization: null, organizationId: null },
    ]);
    expect(items[0].id).toBe("2");
    const now = new Date(NOW);
    expect(dayHeading(ago(1000), now)).toBe("Today");
  });
});

describe("admin list helpers", () => {
  it("paginates and clamps the page", () => {
    const r = paginate(Array.from({ length: 30 }, (_, i) => i), 9, 25);
    expect(r).toMatchObject({ page: 2, pageCount: 2, total: 30 });
    expect(r.items).toHaveLength(5);
    expect(pageOf({ page: "abc" })).toBe(1);
  });

  it("keeps filters when changing page", () => {
    expect(hrefWith("/admin/users", { q: "acme", status: "disabled" }, { page: 2 })).toBe("/admin/users?q=acme&status=disabled&page=2");
    expect(hrefWith("/admin/users", { q: "acme", page: "2" }, { q: null })).toBe("/admin/users?page=2");
  });

  it("uses plain role names", () => {
    expect(roleLabel("super_admin")).toBe("Platform admin");
    expect(roleLabel("pilot")).toBe("Member");
    expect(roleLabel(null)).toBe("No role");
  });

  it("formats operational times and durations", () => {
    const now = new Date(NOW);
    expect(formatWhen(ago(20_000), now)).toBe("Just now");
    expect(formatWhen(ago(12 * 60_000), now)).toBe("12 min ago");
    expect(formatDuration(ago(90_000), ago(0))).toBe("2 min");
    expect(formatDuration(ago(45_000), ago(0))).toBe("45 s");
    expect(formatDuration(null, ago(0))).toBeNull();
  });
});
