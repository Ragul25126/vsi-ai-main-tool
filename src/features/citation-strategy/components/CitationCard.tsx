"use client";

import { useState } from "react";
import type { AIOCitation } from "@/types/search";
import { PLATFORM_LABELS } from "@/types/search";
import type { CitationContent } from "@/app/api/citation-content/route";
import type { CitationIntelligence } from "@/lib/llm";

interface Props {
 citation: AIOCitation;
 keyword: string;
 clientBrand: string;
 preloaded?: CitationContent | null;
 loadingPreload?: boolean;
}

export default function CitationCard({ citation, keyword, clientBrand, preloaded, loadingPreload }: Props) {
 const [expanded, setExpanded] = useState(false);
 const [intelligence, setIntelligence] = useState<CitationIntelligence | null>(null);
 const [analyzing, setAnalyzing] = useState(false);

 const data = preloaded;

 async function runAnalysis() {
 if (analyzing || intelligence) return;
 setAnalyzing(true);
 try {
 const res = await fetch("/api/citation-content", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({
 url: citation.url,
 keyword,
 sourceName: citation.sourceName,
 clientBrand,
 analyze: true,
 }),
 });
 if (res.ok) {
 const result: CitationContent = await res.json();
 setIntelligence(result.intelligence);
 }
 } finally {
 setAnalyzing(false);
 }
 }

 const intel = intelligence ?? data?.intelligence ?? null;

 return (
  <div className={`rounded-panel border transition-all ${
  citation.isClient
  ? "border-line bg-attention-soft "
  : "border-line bg-surface-2 hover:border-line-strong hover:bg-surface-2/50"
  }`}>
  {/* Header row */}
  <div className="flex items-start gap-3 px-4 py-3.5">
  <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-caption font-semibold ${
  citation.isClient ? "bg-ink text-white font-semibold" : "bg-line text-ink-2 border border-line-strong font-semibold"
  }`}>
  {citation.position}
  </span>

  <div className="min-w-0 flex-1">
  <div className="flex items-center gap-2 flex-wrap">
  <span className={`text-caption font-semibold ${citation.isClient ? "text-attention" : "text-ink"}`}>
  {citation.sourceName}
  </span>
  {citation.isClient && (
  <span className="rounded-full bg-ink px-2 py-0.5 text-caption font-semibold text-white">
  Your Client
  </span>
  )}
  {!citation.isClient && citation.platform !== "other" && citation.platform !== "brand" && (
  <span className={`rounded px-1.5 py-0.5 text-caption font-semibold ${PLATFORM_LABELS[citation.platform].color}`}>
  {PLATFORM_LABELS[citation.platform].label}
  </span>
  )}
  {loadingPreload && (
  <span className="text-caption text-ink-3 animate-pulse">Reading content...</span>
  )}
  {data && !loadingPreload && (
  <span className="text-caption text-ink-3">{data.wordCount.toLocaleString()} words</span>
  )}
  </div>
  {citation.title && (
  <p className="mt-0.5 text-caption text-ink-2 truncate font-medium">{citation.title}</p>
  )}
  <p className="mt-0.5 text-caption text-ink-3 truncate">{citation.domain}</p>
  </div>

  <div className="flex items-center gap-2 shrink-0">
  <a href={citation.url} target="_blank" rel="noopener noreferrer"
  className="text-caption font-semibold text-ink-3 hover:text-attention transition-colors" title="Open in new tab">
  ↗
  </a>
  {(data || loadingPreload) && (
  <button
  onClick={() => setExpanded((v) => !v)}
  className={`rounded-control px-2.5 py-1 text-caption font-semibold transition-colors ${
  expanded ? "bg-line text-ink"
  : citation.isClient
  ? "bg-brand-soft text-attention hover:bg-brand-soft"
  : "bg-line text-ink-2 hover:bg-line hover:text-ink"
  }`}
  >
  {expanded ? "Hide" : "View"}
  </button>
  )}
  </div>
  </div>

  {/* Expandable panel */}
  {expanded && data && (
  <div className="border-t border-line px-4 pb-4 pt-4 space-y-4 bg-surface rounded-b-[20px]">

  {/* Intelligence panel */}
  {intel ? (
  <div className="space-y-3">
  <div className={`rounded-panel px-4 py-3 border ${
  citation.isClient ? "bg-attention-soft border-line" : "bg-surface-2 border-line "
  }`}>
  <div className="flex items-start justify-between gap-3">
  <p className="text-caption text-ink-2 leading-relaxed font-medium">{intel.summary}</p>
  {intel.citabilityScore > 0 && (
  <div className="shrink-0 text-center">
  <div className={`text-base font-semibold ${
  intel.citabilityScore >= 7 ? "text-critical" :
  intel.citabilityScore >= 4 ? "text-attention" : "text-positive"
  }`}>{intel.citabilityScore}/10</div>
  <div className="text-caption text-ink-3 font-semibold">Citability</div>
  </div>
  )}
  </div>
  </div>

  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
  {intel.whyCited.length > 0 && (
  <div className="rounded-panel bg-surface-2 border border-line p-3">
  <p className="text-caption font-semibold text-ink-3 mb-2">Why Google cited this</p>
  <ul className="space-y-1">
  {intel.whyCited.map((r, i) => (
  <li key={i} className="flex gap-2 text-caption text-ink-2">
  <span className="text-positive shrink-0 font-semibold">✓</span><span>{r}</span>
  </li>
  ))}
  </ul>
  </div>
  )}

  {intel.contentSignals.length > 0 && (
  <div className="rounded-panel bg-surface-2 border border-line p-3">
  <p className="text-caption font-semibold text-ink-3 mb-2">Authority signals</p>
  <div className="flex flex-wrap gap-1">
  {intel.contentSignals.map((s, i) => (
  <span key={i} className="rounded-full bg-info-soft border border-info/30 px-2 py-0.5 text-caption text-info font-medium">{s}</span>
  ))}
  </div>
  </div>
  )}

  {intel.keyTopics.length > 0 && (
  <div className="rounded-panel bg-surface-2 border border-line p-3">
  <p className="text-caption font-semibold text-ink-3 mb-2">Topics covered</p>
  <div className="flex flex-wrap gap-1">
  {intel.keyTopics.map((t, i) => (
  <span key={i} className="rounded-full bg-surface-2 border border-line px-2 py-0.5 text-caption text-ink-2">{t}</span>
  ))}
  </div>
  </div>
  )}

  {intel.missingFromClient.length > 0 && (
  <div className="rounded-panel bg-critical-soft border border-critical/30 p-3">
  <p className="text-caption font-semibold text-critical mb-2">
  What {clientBrand || "your client"} is missing
  </p>
  <ul className="space-y-1">
  {intel.missingFromClient.map((g, i) => (
  <li key={i} className="flex gap-2 text-caption text-critical">
  <span className="shrink-0 font-semibold">✗</span><span>{g}</span>
  </li>
  ))}
  </ul>
  </div>
  )}
  </div>
  </div>
  ) : (
  <button
  onClick={runAnalysis}
  disabled={analyzing}
  className="w-full rounded-panel border border-dashed border-info/30 bg-info-soft px-4 py-3 text-caption font-semibold text-info hover:bg-info-soft disabled:opacity-50 transition-colors"
  >
  {analyzing ? (
  <span className="animate-pulse">Running citation analysis...</span>
  ) : (
  "Analyse why Google cited this page"
  )}
  </button>
  )}

  {/* Page content */}
  <div>
  <div className="flex items-center justify-between mb-1">
  <p className="text-caption font-semibold text-ink-3">Page Content Extract</p>
  <span className="text-caption text-ink-3">{data.wordCount.toLocaleString()} words</span>
  </div>
  {data.description && (
  <p className="mb-2 text-caption text-ink-3 italic">{data.description}</p>
  )}
  <div className="rounded-control bg-surface-2 border border-line px-3 py-2.5 max-h-48 overflow-y-auto">
  <pre className="text-caption text-ink-2 leading-relaxed whitespace-pre-wrap font-sans">{data.markdown}</pre>
  </div>
  </div>
  </div>
  )}
  </div>
 );
}
