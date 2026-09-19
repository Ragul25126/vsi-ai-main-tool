import type { Metadata } from "next";
import { requireSuperAdmin } from "@/lib/auth";
import { filterJobs, loadJobs } from "@/lib/admin/jobs";
import { hrefWith, pageOf, paginate, param, type Params } from "@/lib/admin/common";
import { PageContainer, PageHeader } from "@/components/ui/Page";
import { Notice } from "@/components/ui/Status";
import { Pagination } from "@/components/admin/DataTable";
import { TableToolbar } from "@/components/admin/TableToolbar";
import { LoadFailed, PartialData } from "@/components/admin/bits";
import { JobsTable } from "@/components/admin/JobsTable";

export const metadata: Metadata = { title: "Jobs" };
export const dynamic = "force-dynamic";

const WINDOWS: Record<string, number> = { "1": 1, "7": 7, "30": 30 };

export default async function JobsPage({ searchParams }: { searchParams: Promise<Params> }) {
  await requireSuperAdmin();
  const sp = await searchParams;
  // Old /admin/cron-runs links arrive as ?type=scheduled.
  const typeParam = param(sp, "type") === "scheduled" ? "scheduled_run" : param(sp, "type");
  const days = WINDOWS[param(sp, "days")] ?? 7;
  const load = await loadJobs({ sinceDays: days });

  const header = (
    <PageHeader
      title="Jobs"
      description="Background work VSI has recorded: site audits, reports, citation strategies and scheduled runs."
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

  const filtered = filterJobs(load.data.jobs, { status: param(sp, "status"), type: typeParam });
  const page = paginate(filtered, pageOf(sp));
  const attention = load.data.jobs.filter((j) => j.status === "failed" || j.stuck).length;

  return (
    <PageContainer>
      {header}
      {attention > 0 && !param(sp, "status") && (
        <Notice tone="attention" title={`${attention} ${attention === 1 ? "job needs" : "jobs need"} attention in this period`}>
          Open a failed or stuck job to see what happened.
        </Notice>
      )}
      <TableToolbar
        filters={[
          {
            param: "status",
            label: "Status",
            options: [
              { value: "", label: "All statuses" },
              { value: "attention", label: "Needs attention" },
              { value: "running", label: "Running" },
              { value: "completed", label: "Completed" },
              { value: "failed", label: "Failed" },
            ],
          },
          {
            param: "type",
            label: "Type",
            options: [
              { value: "", label: "All types" },
              { value: "site_audit", label: "Site audits" },
              { value: "report", label: "Reports" },
              { value: "citation_strategy", label: "Citation strategies" },
              { value: "scheduled_run", label: "Scheduled runs" },
            ],
          },
          { param: "days", label: "Period", options: [{ value: "7", label: "Last 7 days" }, { value: "1", label: "Last 24 hours" }, { value: "30", label: "Last 30 days" }] },
        ]}
      />
      <div className="space-y-3">
        <JobsTable jobs={page.items} empty={load.data.jobs.length === 0 ? `No jobs in the last ${days === 1 ? "24 hours" : `${days} days`}.` : "No jobs match these filters."} />
        <Pagination page={page.page} pageCount={page.pageCount} total={page.total} hrefFor={(n) => hrefWith("/admin/jobs", sp, { page: n })} noun={["job", "jobs"]} />
        <PartialData>
          Search and AI checks run while the user waits and aren&apos;t recorded as jobs yet, so they don&apos;t appear here.
          {load.data.unavailable.length > 0 && ` Not included yet: ${load.data.unavailable.join("; ")}.`}
        </PartialData>
      </div>
    </PageContainer>
  );
}
