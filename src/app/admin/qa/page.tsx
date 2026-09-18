import { createClient } from "@/lib/supabase/server";
import { requireSuperAdmin } from "@/lib/auth";
import { QA_SECTIONS } from "@/lib/qa-checklist";

export const dynamic = "force-dynamic";

interface CheckRow {
  tester_id: string;
  tester_name: string;
  item_key: string;
  status: string;
  notes: string | null;
  updated_at: string;
}

export default async function AdminQAPage() {
  const supabase = await createClient();
  const { data } = await supabase.rpc("qa_all_checks_admin");
  const rows = (data ?? []) as CheckRow[];

  const byTester = new Map<string, { name: string; items: Map<string, CheckRow> }>();
  for (const r of rows) {
    if (!byTester.has(r.tester_id)) {
      byTester.set(r.tester_id, { name: r.tester_name, items: new Map() });
    }
    byTester.get(r.tester_id)!.items.set(r.item_key, r);
  }

  const allItems = QA_SECTIONS.flatMap((s) => s.tests.map((t) => ({ section: s.title, id: t.id, label: t.label })));

  const statusChip = (s: string | undefined) =>
    s === "pass" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
    s === "fail" ? "bg-rose-50 text-rose-700 border border-rose-200" :
    s === "skipped" ? "bg-slate-100 text-slate-600 border border-slate-200" :
    "bg-slate-50 border border-slate-200 text-slate-400";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">QA progress</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Per-tester status for every checklist item. Each tester signs in at <code className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded font-mono font-bold text-slate-800">/qa</code> with their code.
        </p>
      </div>

      {byTester.size === 0 ? (
        <div className="rounded-[22px] border border-dashed border-slate-200 bg-white p-12 text-center shadow-xs">
          <p className="text-sm font-semibold text-slate-400">No QA submissions yet.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from(byTester.entries()).map(([id, t]) => {
              const items = Array.from(t.items.values());
              const pass = items.filter((i) => i.status === "pass").length;
              const fail = items.filter((i) => i.status === "fail").length;
              return (
                <div key={id} className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-xs">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{t.name}</p>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">{items.length}</p>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    <span className="text-emerald-600 font-bold">{pass} pass</span> · <span className="text-rose-600 font-bold">{fail} fail</span>
                  </p>
                </div>
              );
            })}
          </div>

          <div className="rounded-[22px] border border-slate-200/80 bg-white overflow-hidden shadow-xs">
            <div className="grid grid-cols-12 gap-2 px-6 py-3 bg-slate-50/70 border-b border-slate-100 text-xs text-slate-400 font-bold uppercase tracking-wider">
              <div className="col-span-1">ID</div>
              <div className="col-span-5">Test</div>
              {Array.from(byTester.entries()).map(([id, t]) => (
                <div key={id} className="col-span-3 text-center">{t.name}</div>
              ))}
            </div>
            {allItems.map((it) => (
              <div key={it.id} className="grid grid-cols-12 gap-2 px-6 py-3 border-b border-slate-100 last:border-0 text-xs items-center hover:bg-slate-50/60 transition-colors">
                <div className="col-span-1 font-mono font-bold text-slate-400">{it.id}</div>
                <div className="col-span-5 text-slate-800 font-semibold">{it.label}</div>
                {Array.from(byTester.entries()).map(([id, t]) => {
                  const row = t.items.get(it.id);
                  return (
                    <div key={id} className="col-span-3 flex justify-center">
                      <span
                        className={`rounded-lg px-2.5 py-0.5 text-[10px] font-bold ${statusChip(row?.status)}`}
                        title={row?.notes ?? ""}
                      >
                        {row?.status ?? "—"}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
