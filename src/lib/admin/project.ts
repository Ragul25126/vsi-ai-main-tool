import "server-only";
import { createClient } from "@/lib/supabase/server";
import { isDummySupabase, requireSuperAdmin } from "@/lib/auth";
import { isMissingObject, type Load } from "./common";

type Tri = boolean | null;

export interface ProjectDetail {
  id: string;
  name: string;
  brandName: string | null;
  website: string | null;
  createdAt: string;
  agencyId: string | null;
  agencyName: string | null;
  agencyDisabled: boolean;
  engines: { ai_mode_enabled: Tri; ai_overview_enabled: Tri; rank_tracking_enabled: Tri; chatgpt_enabled: Tri; llm_mentions_enabled: Tri };
  searches: { id: string; keyword: string; active: boolean; location: string | null }[];
  /** null when competitor storage isn't set up (migration 036). */
  competitors: { domain: string; createdAt: string }[] | null;
  checks: { last: string | null; last30: number };
  /** null when site audits aren't set up (migration 035). */
  audit: { status: string; score: number | null; at: string } | null | "unavailable";
  tasks: { open: number; done: number; verified: number };
  reports: { id: string; type: string; status: string | null; at: string; token: string | null }[];
}

type ClientRow = {
  id: string;
  name: string;
  brand_name: string | null;
  website: string | null;
  created_at: string;
  agency_id: string | null;
  ai_mode_enabled: Tri;
  ai_overview_enabled: Tri;
  rank_tracking_enabled: Tri;
  chatgpt_enabled: Tri;
  llm_mentions_enabled: Tri;
  agencies: { name: string; is_disabled: boolean | null } | { name: string; is_disabled: boolean | null }[] | null;
};

/** Everything a platform admin needs to inspect one project. Returns ok:false with "not_found" when it doesn't exist. */
export async function loadProjectDetail(id: string): Promise<Load<ProjectDetail>> {
  await requireSuperAdmin();
  if (isDummySupabase()) return { ok: false, message: "VSI isn't connected to its database in this environment." };
  const supabase = await createClient();
  const since = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const head = { count: "exact" as const, head: true };

  const { data: client, error } = await supabase
    .from("clients")
    .select("id, name, brand_name, website, created_at, agency_id, ai_mode_enabled, ai_overview_enabled, rank_tracking_enabled, chatgpt_enabled, llm_mentions_enabled, agencies(name, is_disabled)")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("[admin] project failed", { code: error.code });
    return { ok: false, message: "This project couldn't be loaded right now." };
  }
  if (!client) return { ok: false, message: "not_found" };
  const c = client as unknown as ClientRow;
  const agency = Array.isArray(c.agencies) ? c.agencies[0] : c.agencies;

  const [kw, comp, lastCheck, checks30, audit, open, done, verified, reports] = await Promise.all([
    supabase.from("tracked_keywords").select("id, keyword, is_active, location").eq("client_id", id).order("created_at", { ascending: true }).limit(200),
    supabase.from("project_competitors").select("domain, created_at").eq("client_id", id).order("created_at", { ascending: true }),
    supabase.from("search_results").select("created_at").eq("client_id", id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("search_results").select("id", head).eq("client_id", id).gte("created_at", since),
    supabase.from("site_audits").select("status, score, created_at").eq("client_id", id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("tasks").select("id", head).eq("client_id", id).in("status", ["todo", "in_progress"]),
    supabase.from("tasks").select("id", head).eq("client_id", id).eq("status", "done"),
    supabase.from("tasks").select("id", head).eq("client_id", id).eq("outcome_status", "verified"),
    supabase.from("reports").select("id, type, status, generated_at, share_token").eq("client_id", id).order("generated_at", { ascending: false }).limit(10),
  ]);

  return {
    ok: true,
    data: {
      id: c.id,
      name: c.name,
      brandName: c.brand_name,
      website: c.website,
      createdAt: c.created_at,
      agencyId: c.agency_id,
      agencyName: agency?.name ?? null,
      agencyDisabled: !!agency?.is_disabled,
      engines: {
        ai_mode_enabled: c.ai_mode_enabled,
        ai_overview_enabled: c.ai_overview_enabled,
        rank_tracking_enabled: c.rank_tracking_enabled,
        chatgpt_enabled: c.chatgpt_enabled,
        llm_mentions_enabled: c.llm_mentions_enabled,
      },
      searches: ((kw.data ?? []) as { id: string; keyword: string; is_active: boolean; location: string | null }[]).map((k) => ({ id: k.id, keyword: k.keyword, active: k.is_active, location: k.location })),
      competitors: comp.error ? (isMissingObject(comp.error) ? null : []) : ((comp.data ?? []) as { domain: string; created_at: string }[]).map((x) => ({ domain: x.domain, createdAt: x.created_at })),
      checks: { last: (lastCheck.data?.created_at as string | undefined) ?? null, last30: checks30.count ?? 0 },
      audit: audit.error ? "unavailable" : audit.data ? { status: audit.data.status as string, score: (audit.data.score as number | null) ?? null, at: audit.data.created_at as string } : null,
      tasks: { open: open.count ?? 0, done: done.count ?? 0, verified: verified.count ?? 0 },
      reports: ((reports.data ?? []) as { id: string; type: string; status: string | null; generated_at: string; share_token: string | null }[]).map((r) => ({ id: r.id, type: r.type, status: r.status, at: r.generated_at, token: r.share_token })),
    },
  };
}
