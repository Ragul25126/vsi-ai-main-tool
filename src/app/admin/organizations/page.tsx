import type { Metadata } from "next";
import { requireSuperAdmin } from "@/lib/auth";
import { loadOrganizations } from "@/lib/admin/platform";
import { hrefWith, matches, pageOf, paginate, param, type Params } from "@/lib/admin/common";
import { PageContainer, PageHeader } from "@/components/ui/Page";
import { ButtonLink } from "@/components/ui/Button";
import { DataTable, Pagination } from "@/components/admin/DataTable";
import { TableToolbar } from "@/components/admin/TableToolbar";
import { AccountStatus, LoadFailed, PartialData, When } from "@/components/admin/bits";

export const metadata: Metadata = { title: "Organizations" };
export const dynamic = "force-dynamic";

export default async function OrganizationsPage({ searchParams }: { searchParams: Promise<Params> }) {
  await requireSuperAdmin();
  const sp = await searchParams;
  const load = await loadOrganizations();
  const q = param(sp, "q");
  const status = param(sp, "status");

  const header = (
    <PageHeader
      title="Organizations"
      description="Every organization on VSI, with its projects, members and latest activity."
      actions={<ButtonLink href="/admin/users?tab=invites">Invite someone</ButtonLink>}
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

  const filtered = load.data.filter(
    (o) =>
      matches([o.name], q) &&
      (!status || (status === "disabled" ? o.isDisabled : status === "pilot" ? o.isPilot && !o.isDisabled : status === "active" ? !o.isDisabled : true)),
  );
  const page = paginate(filtered, pageOf(sp));

  return (
    <PageContainer>
      {header}
      <TableToolbar
        searchPlaceholder="Search organizations"
        filters={[
          {
            param: "status",
            label: "Status",
            options: [
              { value: "", label: "All" },
              { value: "active", label: "Active" },
              { value: "pilot", label: "Pilot" },
              { value: "disabled", label: "Disabled" },
            ],
          },
        ]}
      />
      <div className="space-y-3">
        <DataTable
          caption="Organizations"
          columns={[
            { label: "Organization" },
            { label: "Projects", className: "tabular" },
            { label: "Users", className: "tabular" },
            { label: "Status" },
            { label: "Created", hideOnMobile: true },
            { label: "Last activity" },
          ]}
          rows={page.items.map((o) => ({
            key: o.id,
            href: `/admin/organizations/${o.id}`,
            cells: [
              o.name,
              o.projects,
              o.users,
              <AccountStatus key="s" disabled={o.isDisabled} pilot={o.isPilot} />,
              <When key="c" iso={o.createdAt} />,
              <When key="l" iso={o.lastActivity} missing="Data unavailable" />,
            ],
          }))}
          empty={
            load.data.length === 0
              ? "No organizations yet. Organizations are created when someone accepts an invite."
              : "No organizations match these filters."
          }
        />
        <Pagination page={page.page} pageCount={page.pageCount} total={page.total} hrefFor={(n) => hrefWith("/admin/organizations", sp, { page: n })} noun={["organization", "organizations"]} />
        {load.partial && <PartialData>{load.partial}</PartialData>}
      </div>
    </PageContainer>
  );
}
