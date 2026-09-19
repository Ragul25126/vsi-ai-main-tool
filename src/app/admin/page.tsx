import type { Metadata } from "next";
import Link from "next/link";
import { requireSuperAdmin } from "@/lib/auth";
import { loadPlatformCounts } from "@/lib/admin/platform";
import { loadJobs } from "@/lib/admin/jobs";
import { loadHealth } from "@/lib/admin/health";
import { loadActivity } from "@/lib/admin/activity";
import { formatDateTime } from "@/lib/format";
import { PageContainer, PageHeader, Section } from "@/components/ui/Page";
import { Stat, StatStrip } from "@/components/ui/Metrics";
import { StatusIcon } from "@/components/ui/Status";
import { HealthLabel, LoadFailed, PartialData, When } from "@/components/admin/bits";
import { plural } from "@/lib/format";

export const metadata: Metadata = { title: "Overview" };
export const dynamic = "force-dynamic";

const UNAVAILABLE = "Data unavailable";

/** "Is the VSI platform operating correctly?" */
export default async function AdminOverviewPage() {
  await requireSuperAdmin();
  const [counts, jobs, activity] = await Promise.all([loadPlatformCounts(), loadJobs({ sinceDays: 7 }), loadActivity({ sinceDays: 7, limit: 8 })]);
  const health = await loadHealth(jobs.ok ? jobs.data.jobs : null);

  const dayAgo = Date.now() - 86_400_000;
  const failed24h = jobs.ok ? jobs.data.jobs.filter((j) => j.status === "failed" && j.startedAt && new Date(j.startedAt).getTime() >= dayAgo) : [];
  const stuck = jobs.ok ? jobs.data.jobs.filter((j) => j.stuck) : [];
  const unhealthy = health.filter((h) => h.state === "attention" || h.state === "unavailable");

  const attention: { text: string; href: string; label: string }[] = [];
  if (failed24h.length) attention.push({ text: `${plural(failed24h.length, "job")} failed in the last 24 hours`, href: "/admin/jobs?status=failed", label: "View jobs" });
  if (stuck.length) attention.push({ text: `${plural(stuck.length, "job")} stuck while running`, href: "/admin/jobs?status=attention", label: "View jobs" });
  for (const h of unhealthy) if (h.key !== "jobs" || (!failed24h.length && !stuck.length)) attention.push({ text: `${h.name}: ${h.detail}`, href: "/admin/health", label: "System health" });

  const shownHealth = health.filter((h) => ["database", "jobs", "ai", "search"].includes(h.key));

  return (
    <PageContainer>
      <PageHeader title="Platform overview" description="Is the VSI platform operating correctly?" meta={<span>Updated {formatDateTime(new Date().toISOString())}</span>} />

      {counts.ok ? (
        <StatStrip>
          <Stat
            label="Organizations"
            value={counts.data.orgs.total}
            sub={`${counts.data.orgs.total - counts.data.orgs.disabled} active${counts.data.orgs.disabled ? `, ${counts.data.orgs.disabled} disabled` : ""}`}
          />
          <Stat label="Users" value={counts.data.users.total} sub={counts.data.users.disabled ? `${counts.data.users.disabled} disabled` : "None disabled"} />
          <Stat label="Projects" value={counts.data.projects.total} sub={`${counts.data.projects.recent} added in the last 30 days`} />
        </StatStrip>
      ) : (
        <StatStrip>
          <Stat label="Organizations" value={<span className="text-body text-ink-3">{UNAVAILABLE}</span>} />
          <Stat label="Users" value={<span className="text-body text-ink-3">{UNAVAILABLE}</span>} />
          <Stat label="Projects" value={<span className="text-body text-ink-3">{UNAVAILABLE}</span>} sub={counts.message} />
        </StatStrip>
      )}

      <Section title="Needs attention">
        {!jobs.ok ? (
          <LoadFailed message={jobs.message} />
        ) : attention.length === 0 ? (
          <p className="flex items-center gap-2 text-body text-ink-2">
            <StatusIcon tone="positive" />
            Nothing needs attention right now.
          </p>
        ) : (
          <ul className="divide-y divide-line rounded-panel border border-line bg-surface">
            {attention.map((a) => (
              <li key={a.text} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <span className="flex min-w-0 items-center gap-2.5 text-body text-ink">
                  <StatusIcon tone="attention" />
                  {a.text}
                </span>
                <Link href={a.href} className="text-support font-medium text-ink underline-offset-4 hover:underline">
                  {a.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Platform health" action={{ label: "Full health check", href: "/admin/health" }}>
        <ul className="divide-y divide-line rounded-panel border border-line bg-surface">
          {shownHealth.map((h) => (
            <li key={h.key} className="grid gap-1 px-4 py-3 sm:grid-cols-[10rem_12rem_minmax(0,1fr)] sm:items-center sm:gap-4">
              <span className="text-body font-medium text-ink">{h.name}</span>
              <HealthLabel state={h.state} />
              <span className="text-support text-ink-3">{h.detail}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Recent activity" description="The last 7 days." action={{ label: "All activity", href: "/admin/activity" }}>
        {!activity.ok ? (
          <LoadFailed message={activity.message} />
        ) : activity.data.items.length === 0 ? (
          <p className="text-body text-ink-2">No activity in the last 7 days.</p>
        ) : (
          <ul className="divide-y divide-line rounded-panel border border-line bg-surface">
            {activity.data.items.map((a) => (
              <li key={a.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 px-4 py-2.5">
                <span className="min-w-0 text-body text-ink-2">
                  {a.problem && <StatusIcon tone="attention" size={14} />} <span className="text-ink">{a.actor}</span> {a.action}
                  {a.entity && (
                    <>
                      {" · "}
                      {a.entityHref ? (
                        <Link href={a.entityHref} className="text-ink underline-offset-4 hover:underline">
                          {a.entity}
                        </Link>
                      ) : (
                        a.entity
                      )}
                    </>
                  )}
                </span>
                <span className="text-support text-ink-3">
                  <When iso={a.at} />
                </span>
              </li>
            ))}
          </ul>
        )}
        {activity.ok && activity.data.unavailable.length > 0 && <PartialData>Not included yet: {activity.data.unavailable.join("; ")}.</PartialData>}
      </Section>
    </PageContainer>
  );
}
