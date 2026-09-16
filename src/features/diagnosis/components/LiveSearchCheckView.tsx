"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Location, RunCheckResult } from "@/types/search";
import { LOCATIONS } from "@/types/search";
import CitationCard from "@/components/CitationCard";
import GapMetrics from "@/components/GapMetrics";
import type { CitationContent } from "@/app/api/citation-content/route";
import { normaliseDomain } from "@/lib/url-input";
import {
  Search,
  Link2,
  Building2,
  MapPin,
  Sparkles,
  Users,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  XCircle,
  Loader2,
  ArrowRight,
  ChevronDown,
  TrendingUp,
  Globe,
  Layers,
  Target,
  BarChart3,
  Zap,
} from "lucide-react";

type CitationMap = Record<string, CitationContent | "loading" | "error">;

const GAP_STYLES: Record<string, { border: string; bg: string; badge: string; dot: string; text: string }> = {
  strong_visibility: { border: "border-emerald-200 dark:border-emerald-800/40", bg: "bg-emerald-50 dark:bg-emerald-950/20", badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400", dot: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-400" },
  seo_plus_citation: { border: "border-emerald-200 dark:border-emerald-800/40", bg: "bg-emerald-50 dark:bg-emerald-950/20", badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400", dot: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-400" },
  ai_visible: { border: "border-emerald-200 dark:border-emerald-800/40", bg: "bg-emerald-50 dark:bg-emerald-950/20", badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400", dot: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-400" },
  partial_visibility: { border: "border-orange-200 dark:border-orange-800/40", bg: "bg-orange-50 dark:bg-orange-950/20", badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400", dot: "bg-[#FF5A1F]", text: "text-orange-700 dark:text-orange-400" },
  ai_mention_only: { border: "border-orange-200 dark:border-orange-800/40", bg: "bg-orange-50 dark:bg-orange-950/20", badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400", dot: "bg-[#FF5A1F]", text: "text-orange-700 dark:text-orange-400" },
  citation_only: { border: "border-orange-200 dark:border-orange-800/40", bg: "bg-orange-50 dark:bg-orange-950/20", badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400", dot: "bg-[#FF5A1F]", text: "text-orange-700 dark:text-orange-400" },
  seo_only: { border: "border-amber-200 dark:border-amber-800/40", bg: "bg-amber-50 dark:bg-amber-950/20", badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400", dot: "bg-amber-500", text: "text-amber-700 dark:text-amber-400" },
  weak_double_loss: { border: "border-rose-200 dark:border-rose-800/40", bg: "bg-rose-50 dark:bg-rose-950/20", badge: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400", dot: "bg-rose-500", text: "text-rose-700 dark:text-rose-400" },
};

const getGapStyle = (label: string) => GAP_STYLES[label] ?? GAP_STYLES.weak_double_loss;

export default function LiveSearchCheckView() {
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
      <div className="bg-white dark:bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-orange-50 dark:bg-orange-950/40 text-[#FF5A1F] border border-orange-200/70 dark:border-orange-800/40 mb-2">
              <Zap size={12} className="fill-[#FF5A1F]" />
              Live Diagnostic Engine
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              Search &amp; AI Visibility Check
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Verify how your business appears across Google Search results and AI Overviews in real-time.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-muted/40 border border-border text-xs text-muted-foreground shrink-0">
            <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
            <span>Real-time public Google &amp; AI data</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Input Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">

            {/* Keyword */}
            <div>
              <label htmlFor="check-keyword" className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Target Keyword <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-muted/30 border border-border rounded-lg px-3 py-2.5 focus-within:border-[#FF5A1F] focus-within:bg-white dark:focus-within:bg-card focus-within:ring-2 focus-within:ring-[#FF5A1F]/10 transition-all">
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
                Your Website Domain <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-muted/30 border border-border rounded-lg px-3 py-2.5 focus-within:border-[#FF5A1F] focus-within:bg-white dark:focus-within:bg-card focus-within:ring-2 focus-within:ring-[#FF5A1F]/10 transition-all">
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
                Brand / Company Name <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-muted/30 border border-border rounded-lg px-3 py-2.5 focus-within:border-[#FF5A1F] focus-within:bg-white dark:focus-within:bg-card focus-within:ring-2 focus-within:ring-[#FF5A1F]/10 transition-all">
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
                Target Market / Region <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-muted/30 border border-border rounded-lg px-3 py-2.5 focus-within:border-[#FF5A1F] focus-within:bg-white dark:focus-within:bg-card focus-within:ring-2 focus-within:ring-[#FF5A1F]/10 transition-all">
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
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#FF5A1F] hover:bg-[#E04810] text-white text-sm font-semibold shadow-xs hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0 cursor-pointer"
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
          <div className="mt-4 flex items-start gap-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40 rounded-xl px-4 py-3 text-sm text-rose-700 dark:text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="font-medium">{error}</p>
          </div>
        )}
      </div>

      {/* ── 2. RICH FEATURE CARDS (Matching Reference Layout with Brand Orange Theme) ── */}
      {!result && !loading && (
        <div className="space-y-8 animate-fadeIn">
          
          {/* Header */}
          <div className="text-left space-y-1">
            <h2 className="text-lg font-bold text-foreground tracking-tight">
              Powerful Search &amp; AI Intelligence Capabilities
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Everything you need to inspect, understand, and optimize how modern search engines and AI models see your brand.
            </p>
          </div>

          {/* 4 Feature Cards Grid (2 columns, styled with orange accent) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* CARD 1: Google Ranking & SERP Analysis */}
            <div className="bg-white dark:bg-card border border-border/90 rounded-2xl p-6 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
              <div>
                {/* Header: Icon + Category Badge */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Globe size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Google Organic SERP</h3>
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100/70 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                      Rank Tracking
                    </span>
                  </div>
                </div>

                <h4 className="text-base font-bold text-foreground mb-1.5">
                  Track your exact position in Google results
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed mb-5">
                  Get immediate visibility into where your website is positioned organically for competitive industry keywords.
                </p>

                {/* Content split: Checklist on Left + Mini Mockup on Right */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center mb-6">
                  {/* Checklist */}
                  <div className="space-y-2.5">
                    {[
                      "Desktop & mobile position extraction",
                      "Target landing page attribution",
                      "Top 10 organic results overview",
                      "Localized geographic simulation",
                    ].map((bullet, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs font-medium text-foreground">
                        <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>{bullet}</span>
                      </div>
                    ))}
                  </div>

                  {/* Visual Mockup Graphic */}
                  <div className="bg-slate-50 dark:bg-muted/30 border border-border rounded-xl p-3.5 space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between text-[11px] pb-1.5 border-b border-border">
                      <span className="font-bold text-muted-foreground flex items-center gap-1">
                        <Search size={11} /> Google SERP
                      </span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded text-[10px]">
                        Position #1
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#FF5A1F] shrink-0" />
                        <span className="text-[11px] font-bold text-foreground truncate">{domain || "valgrowlabs.com"}</span>
                      </div>
                      <div className="h-1.5 bg-[#FF5A1F]/80 rounded-full w-4/5" />
                      <div className="h-1.5 bg-slate-200 dark:bg-muted rounded-full w-full" />
                      <div className="h-1.5 bg-slate-200 dark:bg-muted rounded-full w-2/3" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer Action */}
              <div className="pt-4 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">Real-time live Google scrape</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF5A1F] hover:text-[#E04810] hover:underline cursor-pointer">
                  <span>Run Search Check</span>
                  <ArrowRight size={13} />
                </span>
              </div>
            </div>

            {/* CARD 2: AI Overview & Generative Visibility (Orange/Warm theme) */}
            <div className="bg-white dark:bg-card border border-border/90 rounded-2xl p-6 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
              <div>
                {/* Header: Icon + Category Badge */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/40 text-[#FF5A1F] flex items-center justify-center shrink-0">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">AI Mode Visibility</h3>
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-orange-100/70 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300">
                      Generative Intelligence
                    </span>
                  </div>
                </div>

                <h4 className="text-base font-bold text-foreground mb-1.5">
                  Understand your presence in AI-generated answers
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed mb-5">
                  Find out when Google triggers an AI Overview for user queries and if your brand is mentioned or recommended.
                </p>

                {/* Content split: Checklist on Left + Mini Mockup on Right */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center mb-6">
                  {/* Checklist */}
                  <div className="space-y-2.5">
                    {[
                      "AI Overview presence detection",
                      "Direct brand text mention extraction",
                      "AI answer synthesis preview",
                      "Snippet & bullet point parsing",
                    ].map((bullet, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs font-medium text-foreground">
                        <CheckCircle2 size={14} className="text-[#FF5A1F] shrink-0 mt-0.5" />
                        <span>{bullet}</span>
                      </div>
                    ))}
                  </div>

                  {/* Visual Mockup Graphic */}
                  <div className="bg-orange-50/50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/40 rounded-xl p-3.5 space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between text-[11px] pb-1.5 border-b border-orange-100 dark:border-orange-900/40">
                      <span className="font-bold text-orange-800 dark:text-orange-300 flex items-center gap-1">
                        <Sparkles size={11} className="text-[#FF5A1F]" /> AI Overview
                      </span>
                      <span className="bg-[#FF5A1F] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                        Active
                      </span>
                    </div>
                    <div className="space-y-1.5 text-[11px] text-foreground font-medium leading-tight">
                      <p className="text-orange-950 dark:text-orange-200 font-semibold truncate">
                        &quot;Top recommendations include <span className="text-[#FF5A1F] font-bold">{brand || "Your Brand"}</span>...&quot;
                      </p>
                      <div className="h-1.5 bg-orange-200/60 dark:bg-orange-800/40 rounded-full w-full" />
                      <div className="h-1.5 bg-orange-200/60 dark:bg-orange-800/40 rounded-full w-3/4" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer Action */}
              <div className="pt-4 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">Detects Perplexity &amp; Google AIO</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF5A1F] hover:text-[#E04810] hover:underline cursor-pointer">
                  <span>Inspect AI Mentions</span>
                  <ArrowRight size={13} />
                </span>
              </div>
            </div>

            {/* CARD 3: Competitor Citation & Extraction */}
            <div className="bg-white dark:bg-card border border-border/90 rounded-2xl p-6 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
              <div>
                {/* Header: Icon + Category Badge */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <Users size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Competitor Citation Extraction</h3>
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-100/70 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
                      Citation Mapping
                    </span>
                  </div>
                </div>

                <h4 className="text-base font-bold text-foreground mb-1.5">
                  See who AI links to and cites as authority sources
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed mb-5">
                  Discover which directories, blogs, reviews, and competing domains are being cited by AI models for your queries.
                </p>

                {/* Content split: Checklist on Left + Mini Mockup on Right */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center mb-6">
                  {/* Checklist */}
                  <div className="space-y-2.5">
                    {[
                      "Complete cited source link list",
                      "Competitor count & market share",
                      "Citation position numbering",
                      "Instant content preview analysis",
                    ].map((bullet, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs font-medium text-foreground">
                        <CheckCircle2 size={14} className="text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                        <span>{bullet}</span>
                      </div>
                    ))}
                  </div>

                  {/* Visual Mockup Graphic */}
                  <div className="bg-slate-50 dark:bg-muted/30 border border-border rounded-xl p-3.5 space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between text-[11px] pb-1 border-b border-border">
                      <span className="font-bold text-muted-foreground flex items-center gap-1">
                        <Layers size={11} /> Cited Sources
                      </span>
                      <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 font-bold">
                        5 Citations
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] bg-white dark:bg-card border border-border px-2 py-1 rounded">
                        <span className="font-bold text-foreground truncate">1. clutch.co</span>
                        <span className="text-[9px] text-muted-foreground">Directory</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] bg-white dark:bg-card border border-border px-2 py-1 rounded">
                        <span className="font-bold text-foreground truncate">2. competitor-agency.com</span>
                        <span className="text-[9px] text-muted-foreground">Rank #2</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer Action */}
              <div className="pt-4 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">Extracts full page context</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer">
                  <span>View Source Breakdown</span>
                  <ArrowRight size={13} />
                </span>
              </div>
            </div>

            {/* CARD 4: Visibility Gap & Strategic Priority */}
            <div className="bg-white dark:bg-card border border-border/90 rounded-2xl p-6 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
              <div>
                {/* Header: Icon + Category Badge */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Target size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Strategic Visibility Gap</h3>
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100/70 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                      Gap Diagnosis
                    </span>
                  </div>
                </div>

                <h4 className="text-base font-bold text-foreground mb-1.5">
                  Spot opportunities where competitors are winning
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed mb-5">
                  Identifies whether you have strong dual visibility, an AI citation gap, or a traditional SEO ranking deficiency.
                </p>

                {/* Content split: Checklist on Left + Mini Mockup on Right */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center mb-6">
                  {/* Checklist */}
                  <div className="space-y-2.5">
                    {[
                      "8-tier automated visibility classification",
                      "SEO Rank vs AI Citation comparison",
                      "Targeted optimization recommendations",
                      "Priority action items for your team",
                    ].map((bullet, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs font-medium text-foreground">
                        <CheckCircle2 size={14} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <span>{bullet}</span>
                      </div>
                    ))}
                  </div>

                  {/* Visual Mockup Graphic */}
                  <div className="bg-amber-50/40 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded-xl p-3.5 space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between text-[11px] pb-1 border-b border-amber-100 dark:border-amber-900/40">
                      <span className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1">
                        <BarChart3 size={11} /> Gap Matrix
                      </span>
                      <span className="text-[10px] font-extrabold bg-[#FF5A1F] text-white px-1.5 py-0.5 rounded">
                        High Impact
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 text-center text-[10px]">
                      <div className="bg-white dark:bg-card border border-border p-1.5 rounded">
                        <p className="text-muted-foreground font-medium">Google SERP</p>
                        <p className="font-bold text-emerald-600">Top 3 ✓</p>
                      </div>
                      <div className="bg-white dark:bg-card border border-border p-1.5 rounded">
                        <p className="text-muted-foreground font-medium">AI Citation</p>
                        <p className="font-bold text-rose-500">Missing ✗</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer Action */}
              <div className="pt-4 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">Automated action advice</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer">
                  <span>Diagnose Gaps</span>
                  <ArrowRight size={13} />
                </span>
              </div>
            </div>

          </div>

          {/* ── 3. "HOW IT WORKS" PROCESS BANNER (01 -> 02 -> 03 -> 04 with Orange Theme) ── */}
          <div className="bg-slate-50/80 dark:bg-muted/30 border border-border/80 rounded-2xl p-6 sm:p-8">
            <div className="mb-6 text-left">
              <h3 className="text-base font-bold text-foreground">
                How Search &amp; AI Visibility Check Works
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Get started in 4 simple automated steps and unlock full visibility into your search footprint.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
              {/* Step 01 */}
              <div className="bg-white dark:bg-card border border-border/80 rounded-xl p-4 space-y-2 relative shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/50 text-[#FF5A1F] border border-orange-200 dark:border-orange-800/40">
                    01
                  </span>
                  <Search size={15} className="text-muted-foreground" />
                </div>
                <h4 className="text-xs font-bold text-foreground pt-1">Enter Target Query</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Provide your target keyword, website domain, and brand name.
                </p>
              </div>

              {/* Step 02 */}
              <div className="bg-white dark:bg-card border border-border/80 rounded-xl p-4 space-y-2 relative shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/50 text-[#FF5A1F] border border-orange-200 dark:border-orange-800/40">
                    02
                  </span>
                  <Globe size={15} className="text-muted-foreground" />
                </div>
                <h4 className="text-xs font-bold text-foreground pt-1">Live Google Scan</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  We query real-time Google search results and verify AI Overview generation.
                </p>
              </div>

              {/* Step 03 */}
              <div className="bg-white dark:bg-card border border-border/80 rounded-xl p-4 space-y-2 relative shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/50 text-[#FF5A1F] border border-orange-200 dark:border-orange-800/40">
                    03
                  </span>
                  <Sparkles size={15} className="text-muted-foreground" />
                </div>
                <h4 className="text-xs font-bold text-foreground pt-1">Extract Citations</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  We scrape all cited competitor domains and parse full source context.
                </p>
              </div>

              {/* Step 04 */}
              <div className="bg-white dark:bg-card border border-border/80 rounded-xl p-4 space-y-2 relative shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/50 text-[#FF5A1F] border border-orange-200 dark:border-orange-800/40">
                    04
                  </span>
                  <Target size={15} className="text-muted-foreground" />
                </div>
                <h4 className="text-xs font-bold text-foreground pt-1">Execute Next Actions</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Receive actionable diagnostic advice to close any identified visibility gap.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ── 3. LOADING STATE ── */}
      {loading && (
        <div className="bg-white dark:bg-card border border-border rounded-2xl p-12 flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-12 h-12 rounded-full border-2 border-border border-t-[#FF5A1F] animate-spin" />
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
          <div className={`rounded-xl border ${gapStyle.border} ${gapStyle.bg} px-6 py-4 flex items-center justify-between gap-4 flex-wrap shadow-xs`}>
            <div className="flex items-center gap-3">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${gapStyle.dot}`} />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className={`text-sm font-bold ${gapStyle.text}`}>{gap.title}</p>
                  {result.isDemo && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground uppercase tracking-wide">
                      Demo Data
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{gap.description}</p>
              </div>
            </div>
            <span className={`text-xs font-bold px-3.5 py-1.5 rounded-full ${gapStyle.badge} uppercase tracking-wider`}>
              {gap.label.replace(/_/g, " ")}
            </span>
          </div>

          {/* Ranking + AI Side-by-Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Google Ranking Card */}
            <div className="bg-white dark:bg-card border border-border rounded-xl p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-muted flex items-center justify-center text-foreground">
                    <TrendingUp size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Google Organic SERP</h3>
                    <p className="text-[11px] text-muted-foreground">Standard search results</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded">
                  {location.toUpperCase()}
                </span>
              </div>

              {result.googleRank !== null ? (
                <div className="flex items-baseline gap-2 mb-4 p-3 bg-slate-50 dark:bg-muted/30 rounded-lg border border-border">
                  <span className="text-3xl font-extrabold text-foreground">#{result.googleRank}</span>
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
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Top 10 Ranked Results</p>
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
                        <span className={`shrink-0 w-5 h-5 flex items-center justify-center rounded text-[10px] font-bold ${
                          r.isClient ? "bg-[#FF5A1F] text-white" : "bg-muted text-muted-foreground"
                        }`}>
                          {r.position}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className={`font-semibold truncate ${r.isClient ? "text-[#FF5A1F]" : "text-foreground"}`}>
                            {r.title}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate font-mono">{r.domain}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* AI Visibility Card */}
            <div className="bg-white dark:bg-card border border-border rounded-xl p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center text-[#FF5A1F]">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">AI Mode Visibility</h3>
                    <p className="text-[11px] text-muted-foreground">Google AI Overview detection</p>
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
                      ? "bg-orange-50 border-orange-200 text-[#FF5A1F] dark:bg-orange-950/20 dark:border-orange-800/40"
                      : "bg-slate-50 border-border text-muted-foreground dark:bg-muted/40"
                  }`}>
                    {result.brandMentioned ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    {result.brandMentioned ? "Mentioned in AI text" : "Not mentioned in text"}
                  </div>
                </div>
              )}

              {result.aioBlocks.length > 0 && (
                <div className="border-t border-border pt-4">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">AI Answer Preview</p>
                  <div className="bg-slate-50 dark:bg-muted/30 border border-border rounded-lg p-3.5 space-y-2 max-h-52 overflow-y-auto">
                    {result.aioBlocks.map((block, i) =>
                      block.type === "paragraph" ? (
                        <p key={i} className="text-xs text-foreground leading-relaxed">{block.snippet}</p>
                      ) : block.type === "list" && block.list ? (
                        <ul key={i} className="space-y-1 pl-1">
                          {block.list.map((item, j) => (
                            <li key={j} className="flex gap-2 text-xs text-foreground leading-relaxed">
                              <span className="text-[#FF5A1F] shrink-0 font-bold">•</span>
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
            <div className="bg-white dark:bg-card border border-border rounded-xl p-6 shadow-xs">
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
