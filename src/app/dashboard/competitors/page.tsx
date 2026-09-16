"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  BarChart2,
  Trophy,
  TrendingUp,
  Search,
  Plus,
  Info,
  ChevronDown,
  ExternalLink,
  Globe,
  Lightbulb,
  X,
  Sparkles,
  ArrowRight,
  TrendingDown,
  CheckCircle2,
} from "lucide-react";

interface CompetitorData {
  id: string;
  name: string;
  domain: string;
  visibilityScore: number;
  aiMentionsCount: number;
  topEngine: string;
  gapStatus: "Leading" | "Tied" | "Lagging";
  avatarBg?: string;
  avatarText?: string;
}

export default function CompetitorsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEngine, setSelectedEngine] = useState("All AI Engines");
  const [showEngineMenu, setShowEngineMenu] = useState(false);
  const [sortBy, setSortBy] = useState("Visibility");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCompetitorDomain, setNewCompetitorDomain] = useState("");

  // Start with initial competitor or empty state
  const [competitors, setCompetitors] = useState<CompetitorData[]>([
    {
      id: "comp-1",
      name: "VALGROW Intelligence",
      domain: "valgrow",
      visibilityScore: 65,
      aiMentionsCount: 75,
      topEngine: "ChatGPT (GPT-4o)",
      gapStatus: "Tied",
      avatarBg: "bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400",
      avatarText: "V",
    },
  ]);

  const handleAddCompetitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompetitorDomain.trim()) return;

    const rawDomain = newCompetitorDomain.trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    const baseName = rawDomain.split(".")[0];
    const formattedName = baseName.charAt(0).toUpperCase() + baseName.slice(1) + " AI";
    const initial = baseName.charAt(0).toUpperCase();

    const colors = [
      "bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400",
      "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400",
      "bg-orange-100 text-[#FF5A1F] dark:bg-orange-950/60 dark:text-orange-400",
      "bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400",
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newComp: CompetitorData = {
      id: `comp-${Date.now()}`,
      name: formattedName,
      domain: rawDomain,
      visibilityScore: Math.floor(Math.random() * 35) + 50,
      aiMentionsCount: Math.floor(Math.random() * 120) + 30,
      topEngine: "ChatGPT (GPT-4o)",
      gapStatus: "Tied",
      avatarBg: randomColor,
      avatarText: initial,
    };

    setCompetitors([newComp, ...competitors]);
    setNewCompetitorDomain("");
    setShowAddModal(false);
  };

  // Filtering
  const filteredCompetitors = competitors.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.domain.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto font-sans bg-background min-h-screen animate-fadeIn">
      
      {/* ── 1. TOP HEADER ROW ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-[#FF5A1F] flex items-center justify-center shrink-0 shadow-2xs">
            <Users size={24} className="stroke-[2.2]" />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-foreground tracking-tight">
              Competitor Citation Benchmark
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-muted-foreground font-medium">
              See how your brand compares with competitors across AI search engines. Track mentions, visibility gaps, and new opportunities.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF5A1F] hover:bg-[#E04B14] text-white text-xs font-bold shadow-xs hover:shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus size={15} className="stroke-[2.5]" />
          <span>Track New Competitor</span>
        </button>
      </div>

      {/* ── 2. TOP 4 KPI CARDS ROW ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Your Brand AI Share */}
        <div className="bg-white dark:bg-card border border-border/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between h-[140px]">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <BarChart2 size={20} className="stroke-[2.2]" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-600 dark:text-muted-foreground leading-tight">
                  Your Brand AI Share
                </p>
              </div>
            </div>
            <Info size={14} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer" />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-foreground tracking-tight">
              0.0%
            </p>
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              ↑ +14.2% than industry avg
            </p>
          </div>
        </div>

        {/* Card 2: Tracked Competitors */}
        <div className="bg-white dark:bg-card border border-border/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between h-[140px]">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <Users size={20} className="stroke-[2.2]" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-600 dark:text-muted-foreground leading-tight">
                  Tracked Competitors
                </p>
              </div>
            </div>
            <Info size={14} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer" />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-foreground tracking-tight">
              {competitors.length}
            </p>
            <p className="text-xs text-slate-500 dark:text-muted-foreground font-medium mt-0.5">
              Active domain profiles
            </p>
          </div>
        </div>

        {/* Card 3: Top Rival Domain */}
        <div className="bg-white dark:bg-card border border-border/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between h-[140px]">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Trophy size={20} className="stroke-[2.2]" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-600 dark:text-muted-foreground leading-tight">
                  Top Rival Domain
                </p>
              </div>
            </div>
            <Info size={14} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer" />
          </div>
          <div>
            <p className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-foreground truncate tracking-tight">
              apexsearch.com
            </p>
            <p className="text-xs font-bold text-[#FF5A1F] mt-0.5">
              84.2% AI visibility
            </p>
          </div>
        </div>

        {/* Card 4: Citation Gap Advantage */}
        <div className="bg-white dark:bg-card border border-border/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between h-[140px]">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <TrendingUp size={20} className="stroke-[2.2]" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-600 dark:text-muted-foreground leading-tight">
                  Citation Gap Advantage
                </p>
              </div>
            </div>
            <Info size={14} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer" />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
              +18.0%
            </p>
            <p className="text-xs text-slate-500 dark:text-muted-foreground font-medium mt-0.5">
              Net positive share of citations
            </p>
          </div>
        </div>

      </div>

      {/* ── 3. MAIN TABLE CONTAINER ── */}
      <div className="bg-white dark:bg-card border border-border/80 rounded-2xl shadow-xs overflow-hidden">
        
        {/* Controls / Filter Bar */}
        <div className="p-4 sm:p-5 border-b border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search competitor domain..."
              className="w-full rounded-xl border border-slate-200 dark:border-border bg-slate-50/50 dark:bg-muted/40 pl-9 pr-4 py-2 text-xs text-foreground placeholder:text-slate-400 focus:outline-none focus:border-[#FF5A1F]"
            />
          </div>

          {/* Right Filters */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
            
            {/* Engine Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowEngineMenu(!showEngineMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card text-xs font-semibold text-slate-700 dark:text-foreground hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
              >
                <Globe size={13} className="text-slate-500" />
                <span>{selectedEngine}</span>
                <ChevronDown size={12} className="text-slate-400" />
              </button>

              {showEngineMenu && (
                <div className="absolute right-0 mt-1 z-30 w-44 rounded-xl bg-popover border border-border shadow-xl p-1 text-xs space-y-0.5">
                  {["All AI Engines", "ChatGPT (GPT-4o)", "Google Gemini", "Perplexity AI", "Claude 3.5"].map((eng) => (
                    <button
                      key={eng}
                      type="button"
                      onClick={() => {
                        setSelectedEngine(eng);
                        setShowEngineMenu(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        selectedEngine === eng ? "bg-[#FF5A1F]/10 text-[#FF5A1F] font-bold" : "text-foreground hover:bg-muted"
                      }`}
                    >
                      {eng}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card text-xs font-semibold text-slate-700 dark:text-foreground hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
              >
                <TrendingUp size={13} className="text-slate-500" />
                <span>Sort by: {sortBy}</span>
                <ChevronDown size={12} className="text-slate-400" />
              </button>

              {showSortMenu && (
                <div className="absolute right-0 mt-1 z-30 w-36 rounded-xl bg-popover border border-border shadow-xl p-1 text-xs space-y-0.5">
                  {["Visibility", "Mentions", "Name"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setSortBy(s);
                        setShowSortMenu(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        sortBy === s ? "bg-[#FF5A1F]/10 text-[#FF5A1F] font-bold" : "text-foreground hover:bg-muted"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <span className="text-xs font-medium text-slate-500 dark:text-muted-foreground">
              Showing {filteredCompetitors.length} {filteredCompetitors.length === 1 ? "competitor" : "competitors"}
            </span>
          </div>

        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/60 text-slate-600 dark:text-muted-foreground font-bold text-[11px]">
              <tr>
                <th className="py-3 px-4 w-10">#</th>
                <th className="py-3 px-4">COMPETITOR NAME</th>
                <th className="py-3 px-4">DOMAIN</th>
                <th className="py-3 px-4">
                  <span className="inline-flex items-center gap-1">
                    AI VISIBILITY SCORE <Info size={11} className="text-slate-400" />
                  </span>
                </th>
                <th className="py-3 px-4">
                  <span className="inline-flex items-center gap-1">
                    TOTAL MENTIONS <Info size={11} className="text-slate-400" />
                  </span>
                </th>
                <th className="py-3 px-4">PRIMARY AI ENGINE</th>
                <th className="py-3 px-4">
                  <span className="inline-flex items-center gap-1">
                    GAP BENCHMARK <Info size={11} className="text-slate-400" />
                  </span>
                </th>
                <th className="py-3 px-4 text-right">ACTION</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border/40 font-medium">
              {filteredCompetitors.length === 0 ? (
                /* ── EMPTY STATE VIEW (Matching Image 1) ── */
                <tr>
                  <td colSpan={8} className="py-16 px-4 text-center">
                    <div className="max-w-md mx-auto space-y-4 flex flex-col items-center">
                      
                      {/* Illustrated Document & Magnifier */}
                      <div className="relative w-24 h-24 flex items-center justify-center">
                        <div className="w-16 h-20 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900/40 shadow-xs flex flex-col justify-center gap-1.5 p-3">
                          <div className="w-10 h-1.5 bg-blue-300 dark:bg-blue-600/40 rounded-full" />
                          <div className="w-8 h-1.5 bg-blue-200 dark:bg-blue-700/40 rounded-full" />
                          <div className="w-10 h-1.5 bg-blue-200 dark:bg-blue-700/40 rounded-full" />
                        </div>
                        
                        {/* Floating Magnifying Glass */}
                        <div className="absolute bottom-1 right-2 w-10 h-10 rounded-full bg-white dark:bg-card border-2 border-blue-500 text-blue-500 shadow-md flex items-center justify-center">
                          <Search size={16} className="stroke-[2.5]" />
                        </div>

                        {/* Sparkle accents */}
                        <span className="absolute top-1 left-2 text-amber-400 text-xs">✦</span>
                        <span className="absolute top-2 right-1 text-blue-400 text-xs">✦</span>
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-foreground">
                          No competitor domains yet
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-muted-foreground">
                          Start tracking your competitors to see how your brand compares in AI search engines.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF5A1F] hover:bg-[#E04B14] text-white text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
                      >
                        <Plus size={14} className="stroke-[2.5]" />
                        <span>Track New Competitor</span>
                      </button>

                      <p className="text-[11px] text-slate-400 dark:text-muted-foreground font-medium">
                        Enter a domain to get started
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                /* ── POPULATED STATE ROWS (Matching Image 3) ── */
                filteredCompetitors.map((comp, idx) => (
                  <tr key={comp.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-4 text-slate-500 font-bold">{idx + 1}</td>
                    
                    {/* Competitor Name + Avatar */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-lg ${comp.avatarBg || "bg-blue-100 text-blue-600"} flex items-center justify-center font-black text-xs shrink-0`}>
                          {comp.avatarText || comp.name.charAt(0)}
                        </div>
                        <span className="font-extrabold text-slate-900 dark:text-foreground">
                          {comp.name}
                        </span>
                      </div>
                    </td>

                    {/* Domain */}
                    <td className="py-4 px-4 font-mono text-slate-500 text-xs">
                      {comp.domain}
                    </td>

                    {/* AI Visibility Score + Bar */}
                    <td className="py-4 px-4">
                      <div className="space-y-1 w-32">
                        <span className="font-black text-[#FF5A1F] text-xs">
                          {comp.visibilityScore}%
                        </span>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#FF5A1F] rounded-full"
                            style={{ width: `${comp.visibilityScore}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Total Mentions */}
                    <td className="py-4 px-4 font-extrabold text-slate-900 dark:text-foreground">
                      {comp.aiMentionsCount}
                    </td>

                    {/* Primary AI Engine */}
                    <td className="py-4 px-4">
                      <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-muted/70 text-slate-800 dark:text-foreground text-[11px] font-semibold border border-slate-200/60 dark:border-border/60">
                        {comp.topEngine}
                      </span>
                    </td>

                    {/* Gap Benchmark */}
                    <td className="py-4 px-4">
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#FFF6E9] text-[#D97706] dark:bg-amber-950/40 dark:text-amber-300">
                        {comp.gapStatus}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-4 px-4 text-right">
                      <a
                        href={`https://${comp.domain}.com`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 font-bold hover:underline text-xs"
                      >
                        <span>Visit</span>
                        <ExternalLink size={12} />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── BOTTOM BANNER (WHEN POPULATED) ── */}
        {filteredCompetitors.length > 0 && (
          <div className="p-8 border-t border-border/40 bg-slate-50/40 dark:bg-card/40 flex flex-col items-center justify-center text-center space-y-3">
            {/* Subtle Illustration Icon */}
            <div className="relative w-16 h-12 flex items-center justify-center">
              <div className="w-12 h-10 bg-blue-50/80 dark:bg-blue-950/50 rounded-lg border border-blue-100 flex flex-col justify-center gap-1 p-2">
                <div className="w-6 h-1 bg-blue-300 rounded-full" />
                <div className="w-8 h-1 bg-blue-200 rounded-full" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#FF5A1F] text-white flex items-center justify-center shadow-xs">
                <Users size={12} />
              </div>
              <span className="absolute -top-1 -right-1 text-amber-400 text-xs">✦</span>
            </div>

            <div className="space-y-0.5 max-w-md">
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-foreground">
                Track more competitors to get a complete view.
              </h4>
              <p className="text-xs text-slate-500 dark:text-muted-foreground font-medium">
                Add rival domains to compare mentions, visibility, and opportunities.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF5A1F] hover:bg-[#E04B14] text-white text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer mt-1"
            >
              <Plus size={14} className="stroke-[2.5]" />
              <span>Track New Competitor</span>
            </button>
          </div>
        )}

      </div>

      {/* ── 4. TRACK COMPETITOR MODAL (MATCHING IMAGE 2) ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-card rounded-3xl border border-slate-200 dark:border-border max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 relative">
            
            {/* Close X Button */}
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="absolute top-6 right-6 w-8 h-8 rounded-full bg-slate-100 dark:bg-muted text-slate-500 hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            {/* Modal Header */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-[#FF5A1F] flex items-center justify-center shrink-0">
                <Users size={24} className="stroke-[2.2]" />
              </div>
              <div className="space-y-1 pr-6">
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-foreground tracking-tight">
                  Track Competitor Domain
                </h3>
                <p className="text-xs text-slate-500 dark:text-muted-foreground leading-relaxed">
                  Enter the domain of a competitor to start tracking their AI citations, brand mentions, and visibility across search engines.
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleAddCompetitor} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 dark:text-foreground">
                  Competitor Website Domain
                </label>
                <div className="relative">
                  <Globe size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. competitor.com"
                    value={newCompetitorDomain}
                    onChange={(e) => setNewCompetitorDomain(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-border bg-slate-50/50 dark:bg-muted/40 pl-9 pr-4 py-2.5 text-xs text-foreground placeholder:text-slate-400 focus:outline-none focus:border-[#FF5A1F]"
                  />
                </div>
              </div>

              {/* Blue Tip Box */}
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-xs">
                <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Lightbulb size={14} />
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  You can add any competitor domain. We&apos;ll start tracking it in real-time.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-muted-foreground hover:bg-slate-100 dark:hover:bg-muted transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF5A1F] hover:bg-[#E04B14] text-white text-xs font-black shadow-xs hover:shadow-md transition-all cursor-pointer"
                >
                  <TrendingUp size={14} className="stroke-[2.5]" />
                  <span>Start Tracking</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
