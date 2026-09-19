"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { QASection } from "@/lib/qa-checklist";

type Status = "todo" | "pass" | "fail" | "skipped";

interface SavedCheck { status: string; notes: string | null; updated_at: string }

interface Props {
 sections: QASection[];
 tester: { id: string; name: string };
 initialChecks: Record<string, SavedCheck>;
}

const STATUS_META: Record<Status, { label: string; cls: string }> = {
 todo: { label: "-", cls: "bg-surface-2 text-ink-3" },
 pass: { label: "Pass", cls: "bg-positive text-white" },
 fail: { label: "Fail", cls: "bg-critical text-white" },
 skipped: { label: "Skipped", cls: "bg-ink-3 text-white" },
};

export default function QAChecklistAttributed({ sections, tester, initialChecks }: Props) {
 const router = useRouter();
 const [, startTransition] = useTransition();
 const [checks, setChecks] = useState(initialChecks);
 const [savingKey, setSavingKey] = useState<string | null>(null);

 async function setStatus(itemKey: string, status: Status, notes?: string) {
 setSavingKey(itemKey);
 setChecks((prev) => ({
 ...prev,
 [itemKey]: { status, notes: notes ?? prev[itemKey]?.notes ?? null, updated_at: new Date().toISOString() },
 }));
 try {
 await fetch("/api/qa/check", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ item_key: itemKey, status, notes: notes ?? checks[itemKey]?.notes ?? null }),
 });
 } finally {
 setSavingKey(null);
 }
 }

 async function setNotes(itemKey: string, notes: string) {
 const existingStatus = (checks[itemKey]?.status as Status) ?? "todo";
 await setStatus(itemKey, existingStatus, notes);
 }

 async function signOut() {
 await fetch("/api/qa/login", { method: "DELETE" });
 startTransition(() => router.refresh());
 }

 // Aggregate counts
 const totals = sections.flatMap((s) => s.tests).reduce(
 (acc, t) => {
 const status = (checks[t.id]?.status as Status) ?? "todo";
 acc[status]++;
 acc.total++;
 return acc;
 },
 { total: 0, todo: 0, pass: 0, fail: 0, skipped: 0 } as Record<string, number>,
 );

 return (
 <div className="space-y-5">
 {/* Header / signed-in strip */}
 <div className="rounded-panel border border-line bg-surface p-4 flex flex-wrap items-center justify-between gap-3">
 <div className="flex items-center gap-3">
 <span className="inline-flex h-9 w-9 rounded-full bg-attention-soft text-attention font-semibold items-center justify-center text-body">
 {tester.name.charAt(0).toUpperCase()}
 </span>
 <div>
 <p className="text-body font-semibold text-ink">Signed in as {tester.name}</p>
 <p className="text-caption text-ink-3">Your checks save to the server automatically and attribute to you.</p>
 </div>
 </div>
 <div className="flex items-center gap-3 text-caption">
 <div className="text-right">
 <p className="text-ink-2"><span className="font-semibold text-positive">{totals.pass}</span> pass · <span className="font-semibold text-critical">{totals.fail}</span> fail · {totals.skipped} skipped · {totals.todo} pending</p>
 <p className="text-caption text-ink-3">{totals.total} total</p>
 </div>
 <button
 onClick={signOut}
 className="rounded-control border border-line-strong bg-surface px-3 py-1.5 text-caption font-semibold text-ink-2 hover:bg-surface-2 transition-colors"
 >Sign out</button>
 </div>
 </div>

 {/* Sections */}
 {sections.map((s) => (
 <details key={s.id} open className="group rounded-panel border border-line bg-surface [&_summary::-webkit-details-marker]:hidden">
 <summary className="px-5 py-3 cursor-pointer list-none flex items-center justify-between gap-3">
 <div>
 <p className="text-body font-semibold text-ink">{s.title}</p>
 {s.description && <p className="text-caption text-ink-3 mt-0.5">{s.description}</p>}
 </div>
 <span className="text-caption text-ink-3">{s.tests.length} tests</span>
 </summary>
 <div className="border-t border-line divide-y divide-line">
 {s.tests.map((t) => {
 const current = (checks[t.id]?.status as Status) ?? "todo";
 return (
 <div key={t.id} className="px-5 py-3">
 <div className="flex items-start gap-3">
 <span className="shrink-0 text-caption text-ink-3 w-12">{t.id}</span>
 <div className="flex-1 min-w-0">
 <p className="text-body text-ink">{t.label}</p>
 {t.hint && <p className="text-caption text-ink-3 mt-0.5">{t.hint}</p>}
 {checks[t.id]?.notes && (
 <p className="mt-1.5 rounded-control bg-attention-soft border border-line px-2 py-1 text-caption text-attention leading-relaxed">
 {checks[t.id].notes}
 </p>
 )}
 </div>
 <div className="shrink-0 flex flex-wrap items-center gap-1 self-start">
 {(["pass", "fail", "skipped"] as Status[]).map((s) => (
 <button
 key={s}
 onClick={() => setStatus(t.id, s)}
 disabled={savingKey === t.id}
 className={`rounded-md px-2 py-1 text-caption font-semibold transition-colors ${
 current === s ? STATUS_META[s].cls : "border border-line text-ink-3 hover:bg-surface-2"
 }`}
 >
 {STATUS_META[s].label}
 </button>
 ))}
 <button
 onClick={() => {
 const note = window.prompt("Add a note (optional):", checks[t.id]?.notes ?? "");
 if (note !== null) setNotes(t.id, note);
 }}
 className="rounded-control border border-line bg-surface px-2 py-1 text-caption text-ink-3 hover:bg-surface-2 transition-colors"
 title="Add a note"
 >+ Note</button>
 </div>
 </div>
 </div>
 );
 })}
 </div>
 </details>
 ))}
 </div>
 );
}
