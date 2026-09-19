import "server-only";
import { createClient } from "@/lib/supabase/server";
import { isDummySupabase, requireSuperAdmin } from "@/lib/auth";
import { isMissingObject, type Load } from "./common";

const NO_DB = "VSI isn't connected to its database in this environment.";
const NEEDS_037 = "Last activity appears after the platform admin database update (migration 037) is applied.";
const DAY = 86_400_000;

export interface PlatformCounts {
  orgs: { total: number; disabled: number; pilot: number };
  users: { total: number; disabled: number };
  projects: { total: number; recent: number };
}

/** Headline counts for the Overview. Every number is a count of stored rows. */
export async function loadPlatformCounts(): Promise<Load<PlatformCounts>> {
  await requireSuperAdmin();
  if (isDummySupabase()) return { ok: false, message: NO_DB };
  const supabase = await createClient();
  const head = { count: "exact" as const, head: true };
  const since = new Date(Date.now() - 30 * DAY).toISOString();
  const r = await Promise.all([
    supabase.from("agencies").select("id", head),
    supabase.from("agencies").select("id", head).eq("is_disabled", true),
    supabase.from("agencies").select("id", head).eq("is_pilot", true),
    supabase.from("profiles").select("id", head),
    supabase.from("profiles").select("id", head).eq("is_disabled", true),
    supabase.from("clients").select("id", head),
    supabase.from("clients").select("id", head).gte("created_at", since),
  ]);
  const failed = r.find((x) => x.error);
  if (failed?.error) {
    console.error("[admin] counts failed", { code: failed.error.code });
    return { ok: false, message: "Counts couldn't be loaded right now." };
  }
  const n = (i: number) => r[i].count ?? 0;
  return {
    ok: true,
    data: {
      orgs: { total: n(0), disabled: n(1), pilot: n(2) },
      users: { total: n(3), disabled: n(4) },
      projects: { total: n(5), recent: n(6) },
    },
  };
}

export interface OrgRow {
  id: string;
  name: string;
  isPilot: boolean;
  isDisabled: boolean;
  disabledReason: string | null;
  maxClients: number | null;
  maxKeywords: number | null;
  createdAt: string;
  projects: number;
  users: number;
  searches: number;
  /** null when it can't be computed yet (migration 037 not applied). */
  lastActivity: string | null;
}

type OrgRpcRow = {
  id: string;
  name: string;
  is_pilot: boolean;
  is_disabled: boolean;
  disabled_reason: string | null;
  max_clients: number | null;
  max_keywords: number | null;
  created_at: string;
  projects: number;
  users: number;
  searches: number;
  last_activity: string | null;
};

export async function loadOrganizations(): Promise<Load<OrgRow[]>> {
  await requireSuperAdmin();
  if (isDummySupabase()) return { ok: false, message: NO_DB };
  const supabase = await createClient();

  const rpc = await supabase.rpc("admin_organization_summaries");
  if (!rpc.error) {
    return {
      ok: true,
      data: ((rpc.data ?? []) as OrgRpcRow[]).map((o) => ({
        id: o.id,
        name: o.name,
        isPilot: o.is_pilot,
        isDisabled: o.is_disabled,
        disabledReason: o.disabled_reason,
        maxClients: o.max_clients,
        maxKeywords: o.max_keywords,
        createdAt: o.created_at,
        projects: Number(o.projects),
        users: Number(o.users),
        searches: Number(o.searches),
        lastActivity: o.last_activity,
      })),
    };
  }
  if (!isMissingObject(rpc.error)) {
    console.error("[admin] organizations failed", { code: rpc.error.code });
    return { ok: false, message: "Organizations couldn't be loaded right now." };
  }

  // Before migration 037: the same counts from plain queries (RLS lets platform admins read them).
  const [agencies, clients, profiles, keywords] = await Promise.all([
    supabase.from("agencies").select("id, name, is_pilot, is_disabled, disabled_reason, max_clients, max_keywords, created_at").order("created_at", { ascending: false }),
    supabase.from("clients").select("agency_id"),
    supabase.from("profiles").select("agency_id"),
    supabase.from("tracked_keywords").select("agency_id").eq("is_active", true),
  ]);
  if (agencies.error) return { ok: false, message: "Organizations couldn't be loaded right now." };
  const count = (rows: { agency_id: string | null }[] | null) => {
    const m = new Map<string, number>();
    for (const r of rows ?? []) if (r.agency_id) m.set(r.agency_id, (m.get(r.agency_id) ?? 0) + 1);
    return m;
  };
  const byClients = count(clients.data as { agency_id: string | null }[] | null);
  const byProfiles = count(profiles.data as { agency_id: string | null }[] | null);
  const byKeywords = count(keywords.data as { agency_id: string | null }[] | null);
  return {
    ok: true,
    partial: NEEDS_037,
    data: ((agencies.data ?? []) as Omit<OrgRpcRow, "projects" | "users" | "searches" | "last_activity">[]).map((a) => ({
      id: a.id,
      name: a.name,
      isPilot: !!a.is_pilot,
      isDisabled: !!a.is_disabled,
      disabledReason: a.disabled_reason,
      maxClients: a.max_clients,
      maxKeywords: a.max_keywords,
      createdAt: a.created_at,
      projects: byClients.get(a.id) ?? 0,
      users: byProfiles.get(a.id) ?? 0,
      searches: byKeywords.get(a.id) ?? 0,
      lastActivity: null,
    })),
  };
}

export interface UserRow {
  id: string;
  email: string | null;
  name: string | null;
  role: string | null;
  agencyId: string | null;
  agencyName: string | null;
  isDisabled: boolean;
  agencyDisabled: boolean;
  createdAt: string;
  /** undefined when the database doesn't provide it yet (migration 037). */
  lastSignIn: string | null | undefined;
}

export async function loadUsers(): Promise<Load<UserRow[]>> {
  await requireSuperAdmin();
  if (isDummySupabase()) return { ok: false, message: NO_DB };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_list_users");
  if (error) {
    console.error("[admin] users failed", { code: error.code });
    return { ok: false, message: isMissingObject(error) ? "The users list needs the admin database functions (migrations 025 to 037)." : "Users couldn't be loaded right now." };
  }
  const rows = (data ?? []) as Record<string, unknown>[];
  const hasSignIn = rows.length === 0 || "last_sign_in_at" in rows[0];
  return {
    ok: true,
    partial: hasSignIn ? undefined : "Last active appears after migration 037 is applied.",
    data: rows.map((u) => ({
      id: u.id as string,
      email: (u.email as string | null) ?? null,
      name: (u.full_name as string | null) ?? null,
      role: (u.role as string | null) ?? null,
      agencyId: (u.agency_id as string | null) ?? null,
      agencyName: (u.agency_name as string | null) ?? null,
      isDisabled: !!u.is_disabled,
      agencyDisabled: !!u.agency_is_disabled,
      createdAt: u.created_at as string,
      lastSignIn: hasSignIn ? ((u.last_sign_in_at as string | null) ?? null) : undefined,
    })),
  };
}

export interface ProjectRow {
  id: string;
  name: string;
  website: string | null;
  agencyId: string | null;
  agencyName: string | null;
  agencyDisabled: boolean;
  createdAt: string;
  searches: number | null;
  activeSearches: number | null;
  lastCheck: string | null;
  openTasks: number | null;
  lastActivity: string | null;
}

type ProjectRpcRow = {
  id: string;
  name: string;
  website: string | null;
  agency_id: string | null;
  agency_name: string | null;
  agency_disabled: boolean;
  created_at: string;
  searches: number;
  active_searches: number;
  last_check: string | null;
  open_tasks: number;
  last_activity: string | null;
};

export async function loadProjects(): Promise<Load<ProjectRow[]>> {
  await requireSuperAdmin();
  if (isDummySupabase()) return { ok: false, message: NO_DB };
  const supabase = await createClient();
  const rpc = await supabase.rpc("admin_project_summaries");
  if (!rpc.error) {
    return {
      ok: true,
      data: ((rpc.data ?? []) as ProjectRpcRow[]).map((p) => ({
        id: p.id,
        name: p.name,
        website: p.website,
        agencyId: p.agency_id,
        agencyName: p.agency_name,
        agencyDisabled: p.agency_disabled,
        createdAt: p.created_at,
        searches: Number(p.searches),
        activeSearches: Number(p.active_searches),
        lastCheck: p.last_check,
        openTasks: Number(p.open_tasks),
        lastActivity: p.last_activity,
      })),
    };
  }
  if (!isMissingObject(rpc.error)) {
    console.error("[admin] projects failed", { code: rpc.error.code });
    return { ok: false, message: "Projects couldn't be loaded right now." };
  }
  const { data, error } = await supabase
    .from("clients")
    .select("id, name, website, agency_id, created_at, agencies(name, is_disabled)")
    .order("created_at", { ascending: false });
  if (error) return { ok: false, message: "Projects couldn't be loaded right now." };
  return {
    ok: true,
    partial: NEEDS_037,
    data: ((data ?? []) as unknown as { id: string; name: string; website: string | null; agency_id: string | null; created_at: string; agencies: { name: string; is_disabled: boolean | null } | { name: string; is_disabled: boolean | null }[] | null }[]).map((c) => {
      const a = Array.isArray(c.agencies) ? c.agencies[0] : c.agencies;
      return {
        id: c.id,
        name: c.name,
        website: c.website,
        agencyId: c.agency_id,
        agencyName: a?.name ?? null,
        agencyDisabled: !!a?.is_disabled,
        createdAt: c.created_at,
        searches: null,
        activeSearches: null,
        lastCheck: null,
        openTasks: null,
        lastActivity: null,
      };
    }),
  };
}
