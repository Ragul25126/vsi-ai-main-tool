"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Location, RunCheckResult } from "@/types/search";
import { LOCATIONS } from "@/types/search";
import CitationCard from "@/components/CitationCard";
import GapMetrics from "@/components/GapMetrics";
import type { CitationContent } from "@/app/api/citation-content/route";
import { normaliseDomain } from "@/lib/url-input";
import { 
  Search, Zap, Globe, TrendingUp, AlertCircle, XCircle, 
  Loader2, Sparkles, ShieldCheck, CheckSquare, Layers
} from "lucide-react";

import NextActionsView from "@/features/citation-strategy/components/NextActionsView";
import AIVisibilityView from "@/features/visibility/components/AIVisibilityView";
import SiteAuditView from "@/features/diagnosis/components/SiteAuditView";

type CitationMap = Record<string, CitationContent | "loading" | "error">;

const GAP_STYLES: Record<string, { border: string; bg: string; badge: string; dot: string }> = {
  strong_visibility: { border: "border-[#22C55E]/30", bg: "bg-[#22C55E]/5", badge: "bg-[#22C55E]/10 text-[#22C55E]", dot: "bg-[#22C55E]" },
  seo_plus_citation: { border: "border-[#22C55E]/30", bg: "bg-[#22C55E]/5", badge: "bg-[#22C55E]/10 text-[#22C55E]", dot: "bg-[#22C55E]" },
  ai_visible: { border: "border-[#22C55E]/30", bg: "bg-[#22C55E]/5", badge: "bg-[#22C55E]/10 text-[#22C55E]", dot: "bg-[#22C55E]" },
  partial_visibility: { border: "border-blue-500/30", bg: "bg-blue-500/5", badge: "bg-blue-500/10 text-blue-400", dot: "bg-blue-400" },
  ai_mention_only: { border: "border-blue-500/30", bg: "bg-blue-500/5", badge: "bg-blue-500/10 text-blue-400", dot: "bg-blue-400" },
  citation_only: { border: "border-blue-500/30", bg: "bg-blue-500/5", badge: "bg-blue-500/10 text-blue-400", dot: "bg-blue-400" },
  seo_only: { border: "border-[#FFD600]/30", bg: "bg-[#FFD600]/5", badge: "bg-[#FFD600]/10 text-[#FFD600]", dot: "bg-[#FFD600]" },
  weak_double_loss: { border: "border-rose-500/30", bg: "bg-rose-500/5", badge: "bg-rose-500/10 text-rose-400", dot: "bg-rose-500" },
};

const getGapStyle = (label: string) => GAP_STYLES[label] ?? GAP_STYLES.weak_double_loss;

// ── Interactive Quick Check Sub-Runner ──
function QuickCheckRunner() {
  const searchParams = useSearchParams();
  const initialKw = searchParams.get("kw") || "";
  const initialDomain = searchParams.get("domain") || "";

  const [keyword, setKeyword] = useState(initialKw);
  const [domain, setDomain] = useState(initialDomain);
  const [brand, setBrand] = useState("");
  const [location, setLocation] = useState<Location>("ae");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RunCheckResult | null>(null);
  const [citationMap, setCitationMap] = useState<CitationMap>({});

  useEffect(() => {
    if (initialKw) setKeyword(initialKw);
    if (initialDomain) setDomain(initialDomain);
  }, [initialKw, initialDomain]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!keyword.trim()) {
      setError("Keyword is required.");
      return;
    }
    if (!domain.trim()) {
      setError("Domain is required.");
      return;
    }
    if (!brand.trim()) {
      setError("Brand Name is required.");
      return;
    }

    const normalisedDomain = normaliseDomain(domain);
    if (!normalisedDomain) {
      setError("Enter a valid domain like example.com");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setCitationMap({});

    try {
      const payload = {
        keyword: keyword.trim(),
        domain: normalisedDomain.domain,
        brand: brand.trim(),
        location,
      };

      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || `Data unavailable: Request failed (${res.status})`);
      }

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Data unavailable");
      }

      setResult(data as RunCheckResult);

      if (data.citations?.length) {
        const initialMap: CitationMap = {};
        data.citations.forEach((c: { url: string }) => { initialMap[c.url] = "loading"; });
        setCitationMap(initialMap);

        data.citations.forEach((c: { url: string; sourceName: string }) => {
          fetch("/api/citation-content", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: c.url, analyze: false }),
          })
            .then((r) => r.ok ? r.json() : Promise.reject())
            .then((content: CitationContent) => {
              setCitationMap((prev) => ({ ...prev, [c.url]: content }));
            })
            .catch(() => {
              setCitationMap((prev) => ({ ...prev, [c.url]: "error" }));
            });
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Data unavailable. Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const gap = result?.status ?? null;
  const gapStyle = gap ? getGapStyle(gap.label) : null;

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <Search className="w-5 h-5 text-amber-500" />
        </div>
        <div>
          <h2 className="text-xl font-black text-foreground tracking-tight">Live Keyword & AI Mode Check</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Real-time deep query inspection across Google Organic SERP and Google AI Overviews</p>
        </div>
      </div>

      {/* Search form */}
      <form onSubmit={handleSubmit} className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-[11px] font-bold text-foreground mb-2 uppercase tracking-wider">
              Keyword <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="e.g. best SEO agency dubai"
              required
              className="w-full bg-background border border-border focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-foreground mb-2 uppercase tracking-wider">
              Domain <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="e.g. valgrowlabs.com"
              required
              className={`w-full bg-background border rounded-xl px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none transition-colors ${
                domain.trim() && !normaliseDomain(domain)
                  ? "border-rose-500 focus:border-rose-500"
                  : "border-border focus:border-amber-500"
              }`}
            />
            {domain.trim() && !normaliseDomain(domain) && (
              <p className="mt-1 text-xs text-rose-500">Enter a domain like <span className="font-mono">example.com</span></p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-bold text-foreground mb-2 uppercase tracking-wider">
              Brand Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g. Valgrow Labs"
              required
              className="w-full bg-background border border-border focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-foreground mb-2 uppercase tracking-wider">
              Location <span className="text-rose-500">*</span>
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value as Location)}
              className="w-full bg-background border border-border focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none transition-colors appearance-none font-medium"
            >
              {(Object.entries(LOCATIONS) as [Location, typeof LOCATIONS[Location]][]).map(([key, val]) => (
                <option key={key} value={key} className="bg-card text-foreground">{val.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Checking SERP & AI…</>
            ) : (
              <><Zap className="w-4 h-4" /> Run Live Intelligence Check</>
            )}
          </button>
        </div>
      </form>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl px-5 py-4 text-xs text-rose-500 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <div>
            <p className="font-bold text-rose-500">Data unavailable</p>
            <p className="text-xs text-rose-400 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!result && !loading && !error && (
        <div className="bg-card border border-border/70 rounded-2xl p-12 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
            <Search className="w-6 h-6 text-amber-500" />
          </div>
          <h3 className="text-sm font-bold text-foreground">No Live Check Active</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
            Enter a keyword, domain, brand name, and location above to extract real-time SERP rankings, Google AI Overview snippets, and competitor citation targets.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8 max-w-2xl mx-auto text-left">
            {[
              { icon: TrendingUp, label: "Google SERP Rank", desc: "Verifies organic rank for normalized domain" },
              { icon: Zap, label: "AI Mode Visibility", desc: "Detects brand citations & text mentions" },
              { icon: Globe, label: "Competitor Extraction", desc: "Discovers competing sources cited in AI" },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="bg-muted/40 border border-border rounded-xl p-4">
                <Icon className="w-4 h-4 text-amber-500 mb-2" />
                <p className="text-xs font-bold text-foreground mb-1">{label}</p>
                <p className="text-[11px] text-muted-foreground leading-snug">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results view */}
      {result && gap && gapStyle && (
        <div className="space-y-5">
          {/* Gap classification banner */}
          <div className={`rounded-2xl border ${gapStyle.border} ${gapStyle.bg} px-6 py-4 flex items-center justify-between gap-4 shadow-sm flex-wrap`}>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full shrink-0 ${gapStyle.dot}`} />
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-foreground">{gap.title}</p>
                  {result.isDemo && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground uppercase">Demo Data</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{gap.description}</p>
              </div>
            </div>
            <span className={`text-xs font-bold px-3.5 py-1 rounded-full ${gapStyle.badge} uppercase tracking-wider`}>
              {gap.label.replace(/_/g, " ")}
            </span>
          </div>

          {/* SERP + AIO side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* SERP card */}
            <div className="bg-card border border-border/80 rounded-2xl p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider">Google Ranking</h3>
                <TrendingUp className="w-4 h-4 text-amber-500" />
              </div>

              {result.googleRank !== null ? (
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-black text-foreground tracking-tight">#{result.googleRank}</span>
                  <span className="text-xs font-medium text-muted-foreground">for {result.domain}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2.5">
                  <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                  <p className="text-xs font-semibold text-muted-foreground">Not found in top Google organic results</p>
                </div>
              )}

              {result.organicResults.length > 0 && (
                <div className="space-y-2 pt-1">
                  {result.organicResults.map((r) => (
                    <div
                      key={r.url}
                      className={`flex items-start gap-3 rounded-xl px-3.5 py-2.5 transition-all ${
                        r.isClient ? "bg-amber-500/10 border border-amber-500/30" : "bg-muted/40 border border-border"
                      }`}
                    >
                      <span className={`shrink-0 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-extrabold ${
                        r.isClient ? "bg-amber-500 text-white" : "bg-muted text-muted-foreground border border-border"
                      }`}>
                        {r.position}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-semibold truncate ${r.isClient ? "text-amber-500 font-bold" : "text-foreground"}`}>{r.title}</p>
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5 font-mono">{r.domain}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AIO card */}
            <div className="bg-card border border-border/80 rounded-2xl p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider">AI Mode Visibility</h3>
                <Zap className="w-4 h-4 text-amber-500" />
              </div>

              <div className="flex items-center gap-2.5">
                <span className={`w-2.5 h-2.5 rounded-full ${result.aioPresent ? "bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-rose-500"}`} />
                <span className="text-xs font-bold text-foreground">
                  {result.aioPresent ? "AI Mode triggered" : "No AI Mode triggered for this query"}
                </span>
              </div>

              {result.aioPresent && (
                <div className="flex flex-wrap gap-2">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                    result.brandCited
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                      : "bg-muted text-muted-foreground border-border"
                  }`}>
                    {result.brandCited ? `✓ Cited as source (#${result.clientCitationPosition})` : "✗ Not a cited source link"}
                  </span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                    result.brandMentioned
                      ? "bg-blue-500/10 text-blue-500 border-blue-500/30"
                      : "bg-muted text-muted-foreground border-border"
                  }`}>
                    {result.brandMentioned ? "✓ Mentioned in AI text" : "✗ Not mentioned in text"}
                  </span>
                </div>
              )}

              {result.aioBlocks.length > 0 && (
                <div className="space-y-2.5 pt-2 border-t border-border/60">
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">AI Answer Preview</p>
                  <div className="bg-muted/40 border border-border rounded-xl p-4 space-y-2 max-h-64 overflow-y-auto">
                    {result.aioBlocks.map((block, i) => (
                      block.type === "paragraph" ? (
                        <p key={i} className="text-xs text-foreground leading-relaxed font-normal">{block.snippet}</p>
                      ) : block.type === "list" && block.list ? (
                        <ul key={i} className="space-y-1.5 pl-1">
                          {block.list.map((item, j) => (
                            <li key={j} className="flex gap-2 text-xs text-foreground leading-relaxed">
                              <span className="text-amber-500 shrink-0 font-bold">•</span>
                              <span>{item.snippet}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Gap Metrics Component */}
          <GapMetrics
            serp={result.serp}
            aio={result.aio}
            uniqueCompetitorsCount={result.uniqueCompetitorsCount}
            totalCitationsCount={result.totalCitationsCount}
          />

          {/* Citations List */}
          {result.aioPresent && result.citations.length > 0 && (
            <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider">AI Mode Citations</h3>
                <span className="text-xs font-semibold text-muted-foreground">
                  {result.uniqueCompetitorsCount} unique competitors across {result.totalCitationsCount} source citations
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

// ── Main Page Component with Unified Tab Hub ──
function CheckPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");

  // Determine active tab
  const activeTab = tab === "opportunities" 
    ? "opportunities" 
    : tab === "aivisibility" 
    ? "aivisibility" 
    : tab === "quick-check" 
    ? "quick-check" 
    : "audit";

  const handleTabChange = (newTab: string) => {
    if (newTab === "audit") {
      router.push("/dashboard/check");
    } else {
      router.push(`/dashboard/check?tab=${newTab}`);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8 font-sans text-foreground max-w-[1600px] mx-auto space-y-6">
      
      {/* ── UNIFIED SUB-NAVIGATION HEADER (Ubersuggest Information Architecture) ── */}
      <div className="bg-card border border-border/80 rounded-2xl p-2.5 shadow-xs flex items-center justify-between gap-3 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleTabChange("audit")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "audit"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            <ShieldCheck size={14} />
            <span>Site Audit</span>
          </button>

          <button
            onClick={() => handleTabChange("aivisibility")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "aivisibility"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            <Sparkles size={14} />
            <span>AI Visibility</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
              activeTab === "aivisibility" ? "bg-primary-foreground/20 text-primary-foreground" : "bg-amber-500/10 text-amber-500"
            }`}>
              NEW!
            </span>
          </button>

          <button
            onClick={() => handleTabChange("opportunities")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "opportunities"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            <Zap size={14} />
            <span>Next Actions</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
              activeTab === "opportunities" ? "bg-primary-foreground/20 text-primary-foreground" : "bg-amber-500/10 text-amber-500"
            }`}>
              HIGH IMPACT
            </span>
          </button>

          <button
            onClick={() => handleTabChange("quick-check")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "quick-check"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            <Search size={14} />
            <span>Live SERP Check</span>
          </button>
        </div>
      </div>

      {/* ── ACTIVE TAB VIEW ── */}
      {activeTab === "opportunities" && <NextActionsView />}
      {activeTab === "aivisibility" && <AIVisibilityView />}
      {activeTab === "audit" && <SiteAuditView />}
      {activeTab === "quick-check" && <QuickCheckRunner />}

    </div>
  );
}

export default function CheckPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs font-semibold text-muted-foreground flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-5 h-5 animate-spin mr-2 text-primary" />
          Loading Intelligence Hub…
        </div>
      }
    >
      <CheckPageContent />
    </Suspense>
  );
}
