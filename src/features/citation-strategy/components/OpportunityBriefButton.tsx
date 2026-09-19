"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getOpportunitySignal } from "@/lib/opportunities";
import type { OpportunityBrief } from "@/app/api/opportunity-brief/route";

interface Props {
 gapLabel: string;
 trackedKeywordId: string;
 initialBrief?: OpportunityBrief | null;
 isStale?: boolean;
}

export default function OpportunityBriefButton(props: Props) {
 const router = useRouter();
 const [, startTransition] = useTransition();
 const [brief, setBrief] = useState<OpportunityBrief | null>(props.initialBrief ?? null);
 const [loading, setLoading] = useState(false);
 const [expanded, setExpanded] = useState(!!props.initialBrief);
 // Optimistically clear the stale flag after a successful regenerate so the
 // user doesn't see "Outdated - signals changed" still hanging there while
 // the server-rendered isStale prop refreshes.
 const [staleOverride, setStaleOverride] = useState<boolean | null>(null);
 const isStale = staleOverride ?? props.isStale ?? false;
 const [error, setError] = useState<string | null>(null);

 const signal = getOpportunitySignal(props.gapLabel);

 async function regenerate() {
 if (loading) return;
 setLoading(true);
 setExpanded(true);
 setError(null);
 try {
 const res = await fetch("/api/opportunity-brief", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ trackedKeywordId: props.trackedKeywordId }),
 });
 if (res.ok) {
 setBrief(await res.json());
 setStaleOverride(false);
 // Re-fetch the server component so the persisted ai_brief_snapshot
 // is picked up next render - also refreshes any other panels that
 // depend on the new state (e.g. the snapshot strip).
 startTransition(() => router.refresh());
 } else {
 const data = await res.json().catch(() => ({}));
 setError(data.error ?? `Request failed (${res.status}). All AI models may be rate-limited - try again in a minute.`);
 }
 } catch (e) {
 setError(e instanceof Error ? e.message : "Network error");
 } finally {
 setLoading(false);
 }
 }

 return (
 <div className={`rounded-panel ${signal.priorityBg} p-5`}>
 {/* Header */}
 <div className="flex items-start justify-between gap-4">
 <div className="flex-1">
 <div className="flex items-center gap-2 mb-1">
 <span className={`text-body font-semibold ${signal.priorityColor}`}>
 {signal.priorityLabel}
 </span>
 {brief && isStale && (
 <span className="rounded-full bg-attention-soft px-2 py-0.5 text-caption font-semibold text-attention">
 Outdated - signals changed
 </span>
 )}
 </div>
 <h2 className="text-lg font-semibold text-ink">{signal.headline}</h2>
 <p className="text-body text-ink-2 mt-1">{signal.explanation}</p>
 </div>

 <div className="flex flex-wrap items-center gap-2 shrink-0">
 {brief && !loading && (
 <button
 onClick={() => setExpanded((v) => !v)}
 className="rounded-control border border-line-strong px-3 py-2 text-body text-ink-2 hover:bg-surface-2 transition-colors"
 >
 {expanded ? "Hide" : "Show"}
 </button>
 )}
 <button
 onClick={regenerate}
 disabled={loading}
 className="rounded-control bg-ink px-4 py-2 text-body font-semibold text-white hover:bg-ink-2 disabled:opacity-50 transition-colors"
 >
 {loading
 ? "Generating..."
 : brief
 ? (isStale ? "↻ Regenerate (outdated)" : "↻ Regenerate")
 : "Generate brief"}
 </button>
 </div>
 </div>

 {/* Quick rule-based actions (always visible) */}
 {!brief && signal.quickActions.length > 0 && (
 <div className="mt-4 space-y-2">
 <p className="text-caption font-semibold text-ink-3">Quick actions</p>
 {signal.quickActions.map((qa, i) => (
 <div key={i} className="flex gap-3 rounded-control bg-surface-2 border border-line px-3 py-2.5">
 <span className="shrink-0 flex h-5 w-5 mt-0.5 items-center justify-center rounded-full bg-line text-caption font-semibold text-ink-2">
 {i + 1}
 </span>
 <div>
 <p className="text-body font-medium text-ink">{qa.action}</p>
 <p className="text-caption text-ink-3 mt-0.5 leading-relaxed">{qa.why}</p>
 </div>
 </div>
 ))}
 </div>
 )}

 {/* Error state */}
 {error && expanded && !brief && (
 <div className="mt-4 rounded-control bg-critical-soft border border-critical/30 px-4 py-3">
 <p className="text-caption font-semibold text-critical mb-1">Brief Generation Failed</p>
 <p className="text-body text-critical leading-relaxed">{error}</p>
 </div>
 )}

 {/* LLM-generated brief */}
 {brief && expanded && (
 <div className="mt-5 space-y-3">
 {brief.confidence && (
 <div className={`rounded-control border px-4 py-3 ${
 brief.confidence.level === "high" ? "bg-positive-soft border-positive/30"
 : brief.confidence.level === "medium" ? "bg-attention-soft border-line"
 : "bg-brand-soft border-brand/40"
 }`}>
 <div className="flex items-center justify-between gap-2 mb-1.5">
 <p className="text-caption font-semibold text-ink-2">
 Confidence
 </p>
 <span className={`rounded-full px-2 py-0.5 text-caption font-semibold   ${
 brief.confidence.level === "high" ? "bg-positive text-white"
 : brief.confidence.level === "medium" ? "bg-ink text-white"
 : "bg-ink text-white"
 }`}>{brief.confidence.level}</span>
 </div>
 <ul className="space-y-0.5">
 {brief.confidence.reasons.map((r, i) => (
 <li key={i} className="text-caption text-ink-2 flex items-start gap-1.5">
 <span className="text-ink-3 mt-0.5">·</span><span>{r}</span>
 </li>
 ))}
 </ul>
 </div>
 )}
 {brief.aioOffTopic && (
 <div className="rounded-control bg-critical-soft border border-critical/30 px-4 py-3">
 <p className="text-caption font-semibold text-critical mb-1">AI answer topic mismatch</p>
 <p className="text-body text-ink leading-relaxed">
 Google&apos;s AI answer for this query is actually about <strong>{brief.aioOffTopic.actualTopic}</strong> - not your industry. The actions below are a disambiguation strategy, not citation injection.
 </p>
 </div>
 )}

 {/* Insight callout */}
 {brief.targetedInsight && (
 <div className="rounded-control bg-attention-soft border border-line px-4 py-3">
 <p className="text-caption font-semibold text-attention mb-1">Key Insight</p>
 <p className="text-body text-ink leading-relaxed">{brief.targetedInsight}</p>
 </div>
 )}

 {/* Situation */}
 <div className="rounded-control bg-surface border border-line px-4 py-3">
 <p className="text-caption font-semibold text-ink-3 mb-1">Situation</p>
 <p className="text-body text-ink leading-relaxed">{brief.situation}</p>
 </div>

 {/* Content angle */}
 {brief.contentAngle && (
 <div className="rounded-control bg-info-soft border border-info/30 px-4 py-3">
 <p className="text-caption font-semibold text-info mb-1">Content Angle</p>
 <p className="text-body text-ink leading-relaxed">{brief.contentAngle}</p>
 </div>
 )}

 {/* CTA - fires the Task List report directly. KeywordReportButton
 listens for vsi:generate-task-list and runs the generator. */}
 <div className="rounded-control bg-surface-2 text-ink px-5 py-4">
 <div className="flex items-center justify-between gap-3 flex-wrap">
 <div className="min-w-0">
 <p className="text-body font-semibold leading-tight">Ready to execute?</p>
 <p className="text-caption text-ink-3 mt-0.5 leading-relaxed">
 Generate a <strong className="text-ink">Task List report</strong> - concrete tickets with owner roles, effort, acceptance criteria. Import to the tracker in one click.
 </p>
 </div>
 <button
 type="button"
 onClick={() => {
 if (typeof window === "undefined") return;
 window.dispatchEvent(new CustomEvent("vsi:generate-task-list"));
 const el = document.getElementById("reports-section");
 if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
 }}
 className="shrink-0 rounded-control bg-ink px-4 py-2 text-body font-semibold text-white hover:bg-ink-2 transition-colors"
 >
 Generate Task List →
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}
