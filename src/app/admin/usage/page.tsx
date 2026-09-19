import type { Metadata } from "next";
import Link from "next/link";
import { requireSuperAdmin } from "@/lib/auth";
import { loadUsage } from "@/lib/admin/usage";
import { formatShortDate } from "@/lib/format";
import { PageContainer, PageHeader, Section } from "@/components/ui/Page";
import { ButtonLink } from "@/components/ui/Button";
import { Stat, StatStrip } from "@/components/ui/Metrics";
import { DataTable } from "@/components/admin/DataTable";
import { LoadFailed, PartialData } from "@/components/admin/bits";
import { TrendLine } from "@/features/visibility/components/TrajectoryChart";

export const metadata: Metadata = { title: "Usage" };
export const dynamic = "force-dynamic";

const EVENT_LABEL: Record<string, string> = {
  chat_query: "AI Chat questions",
  chat_thumbs: "AI Chat ratings",
  brief_generated: "Briefs generated",
  brief_regenerated: "Briefs regenerated",
  report_generated: "Reports started",
  report_completed: "Reports completed",
  task_imported: "Tasks imported",
  task_status_change: "Task status changes",
  task_outcome: "Task outcomes",
  feedback_submitted: "Feedback sent",
  keyword_run_outcome: "Search checks",
  engine_used: "Engine calls",
};

/** Real usage over the last 30 days. Billing isn't implemented, so it isn't shown. */
export default async function UsagePage() {
  await requireSuperAdmin();
  const load = await loadUsage({ sinceDays: 30 });
  const header = (
    <PageHeader
      title="Usage"
      description="How organizations used VSI in the last 30 days. Product events use hashed user ids; no personal data is stored with them."
      actions={
        <>
          <ButtonLink href="/api/admin/analytics/export?format=csv&since_days=30">Export CSV</ButtonLink>
          <ButtonLink href="/api/admin/analytics/export?format=jsonl&since_days=30">Export JSONL</ButtonLink>
        </>
      }
    />
  );
  if (!load.ok) {
    return (
      <PageContainer>
        {header}
        <LoadFailed message={load.message} />
      </PageContainer>
    );
  }
  const u = load.data;
  const totals = u.organizations.reduce(
    (t, o) => ({ checks: t.checks + o.checks, reports: t.reports + o.reports, tasksDone: t.tasksDone + o.tasksDone }),
    { checks: 0, reports: 0, tasksDone: 0 },
  );
  const rated = u.chatFeedback.up + u.chatFeedback.down;

  return (
    <PageContainer>
      {header}
      <StatStrip>
        <Stat label="Check results stored" value={totals.checks} />
        <Stat label="Reports created" value={totals.reports} />
        <Stat label="Tasks completed" value={totals.tasksDone} />
        <Stat label="AI Chat rated helpful" value={rated === 0 ? <span className="text-body text-ink-3">No ratings yet</span> : `${Math.round((u.chatFeedback.up / rated) * 100)}%`} sub={rated ? `${u.chatFeedback.up} of ${rated} ratings` : undefined} />
      </StatStrip>

      <Section title="Product events per day" description={`${u.totalEvents} events in the last 30 days.`}>
        {u.daily.filter((d) => d.value > 0).length >= 2 ? (
          <TrendLine
            points={u.daily.map((d) => ({ label: formatShortDate(d.date), value: d.value }))}
            max={Math.max(...u.daily.map((d) => d.value), 1)}
            format={(v) => `${v}`}
            ariaLabel="Product events per day over the last 30 days"
            tone="neutral"
          />
        ) : (
          <p className="text-body text-ink-2">Not enough events yet to show a trend.</p>
        )}
      </Section>

      <Section title="By organization">
        <DataTable
          caption="Usage by organization"
          columns={[
            { label: "Organization" },
            { label: "Check results", className: "tabular" },
            { label: "Site audits", className: "tabular" },
            { label: "Reports", className: "tabular" },
            { label: "Tasks done", className: "tabular" },
            { label: "Active users", className: "tabular" },
          ]}
          rows={u.organizations.map((o) => ({
            key: o.agencyId,
            href: `/admin/organizations/${o.agencyId}`,
            cells: [o.name, o.checks, o.audits ?? "Data unavailable", o.reports, o.tasksDone, o.activeUsers],
          }))}
          empty="No organizations yet."
        />
      </Section>

      <Section title="Product events by type">
        {u.eventTypes.length === 0 ? (
          <p className="text-body text-ink-2">No product events in the last 30 days.</p>
        ) : (
          <ul className="grid gap-x-10 gap-y-2 text-support sm:grid-cols-2">
            {u.eventTypes.map((t) => (
              <li key={t.type} className="flex justify-between gap-4 border-b border-line py-1.5">
                <span className="text-ink-2">{EVENT_LABEL[t.type] ?? t.type}</span>
                <span className="tabular text-ink">{t.count}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Billing">
        <p className="text-body text-ink-2">
          Billing isn&apos;t set up in VSI yet, so there are no plans, invoices or revenue to show. Plan limits per organization are on each{" "}
          <Link href="/admin/organizations" className="underline underline-offset-4">organization</Link> page.
        </p>
      </Section>

      {(u.unavailable.length > 0 || u.capped) && (
        <PartialData>
          {u.unavailable.length > 0 && `Not included yet: ${u.unavailable.join("; ")}. `}
          {u.capped && "Some counts reached the 20,000-row limit for this page and may be higher."}
        </PartialData>
      )}
    </PageContainer>
  );
}
