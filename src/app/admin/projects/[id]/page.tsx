import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSuperAdmin } from "@/lib/auth";
import { UUID_PATTERN, displayDomain } from "@/lib/project-types";
import { loadProjectDetail } from "@/lib/admin/project";
import { loadJobs } from "@/lib/admin/jobs";
import { loadActivity } from "@/lib/admin/activity";
import { plural } from "@/lib/format";
import { PageContainer, PageHeader, Section } from "@/components/ui/Page";
import { AccountStatus, BackLink, DetailList, LoadFailed, PartialData, When } from "@/components/admin/bits";
import { JobsTable } from "@/components/admin/JobsTable";
import { ActivityList } from "@/components/admin/ActivityList";
import AdminClientEnginesForm from "@/components/AdminClientEnginesForm";
import ClientIdentityForm from "@/components/ClientIdentityForm";

export const metadata: Metadata = { title: "Project" };
export const dynamic = "force-dynamic";

/** Inspection view for one project. Not the customer dashboard. */
export default async function AdminProjectPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSuperAdmin();
  const { id } = await params;
  if (!UUID_PATTERN.test(id)) notFound();

  const detail = await loadProjectDetail(id);
  if (!detail.ok && detail.message === "not_found") notFound();
  if (!detail.ok) {
    return (
      <PageContainer>
        <BackLink href="/admin/projects">Projects</BackLink>
        <PageHeader title="Project" />
        <LoadFailed message={detail.message} />
      </PageContainer>
    );
  }
  const p = detail.data;
  const [jobs, activity] = await Promise.all([loadJobs({ projectId: id, sinceDays: 90 }), loadActivity({ projectId: id, sinceDays: 30, limit: 30 })]);
  const activeSearches = p.searches.filter((s) => s.active).length;

  return (
    <PageContainer>
      <BackLink href="/admin/projects">Projects</BackLink>
      <PageHeader
        title={p.name}
        description={<AccountStatus orgDisabled={p.agencyDisabled} />}
        meta={
          <>
            <span>{displayDomain(p.website) ?? "No website"}</span>
            <span>Created <When iso={p.createdAt} /></span>
          </>
        }
      />

      <DetailList
        items={[
          {
            label: "Organization",
            value: p.agencyId ? (
              <Link href={`/admin/organizations/${p.agencyId}`} className="underline-offset-4 hover:underline">
                {p.agencyName ?? "Unnamed organization"}
              </Link>
            ) : (
              "None"
            ),
          },
          { label: "Domain", value: displayDomain(p.website) ?? "No website" },
          { label: "Searches", value: `${activeSearches} active of ${p.searches.length}` },
          { label: "Competitors added", value: p.competitors === null ? "Data unavailable (migration 036 pending)" : p.competitors.length },
          { label: "Last search or AI check", value: <When iso={p.checks.last} missing="Never" /> },
          { label: "Check results (30 days)", value: p.checks.last30 },
          {
            label: "Latest site audit",
            value:
              p.audit === "unavailable" ? (
                "Data unavailable (migration 035 pending)"
              ) : p.audit === null ? (
                "Not run yet"
              ) : (
                <>
                  {p.audit.status === "completed" && p.audit.score !== null ? `Score ${p.audit.score} / 100` : p.audit.status === "failed" ? "Failed" : "Running"} · <When iso={p.audit.at} />
                </>
              ),
          },
          { label: "Tasks", value: `${p.tasks.open} open, ${p.tasks.done} done, ${p.tasks.verified} confirmed by a re-check` },
        ]}
      />

      <Section title="Searches" description={p.searches.length ? plural(p.searches.length, "search", "searches") : undefined}>
        {p.searches.length === 0 ? (
          <p className="text-body text-ink-2">No searches added yet.</p>
        ) : (
          <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-support">
            {p.searches.map((s) => (
              <li key={s.id} className={s.active ? "text-ink-2" : "text-ink-3 line-through"}>
                {s.keyword}
              </li>
            ))}
          </ul>
        )}
      </Section>

      {p.competitors && p.competitors.length > 0 && (
        <Section title="Competitors added">
          <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-support text-ink-2">
            {p.competitors.map((c) => (
              <li key={c.domain}>{c.domain}</li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="Recent jobs" description="The last 90 days." action={{ label: "All jobs", href: "/admin/jobs" }}>
        {!jobs.ok ? (
          <LoadFailed message={jobs.message} />
        ) : (
          <>
            <JobsTable jobs={jobs.data.jobs.slice(0, 20)} showOrg={false} empty="No jobs for this project in the last 90 days." />
            {jobs.data.unavailable.length > 0 && <PartialData>Not included yet: {jobs.data.unavailable.join("; ")}.</PartialData>}
          </>
        )}
      </Section>

      <Section title="Reports">
        {p.reports.length === 0 ? (
          <p className="text-body text-ink-2">No reports created yet.</p>
        ) : (
          <ul className="divide-y divide-line rounded-panel border border-line bg-surface">
            {p.reports.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-support">
                <span className="text-ink">
                  {r.type === "weekly" ? "Weekly report" : "Search report"}
                  {r.status === "failed" && <span className="ml-2 text-critical">Failed</span>}
                  {r.status === "pending" && <span className="ml-2 text-ink-3">Generating</span>}
                </span>
                <span className="text-ink-3">
                  <When iso={r.at} />
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Activity" description="The last 30 days.">
        {!activity.ok ? <LoadFailed message={activity.message} /> : <ActivityList items={activity.data.items} unavailable={activity.data.unavailable} empty="No activity on this project in the last 30 days." />}
      </Section>

      <Section title="Website and brand" description="What VSI looks for in results and AI answers.">
        <ClientIdentityForm clientId={id} scope="admin" initial={{ website: p.website, brand_name: p.brandName }} />
      </Section>

      <Section title="Checks this project runs">
        <AdminClientEnginesForm clientId={id} initial={p.engines} />
      </Section>
    </PageContainer>
  );
}
