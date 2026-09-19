import { requireSuperAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CronRunsPage() {
  // Checked here, not only in the layout: layouts don't re-run on client navigation.
  await requireSuperAdmin();
  const supabase = await createClient();
  const { data: runs } = await supabase
    .from("cron_runs")
    .select("id, started_at, finished_at, clients_processed, keywords_processed, errors")
    .order("started_at", { ascending: false })
    .limit(50);

  const rows = runs ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Cron history</h1>
        <p className="text-sm text-slate-500 mt-0.5">Last 50 automatic runs of <code className="text-brand-strong bg-orange-50 px-1.5 py-0.5 rounded font-mono font-bold">/api/cron/run-due-clients</code>. Useful for verifying the scheduler is firing and spotting failing clients.</p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-panel border border-dashed border-slate-200 bg-white p-12 text-center">
          <p className="text-sm font-semibold text-slate-400">No cron runs yet.</p>
          <p className="text-xs text-slate-400 mt-1">Configure the scheduled task to hit the cron endpoint hourly.</p>
        </div>
      ) : (
        <div className="rounded-panel border border-slate-200/80 bg-white overflow-hidden">
          <div className="hidden sm:grid grid-cols-12 gap-2 px-6 py-3 bg-slate-50/70 border-b border-slate-100 text-xs text-slate-400 font-bold">
            <div className="col-span-3">Started</div>
            <div className="col-span-2">Duration</div>
            <div className="col-span-2 text-center">Clients</div>
            <div className="col-span-2 text-center">Keywords</div>
            <div className="col-span-3">Errors</div>
          </div>
          {rows.map((r) => {
            const start = new Date(r.started_at);
            const end = r.finished_at ? new Date(r.finished_at) : null;
            const durationMs = end ? end.getTime() - start.getTime() : null;
            const duration = durationMs != null
              ? durationMs < 1000
                ? `${durationMs}ms`
                : `${Math.round(durationMs / 1000)}s`
              : "running…";

            return (
              <div key={r.id} className="border-b border-slate-100 last:border-0 px-6 py-3.5 text-xs flex flex-col gap-1.5 sm:grid sm:grid-cols-12 sm:gap-2 sm:items-center hover:bg-slate-50/60 transition-colors">
                <div className="sm:col-span-3 text-slate-900 font-bold">
                  {start.toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </div>
                <div className="sm:col-span-2 text-slate-500 font-medium">{duration}</div>
                <div className="sm:col-span-2 sm:text-center">
                  <span className="text-slate-400 sm:hidden font-medium">Clients: </span>
                  <span className="text-slate-900 font-bold">{r.clients_processed ?? 0}</span>
                </div>
                <div className="sm:col-span-2 sm:text-center">
                  <span className="text-slate-400 sm:hidden font-medium">Keywords: </span>
                  <span className="text-slate-900 font-bold">{r.keywords_processed ?? 0}</span>
                </div>
                <div className="sm:col-span-3 text-xs">
                  {(r.errors?.length ?? 0) === 0 ? (
                    <span className="text-emerald-600 font-bold">No errors</span>
                  ) : (
                    <details>
                      <summary className="cursor-pointer text-rose-600 font-bold">
                        {r.errors!.length} error{r.errors!.length !== 1 ? "s" : ""}
                      </summary>
                      <ul className="mt-1 space-y-0.5 list-disc list-inside text-slate-500 font-medium">
                        {r.errors!.map((e: string, i: number) => (
                          <li key={i} className="truncate" title={e}>{e}</li>
                        ))}
                      </ul>
                    </details>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
