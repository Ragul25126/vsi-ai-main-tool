import type { Metadata } from "next";
import { requireSuperAdmin } from "@/lib/auth";
import { displayDomain } from "@/lib/project-types";
import { loadProjects } from "@/lib/admin/platform";
import { hrefWith, matches, pageOf, paginate, param, type Params } from "@/lib/admin/common";
import { PageContainer, PageHeader } from "@/components/ui/Page";
import { DataTable, Pagination } from "@/components/admin/DataTable";
import { TableToolbar } from "@/components/admin/TableToolbar";
import { AccountStatus, LoadFailed, PartialData, When } from "@/components/admin/bits";

export const metadata: Metadata = { title: "Projects" };
export const dynamic = "force-dynamic";

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<Params> }) {
  await requireSuperAdmin();
  const sp = await searchParams;
  const load = await loadProjects();
  const header = <PageHeader title="Projects" description="Every website tracked on VSI, across all organizations." />;

  if (!load.ok) {
    return (
      <PageContainer>
        {header}
        <LoadFailed message={load.message} />
      </PageContainer>
    );
  }

  const q = param(sp, "q");
  const org = param(sp, "org");
  const orgs = [...new Map(load.data.filter((p) => p.agencyId).map((p) => [p.agencyId as string, p.agencyName ?? "Unnamed organization"])).entries()].sort((a, b) => a[1].localeCompare(b[1]));
  const filtered = load.data.filter((p) => matches([p.name, p.website, p.agencyName], q) && (!org || p.agencyId === org));
  const page = paginate(filtered, pageOf(sp));

  return (
    <PageContainer>
      {header}
      <TableToolbar
        searchPlaceholder="Search project, domain or organization"
        filters={[{ param: "org", label: "Organization", options: [{ value: "", label: "All organizations" }, ...orgs.map(([value, label]) => ({ value, label }))] }]}
      />
      <div className="space-y-3">
        <DataTable
          caption="Projects"
          columns={[
            { label: "Project" },
            { label: "Organization" },
            { label: "Domain" },
            { label: "Status" },
            { label: "Created", hideOnMobile: true },
            { label: "Last activity" },
          ]}
          rows={page.items.map((p) => ({
            key: p.id,
            href: `/admin/projects/${p.id}`,
            cells: [
              p.name,
              p.agencyName ?? "Unnamed organization",
              displayDomain(p.website) ?? <span key="d" className="text-ink-3">No website</span>,
              <AccountStatus key="s" orgDisabled={p.agencyDisabled} />,
              <When key="c" iso={p.createdAt} />,
              <When key="l" iso={p.lastActivity} missing="Data unavailable" />,
            ],
          }))}
          empty={load.data.length === 0 ? "No projects yet. Projects appear when members add their website." : "No projects match these filters."}
        />
        <Pagination page={page.page} pageCount={page.pageCount} total={page.total} hrefFor={(n) => hrefWith("/admin/projects", sp, { page: n })} noun={["project", "projects"]} />
        {load.partial && <PartialData>{load.partial}</PartialData>}
      </div>
    </PageContainer>
  );
}
