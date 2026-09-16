"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Sparkles, Search, ChevronDown, Info, ExternalLink, Globe, MapPin, 
  TrendingUp, BarChart3, ShieldCheck, ArrowRight, CheckCircle2, RefreshCw, 
  HelpCircle, Layers, PieChart, Users, Cpu, FileText, ArrowLeft, X, AlertCircle
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import ExecutiveDashboardView from "./ExecutiveDashboardView";

interface ClientRecord {
  id: string;
  name: string;
  service_type: string;
  website: string;
  agency_id: string;
  agencies?: { name?: string | null; display_name?: string | null } | { name?: string | null; display_name?: string | null }[] | null;
}

interface ResultRecord {
  client_id: string;
  keyword: string;
  track_type: string;
  gap_label: string;
  rank_position?: number | null;
  aio_present?: boolean | null;
  client_cited?: boolean | null;
  mentioned_in_text?: boolean | null;
  created_at: string;
}

interface DashboardClientViewProps {
  isSuperAdmin: boolean;
  clientList: ClientRecord[];
  keywordCount: number;
  rawResults: ResultRecord[];
  maxClients?: number | null;
}

interface ResearchData {
  success: boolean;
  keyword: string;
  location: string;
  language: string;
  dataSource: string;
  metrics: {
    searches: {
      value: string;
      tag: string;
      tagColor: string;
      description: string;
    };
    difficulty: {
      score: number;
      tag: string;
      tagColor: string;
      description: string;
    };
    aiVisibility: {
      percent: string;
      tag: string;
      tagColor: string;
      description: string;
    };
    intent: {
      primary: string;
      description: string;
    };
  };
  prompts: string[];
  trend: {
    yoy: string;
    isPositive: boolean;
    monthlyPoints: number[];
  };
  aiOverview?: string;
  inclusionRates: {
    engine: string;
    percent: string;
  }[];
  organicResultsCount?: number;
  topOrganicResults?: {
    position?: number;
    title: string;
    link: string;
    snippet?: string;
  }[];
}

export default function DashboardClientView({
  isSuperAdmin,
  clientList,
  keywordCount,
  rawResults,
  maxClients,
}: DashboardClientViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme } = useTheme();

  const queryParam = searchParams.get("q") || "";
  const langParam = searchParams.get("lang") || "English";
  const locParam = searchParams.get("loc") || "India";
  const serviceParam = (searchParams.get("service") as "all-services" | "seo-tracked" | "geo-tracked") || "all-services";
  const clientIdParam = searchParams.get("client");
  const activeClient = clientList.find((c) => c.id === clientIdParam) || clientList[0] || null;

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [language, setLanguage] = useState(langParam);
  const [location, setLocation] = useState(locParam);
  const [selectedService, setSelectedService] = useState<"all-services" | "seo-tracked" | "geo-tracked">(serviceParam);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [researchData, setResearchData] = useState<ResearchData | null>(null);
  const [isLoadingResearch, setIsLoadingResearch] = useState(false);
  const [researchError, setResearchError] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const activeKeyword = queryParam.trim();

  useEffect(() => {
    setSearchQuery(queryParam);
    if (searchParams.get("lang")) setLanguage(searchParams.get("lang")!);
    if (searchParams.get("loc")) setLocation(searchParams.get("loc")!);
    if (searchParams.get("service")) setSelectedService(searchParams.get("service") as any);
  }, [queryParam, searchParams]);

  const fetchKeywordResearch = async (kw: string, lang: string, loc: string, svc: string = selectedService) => {
    setResearchData(null);
    setIsLoadingResearch(true);
    setResearchError(null);

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: kw, language: lang, location: loc, service: svc }),
      });

      if (!res.ok) {
        throw new Error("Unable to load keyword data");
      }

      const data = await res.json();
      if (data.success) {
        setResearchData(data);
      } else {
        setResearchError(data.error || "Unable to load keyword data");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unable to load keyword data";
      setResearchError(msg);
    } finally {
      setIsLoadingResearch(false);
    }
  };

  useEffect(() => {
    if (activeKeyword) {
      fetchKeywordResearch(activeKeyword, language, location, selectedService);
    } else {
      setResearchData(null);
      setIsLoadingResearch(false);
      setResearchError(null);
    }
  }, [activeKeyword, language, location, selectedService]);

  const handleServiceSelect = (val: "all-services" | "seo-tracked" | "geo-tracked") => {
    setSelectedService(val);
    if (activeKeyword) {
      router.push(
        `/dashboard?q=${encodeURIComponent(activeKeyword)}&lang=${encodeURIComponent(language)}&loc=${encodeURIComponent(location)}&service=${encodeURIComponent(val)}`
      );
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsAnalyzing(true);
    router.push(
      `/dashboard?q=${encodeURIComponent(searchQuery.trim())}&lang=${encodeURIComponent(language)}&loc=${encodeURIComponent(location)}&service=${encodeURIComponent(selectedService)}`
    );
    setIsAnalyzing(false);
  };

  const handleQuickTry = (example: string) => {
    setSearchQuery(example);
    setIsAnalyzing(true);
    router.push(
      `/dashboard?q=${encodeURIComponent(example)}&lang=${encodeURIComponent(language)}&loc=${encodeURIComponent(location)}&service=${encodeURIComponent(selectedService)}`
    );
    setIsAnalyzing(false);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    router.push("/dashboard");
  };

  const focusSearchInput = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
      searchInputRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const buildSvgPath = (points: number[]) => {
    if (!points || points.length === 0) return "M 0 40 L 200 40";
    const width = 200;
    const step = width / Math.max(1, points.length - 1);
    return points
      .map((p, i) => {
        const x = Math.round(i * step);
        const y = Math.round(45 - (p / 100) * 35);
        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-7 space-y-6 max-w-[1440px] w-full mx-auto font-sans transition-colors bg-[#F8FAFC] min-h-full">
      
      {/* ── Active Keyword Results View (When q is present) ── */}
      {activeKeyword ? (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Control Bar */}
          <div className="bg-white border border-border/80 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleClearSearch}
                className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5 border border-slate-200 shrink-0 cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Back to Overview</span>
              </button>
              <div className="hidden sm:block text-xs font-semibold text-muted-foreground border-l border-slate-200 pl-3">
                SEO & AI Keyword Research Engine
              </div>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearchSubmit} className="flex flex-wrap md:flex-nowrap items-center gap-2 flex-1 max-w-3xl">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter keyword or website..."
                  className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-border rounded-xl text-foreground text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/30 focus:border-[#FF5A1F] transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>



              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-slate-50 border border-border rounded-xl px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/30 cursor-pointer"
              >
                <option value="English">English</option>
                <option value="German">German</option>
                <option value="Tamil">Tamil</option>
                <option value="Sinhala">Sinhala</option>
              </select>

              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="bg-slate-50 border border-border rounded-xl px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/30 cursor-pointer"
              >
                <option value="India">🇮🇳 India</option>
                <option value="United States">🇺🇸 United States</option>
                <option value="United Kingdom">🇬🇧 United Kingdom</option>
                <option value="Canada">🇨🇦 Canada</option>
                <option value="Australia">🇦🇺 Australia</option>
                <option value="Germany">🇩🇪 Germany</option>
                <option value="Singapore">🇸🇬 Singapore</option>
                <option value="Sri Lanka">🇱🇰 Sri Lanka</option>
                <option value="UAE">🇦🇪 UAE</option>
              </select>

              <button
                type="submit"
                disabled={isAnalyzing || isLoadingResearch}
                className="bg-[#FF5A1F] hover:bg-[#E54E17] text-white font-bold px-4 py-2 rounded-xl transition-all text-xs shrink-0 flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Sparkles size={14} className={isLoadingResearch || isAnalyzing ? "animate-spin" : "animate-pulse"} />
                <span>Search</span>
              </button>
            </form>
          </div>

          {/* Active Keyword Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white border border-border p-5 rounded-2xl shadow-2xs gap-3">
            <div>
              <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Active Keyword Research:</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground flex items-center gap-2.5 mt-1 flex-wrap">
                <span>&quot;{activeKeyword}&quot;</span>
                <span className="text-xs bg-[#FF5A1F]/10 text-[#FF5A1F] border border-[#FF5A1F]/20 px-3 py-1 rounded-full font-bold">
                  {location} • {language}
                </span>
                {researchData?.dataSource && (
                  <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1">
                    <Globe size={12} className="text-[#FF5A1F]" /> {researchData.dataSource}
                  </span>
                )}
              </h2>
            </div>
            <button
              type="button"
              onClick={handleClearSearch}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-border rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              ← Back to Overview
            </button>
          </div>

          {/* Research State: Loading Skeleton */}
          {isLoadingResearch ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white border border-border p-5 rounded-2xl space-y-3 shadow-2xs animate-pulse">
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                    <div className="h-8 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-150 rounded w-full" />
                  </div>
                ))}
              </div>
              <div className="bg-white border border-border rounded-2xl p-6 space-y-4 shadow-2xs animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-12 bg-slate-100 rounded-xl" />
                  ))}
                </div>
              </div>
            </div>
          ) : researchError ? (
            /* Error State UI */
            <div className="bg-red-50 border border-red-200 p-8 rounded-2xl flex flex-col items-center justify-center text-center space-y-3 shadow-xs">
              <AlertCircle size={36} className="text-red-500" />
              <h3 className="text-base font-bold text-red-900">Unable to load keyword data</h3>
              <p className="text-xs text-red-700 font-medium max-w-md">{researchError}</p>
              <button
                type="button"
                onClick={() => fetchKeywordResearch(activeKeyword, language, location)}
                className="mt-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw size={14} />
                <span>Try Again</span>
              </button>
            </div>
          ) : researchData ? (
            /* Loaded Keyword Research Results */
            <>
              {/* 4 Dynamic Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Monthly Searches */}
                <div className="bg-white border border-border p-5 rounded-2xl space-y-1.5 shadow-2xs">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Monthly Searches</p>
                  <p className="text-3xl font-extrabold text-foreground">
                    {researchData.metrics.searches.value}{" "}
                    <span className={`text-xs px-2 py-0.5 rounded-md font-bold ${
                      researchData.metrics.searches.tagColor === "emerald"
                        ? "text-emerald-600 bg-emerald-50"
                        : researchData.metrics.searches.tagColor === "amber"
                        ? "text-amber-600 bg-amber-50"
                        : "text-slate-600 bg-slate-100"
                    }`}>
                      {researchData.metrics.searches.tag}
                    </span>
                  </p>
                  <p className="text-[11px] text-muted-foreground font-medium">{researchData.metrics.searches.description}</p>
                </div>

                {/* How Hard to Rank */}
                <div className="bg-white border border-border p-5 rounded-2xl space-y-1.5 shadow-2xs">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">How Hard to Rank</p>
                  <p className="text-3xl font-extrabold text-foreground">
                    {researchData.metrics.difficulty.score}{" "}
                    <span className={`text-xs px-2 py-0.5 rounded-md font-bold ${
                      researchData.metrics.difficulty.tagColor === "red"
                        ? "text-red-600 bg-red-50"
                        : researchData.metrics.difficulty.tagColor === "amber"
                        ? "text-amber-600 bg-amber-50"
                        : "text-emerald-600 bg-emerald-50"
                    }`}>
                      {researchData.metrics.difficulty.tag}
                    </span>
                  </p>
                  <p className="text-[11px] text-muted-foreground font-medium">{researchData.metrics.difficulty.description}</p>
                </div>

                {/* AI Visibility Trigger */}
                <div className="bg-white border border-border p-5 rounded-2xl space-y-1.5 shadow-2xs">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">AI Visibility Trigger</p>
                  <p className="text-3xl font-extrabold text-foreground">
                    {researchData.metrics.aiVisibility.percent}{" "}
                    <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md font-bold">
                      {researchData.metrics.aiVisibility.tag}
                    </span>
                  </p>
                  <p className="text-[11px] text-muted-foreground font-medium">{researchData.metrics.aiVisibility.description}</p>
                </div>

                {/* Primary Intent */}
                <div className="bg-white border border-border p-5 rounded-2xl space-y-1.5 shadow-2xs">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Primary Intent</p>
                  <p className="text-3xl font-extrabold text-[#FF5A1F]">{researchData.metrics.intent.primary}</p>
                  <p className="text-[11px] text-muted-foreground font-medium">{researchData.metrics.intent.description}</p>
                </div>
              </div>

              {/* Localized AI Intelligence Overview */}
              {researchData.aiOverview && (
                <div className="bg-gradient-to-r from-orange-50 via-white to-amber-50 border border-orange-200 rounded-2xl p-5 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles size={18} className="text-[#FF5A1F] animate-pulse" />
                    <h3 className="text-sm font-bold text-slate-900">
                      {language === "Tamil"
                        ? "AI பகுப்பாய்வு சுருக்கம் (AI Summary)"
                        : language === "German"
                        ? "KI-Analyseübersicht (AI Summary)"
                        : language === "Sinhala"
                        ? "AI විශ්ලේෂණ සාරාංශය (AI Summary)"
                        : "AI Intelligence Overview"}
                    </h3>
                  </div>
                  <p className="text-xs font-medium text-slate-700 leading-relaxed">
                    {researchData.aiOverview}
                  </p>
                </div>
              )}

              {/* Real Live Organic Search & Citation Results */}
              {researchData.topOrganicResults && researchData.topOrganicResults.length > 0 && (
                <div className="bg-white border border-border rounded-2xl p-6 space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                      <Globe size={18} className="text-[#FF5A1F]" />
                      {selectedService === "seo-tracked"
                        ? "Real Live Google Organic Rankings & Indexing"
                        : selectedService === "geo-tracked"
                        ? "Real Generative AI Engine Citations & Sources"
                        : "Real Live Google Search & Indexing Results"}
                    </h3>
                    <span className="text-xs bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1">
                      <Globe size={12} className="text-[#FF5A1F]" />
                      Live SERP Data ({researchData.topOrganicResults.length} Live Sources)
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">
                    Actual ranking web pages & content cited by Google Search & AI engines for &quot;{activeKeyword}&quot;.
                  </p>
                  <div className="space-y-3">
                    {researchData.topOrganicResults.map((item, index) => (
                      <div key={index} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1 hover:border-[#FF5A1F]/50 transition-all">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-[11px] font-extrabold text-[#FF5A1F] bg-[#FF5A1F]/10 px-2.5 py-0.5 rounded-full border border-[#FF5A1F]/20">
                            #{item.position || index + 1} SERP Rank
                          </span>
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-1 truncate max-w-md"
                          >
                            {item.link} <ExternalLink size={11} />
                          </a>
                        </div>
                        <h4 className="text-xs font-bold text-foreground hover:text-[#FF5A1F]">
                          <a href={item.link} target="_blank" rel="noopener noreferrer">
                            {item.title}
                          </a>
                        </h4>
                        {item.snippet && (
                          <p className="text-[11px] text-slate-600 leading-snug font-normal">
                            {item.snippet}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dynamic Suggested AI Prompts */}
              <div className="bg-white border border-border rounded-2xl p-6 space-y-4 shadow-2xs">
                <h3 className="text-lg font-extrabold text-foreground flex items-center gap-2">
                  <Sparkles size={20} className="text-[#FF5A1F]" />
                  {language === "Tamil"
                    ? "பரிந்துரைக்கப்பட்ட உயர் AI தூண்டுதல்கள் & வேறுபாடுகள்"
                    : language === "German"
                    ? "Vorgeschlagene KI-Prompts & Variationen"
                    : language === "Sinhala"
                    ? "යෝජිත ඉහළ විභව AI විමසීම් සහ වෙනස්කම්"
                    : "Suggested High-Potential AI Prompts & Variations"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {researchData.prompts.map((prompt, i) => (
                    <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs font-medium text-foreground hover:border-[#FF5A1F]/50 hover:bg-orange-50/20 transition-all">
                      <span className="font-semibold text-slate-800">&quot;{prompt}&quot;</span>
                      <Link href={`/dashboard/check?q=${encodeURIComponent(prompt)}`} className="text-[#FF5A1F] font-bold hover:underline flex items-center gap-1 shrink-0 ml-3">
                        Analyze <ArrowRight size={14} />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deep Keyword & AI Intelligence Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Dynamic Search Volume Trend */}
                <div className="bg-white border border-border rounded-2xl p-6 space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <TrendingUp size={16} className="text-emerald-500" />
                      Search Volume Trend
                    </h4>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                      researchData.trend.isPositive ? "text-emerald-600 bg-emerald-50" : "text-amber-600 bg-amber-50"
                    }`}>
                      {researchData.trend.yoy}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Historical search interest for &quot;{activeKeyword}&quot; over the last 12 months.</p>
                  
                  <div className="pt-2">
                    <svg viewBox="0 0 200 60" className="w-full h-16 overflow-visible">
                      <defs>
                        <linearGradient id="researchGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#FF5A1F" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#FF5A1F" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path
                        d={`${buildSvgPath(researchData.trend.monthlyPoints)} L 200 60 L 0 60 Z`}
                        fill="url(#researchGrad)"
                      />
                      <path
                        d={buildSvgPath(researchData.trend.monthlyPoints)}
                        fill="none"
                        stroke="#FF5A1F"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="flex justify-between text-[10px] text-muted-foreground font-semibold pt-2">
                      <span>Q1</span>
                      <span>Q2</span>
                      <span>Q3</span>
                      <span>Q4</span>
                    </div>
                  </div>
                </div>

                {/* Dynamic AI Engine Inclusion Rates */}
                <div className="bg-white border border-border rounded-2xl p-6 space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Cpu size={16} className="text-purple-500" />
                      AI Engine Inclusion Rate
                    </h4>
                    <span className="text-[11px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">Live AI Probability</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Likelihood of AI engines (ChatGPT, Claude, Gemini) citing sources for &quot;{activeKeyword}&quot;.</p>
                  <div className="space-y-2.5 pt-1">
                    {researchData.inclusionRates.map((item, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span>{item.engine}</span>
                          <span className="text-[#FF5A1F] font-bold">{item.percent}</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-[#FF5A1F] h-full rounded-full" style={{ width: item.percent }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Action Tools */}
                <div className="bg-white border border-border rounded-2xl p-6 space-y-4 shadow-2xs flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <ShieldCheck size={16} className="text-blue-500" />
                      Recommended Next Actions
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">Take action to capture traffic for &quot;{activeKeyword}&quot;.</p>
                  </div>

                  <div className="space-y-2.5">
                    <Link
                      href={`/dashboard/check?q=${encodeURIComponent(activeKeyword)}`}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold p-3 rounded-xl text-xs flex items-center justify-between transition-colors"
                    >
                      <span>Run Full SEO & AI Audit</span>
                      <ArrowRight size={14} />
                    </Link>
                    <Link
                      href={`/dashboard/tasks?keyword=${encodeURIComponent(activeKeyword)}`}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold p-3 rounded-xl text-xs flex items-center justify-between transition-colors border border-slate-200"
                    >
                      <span>Add to Rank Tracker</span>
                      <ArrowRight size={14} />
                    </Link>
                    <Link
                      href={`/dashboard/prompts?q=${encodeURIComponent(activeKeyword)}`}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold p-3 rounded-xl text-xs flex items-center justify-between transition-colors border border-slate-200"
                    >
                      <span>Explore AI Prompts & Mentions</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      ) : (
        <ExecutiveDashboardView
          clientList={clientList}
          rawResults={rawResults}
          activeClient={activeClient}
          onSearchKeyword={(kw) => {
            setSearchQuery(kw);
            router.push(
              `/dashboard?q=${encodeURIComponent(kw)}&lang=${encodeURIComponent(language)}&loc=${encodeURIComponent(location)}&service=${encodeURIComponent(selectedService)}`
            );
          }}
        />
      )}

    </div>
  );
}
