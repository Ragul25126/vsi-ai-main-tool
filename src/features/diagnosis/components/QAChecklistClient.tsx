"use client";

import { useEffect, useMemo, useState } from "react";
import type { QASection } from "@/lib/qa-checklist";

type Status = "pending" | "pass" | "fail" | "na";

interface TestState {
 status: Status;
 notes: string;
}

interface Run {
 tester: string;
 startedAt: string;
 state: Record<string, TestState>;
}

const STORAGE_KEY = "vsi-qa-run-v1";

const STATUS_STYLES: Record<Status, string> = {
 pending: "bg-surface-2 text-ink-3 border-line",
 pass: "bg-positive-soft text-positive border-positive/30",
 fail: "bg-critical-soft text-critical border-critical/30",
 na: "bg-attention-soft text-attention border-line",
};

const STATUS_BTN: Record<Exclude<Status, "pending">, string> = {
 pass: "PASS",
 fail: "FAIL",
 na: "N/A",
};

export default function QAChecklistClient({ sections }: { sections: QASection[] }) {
 const [run, setRun] = useState<Run>({ tester: "", startedAt: new Date().toISOString(), state: {} });
 const [hydrated, setHydrated] = useState(false);

 // Load from localStorage on mount
 useEffect(() => {
 try {
 const raw = localStorage.getItem(STORAGE_KEY);
 if (raw) setRun(JSON.parse(raw));
 } catch {}
 setHydrated(true);
 }, []);

 // Persist on every change
 useEffect(() => {
 if (!hydrated) return;
 try { localStorage.setItem(STORAGE_KEY, JSON.stringify(run)); } catch {}
 }, [run, hydrated]);

 function setStatus(id: string, status: Status) {
 setRun((r) => ({
 ...r,
 state: {
 ...r.state,
 [id]: { status, notes: r.state[id]?.notes ?? "" },
 },
 }));
 }

 function setNotes(id: string, notes: string) {
 setRun((r) => ({
 ...r,
 state: {
 ...r.state,
 [id]: { status: r.state[id]?.status ?? "pending", notes },
 },
 }));
 }

 function resetRun() {
 if (!confirm("Reset all test results? This cannot be undone.")) return;
 setRun({ tester: "", startedAt: new Date().toISOString(), state: {} });
 }

 function exportMarkdown() {
 const lines: string[] = [];
 lines.push(`# VSI QA Run`);
 lines.push("");
 lines.push(`- **Tester:** ${run.tester || "(unspecified)"}`);
 lines.push(`- **Started:** ${new Date(run.startedAt).toLocaleString()}`);
 lines.push(`- **Exported:** ${new Date().toLocaleString()}`);
 lines.push("");
 lines.push(`## Summary`);
 lines.push(`- Pass: ${counts.pass}`);
 lines.push(`- Fail: ${counts.fail}`);
 lines.push(`- N/A: ${counts.na}`);
 lines.push(`- Pending: ${counts.pending}`);
 lines.push("");
 for (const s of sections) {
 lines.push(`## ${s.title}`);
 lines.push("");
 lines.push("| ID | Test | Status | Notes |");
 lines.push("|---|---|---|---|");
 for (const t of s.tests) {
 const st = run.state[t.id];
 const status = st?.status === "pending" || !st ? "-" : STATUS_BTN[st.status as Exclude<Status, "pending">];
 const notes = (st?.notes ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
 lines.push(`| ${t.id} | ${t.label.replace(/\|/g, "\\|")} | ${status} | ${notes} |`);
 }
 lines.push("");
 }

 const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
 const url = URL.createObjectURL(blob);
 const a = document.createElement("a");
 a.href = url;
 a.download = `vsi-qa-${new Date().toISOString().replace(/[:.]/g, "-")}.md`;
 a.click();
 URL.revokeObjectURL(url);
 }

 const counts = useMemo(() => {
 const c = { pass: 0, fail: 0, na: 0, pending: 0 };
 for (const s of sections) {
 for (const t of s.tests) {
 const st = run.state[t.id]?.status ?? "pending";
 c[st]++;
 }
 }
 return c;
 }, [run, sections]);

 const total = counts.pass + counts.fail + counts.na + counts.pending;
 const completion = total > 0 ? Math.round(((total - counts.pending) / total) * 100) : 0;

 return (
 <div className="space-y-5">
 {/* Tester bar */}
 <div className="rounded-panel border border-line bg-surface p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
 <div className="flex-1 min-w-0">
 <label className="block text-caption text-ink-3 mb-1">Tester name</label>
 <input
 type="text"
 value={run.tester}
 onChange={(e) => setRun((r) => ({ ...r, tester: e.target.value }))}
 placeholder="Your name"
 className="w-full sm:max-w-xs rounded-control border border-line-strong bg-surface-2 px-3 py-2 text-body text-ink placeholder:text-ink-3 focus:border-line-strong focus:outline-none"
 />
 </div>
 <div className="flex flex-wrap gap-2 shrink-0">
 <button onClick={exportMarkdown} className="rounded-control bg-ink px-3 py-2 text-caption font-semibold text-white hover:bg-ink-2">Export Markdown</button>
 <button onClick={resetRun} className="rounded-control border border-line-strong px-3 py-2 text-caption text-ink-2 hover:bg-surface-2">Reset</button>
 </div>
 </div>

 {/* Summary */}
 <div className="rounded-panel border border-line bg-surface p-4">
 <div className="flex flex-wrap items-center gap-2 mb-3 text-caption">
 <span className="font-medium text-ink-2">Progress {completion}%</span>
 <span className="text-ink-3">·</span>
 <span className="text-positive">{counts.pass} pass</span>
 <span className="text-critical">{counts.fail} fail</span>
 <span className="text-attention">{counts.na} n/a</span>
 <span className="text-ink-3">{counts.pending} pending</span>
 </div>
 <div className="h-1.5 w-full bg-line rounded-full overflow-hidden">
 <div className="h-full bg-ink transition-all" style={{ width: `${completion}%` }} />
 </div>
 </div>

 {/* Sections */}
 {sections.map((s) => (
 <div key={s.id} className="rounded-panel border border-line bg-surface overflow-hidden">
 <div className="px-4 py-3 border-b border-line bg-surface-2">
 <p className="text-body font-semibold text-ink">{s.title}</p>
 {s.description && <p className="text-caption text-ink-3 mt-0.5">{s.description}</p>}
 </div>
 <div className="divide-y divide-line">
 {s.tests.map((t) => {
 const st = run.state[t.id] ?? { status: "pending" as Status, notes: "" };
 return (
 <div key={t.id} className="px-4 py-3">
 <div className="flex flex-col sm:flex-row sm:items-start gap-3">
 <div className="flex-1 min-w-0">
 <p className="text-body text-ink">
 <span className="text-ink-3 text-caption mr-2">{t.id}</span>
 {t.label}
 </p>
 {t.hint && <p className="text-caption text-ink-3 mt-0.5">{t.hint}</p>}
 </div>
 <div className="flex shrink-0 gap-1">
 {(["pass", "fail", "na"] as const).map((opt) => (
 <button
 key={opt}
 onClick={() => setStatus(t.id, st.status === opt ? "pending" : opt)}
 className={`rounded-md border px-2.5 py-1 text-caption font-semibold transition-colors ${
 st.status === opt ? STATUS_STYLES[opt] : "border-line text-ink-3 hover:bg-surface-2"
 }`}
 >
 {STATUS_BTN[opt]}
 </button>
 ))}
 </div>
 </div>
 {(st.status === "fail" || st.notes) && (
 <textarea
 value={st.notes}
 onChange={(e) => setNotes(t.id, e.target.value)}
 rows={2}
 placeholder="Notes / reproduction steps / screenshot URL…"
 className="mt-2 w-full rounded-control border border-line-strong bg-surface-2 px-3 py-2 text-caption text-ink placeholder:text-ink-3 focus:border-line-strong focus:outline-none"
 />
 )}
 </div>
 );
 })}
 </div>
 </div>
 ))}
 </div>
 );
}
