import "server-only";
import { createClient } from "@/lib/supabase/server";
import { isDummySupabase, requireSuperAdmin } from "@/lib/auth";
import { isMissingObject, type Load } from "./common";

const DAY = 86_400_000;
/** Row caps keep the page fast; the page says when a cap was reached. */
const CAP = 20_000;

export interface OrgUsage {
  agencyId: string;
  name: string;
  checks: number;
  /** null when site audits aren't set up yet (migration 035). */
  audits: number | null;
  reports: number;
  tasksDone: number;
  activeUsers: number;
  events: number;
}

export interface UsageResult {
  sinceDays: number;
  organizations: OrgUsage[];
  daily: { date: string; value: number }[];
  eventTypes: { type: string; count: number }[];
  chatFeedback: { up: number; down: number };
  totalEvents: number;
  capped: boolean;
  unavailable: string[];
}

/** Real usage counts from existing tables. No billing: it isn't implemented. */
export async function loadUsage(opts: { agencyId?: string; sinceDays?: number } = {}): Promise<Load<UsageResult>> {
  await requireSuperAdmin();
  if (isDummySupabase()) return { ok: false, message: "VSI isn't connected to its database in this environment." };
  const supabase = await createClient();
  const sinceDays = opts.sinceDays ?? 30;
  const since = new Date(Date.now() - sinceDays * DAY).toISOString();
  const unavailable: string[] = [];

  const scoped = <T,>(q: T): T => {
    if (!opts.agencyId) return q;
    return (q as unknown as { eq: (c: string, v: string) => unknown }).eq("agency_id", opts.agencyId) as T;
  };

  const [agencies, checks, audits, reports, tasks, events] = await Promise.all([
    scoped(supabase.from("agencies").select("id, name")) as unknown as Promise<{ data: { id: string; name: string }[] | null; error: { code?: string } | null }>,
    scoped(supabase.from("search_results").select("agency_id").gte("created_at", since).limit(CAP)),
    scoped(supabase.from("site_audits").select("agency_id").gte("created_at", since).limit(CAP)),
    scoped(supabase.from("reports").select("agency_id").gte("generated_at", since).limit(CAP)),
    scoped(supabase.from("tasks").select("agency_id").not("completed_at", "is", null).gte("completed_at", since).limit(CAP)),
    scoped(supabase.from("analytics_events").select("agency_id, user_hash, event_type, payload, created_at").gte("created_at", since).order("created_at", { ascending: false }).limit(CAP)),
  ]);

  if (agencies.error) return { ok: false, message: "Usage couldn't be loaded right now." };

  const tally = (res: { data: unknown; error: { code?: string; message?: string } | null }, label: string) => {
    const m = new Map<string, number>();
    if (res.error) {
      unavailable.push(isMissingObject(res.error) ? `${label} (not set up yet)` : `${label} (couldn't be loaded)`);
      return null;
    }
    for (const r of (res.data ?? []) as { agency_id: string | null }[]) if (r.agency_id) m.set(r.agency_id, (m.get(r.agency_id) ?? 0) + 1);
    return m;
  };
  const byChecks = tally(checks, "Check results");
  const byAudits = tally(audits, "Site audits");
  const byReports = tally(reports, "Reports");
  const byTasks = tally(tasks, "Completed tasks");

  const evRows = (events.error ? [] : (events.data ?? [])) as { agency_id: string | null; user_hash: string | null; event_type: string; payload: { vote?: string } | null; created_at: string }[];
  if (events.error) unavailable.push("Product events (couldn't be loaded)");
  const eventsBy = new Map<string, number>();
  const usersBy = new Map<string, Set<string>>();
  const types = new Map<string, number>();
  const days = new Map<string, number>();
  for (let i = sinceDays - 1; i >= 0; i--) days.set(new Date(Date.now() - i * DAY).toISOString().slice(0, 10), 0);
  let up = 0;
  let down = 0;
  for (const e of evRows) {
    if (e.agency_id) {
      eventsBy.set(e.agency_id, (eventsBy.get(e.agency_id) ?? 0) + 1);
      if (e.user_hash) {
        const set = usersBy.get(e.agency_id) ?? new Set<string>();
        set.add(e.user_hash);
        usersBy.set(e.agency_id, set);
      }
    }
    types.set(e.event_type, (types.get(e.event_type) ?? 0) + 1);
    const d = e.created_at.slice(0, 10);
    if (days.has(d)) days.set(d, (days.get(d) ?? 0) + 1);
    if (e.event_type === "chat_thumbs") {
      if (e.payload?.vote === "up") up++;
      else if (e.payload?.vote === "down") down++;
    }
  }

  const capped = [checks, audits, reports, tasks, events].some((r) => !r.error && ((r.data as unknown[] | null)?.length ?? 0) >= CAP);

  const organizations: OrgUsage[] = (agencies.data ?? []).map((a) => ({
    agencyId: a.id,
    name: a.name,
    checks: byChecks?.get(a.id) ?? 0,
    audits: byAudits ? byAudits.get(a.id) ?? 0 : null,
    reports: byReports?.get(a.id) ?? 0,
    tasksDone: byTasks?.get(a.id) ?? 0,
    activeUsers: usersBy.get(a.id)?.size ?? 0,
    events: eventsBy.get(a.id) ?? 0,
  }));
  organizations.sort((x, y) => y.checks + y.events - (x.checks + x.events) || x.name.localeCompare(y.name));

  return {
    ok: true,
    data: {
      sinceDays,
      organizations,
      daily: [...days.entries()].map(([date, value]) => ({ date, value })),
      eventTypes: [...types.entries()].map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count),
      chatFeedback: { up, down },
      totalEvents: evRows.length,
      capped,
      unavailable,
    },
  };
}
