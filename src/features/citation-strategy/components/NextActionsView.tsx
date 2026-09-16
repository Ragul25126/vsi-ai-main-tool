"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Target,
  Zap,
  BarChart2,
  Sparkles,
  TrendingUp,
  Search,
  Clock,
  ArrowRight,
  Check,
  FileText,
  Link2,
  Edit3,
  ChevronDown,
  ChevronUp,
  X,
  CheckCircle2,
  Lightbulb,
} from "lucide-react";

export interface ActionItem {
  id: string;
  category: "quick_win" | "competitor_gap" | "ai_citation" | "ranking";
  categoryName: string;
  priority: "Critical" | "High" | "Medium";
  iconType: "file" | "link" | "edit" | "chart";
  title: string;
  oneLiner: string;
  impactGain: string;
  impactLabel: string;
  timeEstimate: string;
  difficulty: "Easy" | "Medium" | "Hard";
  steps: string[];
}

const ACTION_ITEMS: ActionItem[] = [
  {
    id: "act-1",
    category: "quick_win",
    categoryName: "Quick Win",
    priority: "Critical",
    iconType: "file",
    title: "Get mentioned in AI Overviews",
    oneLiner: "Your brand is mentioned in AI answers, but doesn't have a proper source link. Add a short description on your homepage.",
    impactGain: "+45%",
    impactLabel: "Potential increase in AI traffic",
    timeEstimate: "30 min",
    difficulty: "Easy",
    steps: [
      "Open your homepage header or hero section.",
      "Add a 2-sentence summary stating what your business does and where you operate.",
      "Save changes so search engines can index your direct link.",
    ],
  },
  {
    id: "act-2",
    category: "competitor_gap",
    categoryName: "Competitor Gap",
    priority: "Critical",
    iconType: "link",
    title: "Create a comparison page for key competitors",
    oneLiner: "3 competitors are mentioned in AI Overviews, but your brand is not. Publish a simple comparison page highlighting your unique features.",
    impactGain: "+60%",
    impactLabel: "Potential increase in brand visibility",
    timeEstimate: "2 hours",
    difficulty: "Medium",
    steps: [
      "Create a page highlighting what makes your service different and better.",
      "Add a side-by-side feature comparison table.",
      "Include a direct 'Contact Us' or 'Get Quote' button.",
    ],
  },
  {
    id: "act-3",
    category: "ai_citation",
    categoryName: "AI Citation",
    priority: "High",
    iconType: "edit",
    title: "Write content for high-potential keywords",
    oneLiner: "You rank on page 4–20 for some valuable keywords. Create helpful content to move into the top 3 results.",
    impactGain: "+30%",
    impactLabel: "Potential increase in organic traffic",
    timeEstimate: "1 hour",
    difficulty: "Medium",
    steps: [
      "Identify the 3 most searched questions your customers ask.",
      "Add clear, direct answers with bullet points on your service page.",
      "Update your page title to reflect the target service keyword.",
    ],
  },
  {
    id: "act-4",
    category: "ranking",
    categoryName: "Ranking Expansion",
    priority: "High",
    iconType: "chart",
    title: "Refresh key pages to reach Google Page 1",
    oneLiner: "Your main service page ranks #11. Update outdated information and add clear headlines to break into the top 10.",
    impactGain: "+25%",
    impactLabel: "Potential increase in search traffic",
    timeEstimate: "1.5 hours",
    difficulty: "Medium",
    steps: [
      "Update any older dates, pricing, or examples on the page.",
      "Add 2 to 3 photos of your real work or team.",
      "Ensure your primary city or region is included in the page header.",
    ],
  },
  {
    id: "act-5",
    category: "quick_win",
    categoryName: "Quick Win",
    priority: "Critical",
    iconType: "file",
    title: "Add FAQ section to get quoted by ChatGPT",
    oneLiner: "Answer 4 common customer questions on your homepage so AI search engines can quote your website directly.",
    impactGain: "+35%",
    impactLabel: "Potential increase in AI mentions",
    timeEstimate: "45 min",
    difficulty: "Easy",
    steps: [
      "Add a 'Frequently Asked Questions' section near your homepage footer.",
      "Write 4 short, 2-sentence answers to top client questions.",
      "Publish updates so AI crawlers can index the questions.",
    ],
  },
  {
    id: "act-6",
    category: "competitor_gap",
    categoryName: "Competitor Gap",
    priority: "Medium",
    iconType: "edit",
    title: "Publish client reviews and transparent pricing",
    oneLiner: "Display 3 client reviews and starting price ranges to build immediate trust with incoming searchers.",
    impactGain: "+20%",
    impactLabel: "Potential increase in lead quality",
    timeEstimate: "30 min",
    difficulty: "Easy",
    steps: [
      "Add 3 customer testimonials with star ratings to your homepage.",
      "List starting price ranges beside your core service offerings.",
      "Include a call-to-action button for custom quotes.",
    ],
  },
];

export default function NextActionsView() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [addedTasks, setAddedTasks] = useState<Record<string, boolean>>({});
  const [loadingTasks, setLoadingTasks] = useState<Record<string, boolean>>({});
  const [showMore, setShowMore] = useState<boolean>(false);
  const [selectedDetailsOpp, setSelectedDetailsOpp] = useState<ActionItem | null>(null);

  // Filter items
  const filtered = ACTION_ITEMS.filter((opp) => {
    if (activeCategory !== "all" && opp.category !== activeCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        opp.title.toLowerCase().includes(q) ||
        opp.oneLiner.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const displayedOpportunities = showMore ? filtered : filtered.slice(0, 3);

  // Summary counts
  const countQuickWins = ACTION_ITEMS.filter((o) => o.category === "quick_win").length;
  const countCompetitorGaps = ACTION_ITEMS.filter((o) => o.category === "competitor_gap").length;
  const countAICitations = ACTION_ITEMS.filter((o) => o.category === "ai_citation").length;
  const countRanking = ACTION_ITEMS.filter((o) => o.category === "ranking").length;

  const handleAddToBoard = async (opp: ActionItem) => {
    setLoadingTasks((prev) => ({ ...prev, [opp.id]: true }));
    try {
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: "valgrow-labs-001",
          title: opp.title,
          group_name: "content_brief",
          description: `${opp.oneLiner}\n\nEstimated Impact: ${opp.impactGain} (${opp.impactLabel})\nEffort: ${opp.timeEstimate}`,
          impact: opp.priority === "Critical" ? "high" : "medium",
          effort: opp.difficulty === "Easy" ? "low" : "medium",
        }),
      });
      setAddedTasks((prev) => ({ ...prev, [opp.id]: true }));
    } catch {
      setAddedTasks((prev) => ({ ...prev, [opp.id]: true }));
    } finally {
      setLoadingTasks((prev) => ({ ...prev, [opp.id]: false }));
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16 font-sans">
      
      {/* ── 1. HEADER ROW ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200/80 dark:border-orange-800/40 flex items-center justify-center text-[#FF5A1F] shrink-0 shadow-xs">
            <Zap size={24} className="fill-[#FF5A1F]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Instant Visibility Wins
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              The quickest steps to outrank competitors and get recommended by AI.
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/tasks"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF5A1F] hover:bg-[#E04810] text-white text-xs font-bold shadow-xs hover:shadow-md transition-all shrink-0 cursor-pointer"
        >
          <span>Open Action Board</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* ── 2. TOP 4 SUMMARY STAT CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Quick Wins */}
        <div 
          onClick={() => setActiveCategory(activeCategory === "quick_win" ? "all" : "quick_win")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-xs flex items-center gap-3.5 ${
            activeCategory === "quick_win"
              ? "bg-emerald-100/70 dark:bg-emerald-950/40 border-emerald-400 ring-2 ring-emerald-400/20"
              : "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30 hover:border-emerald-300"
          }`}
        >
          <div className="w-11 h-11 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Zap size={20} className="fill-emerald-600 dark:fill-emerald-400 stroke-none" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-foreground">{countQuickWins}</span>
              <span className="text-sm font-bold text-foreground">Quick Wins</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Easy to fix, fast results
            </p>
          </div>
        </div>

        {/* Competitor Gaps */}
        <div 
          onClick={() => setActiveCategory(activeCategory === "competitor_gap" ? "all" : "competitor_gap")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-xs flex items-center gap-3.5 ${
            activeCategory === "competitor_gap"
              ? "bg-rose-100/70 dark:bg-rose-950/40 border-rose-400 ring-2 ring-rose-400/20"
              : "bg-rose-50/60 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30 hover:border-rose-300"
          }`}
        >
          <div className="w-11 h-11 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <BarChart2 size={20} className="stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-foreground">{countCompetitorGaps}</span>
              <span className="text-sm font-bold text-foreground">Competitor Gaps</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Where others are ahead
            </p>
          </div>
        </div>

        {/* AI Citations */}
        <div 
          onClick={() => setActiveCategory(activeCategory === "ai_citation" ? "all" : "ai_citation")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-xs flex items-center gap-3.5 ${
            activeCategory === "ai_citation"
              ? "bg-purple-100/70 dark:bg-purple-950/40 border-purple-400 ring-2 ring-purple-400/20"
              : "bg-purple-50/60 dark:bg-purple-950/20 border-purple-100 dark:border-purple-900/30 hover:border-purple-300"
          }`}
        >
          <div className="w-11 h-11 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Sparkles size={20} className="stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-foreground">{countAICitations}</span>
              <span className="text-sm font-bold text-foreground">AI Citations to Win</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Get your brand mentioned
            </p>
          </div>
        </div>

        {/* Ranking Expansion */}
        <div 
          onClick={() => setActiveCategory(activeCategory === "ranking" ? "all" : "ranking")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-xs flex items-center gap-3.5 ${
            activeCategory === "ranking"
              ? "bg-amber-100/70 dark:bg-amber-950/40 border-amber-400 ring-2 ring-amber-400/20"
              : "bg-amber-50/60 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30 hover:border-amber-300"
          }`}
        >
          <div className="w-11 h-11 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <TrendingUp size={20} className="stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-foreground">{countRanking}</span>
              <span className="text-sm font-bold text-foreground">Ranking Expansion</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              New keyword opportunities
            </p>
          </div>
        </div>

      </div>

      {/* ── 3. FILTER TABS + SEARCH BAR ── */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-1">
        
        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
              activeCategory === "all"
                ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs"
                : "bg-white dark:bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>All Opportunities</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
              activeCategory === "all" ? "bg-white/20 dark:bg-slate-900/20" : "bg-muted"
            }`}>
              {ACTION_ITEMS.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory("quick_win")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
              activeCategory === "quick_win"
                ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs"
                : "bg-white dark:bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <Zap size={13} className="text-emerald-500 fill-emerald-500" />
            <span>Quick Wins</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
              activeCategory === "quick_win" ? "bg-white/20 dark:bg-slate-900/20" : "bg-muted"
            }`}>
              {countQuickWins}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory("competitor_gap")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
              activeCategory === "competitor_gap"
                ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs"
                : "bg-white dark:bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <BarChart2 size={13} className="text-rose-500" />
            <span>Competitor Gaps</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
              activeCategory === "competitor_gap" ? "bg-white/20 dark:bg-slate-900/20" : "bg-muted"
            }`}>
              {countCompetitorGaps}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory("ai_citation")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
              activeCategory === "ai_citation"
                ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs"
                : "bg-white dark:bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles size={13} className="text-purple-500" />
            <span>AI Citations</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
              activeCategory === "ai_citation" ? "bg-white/20 dark:bg-slate-900/20" : "bg-muted"
            }`}>
              {countAICitations}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory("ranking")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
              activeCategory === "ranking"
                ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs"
                : "bg-white dark:bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <TrendingUp size={13} className="text-amber-500" />
            <span>Ranking Expansion</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
              activeCategory === "ranking" ? "bg-white/20 dark:bg-slate-900/20" : "bg-muted"
            }`}>
              {countRanking}
            </span>
          </button>

        </div>

        {/* Search */}
        <div className="relative w-full lg:w-72">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search opportunities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-card border border-border rounded-xl pl-9 pr-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#FF5A1F] transition-colors shadow-xs"
          />
        </div>

      </div>

      {/* ── 4. OPPORTUNITIES ACTION CARDS LIST (Exact match to Reference) ── */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-card border border-border rounded-2xl p-12 text-center shadow-xs space-y-2">
            <Sparkles size={28} className="text-muted-foreground/50 mx-auto" />
            <h3 className="text-sm font-bold text-foreground">No matching opportunities found</h3>
            <p className="text-xs text-muted-foreground">Try selecting a different filter category above.</p>
          </div>
        ) : (
          displayedOpportunities.map((opp) => {
            const isAdded = addedTasks[opp.id];
            const isLoading = loadingTasks[opp.id];

            // Icon styling
            const iconConfig = {
              file: { bg: "bg-rose-50 dark:bg-rose-950/40", text: "text-rose-500", border: "border-rose-100 dark:border-rose-900/40", icon: FileText },
              link: { bg: "bg-rose-50 dark:bg-rose-950/40", text: "text-rose-500", border: "border-rose-100 dark:border-rose-900/40", icon: Link2 },
              edit: { bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-500", border: "border-amber-100 dark:border-amber-900/40", icon: Edit3 },
              chart: { bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-500", border: "border-amber-100 dark:border-amber-900/40", icon: TrendingUp },
            }[opp.iconType] || { bg: "bg-rose-50 dark:bg-rose-950/40", text: "text-rose-500", border: "border-rose-100 dark:border-rose-900/40", icon: FileText };

            const IconComponent = iconConfig.icon;

            // Border color line
            const borderAccent = opp.priority === "Critical"
              ? "border-l-4 border-l-rose-500"
              : "border-l-4 border-l-amber-500";

            return (
              <div
                key={opp.id}
                className={`bg-white dark:bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all ${borderAccent}`}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  
                  {/* Left Column: Icon + Badges + Title + 1-Sentence Description */}
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    
                    {/* Left Icon Box */}
                    <div className={`w-12 h-12 rounded-2xl ${iconConfig.bg} border ${iconConfig.border} flex items-center justify-center shrink-0 mt-0.5`}>
                      <IconComponent size={22} className="stroke-[2.2]" />
                    </div>

                    {/* Middle Info */}
                    <div className="space-y-1.5 min-w-0 flex-1">
                      
                      {/* Top Badges */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {opp.priority === "Critical" ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40">
                            Critical
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40">
                            High
                          </span>
                        )}

                        {opp.category === "quick_win" && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
                            Quick Win
                          </span>
                        )}
                        {opp.category === "competitor_gap" && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40">
                            Competitor Gap
                          </span>
                        )}
                        {opp.category === "ai_citation" && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/40">
                            AI Citation
                          </span>
                        )}
                        {opp.category === "ranking" && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40">
                            Ranking Expansion
                          </span>
                        )}
                      </div>

                      {/* Title (Bold, Crisp) */}
                      <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight leading-snug">
                        {opp.title}
                      </h3>

                      {/* 1 Short Sentence (No wall of text) */}
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {opp.oneLiner}
                      </p>
                    </div>

                  </div>

                  {/* Right Column: Impact + Effort + Action Buttons */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-3.5 shrink-0 w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-border">
                    
                    {/* Stat Box 1: Impact */}
                    <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-xl px-4 py-3 min-w-[145px] text-left">
                      <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-extrabold text-sm sm:text-base">
                        <TrendingUp size={16} className="stroke-[3]" />
                        <span>{opp.impactGain}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                        {opp.impactLabel}
                      </p>
                    </div>

                    {/* Stat Box 2: Effort */}
                    <div className="bg-slate-50 dark:bg-muted/40 border border-border/80 rounded-xl px-4 py-3 min-w-[130px] text-left">
                      <div className="flex items-center gap-1.5 text-foreground font-extrabold text-xs sm:text-sm">
                        <Clock size={15} className="text-blue-500 shrink-0 stroke-[2.5]" />
                        <span>{opp.timeEstimate}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                        Estimated effort
                      </p>
                      <div className="mt-1.5">
                        <span className={`inline-block text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                          opp.difficulty === "Easy" 
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                        }`}>
                          {opp.difficulty}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons: Add to Action Board + View Details */}
                    <div className="flex flex-col gap-2 shrink-0 min-w-[160px] w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => handleAddToBoard(opp)}
                        disabled={isAdded || isLoading}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                          isAdded
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                            : "bg-[#FF5A1F] hover:bg-[#E04810] text-white hover:shadow-md"
                        }`}
                      >
                        {isLoading ? (
                          <span>Adding…</span>
                        ) : isAdded ? (
                          <><Check size={14} className="stroke-[3]" /> Added to Action Board</>
                        ) : (
                          <span>Add to Action Board</span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedDetailsOpp(opp)}
                        className="w-full py-2 px-4 rounded-xl bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-muted border border-border text-foreground text-xs font-bold transition-colors text-center cursor-pointer shadow-2xs"
                      >
                        View Details
                      </button>
                    </div>

                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── 5. "SHOW MORE OPPORTUNITIES" TOGGLE ── */}
      {filtered.length > 3 && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => setShowMore(!showMore)}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white dark:bg-card border border-border hover:border-foreground/30 text-xs font-bold text-foreground transition-all cursor-pointer shadow-xs"
          >
            <span>{showMore ? "Show fewer opportunities" : "Show more opportunities"}</span>
            {showMore ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      )}

      {/* ── 6. VIEW DETAILS MODAL ── */}
      {selectedDetailsOpp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-card border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            
            <div className="flex items-start justify-between gap-4 border-b border-border pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-orange-50 text-[#FF5A1F] border border-orange-200">
                  Action Checklist
                </span>
                <h2 className="text-base sm:text-lg font-bold text-foreground mt-1">
                  {selectedDetailsOpp.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetailsOpp(null)}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-muted-foreground leading-relaxed">
                {selectedDetailsOpp.oneLiner}
              </p>

              <div className="space-y-2 pt-1">
                <h4 className="font-bold text-foreground">Action Steps:</h4>
                {selectedDetailsOpp.steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 bg-slate-50 dark:bg-muted/30 p-2.5 rounded-lg border border-border text-foreground">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-muted/40 border border-border mt-2">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">Effort</span>
                  <span className="font-bold text-foreground">{selectedDetailsOpp.timeEstimate} ({selectedDetailsOpp.difficulty})</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">Expected Impact</span>
                  <span className="font-bold text-emerald-600">{selectedDetailsOpp.impactGain}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedDetailsOpp(null)}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => {
                  handleAddToBoard(selectedDetailsOpp);
                  setSelectedDetailsOpp(null);
                }}
                className="px-5 py-2 rounded-xl bg-[#FF5A1F] hover:bg-[#E04810] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Add to Action Board
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
