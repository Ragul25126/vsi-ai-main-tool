"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
 STATUS_META, GROUP_META, OWNER_META, EFFORT_LABEL,
 acceptanceProgress,
 type TaskRow, type TaskStatus, type AcceptanceCriterion,
} from "@/lib/tasks";

const NEXT_STATUS: Record<TaskStatus, TaskStatus> = {
 todo: "in_progress",
 in_progress: "done",
 done: "todo",
 skipped: "todo",
};

interface Props {
 task: TaskRow;
 keywordLabel?: string | null;
 keywordHref?: string | null;
 isStale?: boolean;
}

function relativeDays(iso: string): string {
 const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
 if (days < 1) return "today";
 if (days === 1) return "1d ago";
 if (days < 7) return `${days}d ago`;
 if (days < 30) return `${Math.floor(days / 7)}w ago`;
 if (days < 365) return `${Math.floor(days / 30)}mo ago`;
 return `${Math.floor(days / 365)}y ago`;
}

function fullDateTime(iso: string): string {
 return new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function TaskCard({ task, keywordLabel, keywordHref, isStale = false }: Props) {
 const router = useRouter();
 const [pending, startTransition] = useTransition();
 const [expanded, setExpanded] = useState(false);
 const [local, setLocal] = useState<TaskRow>(task);
 const [saving, setSaving] = useState(false);

 const status = local.status;
 const meta = STATUS_META[status];
 const progress = acceptanceProgress(local.acceptance);

 async function patch(body: Record<string, unknown>) {
 setSaving(true);
 try {
 const res = await fetch(`/api/tasks/${local.id}`, {
 method: "PATCH",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify(body),
 });
 if (res.ok) {
 const fresh = (await res.json()) as TaskRow;
 setLocal(fresh);
 startTransition(() => router.refresh());
 }
 } finally {
 setSaving(false);
 }
 }

 async function toggleStatus() {
 await patch({ status: NEXT_STATUS[status] });
 }

 async function setStatus(s: TaskStatus) {
 await patch({ status: s });
 }

 async function toggleAcceptance(i: number) {
 const next: AcceptanceCriterion[] = local.acceptance.map((c, idx) => idx === i ? { ...c, done: !c.done } : c);
 // If toggling completes everything, suggest marking task done (don't auto - let user decide).
 await patch({ acceptance: next });
 }

 async function deleteTask() {
 if (!confirm("Delete this task?")) return;
 setSaving(true);
 try {
 const res = await fetch(`/api/tasks/${local.id}`, { method: "DELETE" });
 if (res.ok) startTransition(() => router.refresh());
 } finally {
 setSaving(false);
 }
 }

 return (
 <div
 className={`group rounded-panel border transition-all duration-300   ${
 status === "done" ? "border-positive/30 bg-surface-2 " : status === "skipped" ? "border-line bg-surface opacity-60" : "border-line bg-surface hover:border-line hover:bg-surface-2"
 }`}
 >
 <div className="p-5">
 <div className="flex items-start gap-3">
 {/* Status checkbox */}
 <button
 onClick={toggleStatus}
 disabled={saving}
 aria-label={`Mark ${meta.label}`}
 className={`shrink-0 mt-0.5 h-5 w-5 rounded-control border-2 flex items-center justify-center transition-colors ${
 status === "done"
 ? "bg-positive border-positive/30 text-white"
 : status === "in_progress"
 ? "border-info/30 bg-info/10"
 : "border-line hover:border-line bg-surface-2"
 }`}
 >
 {status === "done" && <span className="text-caption leading-none">✓</span>}
 {status === "in_progress" && <span className="h-2 w-2 rounded-full bg-info" />}
 </button>

 <div className="flex-1 min-w-0">
 <div className="flex items-start justify-between gap-2">
 <p className={`text-body font-semibold ${status === "done" ? "text-ink-3 line-through" : "text-ink-3"}`}>
 {local.title}
 </p>
 <button
 onClick={() => setExpanded((v) => !v)}
 className="shrink-0 text-caption text-ink-3 hover:text-ink transition-colors"
 >
 {expanded ? "Hide" : "Open"}
 </button>
 </div>

 {/* Chips row */}
 <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
 <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-caption font-semibold border ${GROUP_META[local.group_name].chip}`}>
 {local.group_name}
 </span>
 {local.owner && (
 <span className={`rounded-full px-2 py-0.5 text-caption font-semibold ${OWNER_META[local.owner].chip}`}>
 {local.owner}
 </span>
 )}
 {local.effort && (
 <span className="rounded-full bg-surface-2 border border-line px-2 py-0.5 text-caption font-semibold text-ink-3">
 {EFFORT_LABEL[local.effort]}
 </span>
 )}
 {local.impact && (
 <span className="rounded-full bg-surface-2 border border-line px-2 py-0.5 text-caption font-semibold text-ink-3">
 Impact: {local.impact}
 </span>
 )}
 {progress.total > 0 && (
 <span className="rounded-full bg-surface-2 px-2 py-0.5 text-caption font-semibold text-ink">
 {progress.done}/{progress.total} steps
 </span>
 )}
 {local.due_date && (
 <span className={`rounded-full px-2 py-0.5 text-caption font-semibold ${
 new Date(local.due_date) < new Date(new Date().toDateString())
 ? "bg-critical-soft text-critical"
 : "bg-attention-soft text-attention"
 }`}>
 Due {new Date(local.due_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
 </span>
 )}
 {keywordLabel && keywordHref && (
 <Link
 href={keywordHref}
 className="rounded-full bg-surface-2 px-2 py-0.5 text-caption font-medium text-ink-3 hover:text-info hover:bg-info/10 transition-colors"
 >
 &ldquo;{keywordLabel}&rdquo;
 </Link>
 )}
 <span
 className="rounded-full bg-surface-2 border border-line px-2 py-0.5 text-caption font-medium text-ink-3"
 title={`Created ${fullDateTime(local.created_at)}`}
 >
 Created {relativeDays(local.created_at)}
 </span>
 <span className={`rounded-full px-2 py-0.5 text-caption font-semibold ${meta.chip}`}>{meta.label}</span>

 {local.outcome_status === "verified" && (
 <span className="rounded-full bg-positive-soft text-positive px-2 py-0.5 text-caption font-semibold">
 Outcome verified
 </span>
 )}
 {local.outcome_status === "regressed" && (
 <span className="rounded-full bg-critical-soft text-critical px-2 py-0.5 text-caption font-semibold">
 ↓ Regressed
 </span>
 )}

 {isStale && local.status !== "done" && local.status !== "skipped" && (
 <span
 className="rounded-full bg-attention-soft text-attention px-2 py-0.5 text-caption font-semibold"
 title="Underlying SERP/AIO/citation signals shifted significantly since this task was created. Re-evaluate."
 >
 Context changed
 </span>
 )}
 </div>
 </div>
 </div>

 {expanded && (
 <div className="mt-4 pl-8 space-y-3">
 {local.description && (
 <div>
 <p className="text-caption font-semibold text-ink-3 mb-1">Description</p>
 <p className="text-caption text-ink-3 leading-relaxed whitespace-pre-line">{local.description}</p>
 </div>
 )}

 {local.acceptance.length > 0 && (
 <div>
 <p className="text-caption font-semibold text-ink-3 mb-1">Acceptance criteria</p>
 <div className="space-y-1.5">
 {local.acceptance.map((c, i) => (
 <label key={i} className="flex items-start gap-2 cursor-pointer group">
 <input
 type="checkbox"
 checked={c.done}
 onChange={() => toggleAcceptance(i)}
 disabled={saving}
 className="mt-0.5 h-3.5 w-3.5 rounded border-line bg-surface-2 text-info focus:ring-info/30"
 />
 <span className={`text-caption leading-relaxed ${c.done ? "text-ink-2 line-through" : "text-ink-3"}`}>
 {c.text}
 </span>
 </label>
 ))}
 </div>
 </div>
 )}

 <div>
 <p className="text-caption font-semibold text-ink-3 mb-1">Status</p>
 <div className="flex items-center gap-1.5">
 {(["todo", "in_progress", "done", "skipped"] as TaskStatus[]).map((s) => (
 <button
 key={s}
 onClick={() => setStatus(s)}
 disabled={saving || s === status}
 className={`rounded-control px-2.5 py-1 text-caption font-semibold transition-colors ${
 s === status
 ? STATUS_META[s].chip
 : "border border-line text-ink-3 hover:bg-surface-2 hover:text-ink"
 }`}
 >
 {STATUS_META[s].label}
 </button>
 ))}
 </div>
 </div>

 <div>
 <p className="text-caption font-semibold text-ink-3 mb-1">Lifecycle</p>
 <div className="space-y-0.5 text-caption text-ink-2">
 <p>
 <span className="text-ink-3">Created:</span> {fullDateTime(local.created_at)}
 <span className="text-ink-3"> · {relativeDays(local.created_at)}</span>
 </p>
 {local.updated_at && local.updated_at !== local.created_at && (
 <p>
 <span className="text-ink-3">Last updated:</span> {fullDateTime(local.updated_at)}
 <span className="text-ink-3"> · {relativeDays(local.updated_at)}</span>
 </p>
 )}
 {local.completed_at && (
 <p>
 <span className="text-ink-3">Completed:</span> {fullDateTime(local.completed_at)}
 <span className="text-ink-3"> · {relativeDays(local.completed_at)}</span>
 </p>
 )}
 {local.context_snapshot && (
 <p>
 <span className="text-ink-3">Context captured:</span> {fullDateTime(local.context_snapshot.capturedAt)}
 <span className="text-ink-3"> · rank {local.context_snapshot.rankPosition ?? "-"}, {local.context_snapshot.citedDomainCount} citations</span>
 </p>
 )}
 </div>
 </div>

 <div className="flex items-center justify-between pt-1">
 <p className="text-caption text-ink-3">
 {isStale ? "Context changed since this task was created" : "Tracking signals match the original context"}
 </p>
 <button
 onClick={deleteTask}
 disabled={saving}
 className="text-caption text-critical hover:text-critical transition-colors"
 >
 Delete
 </button>
 </div>
 </div>
 )}
 </div>
 {pending && <div className="h-0.5 w-full bg-brand-soft animate-pulse" />}
 </div>
 );
}
