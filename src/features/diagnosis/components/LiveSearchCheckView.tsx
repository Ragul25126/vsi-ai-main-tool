"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Location, RunCheckResult } from "@/types/search";
import { LOCATIONS } from "@/types/search";
import CitationCard from "@/components/CitationCard";
import GapMetrics from "@/components/GapMetrics";
import type { CitationContent } from "@/app/api/citation-content/route";
import { normaliseDomain } from "@/lib/url-input";
import { useActiveProject } from "@/components/layout/ProjectProvider";
import {
  Search,
  Link2,
  Building2,
  MapPin,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Loader2,
  ArrowRight,
  ChevronDown,
  TrendingUp,
} from "lucide-react";

type CitationMap = Record<string, CitationContent | "loading" | "error">;

const POSITIVE = { border: "border-positive/30", bg: "bg-positive-soft", badge: "bg-surface text-positive", dot: "bg-positive", text: "text-positive" };
const ATTENTION = { border: "border-attention/30", bg: "bg-attention-soft", badge: "bg-surface text-attention", dot: "bg-attention", text: "text-attention" };
const CRITICAL = { border: "border-critical/30", bg: "bg-critical-soft", badge: "bg-surface text-critical", dot: "bg-critical", text: "text-critical" };

const GAP_STYLES: Record<string, { border: string; bg: string; badge: string; dot: string; text: string }> = {
  strong_visibility: POSITIVE,
  seo_plus_citation: POSITIVE,
  ai_visible: POSITIVE,
  partial_visibility: ATTENTION,
  ai_mention_only: ATTENTION,
  citation_only: ATTENTION,
  seo_only: ATTENTION,
  weak_double_loss: CRITICAL,
};

const getGapStyle = (label: string) => GAP_STYLES[label] ?? GAP_STYLES.weak_double_loss;

export default function LiveSearchCheckView() {
  const searchParams = useSearchParams();
  const project = useActiveProject();
  const initialKw = searchParams.get("kw") || searchParams.get("q") || "";
  // Start from the active project so users don't retype what VSI already knows.
  const initialDomain = searchParams.get("domain") || (project?.website ?? "").replace(/^https?:\/\//, "").replace(/\/$/, "");

  const [keyword, setKeyword] = useState(initialKw);
  const [domain, setDomain] = useState(initialDomain);
  const [brand, setBrand] = useState(project?.brandName || project?.name || "");
  const [location, setLocation] = useState<Location>("ae");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RunCheckResult | null>(null);
  const [citationMap, setCitationMap] = useState<CitationMap>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!keyword.trim()) { setError("Please enter a keyword to check."); return; }
    if (!domain.trim()) { setError("Please enter your website domain."); return; }
    if (!brand.trim()) { setError("Please enter your brand or company name."); return; }

    const normalisedDomain = normaliseDomain(domain);
    if (!normalisedDomain) {
      setError("Enter a valid domain like example.com (without https://)");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setCitationMap({});

    try {
      const payload = { keyword: keyword.trim(), domain: normalisedDomain.domain, brand: brand.trim(), location };
      const res = await fetch("/api/check", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || `Request failed (${res.status})`);
      }
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Data unavailable for this query.");
      setResult(data as RunCheckResult);

      if (data.citations?.length) {
        const initialMap: CitationMap = {};
        data.citations.forEach((c: { url: string }) => { initialMap[c.url] = "loading"; });
        setCitationMap(initialMap);
        data.citations.forEach((c: { url: string; sourceName: string }) => {
          fetch("/api/citation-content", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: c.url, analyze: false }) })
            .then((r) => r.ok ? r.json() : Promise.reject())
            .then((content: CitationContent) => { setCitationMap((prev) => ({ ...prev, [c.url]: content })); })
            .catch(() => { setCitationMap((prev) => ({ ...prev, [c.url]: "error" })); });
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const gap = result?.status ?? null;
  const gapStyle = gap ? getGapStyle(gap.label) : null;

  return (
    <div className="space-y-8 pb-16">

      {/* ── 1. MAIN SEARCH CARD ── */}
      <div className="bg-white dark:bg-card rounded-panel border border-border p-6 sm:p-8">

        <form onSubmit={handleSubmit}>
          {/* Input Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">

            {/* Keyword */}
            <div>
              <label htmlFor="check-keyword" className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Search <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-muted/30 border border-border rounded-lg px-3 py-2.5 focus-within:border-line-strong focus-within:bg-white dark:focus-within:bg-card focus-within:ring-2 focus-within:ring-ink/10 transition-all">
                <Search size={15} className="text-muted-foreground shrink-0" />
                <input
                  id="check-keyword"
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="e.g. best SEO agency dubai"
                  required
                  className="flex-1 bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none min-w-0"
                />
              </div>
            </div>

            {/* Domain */}
            <div>
              <label htmlFor="check-domain" className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Your website <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-muted/30 border border-border rounded-lg px-3 py-2.5 focus-within:border-line-strong focus-within:bg-white dark:focus-within:bg-card focus-within:ring-2 focus-within:ring-ink/10 transition-all">
                <Link2 size={15} className="text-muted-foreground shrink-0" />
                <input
                  id="check-domain"
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="e.g. valgrowlabs.com"
                  required
                  className="flex-1 bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none min-w-0"
                />
              </div>
            </div>

            {/* Brand */}
            <div>
              <label htmlFor="check-brand" className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Business name <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-muted/30 border border-border rounded-lg px-3 py-2.5 focus-within:border-line-strong focus-within:bg-white dark:focus-within:bg-card focus-within:ring-2 focus-within:ring-ink/10 transition-all">
                <Building2 size={15} className="text-muted-foreground shrink-0" />
                <input
                  id="check-brand"
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Valgrow Labs"
                  required
                  className="flex-1 bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none min-w-0"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="check-location" className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Country <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-muted/30 border border-border rounded-lg px-3 py-2.5 focus-within:border-line-strong focus-within:bg-white dark:focus-within:bg-card focus-within:ring-2 focus-within:ring-ink/10 transition-all">
                <MapPin size={15} className="text-muted-foreground shrink-0" />
                <div className="flex-1 relative min-w-0">
                  <select
                    id="check-location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value as Location)}
                    className="w-full bg-transparent text-sm font-medium text-foreground focus:outline-none appearance-none cursor-pointer pr-5"
                  >
                    {(Object.entries(LOCATIONS) as [Location, typeof LOCATIONS[Location]][]).map(([key, val]) => (
                      <option key={key} value={key} className="bg-card text-foreground">{val.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>

          </div>

          {/* Submit Action Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6 pt-5 border-t border-border">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <CheckCircle2 size={14} className="text-emerald-500" />
                Organic Google SERP
              </span>
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <CheckCircle2 size={14} className="text-emerald-500" />
                AI Overview Mentions
              </span>
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <CheckCircle2 size={14} className="text-emerald-500" />
                Competitor Citations
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-ink hover:bg-ink-2 text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Checking Google &amp; AI…</span>
                </>
              ) : (
                <>
                  <span>Run Live Check</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Error notice */}
        {error && (
          <div className="mt-4 flex items-start gap-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40 rounded-panel px-4 py-3 text-sm text-rose-700 dark:text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="font-medium">{error}</p>
          </div>
        )}
      </div>

      {!result && !loading && !error && (
        <p className="text-support text-ink-3">
          You'll see Google's top results for the search, the AI answer if Google shows one, whether it names or links to your
          business, and which other websites it links to. A live check uses search credits.
        </p>
      )}

      {/* ── 3. LOADING STATE ── */}
      {loading && (
        <div className="bg-white dark:bg-card border border-border rounded-panel p-12 flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-12 h-12 rounded-full border-2 border-border border-t-ink animate-spin" />
          <div>
            <p className="text-sm font-bold text-foreground">Checking Google Search &amp; AI Overviews</p>
            <p className="text-xs text-muted-foreground mt-1">Connecting to live Google data and scraping AI citations…</p>
          </div>
        </div>
      )}

      {/* ── 4. RESULTS DASHBOARD (when check has been run) ── */}
      {result && gap && gapStyle && (
        <div className="space-y-5 animate-fadeIn">

          {/* Status Banner */}
          <div className={`rounded-panel border ${gapStyle.border} ${gapStyle.bg} px-6 py-4 flex items-center justify-between gap-4 flex-wrap `}>
            <div className="flex items-center gap-3">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${gapStyle.dot}`} />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className={`text-sm font-bold ${gapStyle.text}`}>{gap.title}</p>
                  {result.isDemo && (
                    <span className="text-caption font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground tracking-wide">
                      Demo Data
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{gap.description}</p>
              </div>
            </div>
            <span className={`text-xs font-bold px-3.5 py-1.5 rounded-full ${gapStyle.badge}  `}>
              {gap.label.replace(/_/g, " ")}
            </span>
          </div>

          {/* Ranking + AI Side-by-Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Google Ranking Card */}
            <div className="bg-white dark:bg-card border border-border rounded-panel p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-muted flex items-center justify-center text-foreground">
                    <TrendingUp size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Google Organic SERP</h3>
                    <p className="text-caption text-muted-foreground">Standard search results</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded">
                  {location.toUpperCase()}
                </span>
              </div>

              {result.googleRank !== null ? (
                <div className="flex items-baseline gap-2 mb-4 p-3 bg-slate-50 dark:bg-muted/30 rounded-lg border border-border">
                  <span className="text-3xl font-semibold text-foreground">#{result.googleRank}</span>
                  <span className="text-xs text-muted-foreground">for {result.domain}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40 mb-4">
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <p className="text-xs font-medium text-rose-700 dark:text-rose-400">
                    Not found in top Google results for this query.
                  </p>
                </div>
              )}

              {result.organicResults.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-muted-foreground tracking-wide">Top 10 Ranked Results</p>
                  <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                    {result.organicResults.map((r) => (
                      <div
                        key={r.url}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs border ${
                          r.isClient
                            ? "bg-orange-50 dark:bg-orange-950/20 border-orange-300 dark:border-orange-800/60"
                            : "bg-slate-50 dark:bg-muted/30 border-border"
                        }`}
                      >
                        <span className={`shrink-0 w-5 h-5 flex items-center justify-center rounded text-caption font-bold ${
                          r.isClient ? "bg-ink text-white" : "bg-muted text-muted-foreground"
                        }`}>
                          {r.position}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className={`font-semibold truncate ${r.isClient ? "text-brand-strong" : "text-foreground"}`}>
                            {r.title}
                          </p>
                          <p className="text-caption text-muted-foreground truncate font-mono">{r.domain}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* AI Visibility Card */}
            <div className="bg-white dark:bg-card border border-border rounded-panel p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center text-brand-strong">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">AI Mode Visibility</h3>
                    <p className="text-caption text-muted-foreground">Google AI Overview detection</p>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  result.aioPresent
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                    : "bg-slate-100 text-slate-600 dark:bg-muted dark:text-muted-foreground"
                }`}>
                  {result.aioPresent ? "AI Overview Triggered" : "No AI Overview"}
                </span>
              </div>

              <div className="flex items-center gap-2.5 mb-4 p-3 bg-slate-50 dark:bg-muted/30 rounded-lg border border-border">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${result.aioPresent ? "bg-emerald-500" : "bg-slate-400"}`} />
                <p className="text-xs font-medium text-foreground">
                  {result.aioPresent
                    ? "Google generated an AI Overview answer for this search."
                    : "No AI Overview was generated for this search."}
                </p>
              </div>

              {result.aioPresent && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                  <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg border font-medium ${
                    result.brandCited
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-800/40 dark:text-emerald-400"
                      : "bg-slate-50 border-border text-muted-foreground dark:bg-muted/40"
                  }`}>
                    {result.brandCited ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    {result.brandCited
                      ? `Cited source (#${result.clientCitationPosition})`
                      : "Not cited as a source"}
                  </div>
                  <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg border font-medium ${
                    result.brandMentioned
                      ? "bg-orange-50 border-orange-200 text-brand-strong dark:bg-orange-950/20 dark:border-orange-800/40"
                      : "bg-slate-50 border-border text-muted-foreground dark:bg-muted/40"
                  }`}>
                    {result.brandMentioned ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    {result.brandMentioned ? "Mentioned in AI text" : "Not mentioned in text"}
                  </div>
                </div>
              )}

              {result.aioBlocks.length > 0 && (
                <div className="border-t border-border pt-4">
                  <p className="text-xs font-bold text-muted-foreground tracking-wide mb-2">AI Answer Preview</p>
                  <div className="bg-slate-50 dark:bg-muted/30 border border-border rounded-lg p-3.5 space-y-2 max-h-52 overflow-y-auto">
                    {result.aioBlocks.map((block, i) =>
                      block.type === "paragraph" ? (
                        <p key={i} className="text-xs text-foreground leading-relaxed">{block.snippet}</p>
                      ) : block.type === "list" && block.list ? (
                        <ul key={i} className="space-y-1 pl-1">
                          {block.list.map((item, j) => (
                            <li key={j} className="flex gap-2 text-xs text-foreground leading-relaxed">
                              <span className="text-brand-strong shrink-0 font-bold">•</span>
                              <span>{item.snippet}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Gap Metrics Visual Summary */}
          <GapMetrics
            serp={result.serp}
            aio={result.aio}
            uniqueCompetitorsCount={result.uniqueCompetitorsCount}
            totalCitationsCount={result.totalCitationsCount}
          />

          {/* AI Mode Citations */}
          {result.aioPresent && result.citations.length > 0 && (
            <div className="bg-white dark:bg-card border border-border rounded-panel p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-foreground">AI Mode Citations &amp; Competitor Sources</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Sources and domains referenced by Google AI Overview for this search query.
                  </p>
                </div>
                <span className="text-xs font-medium text-muted-foreground bg-slate-50 dark:bg-muted px-2.5 py-1 rounded-md border border-border">
                  {result.uniqueCompetitorsCount} competitors · {result.totalCitationsCount} citations
                </span>
              </div>
              <div className="space-y-2.5">
                {result.citations.map((c) => {
                  const cData = citationMap[c.url];
                  return (
                    <CitationCard
                      key={c.url}
                      citation={c}
                      keyword={keyword}
                      clientBrand={brand || domain}
                      preloaded={cData instanceof Object && cData !== null && typeof cData !== "string" ? cData as CitationContent : null}
                      loadingPreload={cData === "loading"}
                    />
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
