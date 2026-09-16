"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BarChart2,
  BarChart3,
  Search,
  Download,
  Printer,
  CheckCircle2,
  XCircle,
  Link2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  MessageSquare,
  Users,
  EyeOff,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { downloadCSV, exportPrintablePDF, ExportDataRow } from "@/utils/export";

export interface KeywordAppearsRow {
  id: string;
  keyword: string;
  monthlySearches: string;
  googleRank: number | null;
  aiVisibility: "cited" | "mentioned" | "not_visible" | "no_data";
  status: "doing_well" | "needs_attention" | "opportunity";
  lastChecked: string;
  simpleAdvice: string;
}

const DEFAULT_ROWS: KeywordAppearsRow[] = [
  {
    id: "kw-1",
    keyword: "enterprise seo platform",
    monthlySearches: "14,800 searches/month",
    googleRank: 2,
    aiVisibility: "mentioned",
    status: "opportunity",
    lastChecked: "10 mins ago",
    simpleAdvice: "Ranks #2 on Google — add strong brand sources to get direct AI link",
  },
  {
    id: "kw-2",
    keyword: "valgrow search intelligence",
    monthlySearches: "3,200 searches/month",
    googleRank: 1,
    aiVisibility: "cited",
    status: "doing_well",
    lastChecked: "25 mins ago",
    simpleAdvice: "Optimal visibility — AI quotes your brand with clickable website link",
  },
  {
    id: "kw-3",
    keyword: "best ai search optimization software",
    monthlySearches: "8,900 searches/month",
    googleRank: null,
    aiVisibility: "not_visible",
    status: "needs_attention",
    lastChecked: "1 hour ago",
    simpleAdvice: "Missing from AI — publish a comparison guide to get recognized",
  },
  {
    id: "kw-4",
    keyword: "generative engine optimization tools",
    monthlySearches: "6,400 searches/month",
    googleRank: 7,
    aiVisibility: "not_visible",
    status: "needs_attention",
    lastChecked: "2 hours ago",
    simpleAdvice: "Competitors are cited — optimize on-page schema and FAQs",
  },
  {
    id: "kw-5",
    keyword: "ai visibility score tracker",
    monthlySearches: "4,100 searches/month",
    googleRank: 3,
    aiVisibility: "cited",
    status: "doing_well",
    lastChecked: "3 hours ago",
    simpleAdvice: "Strong presence — cited in ChatGPT and Google AI Mode",
  },
  {
    id: "kw-6",
    keyword: "b2b search intelligence metrics",
    monthlySearches: "2,800 searches/month",
    googleRank: 11,
    aiVisibility: "no_data",
    status: "opportunity",
    lastChecked: "Yesterday",
    simpleAdvice: "Close to page 1 — push rank into top 5 to trigger AI citation",
  },
  {
    id: "kw-7",
    keyword: "chatgpt search citation audit",
    monthlySearches: "5,300 searches/month",
    googleRank: 4,
    aiVisibility: "mentioned",
    status: "opportunity",
    lastChecked: "Yesterday",
    simpleAdvice: "AI mentions your brand name — add schema markup for link citation",
  },
  {
    id: "kw-8",
    keyword: "llm visibility tracker",
    monthlySearches: "1,300 searches/month",
    googleRank: null,
    aiVisibility: "not_visible",
    status: "needs_attention",
    lastChecked: "5 hours ago",
    simpleAdvice: "No brand citations yet — seed technical review mentions",
  },
];

export default function AIVisibilityView() {
  const [activeTab, setActiveTab] = useState<"all" | "doing_well" | "needs_attention" | "opportunity">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [rows] = useState<KeywordAppearsRow[]>(DEFAULT_ROWS);

  // Counts
  const totalCount = rows.length;
  const doingWellCount = rows.filter((r) => r.status === "doing_well").length;
  const needsAttentionCount = rows.filter((r) => r.status === "needs_attention").length;
  const opportunityCount = rows.filter((r) => r.status === "opportunity").length;

  // Filtered rows
  const filteredRows = rows.filter((r) => {
    if (activeTab !== "all" && r.status !== activeTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return r.keyword.toLowerCase().includes(q);
    }
    return true;
  });

  // Export handlers
  const handleExportCSV = () => {
    const exportRows: ExportDataRow[] = filteredRows.map((r) => ({
      keyword: r.keyword,
      clientName: "Valgrow Labs",
      trackType: "Where Your Brand Appears",
      rankPosition: r.googleRank ?? undefined,
      aioPresent: r.aiVisibility === "cited" || r.aiVisibility === "mentioned",
      classification: r.status,
      createdAt: new Date().toISOString(),
    }));
    downloadCSV("Where_Your_Brand_Appears", exportRows);
  };

  const handlePrintPDF = () => {
    const exportRows: ExportDataRow[] = filteredRows.map((r) => ({
      keyword: r.keyword,
      clientName: "Valgrow Labs",
      trackType: "Where Your Brand Appears",
      rankPosition: r.googleRank ?? undefined,
      aioPresent: r.aiVisibility === "cited" || r.aiVisibility === "mentioned",
      classification: r.status,
      createdAt: new Date().toISOString(),
    }));
    exportPrintablePDF("Where Your Brand Appears Report", exportRows);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto font-sans bg-background animate-fadeIn pb-12">
      
      {/* ── 1. MAIN HERO CARD CONTAINER (Exact Reference Redesign) ── */}
      <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
        
        {/* Top Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          
          {/* Left: Orange Icon + Eyebrow + Title + Subtitle */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF5F0] dark:bg-orange-950/40 text-[#FF5A1F] dark:text-orange-400 border border-orange-100 dark:border-orange-900/30 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
              <BarChart2 size={24} className="stroke-[2.5]" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
                SERP &amp; LLM INTELLIGENCE
              </span>
              <h1 className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-foreground tracking-tight leading-tight">
                Where Your Brand Appears
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-muted-foreground font-normal">
                A simple overview of how your brand shows up when people search on Google or ask AI assistants.
              </p>
            </div>
          </div>

          {/* Right: Actions + Blue Info Widget */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-2.5 shrink-0">
            
            {/* Buttons Row */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-card border border-slate-200 dark:border-border text-xs font-bold text-slate-700 dark:text-foreground hover:bg-slate-50 dark:hover:bg-muted shadow-2xs transition-colors cursor-pointer"
              >
                <Download size={13} className="text-slate-600 dark:text-slate-400 stroke-[2.2]" />
                <span>Export CSV</span>
              </button>

              <button
                type="button"
                onClick={handlePrintPDF}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-card border border-slate-200 dark:border-border text-xs font-bold text-slate-700 dark:text-foreground hover:bg-slate-50 dark:hover:bg-muted shadow-2xs transition-colors cursor-pointer"
              >
                <Printer size={13} className="text-slate-600 dark:text-slate-400 stroke-[2.2]" />
                <span>Print</span>
              </button>
            </div>

            {/* Blue Info Callout Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F0F6FF] dark:bg-blue-950/30 border border-[#DBEAFE]/80 dark:border-blue-900/40 text-[11px] text-blue-600 dark:text-blue-400 shadow-2xs">
              <Sparkles size={14} className="text-blue-500 shrink-0" />
              <div className="leading-tight text-[10.5px]">
                <span className="font-semibold text-blue-900 dark:text-blue-200">Track your visibility. Find gaps.</span>
                <span className="block text-blue-600 dark:text-blue-400">Discover opportunities.</span>
              </div>
            </div>

          </div>

        </div>

        {/* ── 4 KPI CARDS GRID (Exact Reference Colors & Progress Bars) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          
          {/* Card 1: Direct AI Citations (Green) */}
          <div className="bg-[#F4FBF7] dark:bg-emerald-950/20 border border-[#E1F6EB] dark:border-emerald-900/30 rounded-2xl p-4.5 flex flex-col justify-between space-y-3.5 shadow-2xs">
            {/* Top Row: Icon + Title + Trend Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#DCFCE7] dark:bg-emerald-900/50 text-[#16A34A] dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <MessageSquare size={16} className="stroke-[2.2]" />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-foreground">
                  Direct AI Citations
                </span>
              </div>
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#E8F8F0] dark:bg-emerald-950/60 text-[#16A34A] dark:text-emerald-400 text-[10px] font-extrabold border border-[#C6F0DB] dark:border-emerald-800/40">
                <ArrowUpRight size={11} className="stroke-[3]" />
                <span>+12%</span>
              </span>
            </div>

            {/* Metric & Description */}
            <div className="space-y-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-slate-900 dark:text-foreground tracking-tight">
                  {doingWellCount}
                </span>
                <span className="text-xs text-slate-500 font-medium">of {totalCount} keywords</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-muted-foreground leading-relaxed">
                AI answers recommend your brand with a clickable link to your site.
              </p>
            </div>

            {/* Bottom Progress Bar */}
            <div className="flex items-center gap-2 pt-0.5">
              <div className="h-2 flex-1 bg-slate-200/60 dark:bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-[#10B981] rounded-full" style={{ width: "25%" }} />
              </div>
              <span className="text-[10.5px] font-bold text-slate-500 dark:text-muted-foreground">
                25%
              </span>
            </div>
          </div>

          {/* Card 2: Brand Mentions (Blue) */}
          <div className="bg-[#F5F9FF] dark:bg-blue-950/20 border border-[#E3EDFE] dark:border-blue-900/30 rounded-2xl p-4.5 flex flex-col justify-between space-y-3.5 shadow-2xs">
            {/* Top Row: Icon + Title + Trend Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#DBEAFE] dark:bg-blue-900/50 text-[#2563EB] dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Users size={16} className="stroke-[2.2]" />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-foreground">
                  Brand Mentions
                </span>
              </div>
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#EBF3FF] dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 text-[10px] font-extrabold border border-[#CDE0FE] dark:border-blue-800/40">
                <ArrowUpRight size={11} className="stroke-[3]" />
                <span>+8%</span>
              </span>
            </div>

            {/* Metric & Description */}
            <div className="space-y-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-slate-900 dark:text-foreground tracking-tight">
                  2
                </span>
                <span className="text-xs text-slate-500 font-medium">of {totalCount} keywords</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-muted-foreground leading-relaxed">
                AI names your company in answers, but hasn&apos;t added a direct link yet.
              </p>
            </div>

            {/* Bottom Progress Bar */}
            <div className="flex items-center gap-2 pt-0.5">
              <div className="h-2 flex-1 bg-slate-200/60 dark:bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-[#2563EB] rounded-full" style={{ width: "25%" }} />
              </div>
              <span className="text-[10.5px] font-bold text-slate-500 dark:text-muted-foreground">
                25%
              </span>
            </div>
          </div>

          {/* Card 3: Needs AI Visibility (Rose / Red) */}
          <div className="bg-[#FFF5F6] dark:bg-rose-950/20 border border-[#FDE2E4] dark:border-rose-900/30 rounded-2xl p-4.5 flex flex-col justify-between space-y-3.5 shadow-2xs">
            {/* Top Row: Icon + Title + Trend Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#FFE4E6] dark:bg-rose-900/50 text-[#E11D48] dark:text-rose-400 flex items-center justify-center shrink-0">
                  <EyeOff size={16} className="stroke-[2.2]" />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-foreground">
                  Needs AI Visibility
                </span>
              </div>
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#FFF0F2] dark:bg-rose-950/60 text-[#E11D48] dark:text-rose-400 text-[10px] font-extrabold border border-[#FDC8CD] dark:border-rose-800/40">
                <ArrowDownRight size={11} className="stroke-[3]" />
                <span>-8%</span>
              </span>
            </div>

            {/* Metric & Description */}
            <div className="space-y-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-slate-900 dark:text-foreground tracking-tight">
                  {needsAttentionCount}
                </span>
                <span className="text-xs text-slate-500 font-medium">of {totalCount} keywords</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-muted-foreground leading-relaxed">
                Your brand does not appear in AI answers when users ask these queries.
              </p>
            </div>

            {/* Bottom Progress Bar */}
            <div className="flex items-center gap-2 pt-0.5">
              <div className="h-2 flex-1 bg-slate-200/60 dark:bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-[#E11D48] rounded-full" style={{ width: "38%" }} />
              </div>
              <span className="text-[10.5px] font-bold text-slate-500 dark:text-muted-foreground">
                38%
              </span>
            </div>
          </div>

          {/* Card 4: High-Potential Wins (Amber / Yellow) */}
          <div className="bg-[#FFFBF2] dark:bg-amber-950/20 border border-[#FEF3D6] dark:border-amber-900/30 rounded-2xl p-4.5 flex flex-col justify-between space-y-3.5 shadow-2xs">
            {/* Top Row: Icon + Title + Neutral Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#FEF3C7] dark:bg-amber-900/50 text-[#D97706] dark:text-amber-400 flex items-center justify-center shrink-0">
                  <BarChart2 size={16} className="stroke-[2.5]" />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-foreground">
                  High-Potential Wins
                </span>
              </div>
              <span className="w-5 h-5 rounded-full bg-[#FEF3C7] dark:bg-amber-950/60 text-[#D97706] dark:text-amber-400 flex items-center justify-center text-[10px] font-bold border border-[#FDE68A] dark:border-amber-800/40">
                <Minus size={10} className="stroke-[3]" />
              </span>
            </div>

            {/* Metric & Description */}
            <div className="space-y-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-slate-900 dark:text-foreground tracking-tight">
                  {opportunityCount}
                </span>
                <span className="text-xs text-slate-500 font-medium">prime targets</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-muted-foreground leading-relaxed">
                You already rank well on Google — easy opportunity to turn into AI citations.
              </p>
            </div>

            {/* Bottom Progress Bar */}
            <div className="flex items-center gap-2 pt-0.5">
              <div className="h-2 flex-1 bg-slate-200/60 dark:bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-[#F59E0B] rounded-full" style={{ width: "38%" }} />
              </div>
              <span className="text-[10.5px] font-bold text-slate-500 dark:text-muted-foreground">
                38%
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* ── 2. FILTER TABS & SEARCH ROW ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        
        {/* Simple Pill Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-muted rounded-xl w-full sm:w-auto overflow-x-auto">
          
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "all"
                ? "bg-white dark:bg-card text-slate-900 dark:text-foreground shadow-2xs font-bold"
                : "text-slate-600 dark:text-muted-foreground hover:text-slate-900"
            }`}
          >
            <span>All Keywords</span>
            <span className="text-[11px] opacity-70">({totalCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("doing_well")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "doing_well"
                ? "bg-white dark:bg-card text-emerald-700 dark:text-emerald-400 shadow-2xs font-bold"
                : "text-slate-600 dark:text-muted-foreground hover:text-slate-900"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Doing Well</span>
            <span className="text-[11px] opacity-70">({doingWellCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("opportunity")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "opportunity"
                ? "bg-white dark:bg-card text-amber-700 dark:text-amber-400 shadow-2xs font-bold"
                : "text-slate-600 dark:text-muted-foreground hover:text-slate-900"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>Opportunities</span>
            <span className="text-[11px] opacity-70">({opportunityCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("needs_attention")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "needs_attention"
                ? "bg-white dark:bg-card text-rose-700 dark:text-rose-400 shadow-2xs font-bold"
                : "text-slate-600 dark:text-muted-foreground hover:text-slate-900"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>Needs Work</span>
            <span className="text-[11px] opacity-70">({needsAttentionCount})</span>
          </button>

        </div>

        {/* Search Box */}
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search keywords..."
            className="w-full rounded-lg border border-slate-200 dark:border-border bg-white dark:bg-card pl-8.5 pr-3 py-1.5 text-xs text-foreground placeholder:text-slate-400 focus:outline-none focus:border-[#FF5A1F] shadow-2xs"
          />
        </div>

      </div>

      {/* ── 3. HUMAN-FRIENDLY KEYWORD TABLE ── */}
      <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 dark:border-border text-slate-400 dark:text-muted-foreground font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-5">KEYWORD</th>
                <th className="py-3 px-4">GOOGLE POSITION</th>
                <th className="py-3 px-4">AI STATUS</th>
                <th className="py-3 px-4">WHAT TO DO</th>
                <th className="py-3 px-4">UPDATED</th>
                <th className="py-3 px-5 text-right">ACTION</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-border font-medium">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No keywords found.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/70 dark:hover:bg-muted/20 transition-colors">
                    
                    {/* Keyword + Volume */}
                    <td className="py-3.5 px-5">
                      <p className="font-semibold text-slate-900 dark:text-foreground text-xs">
                        {row.keyword}
                      </p>
                      <p className="text-[11px] text-slate-400 dark:text-muted-foreground font-normal mt-0.5">
                        {row.monthlySearches}
                      </p>
                    </td>

                    {/* Google Rank */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {row.googleRank ? (
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          #{row.googleRank} <span className="text-[10px] text-slate-400 font-normal">on Google</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs font-normal">
                          Not in Top 10
                        </span>
                      )}
                    </td>

                    {/* AI Visibility */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {row.aiVisibility === "cited" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/40">
                          <CheckCircle2 size={12} className="stroke-[2.5]" />
                          <span>Cited &amp; Linked</span>
                        </span>
                      )}
                      {row.aiVisibility === "mentioned" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-orange-50 text-[#FF5A1F] dark:bg-orange-950/50 dark:text-orange-300 border border-orange-200/60 dark:border-orange-900/40">
                          <Link2 size={12} className="stroke-[2.5]" />
                          <span>Mentioned Only</span>
                        </span>
                      )}
                      {row.aiVisibility === "not_visible" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600 dark:bg-muted dark:text-slate-400">
                          <XCircle size={12} className="text-slate-400" />
                          <span>Not in AI</span>
                        </span>
                      )}
                      {row.aiVisibility === "no_data" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 text-slate-500 dark:bg-muted">
                          <span>Pending</span>
                        </span>
                      )}
                    </td>

                    {/* What to Do (Plain English) */}
                    <td className="py-3.5 px-4 max-w-xs sm:max-w-sm">
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
                        {row.simpleAdvice}
                      </p>
                    </td>

                    {/* Last Checked */}
                    <td className="py-3.5 px-4 text-xs text-slate-400 dark:text-muted-foreground whitespace-nowrap font-normal">
                      {row.lastChecked}
                    </td>

                    {/* Action Button */}
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <Link
                        href={`/dashboard/check?tab=quick-check&kw=${encodeURIComponent(row.keyword)}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#FF5A1F] hover:bg-orange-50 dark:hover:bg-orange-950/40 transition-colors"
                      >
                        <span>Check AI</span>
                        <ArrowRight size={12} />
                      </Link>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
