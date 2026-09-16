"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, AlertTriangle, AlertCircle, CheckCircle2, RefreshCw, 
  Search, Filter, Plus, ArrowRight, ExternalLink, Loader2, 
  Check, Globe, Cpu, FileText, Share2, Layers, Zap
} from "lucide-react";
import { getCustomClients, ClientItem } from "@/lib/client-store";
import { getFriendlyAuditItem, FriendlyAuditItem } from "../lib/audit-translations";

import AuditHeader from "./AuditHeader";
import HealthScoreCard from "./HealthScoreCard";
import AuditSummaryPillars from "./AuditSummaryPillars";
import TopPrioritiesSection from "./TopPrioritiesSection";
import CategoryHealthOverview from "./CategoryHealthOverview";
import AuditIssueCard from "./AuditIssueCard";
import AffectedPagesModal from "./AffectedPagesModal";
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
    title: "XML Sitemap Valid & Accessible",
    impact: "high",
    status: "pass",
    details: "Sitemap index located at /sitemap.xml returns HTTP 200 with clean, canonicalized URLs.",
    recommendation: "Ensure all new blog posts and service landing pages are automatically pinged to search engines upon publication.",
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
  const [selectedClientId, setSelectedClientId] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [auditItems, setAuditItems] = useState<AuditItem[]>(DEFAULT_AUDIT_ITEMS);
  const [isRunningAudit, setIsRunningAudit] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [addedTasks, setAddedTasks] = useState<Set<string>>(new Set());
  const [selectedAffectedItem, setSelectedAffectedItem] = useState<FriendlyAuditItem | null>(null);

  useEffect(() => {
    const list = getCustomClients();
    setClients(list);
  }, []);

  // Compute Active Client Context
  const activeClient = clients.find((c) => c.id === selectedClientId) || clients[0];
  const clientName = activeClient?.name || "ValGrow Labs";
  const clientWebsite = activeClient?.website || "valgrow.com";

  // Map raw items to Friendly items
  const friendlyItems: FriendlyAuditItem[] = auditItems.map(getFriendlyAuditItem);

  // Top priorities: failed items + high-impact warnings (limit to 4)
  const priorityItems = friendlyItems.filter(
    (item) => item.rawItem.status === "fail" || (item.rawItem.status === "warning" && item.rawItem.impact === "high")
  ).slice(0, 4);

  // Health Score Calculation: 100 - (failed * 12) - (warnings * 4)
  const total = auditItems.length;
  const passed = auditItems.filter((i) => i.status === "pass").length;
  const warnings = auditItems.filter((i) => i.status === "warning").length;
  const failed = auditItems.filter((i) => i.status === "fail").length;
  const healthScore = Math.max(0, Math.min(100, Math.round(100 - (failed * 12) - (warnings * 4))));

  // Filter items for Issue Browser
  const filteredItems = friendlyItems.filter((item) => {
    // Category mapping:
    if (categoryFilter !== "all") {
      if (categoryFilter === "technical" && item.category !== "technical") return false;
      if (categoryFilter === "content" && item.category !== "on_page") return false;
      if (categoryFilter === "ai_readiness" && item.category !== "ai_readiness") return false;
      if (categoryFilter === "visibility" && item.id !== "page-2") return false;
      if (categoryFilter === "citations" && item.category !== "citations") return false;
    }

    // Status filter
    if (statusFilter !== "all" && item.rawItem.status !== statusFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.friendlyTitle.toLowerCase().includes(q) ||
        item.whyItMatters.toLowerCase().includes(q) ||
        item.whatToDoNext.toLowerCase().includes(q) ||
        item.affectedPages.some((p) => p.toLowerCase().includes(q)) ||
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

  // Convert failed/warning item to task
  async function handleCreateTask(item: FriendlyAuditItem) {
    try {
      const clientId = selectedClientId !== "all" ? selectedClientId : (clients[0]?.id || "valgrow-labs-001");
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          title: `[Site Audit] ${item.friendlyTitle}`,
          group_name: item.category === "technical" ? "technical_seo" : "on_page_seo",
          description: `Friendly Diagnosis:\n${item.whyItMatters}\n\nRecommended Action:\n${item.whatToDoNext}\n\nTechnical Reference: ${item.rawItem.title} (${item.id})`,
          impact: item.rawItem.impact,
          effort: item.rawItem.impact === "high" ? "medium" : "low",
        }),
      });
      setAddedTasks((prev) => new Set([...prev, item.id]));
    } catch {
      setAddedTasks((prev) => new Set([...prev, item.id]));
    }
  }

  // Toggle item status directly (for QA / interactive demo)
  const toggleStatus = (id: string) => {
    setAuditItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus = item.status === "pass" ? "warning" : item.status === "warning" ? "fail" : "pass";
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
  };

  if (auditItems.length === 0) {
    return <EmptyAuditState onRunFirstAudit={handleRunAudit} />;
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      
      {/* ── 1. COMPACT AUDIT HEADER ── */}
      <AuditHeader
        clientName={clientName}
        clientWebsite={clientWebsite}
        lastChecked="Today, 2:30 PM"
        isRunning={isRunningAudit}
        onRunAudit={handleRunAudit}
      />

      {/* ── 2. PROMINENT HEALTH SCORE CARD ── */}
      <HealthScoreCard
        score={healthScore}
        criticalCount={failed}
        needsWorkCount={warnings}
        lastAudit="Today"
      />

      {/* ── 3. AT-A-GLANCE SUMMARY PILLARS ── */}
      <AuditSummaryPillars
        passedCount={passed}
        needsAttentionCount={warnings}
        criticalCount={failed}
        activeFilter={statusFilter}
        onSelectFilter={(f) => setStatusFilter(f)}
      />

      {/* ── 4. WHAT NEEDS YOUR ATTENTION (TOP PRIORITIES) ── */}
      <TopPrioritiesSection
        priorityItems={priorityItems}
        addedTasks={addedTasks}
        onCreateTask={handleCreateTask}
        onViewPages={(item) => setSelectedAffectedItem(item)}
      />

      {/* ── 5. WEBSITE HEALTH BY CATEGORY ── */}
      <CategoryHealthOverview
        items={friendlyItems}
        activeCategory={categoryFilter}
        onSelectCategory={(cat) => setCategoryFilter(cat)}
      />

      {/* ── 6. ALL CHECKS & ISSUE BROWSER ── */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-card border border-border/80 rounded-2xl p-3.5 shadow-xs">
          
          {/* Status Tab Pills */}
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

          {/* Search Box */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search checks or pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-muted/40 border border-border rounded-xl pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/30 focus:border-[#FF5A1F] transition-all font-medium"
            />
          </div>
        </div>

        {/* Issue Cards Grid/List */}
        <div className="space-y-3">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <AuditIssueCard
                key={item.id}
                item={item}
                isAdded={addedTasks.has(item.id)}
                onCreateTask={handleCreateTask}
                onViewPages={(it) => setSelectedAffectedItem(it)}
                onToggleStatus={toggleStatus}
              />
            ))
          ) : (
            <div className="p-8 text-center bg-white dark:bg-card border border-border/80 rounded-2xl text-xs text-muted-foreground">
              No audit checks match your selected filter criteria.
            </div>
          )}
        </div>
      </div>

      {/* ── AFFECTED PAGES MODAL / DRAWER ── */}
      <AffectedPagesModal
        item={selectedAffectedItem}
        isOpen={!!selectedAffectedItem}
        onClose={() => setSelectedAffectedItem(null)}
      />

      {/* ── RUN AUDIT PROGRESS MODAL ── */}
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
