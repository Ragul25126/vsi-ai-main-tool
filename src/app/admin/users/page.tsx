import type { Metadata } from "next";
import Link from "next/link";
import { requireSuperAdmin, isDummySupabase } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { loadUsers } from "@/lib/admin/platform";
import { hrefWith, matches, pageOf, paginate, param, roleLabel, type Params } from "@/lib/admin/common";
import { PageContainer, PageHeader, Section } from "@/components/ui/Page";
import { StatusLabel } from "@/components/ui/Status";
import { DataTable, Pagination } from "@/components/admin/DataTable";
import { TableToolbar } from "@/components/admin/TableToolbar";
import { AccountStatus, LoadFailed, PartialData, Tabs, When } from "@/components/admin/bits";
import { UserActions } from "@/components/admin/UserActions";
import InviteCreator from "@/components/admin/InviteCreator";

export const metadata: Metadata = { title: "Users" };
export const dynamic = "force-dynamic";

export default async function UsersPage({ searchParams }: { searchParams: Promise<Params> }) {
  const session = await requireSuperAdmin();
  const sp = await searchParams;
  const tab = param(sp, "tab") === "invites" ? "invites" : "users";

  return (
    <PageContainer>
      <PageHeader title="Users" description="Everyone who can sign in to VSI, and the invites that let new people join." />
      <Tabs
        current={tab}
        tabs={[
          { key: "users", label: "Users", href: "/admin/users" },
          { key: "invites", label: "Invites", href: "/admin/users?tab=invites" },
        ]}
      />
      {tab === "users" ? <UsersTab sp={sp} selfId={session.userId} /> : <InvitesTab />}
    </PageContainer>
  );
}

async function UsersTab({ sp, selfId }: { sp: Params; selfId: string }) {
  const load = await loadUsers();
  if (!load.ok) return <LoadFailed message={load.message} />;
  const q = param(sp, "q");
  const status = param(sp, "status");
  const role = param(sp, "role");
  const filtered = load.data.filter(
    (u) =>
      matches([u.email, u.name, u.agencyName], q) &&
      (!role || u.role === role) &&
      (!status || (status === "disabled" ? u.isDisabled || u.agencyDisabled : !u.isDisabled && !u.agencyDisabled)),
  );
  const page = paginate(filtered, pageOf(sp));

  return (
    <div className="space-y-4">
      <TableToolbar
        searchPlaceholder="Search name, email or organization"
        filters={[
          { param: "role", label: "Role", options: [{ value: "", label: "All roles" }, { value: "super_admin", label: "Platform admin" }, { value: "pilot", label: "Member" }] },
          { param: "status", label: "Status", options: [{ value: "", label: "All" }, { value: "active", label: "Active" }, { value: "disabled", label: "Disabled" }] },
        ]}
      />
      <DataTable
        caption="Users"
        columns={[{ label: "User" }, { label: "Organization" }, { label: "Role" }, { label: "Status" }, { label: "Last active" }, { label: "Actions" }]}
        rows={page.items.map((u) => ({
          key: u.id,
          cells: [
            <span key="n" className="block min-w-0">
              <span className="block truncate font-medium text-ink">{u.name ?? u.email ?? "Unnamed user"}</span>
              {u.name && u.email && <span className="block truncate text-caption text-ink-3">{u.email}</span>}
            </span>,
            u.agencyId ? (
              <Link key="o" href={`/admin/organizations/${u.agencyId}`} className="hover:text-ink hover:underline">
                {u.agencyName ?? "Unnamed organization"}
              </Link>
            ) : (
              <span key="o" className="text-ink-3">No organization yet</span>
            ),
            roleLabel(u.role),
            <AccountStatus key="s" disabled={u.isDisabled} orgDisabled={u.agencyDisabled} />,
            u.lastSignIn === undefined ? <span key="l" className="text-ink-3">Data unavailable</span> : <When key="l" iso={u.lastSignIn} missing="Never signed in" />,
            <UserActions key="a" id={u.id} email={u.email} isDisabled={u.isDisabled} isSelf={u.id === selfId} />,
          ],
        }))}
        empty={load.data.length === 0 ? "No users yet." : "No users match these filters."}
      />
      <Pagination page={page.page} pageCount={page.pageCount} total={page.total} hrefFor={(n) => hrefWith("/admin/users", sp, { page: n })} noun={["user", "users"]} />
      {load.partial && <PartialData>{load.partial}</PartialData>}
    </div>
  );
}

type InviteRow = { id: string; code: string; email: string | null; role: string; max_keywords: number; note: string | null; is_active: boolean; used_by: string | null; used_at: string | null; created_at: string };

async function InvitesTab() {
  await requireSuperAdmin();
  let rows: InviteRow[] = [];
  let failed: string | null = null;
  if (isDummySupabase()) failed = "VSI isn't connected to its database in this environment.";
  else {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("invites")
      .select("id, code, email, role, max_keywords, note, is_active, used_by, used_at, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) failed = "Invites couldn't be loaded right now.";
    rows = (data ?? []) as InviteRow[];
  }

  return (
    <div className="space-y-6">
      <Section title="Create an invite" description="Each code works once. Members get their own organization when they accept.">
        <InviteCreator />
      </Section>
      <Section title="Invites">
        {failed ? (
          <LoadFailed message={failed} />
        ) : (
          <DataTable
            caption="Invites"
            columns={[{ label: "Code" }, { label: "For" }, { label: "Access" }, { label: "Max searches", className: "tabular" }, { label: "Status" }, { label: "Created", hideOnMobile: true }]}
            rows={rows.map((i) => ({
              key: i.id,
              cells: [
                <span key="c" className="font-mono">{i.code}</span>,
                <span key="f" className="block min-w-0">
                  <span className="block truncate">{i.email ?? "Any email"}</span>
                  {i.note && <span className="block truncate text-caption text-ink-3">{i.note}</span>}
                </span>,
                roleLabel(i.role),
                i.role === "super_admin" ? "No limit" : i.max_keywords,
                i.used_by ? (
                  <span key="s" className="text-ink-3">
                    Used <When iso={i.used_at} />
                  </span>
                ) : i.is_active ? (
                  <StatusLabel key="s" tone="info">Open</StatusLabel>
                ) : (
                  <StatusLabel key="s" tone="neutral">Closed</StatusLabel>
                ),
                <When key="d" iso={i.created_at} />,
              ],
            }))}
            empty="No invites yet."
          />
        )}
      </Section>
    </div>
  );
}
