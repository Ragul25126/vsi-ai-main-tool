import "server-only";
import { createClient } from "@/lib/supabase/server";
import { isDummySupabase, requireSuperAdmin } from "@/lib/auth";
import { isMissingObject, type Load } from "./common";
import { actorLabel, sortActivity, type ActivityItem } from "./activity-model";

type Named = { name?: string | null } | { name?: string | null }[] | null | undefined;
const nameOf = (n: Named) => (Array.isArray(n) ? n[0]?.name : n?.name) ?? null;

export interface ActivityResult {
  items: ActivityItem[];
  unavailable: string[];
}

/**
 * Platform activity from real timestamps across VSI's tables, plus the admin
 * audit log. Scoped to one organization or project when given.
 */
export async function loadActivity(opts: { sinceDays?: number; agencyId?: string; projectId?: string; limit?: number } = {}): Promise<Load<ActivityResult>> {
  await requireSuperAdmin();
  if (isDummySupabase()) return { ok: false, message: "VSI isn't connected to its database in this environment." };
  const supabase = await createClient();
  const since = new Date(Date.now() - (opts.sinceDays ?? 30) * 86_400_000).toISOString();
  const per = 150;
  const unavailable: string[] = [];

  // Narrow a query to the requested organization or project (kept loosely typed on purpose).
  const scope = <T,>(q: T, agencyCol = "agency_id", projectCol = "client_id"): T => {
    let out = q as unknown as { eq: (c: string, v: string) => unknown };
    if (opts.agencyId) out = out.eq(agencyCol, opts.agencyId) as typeof out;
    if (opts.projectId) out = out.eq(projectCol, opts.projectId) as typeof out;
    return out as unknown as T;
  };

  const [orgs, projects, invites, tasksCreated, tasksDone, reports, audits, competitors, admin] = await Promise.all([
    opts.projectId
      ? Promise.resolve({ data: [], error: null })
      : scope(supabase.from("agencies").select("id, name, created_at").gte("created_at", since).order("created_at", { ascending: false }).limit(per), "id", "id"),
    scope(supabase.from("clients").select("id, name, agency_id, created_at, agencies(name)").gte("created_at", since).order("created_at", { ascending: false }).limit(per), "agency_id", "id"),
    opts.agencyId || opts.projectId
      ? Promise.resolve({ data: [], error: null })
      : supabase.from("invites").select("id, used_by, used_at, role").not("used_at", "is", null).gte("used_at", since).order("used_at", { ascending: false }).limit(per),
    scope(supabase.from("tasks").select("id, title, client_id, agency_id, created_by, created_at, clients(name), agencies(name)").gte("created_at", since).order("created_at", { ascending: false }).limit(per)),
    scope(supabase.from("tasks").select("id, title, client_id, agency_id, completed_by, completed_at, clients(name), agencies(name)").not("completed_at", "is", null).gte("completed_at", since).order("completed_at", { ascending: false }).limit(per)),
    scope(supabase.from("reports").select("id, type, client_id, agency_id, created_by, generated_at, status, clients(name), agencies(name)").gte("generated_at", since).order("generated_at", { ascending: false }).limit(per)),
    scope(supabase.from("site_audits").select("id, client_id, agency_id, requested_by, status, domain, created_at, clients(name), agencies(name)").gte("created_at", since).order("created_at", { ascending: false }).limit(per)),
    scope(supabase.from("project_competitors").select("id, domain, client_id, agency_id, created_by, created_at, clients(name), agencies(name)").gte("created_at", since).order("created_at", { ascending: false }).limit(per)),
    opts.projectId
      ? Promise.resolve({ data: [], error: null })
      : scope(supabase.from("audit_log").select("id, actor_id, actor_email, agency_id, action, target_type, target_id, summary, created_at, agencies(name)").gte("created_at", since).order("created_at", { ascending: false }).limit(per), "agency_id", "agency_id"),
  ]);

  const note = (res: { error: { code?: string; message?: string } | null }, label: string) => {
    if (!res.error) return true;
    unavailable.push(isMissingObject(res.error) ? `${label} (its database table isn't set up yet)` : `${label} (couldn't be loaded)`);
    if (!isMissingObject(res.error)) console.error(`[admin] activity: ${label} failed`, { code: res.error.code });
    return false;
  };

  type Row = Record<string, unknown>;
  const rows = (res: { data: unknown }) => (res.data ?? []) as Row[];

  // Names for recorded people (profiles hold names; emails come from the audit log itself).
  const actorIds = new Set<string>();
  for (const r of [...rows(invites), ...rows(tasksCreated), ...rows(tasksDone), ...rows(reports), ...rows(audits), ...rows(competitors)]) {
    for (const k of ["used_by", "created_by", "completed_by", "requested_by"]) if (typeof r[k] === "string") actorIds.add(r[k] as string);
  }
  const names = new Map<string, string>();
  if (actorIds.size > 0) {
    const { data } = await supabase.from("profiles").select("id, full_name").in("id", [...actorIds]);
    for (const p of (data ?? []) as { id: string; full_name: string | null }[]) if (p.full_name) names.set(p.id, p.full_name);
  }
  const who = (id: unknown, org: string | null) => actorLabel(typeof id === "string" ? names.get(id) : null, org);

  const items: ActivityItem[] = [];
  if (note(orgs, "Organizations"))
    for (const r of rows(orgs))
      items.push({ id: `org:${r.id}`, at: r.created_at as string, kind: "organization", actor: "Someone", action: "created organization", entity: r.name as string, entityHref: `/admin/organizations/${r.id}`, organization: r.name as string, organizationId: r.id as string });
  if (note(projects, "Projects"))
    for (const r of rows(projects)) {
      const org = nameOf(r.agencies as Named);
      items.push({ id: `project:${r.id}`, at: r.created_at as string, kind: "project", actor: actorLabel(null, org), action: "created project", entity: r.name as string, entityHref: `/admin/projects/${r.id}`, organization: org, organizationId: r.agency_id as string });
    }
  if (note(invites, "Invites"))
    for (const r of rows(invites))
      items.push({ id: `invite:${r.id}`, at: r.used_at as string, kind: "invite", actor: who(r.used_by, null), action: r.role === "super_admin" ? "accepted a platform admin invite" : "accepted an invite", entity: null, entityHref: null, organization: null, organizationId: null });
  if (note(tasksCreated, "Tasks"))
    for (const r of rows(tasksCreated)) {
      const org = nameOf(r.agencies as Named);
      items.push({ id: `task:${r.id}`, at: r.created_at as string, kind: "task", actor: who(r.created_by, org), action: `created task "${r.title}"`, entity: nameOf(r.clients as Named), entityHref: `/admin/projects/${r.client_id}`, organization: org, organizationId: r.agency_id as string });
    }
  if (note(tasksDone, "Completed tasks"))
    for (const r of rows(tasksDone)) {
      const org = nameOf(r.agencies as Named);
      items.push({ id: `task-done:${r.id}`, at: r.completed_at as string, kind: "task", actor: who(r.completed_by, org), action: `completed task "${r.title}"`, entity: nameOf(r.clients as Named), entityHref: `/admin/projects/${r.client_id}`, organization: org, organizationId: r.agency_id as string });
    }
  if (note(reports, "Reports"))
    for (const r of rows(reports)) {
      const org = nameOf(r.agencies as Named);
      const failed = r.status === "failed";
      items.push({ id: `report:${r.id}`, at: r.generated_at as string, kind: "report", actor: who(r.created_by, org), action: failed ? "report failed" : "created a report", entity: nameOf(r.clients as Named), entityHref: `/admin/projects/${r.client_id}`, organization: org, organizationId: r.agency_id as string, problem: failed });
    }
  if (note(audits, "Site audits"))
    for (const r of rows(audits)) {
      const org = nameOf(r.agencies as Named);
      const failed = r.status === "failed";
      items.push({ id: `audit:${r.id}`, at: r.created_at as string, kind: "audit", actor: who(r.requested_by, org), action: failed ? "site audit failed" : r.status === "running" ? "started a site audit" : "ran a site audit", entity: nameOf(r.clients as Named), entityHref: `/admin/projects/${r.client_id}`, organization: org, organizationId: r.agency_id as string, problem: failed });
    }
  if (note(competitors, "Competitors"))
    for (const r of rows(competitors)) {
      const org = nameOf(r.agencies as Named);
      items.push({ id: `competitor:${r.id}`, at: r.created_at as string, kind: "competitor", actor: who(r.created_by, org), action: `added competitor ${r.domain}`, entity: nameOf(r.clients as Named), entityHref: `/admin/projects/${r.client_id}`, organization: org, organizationId: r.agency_id as string });
    }
  if (note(admin, "Admin actions"))
    for (const r of rows(admin))
      items.push({ id: `admin:${r.id}`, at: r.created_at as string, kind: "admin", actor: actorLabel(r.actor_email as string | null, "the platform team"), action: r.summary as string, entity: null, entityHref: null, organization: nameOf(r.agencies as Named), organizationId: (r.agency_id as string | null) ?? null });

  return { ok: true, data: { items: sortActivity(items).slice(0, opts.limit ?? 500), unavailable } };
}
