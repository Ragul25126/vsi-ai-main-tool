"use client";

import React, { useState, useMemo } from "react";
import { 
  Search, 
  FileCheck, 
  ArrowUpDown, 
  ChevronDown, 
  ArrowRight, 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Check, 
  Link2, 
  Gauge, 
  Bot, 
  ShieldCheck, 
  FileText, 
  Sparkles,
  ChevronUp,
  X
} from "lucide-react";
import type { FriendlyAuditItem } from "../lib/audit-translations";

interface AuditChecksSectionProps {
  items: FriendlyAuditItem[];
  addedTasks: Set<string>;
  healthScore: number;
  failedCount: number;
  warningCount: number;
  passedCount: number;
  categoryFilter?: string;
  onClearCategoryFilter?: () => void;
  onSelectIssue: (item: FriendlyAuditItem) => void;
  onCreateTask: (item: FriendlyAuditItem) => void;
  onRunAudit?: () => void;
  fullReportRef?: React.RefObject<HTMLDivElement | null>;
}

type TabFilter = "all" | "issues" | "passed";
type SortOption = "priority" | "impact" | "category" | "name";

function ImpactBars({ level }: { level: "high" | "medium" | "positive" }) {
  if (level === "high") {
    return (
      <div className="flex items-end gap-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true">
        <span className="w-1 h-1.5 bg-rose-500 rounded-[1px]" />
        <span className="w-1 h-2.5 bg-rose-500 rounded-[1px]" />
        <span className="w-1 h-3.5 bg-rose-500 rounded-[1px]" />
      </div>
    );
  }
  if (level === "medium") {
    return (
      <div className="flex items-end gap-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true">
        <span className="w-1 h-1.5 bg-amber-500 rounded-[1px]" />
        <span className="w-1 h-2.5 bg-amber-500 rounded-[1px]" />
        <span className="w-1 h-3.5 bg-amber-200 dark:bg-amber-900/40 rounded-[1px]" />
      </div>
    );
  }
  return (
    <div className="flex items-end gap-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true">
      <span className="w-1 h-1.5 bg-emerald-500 rounded-[1px]" />
      <span className="w-1 h-2.5 bg-emerald-500 rounded-[1px]" />
      <span className="w-1 h-3.5 bg-emerald-500 rounded-[1px]" />
    </div>
  );
}

function getItemIcon(item: FriendlyAuditItem) {
  const title = item.friendlyTitle.toLowerCase();
  const id = item.id.toLowerCase();

  if (title.includes("link") || id.includes("link")) return Link2;
  if (title.includes("speed") || id.includes("speed") || id.includes("perf")) return Gauge;
  if (title.includes("ai") || item.category === "ai_readiness" || id.includes("ai")) return Bot;
  if (title.includes("identity") || title.includes("verified") || title.includes("directory") || id.includes("cite")) return ShieldCheck;
  if (title.includes("directory") || title.includes("sitemap") || title.includes("page")) return FileText;
  
  if (item.rawItem.status === "fail") return AlertCircle;
  if (item.rawItem.status === "warning") return AlertTriangle;
  return CheckCircle2;
}

function getItemImpactDetails(item: FriendlyAuditItem) {
  const isCritical = item.rawItem.status === "fail" || item.priority === "critical";
  const isWarning = item.rawItem.status === "warning";
  const title = item.friendlyTitle.toLowerCase();

  if (isCritical) {
    let summary = "Your website may not appear in search results.";
    if (title.includes("link")) {
      summary = "Visitors may leave your site if they find broken links.";
    } else if (title.includes("page") || title.includes("directory")) {
      summary = "Your website may not appear in search results.";
    }
    return {
      level: "high" as const,
      label: "High",
      labelColor: "text-rose-600 dark:text-rose-400",
      cardBg: "bg-rose-50/70 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30",
      summary,
    };
  }

  if (isWarning) {
    let summary = "Slow pages can make visitors leave your site.";
    if (title.includes("speed")) {
      summary = "Slow pages can make visitors leave your site.";
    } else if (title.includes("title") || title.includes("heading")) {
      summary = "Clear page titles help search engines rank your pages.";
    } else if (title.includes("image") || title.includes("description")) {
      summary = "Missing descriptions make content harder to understand.";
    }
    return {
      level: "medium" as const,
      label: "Medium",
      labelColor: "text-amber-600 dark:text-amber-400",
      cardBg: "bg-amber-50/70 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30",
      summary,
    };
  }

  let summary = "Helps your content appear in AI search results.";
  if (title.includes("identity") || title.includes("verified")) {
    summary = "Builds trust and improves visibility.";
  }
  return {
    level: "positive" as const,
    label: "Positive",
    labelColor: "text-emerald-600 dark:text-emerald-400",
    cardBg: "bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30",
    summary,
  };
}

export default function AuditChecksSection({
  items,
  addedTasks,
  healthScore,
  failedCount,
  warningCount,
  passedCount,
  categoryFilter,
  onClearCategoryFilter,
  onSelectIssue,
  onCreateTask,
  onRunAudit,
  fullReportRef,
}: AuditChecksSectionProps) {
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("priority");
  const [expandedWhyIds, setExpandedWhyIds] = useState<Set<string>>(new Set());

  const toggleWhy = (id: string) => {
    setExpandedWhyIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const issuesCount = failedCount + warningCount;

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    // Filter by category if passed from grid
    if (categoryFilter && categoryFilter !== "all") {
      if (categoryFilter === "technical") {
        result = result.filter((item) => item.category === "technical");
      } else if (categoryFilter === "content") {
        result = result.filter((item) => item.category === "on_page");
      } else if (categoryFilter === "ai_readiness") {
        result = result.filter((item) => item.category === "ai_readiness");
      } else if (categoryFilter === "visibility") {
        result = result.filter((item) => item.id === "page-2" || item.category === "on_page");
      } else if (categoryFilter === "citations") {
        result = result.filter((item) => item.category === "citations");
      }
    }

    // Filter by tab
    if (activeTab === "issues") {
      result = result.filter((item) => item.rawItem.status === "fail" || item.rawItem.status === "warning");
    } else if (activeTab === "passed") {
      result = result.filter((item) => item.rawItem.status === "pass");
    }

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((item) =>
        item.friendlyTitle.toLowerCase().includes(q) ||
        item.shortExplanation.toLowerCase().includes(q) ||
        item.whyItMatters.toLowerCase().includes(q) ||
        item.rawItem.title.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "priority") {
        const scoreA = a.rawItem.status === "fail" ? 3 : a.rawItem.status === "warning" ? 2 : 1;
        const scoreB = b.rawItem.status === "fail" ? 3 : b.rawItem.status === "warning" ? 2 : 1;
        return scoreB - scoreA;
      }
      if (sortBy === "impact") {
        const impactScore = (item: FriendlyAuditItem) =>
          item.rawItem.impact === "high" ? 3 : item.rawItem.impact === "medium" ? 2 : 1;
        return impactScore(b) - impactScore(a);
      }
      if (sortBy === "name") {
        return a.friendlyTitle.localeCompare(b.friendlyTitle);
      }
      return 0;
    });

    return result;
  }, [items, categoryFilter, activeTab, searchQuery, sortBy]);

  return (
    <div ref={fullReportRef} className="space-y-6 pt-6 border-t border-border/70">
      
      {/* ── 1. SECTION HEADER (Matching Reference) ── */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 mt-0.5 shadow-2xs">
            <FileCheck size={20} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              Website Audit Results
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 leading-relaxed">
              We checked your website and found what&apos;s working well and what can be improved.
            </p>
          </div>
        </div>

        {/* Right: Search Box + Lightbulb Explainer Tip */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-60">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search checks..."
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-card border border-border/80 focus:border-[#FF5A1F] focus:outline-hidden text-foreground placeholder:text-muted-foreground/70 shadow-2xs transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-foreground shrink-0 shadow-2xs">
            <span className="text-sm">💡</span>
            <div className="leading-tight">
              <p className="text-[11px] font-bold text-foreground">Not sure what this means?</p>
              <p className="text-[10px] text-muted-foreground">Each check has a simple explanation and clear steps to fix it.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. FILTER PILLS (All Checks / Issues to Fix / Working Well) ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        {/* All Checks Pill */}
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === "all"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-white dark:bg-card border border-border/80 text-foreground hover:bg-muted/60"
          }`}
        >
          <FileText size={14} />
          <span>All Checks</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
            activeTab === "all" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
          }`}>
            {items.length}
          </span>
        </button>

        {/* Issues to Fix Pill */}
        <button
          type="button"
          onClick={() => setActiveTab("issues")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === "issues"
              ? "bg-rose-500 text-white shadow-xs"
              : "bg-white dark:bg-card border border-border/80 text-foreground hover:border-rose-300"
          }`}
        >
          <AlertCircle size={14} className={activeTab === "issues" ? "text-white" : "text-rose-500"} />
          <span>Issues to Fix</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
            activeTab === "issues" ? "bg-white/20 text-white" : "bg-rose-500/10 text-rose-600"
          }`}>
            {issuesCount}
          </span>
        </button>

        {/* Working Well Pill */}
        <button
          type="button"
          onClick={() => setActiveTab("passed")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === "passed"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-white dark:bg-card border border-border/80 text-foreground hover:border-emerald-300"
          }`}
        >
          <CheckCircle2 size={14} className={activeTab === "passed" ? "text-white" : "text-emerald-500"} />
          <span>Working Well</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
            activeTab === "passed" ? "bg-white/20 text-white" : "bg-emerald-500/10 text-emerald-600"
          }`}>
            {passedCount}
          </span>
        </button>

        {/* Active Category Filter Tag if selected */}
        {categoryFilter && categoryFilter !== "all" && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#FF5A1F]/10 text-[#FF5A1F] border border-[#FF5A1F]/20 shrink-0">
            <span className="capitalize">{categoryFilter.replace("_", " ")}</span>
            {onClearCategoryFilter && (
              <button
                type="button"
                onClick={onClearCategoryFilter}
                className="hover:opacity-75 cursor-pointer ml-1"
                aria-label="Clear category filter"
              >
                <X size={12} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── 3. FOUR METRIC SUMMARY CARDS (Matching Reference) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Card 1: Total Checks */}
        <div className="bg-white dark:bg-card border border-border/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <FileText size={18} />
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black text-foreground tracking-tight block">
                {items.length}
              </span>
              <p className="text-xs font-bold text-foreground leading-none">
                Total checks
              </p>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground leading-snug">
            We analyzed your website across important areas.
          </p>
        </div>

        {/* Card 2: Need Attention */}
        <div className="bg-[#FFF5F5] dark:bg-rose-950/15 border border-rose-100 dark:border-rose-900/30 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-500/15 border border-rose-500/25 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
              <AlertCircle size={18} />
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black text-rose-500 tracking-tight block">
                {issuesCount}
              </span>
              <p className="text-xs font-bold text-foreground leading-none">
                Need attention
              </p>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground leading-snug">
            These issues may affect your visibility or user experience.
          </p>
        </div>

        {/* Card 3: Working Well */}
        <div className="bg-[#F2FBF6] dark:bg-emerald-950/15 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight block">
                {passedCount}
              </span>
              <p className="text-xs font-bold text-foreground leading-none">
                Working well
              </p>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground leading-snug">
            Great! These are properly set up.
          </p>
        </div>

        {/* Card 4: Overall Health */}
        <div className="bg-white dark:bg-card border border-border/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
              <Sparkles size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400 tracking-tight">
                  {healthScore}%
                </span>
                <span className="text-[10px] font-bold text-muted-foreground">Overall health</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-muted h-2 rounded-full overflow-hidden mt-1">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500" 
                  style={{ width: `${healthScore}%` }} 
                />
              </div>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground leading-snug">
            {healthScore >= 80 
              ? "Your website is in great shape with strong visibility foundation." 
              : "Your website is good, but there's room for improvement."}
          </p>
        </div>

      </div>

      {/* ── 4. LIST TITLE & SORT CONTROLS ── */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <div>
          <h3 className="text-lg sm:text-xl font-black text-foreground tracking-tight">
            All Audit Checks
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Here are all the checks we performed. Each item tells you what we found and how to improve it.
          </p>
        </div>

        {/* Sort Selector */}
        <div className="relative shrink-0">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="appearance-none pl-7 pr-8 py-1.5 text-xs font-bold rounded-xl bg-card border border-border/80 text-foreground cursor-pointer focus:outline-hidden focus:border-[#FF5A1F] shadow-2xs"
          >
            <option value="priority">Sort by: Priority</option>
            <option value="impact">Sort by: Impact</option>
            <option value="name">Sort by: Name</option>
          </select>
          <ArrowUpDown size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* ── 5. CHECK ROWS / CARDS (Matching Reference Layout) ── */}
      <div className="space-y-3.5">
        {filteredAndSortedItems.map((item) => {
          const isPassed = item.rawItem.status === "pass";
          const isCritical = item.priority === "critical" || item.rawItem.status === "fail";
          const isWarning = item.rawItem.status === "warning";
          const isAdded = addedTasks.has(item.id);
          const isWhyExpanded = expandedWhyIds.has(item.id);

          const ItemIcon = getItemIcon(item);
          const impact = getItemImpactDetails(item);

          return (
            <div
              key={item.id}
              className={`p-5 sm:p-6 rounded-2xl bg-white dark:bg-card border transition-all shadow-xs hover:shadow-sm space-y-4 ${
                isCritical
                  ? "border-rose-200/80 dark:border-rose-900/40"
                  : isWarning
                  ? "border-amber-200/80 dark:border-amber-900/40"
                  : "border-border/80"
              }`}
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                
                {/* ── Left Area: Icon + Badge + Title + Description + Why link ── */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  {/* Large Rounded Icon Badge */}
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs mt-0.5 ${
                    isCritical
                      ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                      : isWarning
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  }`}>
                    <ItemIcon size={22} />
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    {/* Status Badge */}
                    <div>
                      {isCritical && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                          <AlertCircle size={10} />
                          <span>Critical Impact</span>
                        </span>
                      )}
                      {isWarning && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                          <AlertTriangle size={10} />
                          <span>Needs Improvement</span>
                        </span>
                      )}
                      {isPassed && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 size={10} />
                          <span>Working Well</span>
                        </span>
                      )}
                    </div>

                    {/* Friendly Title */}
                    <h4 className="text-base font-extrabold text-foreground tracking-tight">
                      {item.friendlyTitle}
                    </h4>

                    {/* Simple Plain-English Explanation */}
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
                      {item.shortExplanation}
                    </p>

                    {/* Why this matters toggle link */}
                    <div className="pt-0.5">
                      <button
                        type="button"
                        onClick={() => toggleWhy(item.id)}
                        className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <HelpCircle size={12} />
                        <span>Why this matters?</span>
                        {isWhyExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── Middle Area: Impact Card ── */}
                <div className={`w-full lg:w-60 shrink-0 rounded-2xl p-3.5 border shadow-2xs ${impact.cardBg}`}>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Impact
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <ImpactBars level={impact.level} />
                    <span className={`text-xs font-extrabold ${impact.labelColor}`}>
                      {impact.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug mt-1">
                    {impact.summary}
                  </p>
                </div>

                {/* ── Right Area: Action CTA Buttons & Link ── */}
                <div className="flex flex-col items-stretch sm:items-end justify-center gap-2 shrink-0 w-full lg:w-auto min-w-[170px]">
                  {!isPassed ? (
                    <button
                      type="button"
                      onClick={() => onCreateTask(item)}
                      disabled={isAdded}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer text-center flex items-center justify-center gap-2 w-full sm:w-auto ${
                        isAdded
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                          : isCritical
                          ? "bg-[#FF5A1F] hover:bg-[#E04810] text-white"
                          : "bg-amber-500 hover:bg-amber-600 text-white"
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check size={14} />
                          <span>Task Added ✓</span>
                        </>
                      ) : (
                        <span>{isCritical ? "Fix this issue" : "Improve issue"}</span>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onSelectIssue(item)}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-card border border-border/80 hover:bg-muted/60 text-foreground transition-all shadow-xs cursor-pointer text-center flex items-center justify-center gap-1.5 w-full sm:w-auto"
                    >
                      <span>View details</span>
                      <ArrowRight size={13} />
                    </button>
                  )}

                  {/* Secondary Link: See affected pages */}
                  <button
                    type="button"
                    onClick={() => onSelectIssue(item)}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-center sm:justify-end gap-1 cursor-pointer transition-colors"
                  >
                    <span>See affected pages ({item.affectedPages.length || 3})</span>
                    <ArrowRight size={12} />
                  </button>
                </div>

              </div>

              {/* ── Expandable "Why this matters" Plain-English Box ── */}
              {isWhyExpanded && (
                <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 text-xs space-y-2 animate-fadeIn">
                  <div>
                    <span className="font-bold text-blue-900 dark:text-blue-300 block mb-0.5">
                      Why this matters for your website:
                    </span>
                    <p className="text-muted-foreground leading-relaxed">
                      {item.whyItMatters}
                    </p>
                  </div>
                  <div className="pt-1.5 border-t border-blue-200/50 dark:border-blue-900/40 flex items-center justify-between gap-3 flex-wrap">
                    <p className="text-muted-foreground">
                      <strong className="text-foreground">Recommended next step: </strong>
                      {item.whatToDoNext}
                    </p>
                    <button
                      type="button"
                      onClick={() => onSelectIssue(item)}
                      className="text-xs font-bold text-[#FF5A1F] hover:underline cursor-pointer"
                    >
                      View full details & pages →
                    </button>
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* ── 6. BOTTOM "WANT TO IMPROVE YOUR SCORE?" CTA BANNER (Matching Reference) ── */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50/60 to-purple-50/40 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 border border-blue-200/80 dark:border-blue-900/40 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white dark:bg-card border border-blue-200/70 dark:border-blue-800/40 flex items-center justify-center text-blue-600 shrink-0 shadow-xs">
            <FileCheck size={22} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-base font-black text-foreground tracking-tight">
              Want to improve your score?
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
              Fix the critical and important issues to get better visibility on Google and AI search tools.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRunAudit}
          className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer shrink-0"
        >
          <Sparkles size={14} />
          <span>Create Action Plan</span>
          <ArrowRight size={13} />
        </button>
      </div>

    </div>
  );
}
