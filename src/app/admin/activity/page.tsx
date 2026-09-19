import type { Metadata } from "next";
import { requireSuperAdmin } from "@/lib/auth";
import { loadActivity } from "@/lib/admin/activity";
import { ACTIVITY_KIND_LABEL, type ActivityKind } from "@/lib/admin/activity-model";
import { hrefWith, pageOf, paginate, param, type Params } from "@/lib/admin/common";
import { PageContainer, PageHeader } from "@/components/ui/Page";
import { Pagination } from "@/components/admin/DataTable";
import { TableToolbar } from "@/components/admin/TableToolbar";
import { LoadFailed } from "@/components/admin/bits";
import { ActivityList } from "@/components/admin/ActivityList";

export const metadata: Metadata = { title: "Activity" };
export const dynamic = "force-dynamic";

const WINDOWS: Record<string, number> = { "7": 7, "30": 30, "90": 90 };

export default async function ActivityPage({ searchParams }: { searchParams: Promise<Params> }) {
  await requireSuperAdmin();
  const sp = await searchParams;
  const days = WINDOWS[param(sp, "days")] ?? 30;
  const kind = param(sp, "kind") as ActivityKind | "";
  const org = param(sp, "org");
  const load = await loadActivity({ sinceDays: days, agencyId: org || undefined, limit: 1000 });

  const header = <PageHeader title="Activity" description="What happened across VSI: who did what, to which organization or project, and when." />;
  if (!load.ok) {
    return (
      <PageContainer>
        {header}
        <LoadFailed message={load.message} />
      </PageContainer>
    );
  }

  const items = kind ? load.data.items.filter((i) => i.kind === kind) : load.data.items;
  const page = paginate(items, pageOf(sp), 50);
  const orgs = [...new Map(load.data.items.filter((i) => i.organizationId && i.organization).map((i) => [i.organizationId as string, i.organization as string])).entries()].sort((a, b) => a[1].localeCompare(b[1]));

  return (
    <PageContainer>
      {header}
      <TableToolbar
        filters={[
          { param: "kind", label: "Type", options: [{ value: "", label: "Everything" }, ...(Object.entries(ACTIVITY_KIND_LABEL) as [ActivityKind, string][]).map(([value, label]) => ({ value, label }))] },
          { param: "org", label: "Organization", options: [{ value: "", label: "All organizations" }, ...orgs.map(([value, label]) => ({ value, label }))] },
          { param: "days", label: "Period", options: [{ value: "30", label: "Last 30 days" }, { value: "7", label: "Last 7 days" }, { value: "90", label: "Last 90 days" }] },
        ]}
      />
      <div className="space-y-3">
        <ActivityList items={page.items} unavailable={load.data.unavailable} empty={load.data.items.length === 0 ? "No recent activity." : "No activity matches these filters."} />
        <Pagination page={page.page} pageCount={page.pageCount} total={page.total} hrefFor={(n) => hrefWith("/admin/activity", sp, { page: n })} noun={["event", "events"]} />
      </div>
    </PageContainer>
  );
}
