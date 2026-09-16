"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  AlertTriangle, AlertCircle, CheckCircle2, 
  Search, Plus, Check, Code2, ChevronDown, ChevronUp
} from "lucide-react";
import { getCustomClients, ClientItem } from "@/lib/client-store";
import { getFriendlyAuditItem, FriendlyAuditItem } from "../lib/audit-translations";

import SiteAuditHeader from "./SiteAuditHeader";
import WebsiteHealthHero from "./WebsiteHealthHero";
import VisualIssueGrid from "./VisualIssueGrid";
import AuditCategoryGrid from "./AuditCategoryGrid";
import AuditProcessWorkflow from "./AuditProcessWorkflow";
import IssueDetailDrawer from "./IssueDetailDrawer";
import AuditProgressModal from "./AuditProgressModal";
import EmptyAuditState from "./EmptyAuditState";

export interface AuditItem {
  id: string;
  category: "technical" | "ai_readiness" | "on_page" | "citations";
  title: string;
  impact: "high" | "medium" | "low";
  status: "pass" | "warning" | "fail";
  details: string;
  recommendation: string;
}

export const DEFAULT_AUDIT_ITEMS: AuditItem[] = [
  // ── Technical SEO ──
  {
    id: "tech-1",
    category: "technical",
    title: "AI Crawlers Permitted in robots.txt",
    impact: "high",
    status: "pass",
    details: "GPTBot, ClaudeBot, Google-Extended, and PerplexityBot are explicitly permitted without wildcard disallow blocking.",
    recommendation: "Ensure robots.txt maintains User-agent: GPTBot and User-agent: Google-Extended rules set to Allow: /.",
  },
  {
    id: "tech-2",
    category: "technical",
    title: "Dead Ends & Broken Internal Links",
    impact: "high",
    status: "fail",
    details: "3 crawled internal URLs return HTTP 404 (Not Found) or 500 server errors, leaking crawl equity.",
    recommendation: "Implement 301 permanent redirects to relevant canonical destinations or remove dead internal links.",
  },
  {
    id: "tech-3",
    category: "technical",
    title: "Core Web Vitals & TTFB Performance",
    impact: "medium",
    status: "warning",
    details: "Time to First Byte (TTFB) is 380ms (target <200ms). LCP on mobile measures 2.6s (target <2.5s).",
    recommendation: "Enable edge caching via CDN and optimize hero image preloading using <link rel='preload'>.",
  },
  {
    id: "tech-4",
    category: "technical",
    title: "Broken Internal Links & Redirect Chains",
    impact: "high",
    status: "fail",
    details: "3 internal links pointing to deprecated /features/v1 URLs result in 301 redirect chains.",
    recommendation: "Update internal href links across the navigation and footer to point directly to current target paths.",
  },

  // ── AI Search Readiness ──
  {
    id: "ai-1",
    category: "ai_readiness",
    title: "Schema.org Organization & WebSite JSON-LD",
    impact: "high",
    status: "pass",
    details: "Structured schema is present in <head> containing name, url, logo, and sameAs social profile entity links.",
    recommendation: "Add 'knowsAbout' array to Organization schema detailing proprietary expertise domains.",
  },
  {
    id: "ai-2",
    category: "ai_readiness",
    title: "FAQPage Structured Data for AI Overview Snippets",
    impact: "high",
    status: "fail",
    details: "High-value commercial landing pages lack structured FAQPage schema, reducing chances of AI direct answering.",
    recommendation: "Implement JSON-LD FAQ schema for top 5 commercial landing pages with concise question-and-answer pairs.",
  },
  {
    id: "ai-3",
    category: "ai_readiness",
    title: "Information Gain & Direct Quotability",
    impact: "medium",
    status: "warning",
    details: "Content density is solid, but definition paragraphs exceed 75 words, making sentence-level LLM extraction difficult.",
    recommendation: "Front-load primary answer blocks: place a 40-50 word definition paragraph directly under each H2 topic query.",
  },
  {
    id: "ai-4",
    category: "ai_readiness",
    title: "Author Persona & E-E-A-T Credential Anchors",
    impact: "medium",
    status: "pass",
    details: "Articles feature verified author bylines with linked LinkedIn profiles and verified editorial review notices.",
    recommendation: "Add Person schema with verified external publisher citations to author profile pages.",
  },

  // ── On-Page & Semantic ──
  {
    id: "page-1",
    category: "on_page",
    title: "Semantic Heading Hierarchy (Single H1)",
    impact: "high",
    status: "pass",
    details: "All indexed pages contain exactly one H1 element followed by logical, descending H2 and H3 structures.",
    recommendation: "Maintain semantic nesting and avoid using heading tags solely for typographic styling.",
  },
  {
    id: "page-2",
    category: "on_page",
    title: "Meta Titles & Descriptions Optimization",
    impact: "medium",
    status: "warning",
    details: "4 blog posts have meta descriptions under 90 characters, leaving search snippet real-estate underutilized.",
    recommendation: "Expand short descriptions to 145-155 characters, incorporating secondary search query entities.",
  },
  {
    id: "page-3",
    category: "on_page",
    title: "Descriptive Image Alt Attributes",
    impact: "low",
    status: "pass",
    details: "All content images feature contextual alt descriptions supporting semantic search indexing.",
    recommendation: "Ensure newly generated infographics include descriptive captions alongside alt text.",
  },

  // ── Citations & Authority ──
  {
    id: "cite-1",
    category: "citations",
    title: "Open Graph & Social Card Meta Verification",
    impact: "medium",
    status: "pass",
    details: "og:title, og:image (1200x630), og:description, and twitter:card tags are fully rendered.",
    recommendation: "Test social sharing previews periodically on LinkedIn and X/Twitter post inspectors.",
  },
  {
    id: "cite-2",
    category: "citations",
    title: "Brand Citation Profile Across Industry Directories",
    impact: "high",
    status: "warning",
    details: "Brand is listed on G2 and Capterra, but NAP (Name, Address, Phone) data has slight discrepancy on Crunchbase.",
    recommendation: "Standardize legal entity name and official domain URL across all external business directory listings.",
  },
];

export default function SiteAuditView() {
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [auditItems] = useState<AuditItem[]>(DEFAULT_AUDIT_ITEMS);
  const [isRunningAudit, setIsRunningAudit] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [addedTasks, setAddedTasks] = useState<Set<string>>(new Set());
  const [selectedIssue, setSelectedIssue] = useState<FriendlyAuditItem | null>(null);
  const [expandedTechIds, setExpandedTechIds] = useState<Set<string>>(new Set());

  const fullReportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = getCustomClients();
    const frame = requestAnimationFrame(() => {
      setClients(list);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  // Active Client
  const activeClient = clients[0];
  const clientName = activeClient?.name || "ValGrow Labs";
  const clientWebsite = activeClient?.website || "valgrow.com";

  // Map to Friendly items
  const friendlyItems: FriendlyAuditItem[] = auditItems.map(getFriendlyAuditItem);

  // Top 4 priority issues (failed items first, then high-impact warnings)
  const priorityItems = friendlyItems.filter(
    (item) => item.rawItem.status === "fail" || (item.rawItem.status === "warning" && item.rawItem.impact === "high")
  ).slice(0, 4);

  // Health Score Calculation: 100 - (failed * 12) - (warnings * 4)
  const passed = auditItems.filter((i) => i.status === "pass").length;
  const warnings = auditItems.filter((i) => i.status === "warning").length;
  const failed = auditItems.filter((i) => i.status === "fail").length;
  const healthScore = Math.max(0, Math.min(100, Math.round(100 - (failed * 12) - (warnings * 4))));

  // Filtered items for Full Report list
  const filteredReportItems = friendlyItems.filter((item) => {
    if (categoryFilter !== "all") {
      if (categoryFilter === "technical" && item.category !== "technical") return false;
      if (categoryFilter === "content" && item.category !== "on_page") return false;
      if (categoryFilter === "ai_readiness" && item.category !== "ai_readiness") return false;
      if (categoryFilter === "visibility" && item.id !== "page-2") return false;
      if (categoryFilter === "citations" && item.category !== "citations") return false;
    }

    if (statusFilter !== "all" && item.rawItem.status !== statusFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.friendlyTitle.toLowerCase().includes(q) ||
        item.shortExplanation.toLowerCase().includes(q) ||
        item.whyItMatters.toLowerCase().includes(q) ||
        item.rawItem.title.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Re-run Audit flow with animated modal
  const handleRunAudit = () => {
    setIsRunningAudit(true);
    setShowProgressModal(true);
  };

  const handleCloseProgressModal = () => {
    setShowProgressModal(false);
    setIsRunningAudit(false);
  };

  const handleScrollToReport = () => {
    fullReportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Convert failed/warning item to task
  async function handleCreateTask(item: FriendlyAuditItem) {
    try {
      const clientId = clients[0]?.id || "valgrow-labs-001";
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          title: `[Site Audit] ${item.friendlyTitle}`,
          group_name: item.category === "technical" ? "technical_seo" : "on_page_seo",
          description: `What we found:\n${item.shortExplanation}\n\nWhy it matters:\n${item.whyItMatters}\n\nWhat to do:\n${item.whatToDoNext}\n\nSource: Site Audit (${item.rawItem.title} - ${item.id})`,
          impact: item.rawItem.impact,
          effort: item.rawItem.impact === "high" ? "medium" : "low",
        }),
      });
      setAddedTasks((prev) => new Set([...prev, item.id]));
    } catch {
      setAddedTasks((prev) => new Set([...prev, item.id]));
    }
  }

  const toggleTechnicalDetail = (id: string) => {
    setExpandedTechIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (auditItems.length === 0) {
    return <EmptyAuditState onRunFirstAudit={handleRunAudit} />;
  }

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      
      {/* ── 1. COMPACT AUDIT HEADER ── */}
      <SiteAuditHeader
        clientName={clientName}
        clientWebsite={clientWebsite}
        lastChecked="Today, 2:30 PM"
        isRunning={isRunningAudit}
        onRunAudit={handleRunAudit}
      />

      {/* ── 2. PROMINENT WEBSITE HEALTH HERO ── */}
      <WebsiteHealthHero
        score={healthScore}
        criticalCount={failed}
        needsAttentionCount={warnings}
        passedCount={passed}
        lastChecked="Today, 2:30 PM"
        onRunAudit={handleRunAudit}
        onViewReport={handleScrollToReport}
      />

      {/* ── 3. WHAT NEEDS YOUR ATTENTION (VISUAL 2-COLUMN GRID) ── */}
      <VisualIssueGrid
        items={priorityItems}
        addedTasks={addedTasks}
        onSelectIssue={(item) => setSelectedIssue(item)}
      />

      {/* ── 4. YOUR WEBSITE AT A GLANCE (COMPACT CATEGORY CARDS) ── */}
      <AuditCategoryGrid
        onSelectCategory={(catId) => {
          setCategoryFilter(catId);
          handleScrollToReport();
        }}
      />

      {/* ── 5. HOW VSI CHECKS YOUR WEBSITE (4-STEP CONNECTED PROCESS) ── */}
      <AuditProcessWorkflow />

      {/* ── 6. FULL REPORT & AUDIT DETAILS SECTION ── */}
      <div ref={fullReportRef} className="space-y-4 pt-4 border-t border-border/80">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-foreground tracking-tight">
              All Audit Checks & Technical Details
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Review all verified checks or filter by severity and category.
            </p>
          </div>

          {/* Quick Filter Buttons & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search checks..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-card border border-border/80 focus:border-[#FF5A1F] focus:outline-hidden text-foreground w-full sm:w-44"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {[
                { id: "all", label: "All Checks", count: friendlyItems.length },
                { id: "fail", label: "Critical", count: failed },
                { id: "warning", label: "Needs Attention", count: warnings },
                { id: "pass", label: "Passed", count: passed },
              ].map((tab) => {
                const active = statusFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStatusFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                      active
                        ? "bg-[#FF5A1F] text-white shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                      active ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Detailed Item List */}
        <div className="space-y-3">
          {filteredReportItems.map((item) => {
            const isPassed = item.rawItem.status === "pass";
            const isCritical = item.priority === "critical" || item.rawItem.status === "fail";
            const isWarning = item.rawItem.status === "warning";
            const isAdded = addedTasks.has(item.id);
            const isTechExpanded = expandedTechIds.has(item.id);

            return (
              <div
                key={item.id}
                className={`p-5 rounded-2xl bg-white dark:bg-card border transition-all shadow-xs space-y-3 ${
                  isCritical
                    ? "border-rose-200/80 dark:border-rose-900/40"
                    : isWarning
                    ? "border-amber-200/80 dark:border-amber-900/40"
                    : "border-border/70"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                        isCritical
                          ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                          : isWarning
                          ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                          : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                      }`}
                    >
                      {isCritical ? <AlertCircle size={11} /> : isWarning ? <AlertTriangle size={11} /> : <CheckCircle2 size={11} />}
                      <span>{item.priorityLabel}</span>
                    </span>

                    <span className="text-[11px] font-semibold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                      {item.friendlyCategory}
                    </span>

                    <h4 className="text-sm font-bold text-foreground">
                      {item.friendlyTitle}
                    </h4>
                  </div>

                  {!isPassed && (
                    <button
                      type="button"
                      onClick={() => handleCreateTask(item)}
                      disabled={isAdded}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs ${
                        isAdded
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30"
                          : "bg-[#FF5A1F] hover:bg-[#E04810] text-white"
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check size={13} />
                          <span>Task Created</span>
                        </>
                      ) : (
                        <>
                          <Plus size={13} />
                          <span>Create Task</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.shortExplanation}
                </p>

                {/* Sub-actions: View Drawer + Collapsible Technical Telemetry */}
                <div className="pt-2 border-t border-border/60 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedIssue(item)}
                    className="text-xs text-[#FF5A1F] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>View affected pages & recommendations →</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleTechnicalDetail(item.id)}
                    className="text-[11px] text-muted-foreground hover:text-foreground font-medium flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Code2 size={12} className="text-muted-foreground/70" />
                    <span>Advanced technical details</span>
                    {isTechExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                </div>

                {isTechExpanded && (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-2 font-sans animate-fadeIn">
                    <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground pb-1 border-b border-border/60">
                      <span>CHECK: {item.rawItem.title}</span>
                      <span className="bg-muted px-1.5 py-0.5 rounded font-bold">[{item.id}]</span>
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        <strong className="text-foreground">Observed crawler state: </strong>
                        {item.rawItem.details}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        <strong className="text-[#FF5A1F]">Developer remediation plan: </strong>
                        {item.rawItem.recommendation}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 7. SLIDE-OVER ISSUE DETAIL DRAWER ── */}
      <IssueDetailDrawer
        item={selectedIssue}
        isOpen={!!selectedIssue}
        isTaskAdded={selectedIssue ? addedTasks.has(selectedIssue.id) : false}
        onClose={() => setSelectedIssue(null)}
        onCreateTask={handleCreateTask}
      />

      {/* ── 8. ANIMATED RUN AUDIT PROGRESS MODAL ── */}
      <AuditProgressModal
        isOpen={showProgressModal}
        score={healthScore}
        criticalCount={failed}
        needsAttentionCount={warnings}
        passedCount={passed}
        onClose={handleCloseProgressModal}
      />

    </div>
  );
}
