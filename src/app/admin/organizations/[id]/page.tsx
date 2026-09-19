import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireSuperAdmin } from "@/lib/auth";
import { UUID_PATTERN, displayDomain } from "@/lib/project-types";
import { loadOrganizations, loadProjects, loadUsers } from "@/lib/admin/platform";
import { loadActivity } from "@/lib/admin/activity";
import { loadUsage } from "@/lib/admin/usage";
import { roleLabel, type Params } from "@/lib/admin/common";
import { PageContainer, PageHeader, Section } from "@/components/ui/Page";
import { DataTable } from "@/components/admin/DataTable";
import { AccountStatus, BackLink, DetailList, LoadFailed, PartialData, Tabs, When } from "@/components/admin/bits";
import { ActivityList } from "@/components/admin/ActivityList";
import { OrgLimitsForm, OrgStatusControl } from "@/components/admin/OrgControls";

export const metadata: Metadata = { title: "Organization" };
export const dynamic = "force-dynamic";

const TABS = ["overview", "users", "projects", "usage", "activity"] as const;
type Tab = (typeof TABS)[number];

export default async function OrganizationPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Params> }) {
  const session = await requireSuperAdmin();
  const { id } = await params;
  if (!UUID_PATTERN.test(id)) notFound();
  const sp = await searchParams;
  const tab: Tab = (TABS as readonly string[]).includes(String(sp.tab)) ? (sp.tab as Tab) : "overview";

  const orgs = await loadOrganizations();
  if (!orgs.ok) {
    return (
      <PageContainer>
        <PageHeader title="Organization" />
        <LoadFailed message={orgs.message} />
      </PageContainer>
    );
  }
  const org = orgs.data.find((o) => o.id === id);
  if (!org) notFound();

  const base = `/admin/organizations/${id}`;
  const tabs = [
    { key: "overview", label: "Overview", href: base },
    { key: "users", label: `Users (${org.users})`, href: `${base}?tab=users` },
    { key: "projects", label: `Projects (${org.projects})`, href: `${base}?tab=projects` },
    { key: "usage", label: "Usage", href: `${base}?tab=usage` },
    { key: "activity", label: "Activity", href: `${base}?tab=activity` },
  ];

  return (
    <PageContainer>
      <BackLink href="/admin/organizations">Organizations</BackLink>
      <PageHeader
        title={org.name}
        description={<AccountStatus disabled={org.isDisabled} pilot={org.isPilot} />}
        meta={
          <>
            <span>Created <When iso={org.createdAt} /></span>
            <span>Last activity <When iso={org.lastActivity} missing="unavailable" /></span>
          </>
        }
      />
      <Tabs tabs={tabs} current={tab} />

      {tab === "overview" && (
        <>
          <DetailList
            items={[
              { label: "Projects", value: org.projects },
              { label: "Members", value: org.users },
              { label: "Active searches", value: org.searches },
              { label: "Plan", value: org.isPilot ? "Pilot" : "Standard" },
              { label: "Max projects", value: org.maxClients ?? "No limit" },
              { label: "Max searches", value: org.maxKeywords ?? "Not set" },
            ]}
          />
          <Section title="Limits" description="Applied when members add projects or searches.">
            <OrgLimitsForm id={org.id} maxClients={org.maxClients} maxKeywords={org.maxKeywords} isPilot={org.isPilot} />
          </Section>
          <Section title="Access">
            <OrgStatusControl id={org.id} name={org.name} isDisabled={org.isDisabled} disabledReason={org.disabledReason} isOwnOrg={org.id === session.agencyId} />
          </Section>
          {orgs.partial && <PartialData>{orgs.partial}</PartialData>}
        </>
      )}

      {tab === "users" && <OrgUsers agencyId={id} />}
      {tab === "projects" && <OrgProjects agencyId={id} />}
      {tab === "usage" && <OrgUsage agencyId={id} />}
      {tab === "activity" && <OrgActivity agencyId={id} />}
    </PageContainer>
  );
}

async function OrgUsers({ agencyId }: { agencyId: string }) {
  const users = await loadUsers();
  if (!users.ok) return <LoadFailed message={users.message} />;
  const rows = users.data.filter((u) => u.agencyId === agencyId);
  return (
    <DataTable
      caption="Members"
      columns={[{ label: "User" }, { label: "Role" }, { label: "Status" }, { label: "Last active" }]}
      rows={rows.map((u) => ({
        key: u.id,
        href: `/admin/users?q=${encodeURIComponent(u.email ?? u.id)}`,
        cells: [
          <span key="n">
            {u.name ?? u.email ?? "Unnamed user"}
            {u.name && u.email && <span className="block text-caption font-normal text-ink-3">{u.email}</span>}
          </span>,
          roleLabel(u.role),
          <AccountStatus key="s" disabled={u.isDisabled} orgDisabled={u.agencyDisabled} />,
          u.lastSignIn === undefined ? <span key="l" className="text-ink-3">Data unavailable</span> : <When key="l" iso={u.lastSignIn} missing="Never" />,
        ],
      }))}
      empty="No members in this organization."
    />
  );
}

async function OrgProjects({ agencyId }: { agencyId: string }) {
  const projects = await loadProjects();
  if (!projects.ok) return <LoadFailed message={projects.message} />;
  const rows = projects.data.filter((p) => p.agencyId === agencyId);
  return (
    <DataTable
      caption="Projects"
      columns={[{ label: "Project" }, { label: "Domain" }, { label: "Searches", className: "tabular" }, { label: "Created", hideOnMobile: true }, { label: "Last activity" }]}
      rows={rows.map((p) => ({
        key: p.id,
        href: `/admin/projects/${p.id}`,
        cells: [p.name, displayDomain(p.website) ?? "No website", p.activeSearches ?? "Data unavailable", <When key="c" iso={p.createdAt} />, <When key="l" iso={p.lastActivity} missing="Data unavailable" />],
      }))}
      empty="This organization has no projects yet."
    />
  );
}

async function OrgUsage({ agencyId }: { agencyId: string }) {
  const usage = await loadUsage({ agencyId });
  if (!usage.ok) return <LoadFailed message={usage.message} />;
  const u = usage.data.organizations[0];
  if (!u) return <p className="text-body text-ink-2">No usage recorded in the last 30 days.</p>;
  return (
    <DetailList
      items={[
        { label: "Search and AI check results (30 days)", value: u.checks },
        { label: "Site audits (30 days)", value: u.audits ?? "Data unavailable" },
        { label: "Reports (30 days)", value: u.reports },
        { label: "Tasks completed (30 days)", value: u.tasksDone },
        { label: "Active users (30 days)", value: u.activeUsers },
        { label: "Product events (30 days)", value: u.events },
      ]}
    />
  );
}

async function OrgActivity({ agencyId }: { agencyId: string }) {
  const activity = await loadActivity({ agencyId, sinceDays: 30 });
  if (!activity.ok) return <LoadFailed message={activity.message} />;
  return <ActivityList items={activity.data.items} unavailable={activity.data.unavailable} empty="No activity in this organization in the last 30 days." />;
}
