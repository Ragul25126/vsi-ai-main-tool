import "server-only";
import { createClient } from "@/lib/supabase/server";
import { isDummySupabase, requireSuperAdmin } from "@/lib/auth";
import { isMissingObject, type Load } from "./common";
import { auditJob, reportJob, scheduledJob, sortJobs, strategyJob, type AdminJob, type JobType } from "./jobs-model";

export interface JobsResult {
  jobs: AdminJob[];
  /** Sources that couldn't be read, in plain words (e.g. a pending migration). */
  unavailable: string[];
}

/**
 * Background work from the tables VSI already writes: site audits, reports,
 * citation strategies and scheduled runs. Search and AI checks run inline
 * and leave no job record, so they aren't listed (and aren't invented).
 */
export async function loadJobs(opts: { sinceDays?: number; projectId?: string; agencyId?: string } = {}): Promise<Load<JobsResult>> {
  await requireSuperAdmin();
  if (isDummySupabase()) return { ok: false, message: "VSI isn't connected to its database in this environment." };
  const supabase = await createClient();
  const since = new Date(Date.now() - (opts.sinceDays ?? 30) * 86_400_000).toISOString();
  const now = Date.now();
  const unavailable: string[] = [];
  const jobs: AdminJob[] = [];

  let audits = supabase
    .from("site_audits")
    .select("id, client_id, agency_id, status, domain, error_message, created_at, completed_at, clients(name), agencies(name)")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(300);
  let reports = supabase
    .from("reports")
    .select("id, client_id, agency_id, type, status, error_message, generated_at, clients(name), agencies(name)")
    .gte("generated_at", since)
    .order("generated_at", { ascending: false })
    .limit(300);
  let strategies = supabase
    .from("search_results")
    .select("id, client_id, agency_id, keyword, citation_strategy_status, citation_strategy_error, clients(name), agencies(name)")
    .not("citation_strategy_status", "is", null)
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(200);
  if (opts.projectId) {
    audits = audits.eq("client_id", opts.projectId);
    reports = reports.eq("client_id", opts.projectId);
    strategies = strategies.eq("client_id", opts.projectId);
  }
  if (opts.agencyId) {
    audits = audits.eq("agency_id", opts.agencyId);
    reports = reports.eq("agency_id", opts.agencyId);
    strategies = strategies.eq("agency_id", opts.agencyId);
  }
  const scoped = !!(opts.projectId || opts.agencyId);
  const [a, r, s, c] = await Promise.all([
    audits,
    reports,
    strategies,
    scoped ? Promise.resolve({ data: [], error: null }) : supabase.from("cron_runs").select("id, started_at, finished_at, clients_processed, keywords_processed, errors").gte("started_at", since).order("started_at", { ascending: false }).limit(100),
  ]);

  const take = <T,>(res: { data: unknown; error: { code?: string; message?: string } | null }, label: string, map: (row: T) => AdminJob) => {
    if (res.error) {
      unavailable.push(isMissingObject(res.error) ? `${label} (its database table isn't set up yet)` : `${label} (couldn't be loaded)`);
      if (!isMissingObject(res.error)) console.error(`[admin] jobs: ${label} failed`, { code: res.error.code });
      return;
    }
    for (const row of (res.data ?? []) as T[]) jobs.push(map(row));
  };
  take<Parameters<typeof auditJob>[0]>(a, "Site audits", (row) => auditJob(row, now));
  take<Parameters<typeof reportJob>[0]>(r, "Reports", reportJob);
  take<Parameters<typeof strategyJob>[0]>(s, "Citation strategies", strategyJob);
  take<Parameters<typeof scheduledJob>[0]>(c, "Scheduled runs", (row) => scheduledJob(row, now));

  return { ok: true, data: { jobs: sortJobs(jobs), unavailable } };
}

export function filterJobs(jobs: AdminJob[], f: { status?: string; type?: string; agencyId?: string }): AdminJob[] {
  return jobs.filter(
    (j) =>
      (!f.type || j.type === (f.type as JobType)) &&
      (!f.agencyId || j.agencyId === f.agencyId) &&
      (!f.status ||
        (f.status === "attention" ? j.status === "failed" || j.stuck : j.status === f.status)),
  );
}
