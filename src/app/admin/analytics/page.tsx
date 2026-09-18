import { createClient } from "@/lib/supabase/server";
import { requireSuperAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const EVENT_LABEL: Record<string, string> = {
  chat_query: "Chat queries",
  chat_thumbs: "Chat 👍/👎",
  brief_generated: "Briefs generated",
  brief_regenerated: "Briefs regenerated",
  report_generated: "Reports started",
  report_completed: "Reports completed",
  task_imported: "Tasks imported",
  task_status_change: "Task status changes",
  task_outcome: "Task outcomes",
  feedback_submitted: "Feedback submitted",
  keyword_run_outcome: "Keyword runs",
  engine_used: "Engine calls",
};

function nowMs(): number { return Date.now(); }

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();

  const sinceISO = new Date(nowMs() - 30 * 86400 * 1000).toISOString();

  const { data: events, count } = await supabase
    .from("analytics_events")
    .select("event_type, payload, created_at, agency_id", { count: "exact" })
    .gte("created_at", sinceISO)
    .order("created_at", { ascending: false })
    .limit(2000);

  const rows = events ?? [];

  const byType = new Map<string, number>();
  for (const r of rows) {
    const t = r.event_type as string;
    byType.set(t, (byType.get(t) ?? 0) + 1);
  }
  const typeRows = Array.from(byType.entries()).sort((a, b) => b[1] - a[1]);

  const thumbsRows = rows.filter((r) => r.event_type === "chat_thumbs");
  const thumbsUp = thumbsRows.filter((r) => (r.payload as { vote?: string })?.vote === "up").length;
  const thumbsDown = thumbsRows.filter((r) => (r.payload as { vote?: string })?.vote === "down").length;
  const thumbsTotal = thumbsUp + thumbsDown;
  const thumbsPct = thumbsTotal === 0 ? null : Math.round((thumbsUp / thumbsTotal) * 100);

  const briefRows = rows.filter((r) => r.event_type === "brief_generated");
  const briefConfidence = { high: 0, medium: 0, low: 0 };
  for (const r of briefRows) {
    const c = (r.payload as { confidence?: string })?.confidence;
    if (c && c in briefConfidence) briefConfidence[c as keyof typeof briefConfidence]++;
  }

  const chatRows = rows.filter((r) => r.event_type === "chat_query");
  const byScope = new Map<string, number>();
  for (const r of chatRows) {
    const k = (r.payload as { scope_kind?: string })?.scope_kind ?? "unknown";
    byScope.set(k, (byScope.get(k) ?? 0) + 1);
  }

  const dailyMap = new Map<string, number>();
  const baseMs = nowMs();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(baseMs - i * 86400 * 1000);
    dailyMap.set(d.toISOString().slice(0, 10), 0);
  }
  for (const r of rows) {
    const d = (r.created_at as string).slice(0, 10);
    if (dailyMap.has(d)) dailyMap.set(d, (dailyMap.get(d) ?? 0) + 1);
  }
  const dailyMax = Math.max(1, ...Array.from(dailyMap.values()));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Analytics</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Anonymous interaction data - last 30 days. User IDs are hashed; agency IDs preserved so we can cohort by tenant.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/api/admin/analytics/export?format=jsonl&since_days=30"
            download
            className="rounded-panel bg-ink px-4 py-2 text-xs font-bold text-white hover:bg-[#e04800] transition-colors /20"
          >
            Export JSONL
          </a>
          <a
            href="/api/admin/analytics/export?format=csv&since_days=30"
            download
            className="rounded-panel border border-slate-200/80 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Export CSV
          </a>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card label="Total events (30d)" value={String(count ?? 0)} />
        <Card label="Brief satisfaction" value={thumbsPct == null ? "-" : `${thumbsPct}%`} sub={thumbsTotal === 0 ? "no thumbs yet" : `${thumbsUp} 👍 · ${thumbsDown} 👎`} />
        <Card label="High-confidence briefs" value={`${briefConfidence.high}`} sub={`${briefConfidence.medium} medium · ${briefConfidence.low} low`} />
        <Card label="Chat queries" value={String(chatRows.length)} sub={`${byScope.get("keyword") ?? 0} keyword · ${byScope.get("client") ?? 0} client · ${byScope.get("global") ?? 0} global`} />
      </div>

      <div className="rounded-panel border border-slate-200/80 bg-white p-6">
        <p className="text-xs font-bold text-slate-400 mb-4">Events by agency - last 30 days</p>
        { (() => {
          const agencyMap = new Map<string, number>();
          for (const r of rows) {
            const ag = (r as any).agency_id ?? "unknown";
            agencyMap.set(ag, (agencyMap.get(ag) ?? 0) + 1);
          }
          const agencyRows = Array.from(agencyMap.entries()).sort((a,b)=>b[1]-a[1]).slice(0,10);
          const maxCount = Math.max(1, ...agencyRows.map(([,c])=>c));
          return (
            <div className="flex items-end gap-2 h-36">
              {agencyRows.map(([id, count]) => (
                <div key={id} className="flex-1 flex flex-col items-center justify-end h-full group">
                  <div className="flex-1 w-full flex items-end relative">
                    <div
                      className="w-full rounded-t-xl bg-ink hover:bg-[#e04800] transition-colors"
                      style={{ height: `${Math.max(6, (count / maxCount) * 100)}%` }}
                      title={`${id}: ${count} events`}
                    />
                  </div>
                  <p className="text-caption font-bold text-slate-400 truncate mt-2 shrink-0">{id.slice(0,6)}</p>
                </div>
              ))}
            </div>
          );
        })() }
      </div>

      <div className="rounded-panel border border-slate-200/80 bg-white p-6">
        <p className="text-xs font-bold text-slate-400 mb-4">Daily event volume - last 14 days</p>
        <div className="flex items-end gap-2 h-36">
          {Array.from(dailyMap.entries()).map(([d, v]) => (
            <div key={d} className="flex-1 flex flex-col items-center justify-end h-full group">
              <div className="flex-1 w-full flex items-end relative">
                <div
                  className="w-full rounded-t-xl bg-blue-600 hover:bg-blue-700 transition-colors"
                  style={{ height: `${Math.max(6, (v / dailyMax) * 100)}%` }}
                  title={`${d}: ${v} events`}
                />
              </div>
              <p className="text-caption font-bold text-slate-400 mt-2 shrink-0">{d.slice(5)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-panel border border-slate-200/80 bg-white p-6">
        <p className="text-xs font-bold text-slate-400 mb-4">Events by type</p>
        {typeRows.length === 0 ? (
          <p className="text-xs text-slate-400">No events yet.</p>
        ) : (
          <div className="space-y-3">
            {typeRows.map(([t, n]) => {
              const pct = count && count > 0 ? Math.round((n / count) * 100) : 0;
              return (
                <div key={t}>
                  <div className="flex items-center justify-between text-xs mb-1.5 font-semibold">
                    <p className="text-slate-800">{EVENT_LABEL[t] ?? t}</p>
                    <p className="text-slate-500">{n} <span className="text-slate-400">({pct}%)</span></p>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-ink rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function Card({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-panel border border-slate-200/80 bg-white p-5">
      <p className="text-caption font-bold text-slate-400">{label}</p>
      <p className="text-2xl font-semibold text-slate-900 mt-1">{value}</p>
      {sub && <p className="text-caption text-slate-500 font-medium mt-1">{sub}</p>}
    </div>
  );
}
