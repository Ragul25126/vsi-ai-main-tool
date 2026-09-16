"use client";

import React, { useState, useEffect, useRef } from "react";
import { getCustomClients, ClientItem } from "@/lib/client-store";
import { getFriendlyAuditItem, FriendlyAuditItem } from "../lib/audit-translations";

import SiteAuditHeader from "./SiteAuditHeader";
import WebsiteHealthHero from "./WebsiteHealthHero";
import VisualIssueGrid from "./VisualIssueGrid";
import AuditCategoryGrid from "./AuditCategoryGrid";
import AuditProcessWorkflow from "./AuditProcessWorkflow";
import AuditChecksSection from "./AuditChecksSection";
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
  const [auditItems] = useState<AuditItem[]>(DEFAULT_AUDIT_ITEMS);
  const [isRunningAudit, setIsRunningAudit] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [addedTasks, setAddedTasks] = useState<Set<string>>(new Set());
  const [selectedIssue, setSelectedIssue] = useState<FriendlyAuditItem | null>(null);

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

  // Top 3 priority issues (failed items first, then high-impact warnings)
  const priorityItems = friendlyItems.filter(
    (item) => item.rawItem.status === "fail" || (item.rawItem.status === "warning" && item.rawItem.impact === "high")
  ).slice(0, 3);

  // Health Score Calculation: 100 - (failed * 12) - (warnings * 4)
  const passed = auditItems.filter((i) => i.status === "pass").length;
  const warnings = auditItems.filter((i) => i.status === "warning").length;
  const failed = auditItems.filter((i) => i.status === "fail").length;
  const healthScore = Math.max(0, Math.min(100, Math.round(100 - (failed * 12) - (warnings * 4))));

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
        onViewHistory={handleScrollToReport}
      />

      {/* ── 2. PROMINENT WEBSITE HEALTH HERO ── */}
      <WebsiteHealthHero
        score={70}
        criticalCount={1}
        needsAttentionCount={3}
        passedCount={8}
        lastChecked="Today, 2:30 PM"
        onRunAudit={handleRunAudit}
        onViewReport={handleScrollToReport}
      />

      {/* ── 3. WHAT NEEDS YOUR ATTENTION (VISUAL 3-COLUMN GRID) ── */}
      <VisualIssueGrid
        items={priorityItems}
        addedTasks={addedTasks}
        onSelectIssue={(item) => setSelectedIssue(item)}
        onViewAll={handleScrollToReport}
      />

      {/* ── 4. YOUR WEBSITE AT A GLANCE (COMPACT CATEGORY CARDS) ── */}
      <AuditCategoryGrid
        onSelectCategory={(catId) => {
          setCategoryFilter(catId);
          handleScrollToReport();
        }}
      />

      {/* ── 5. HOW VSI CHECKS YOUR WEBSITE (4-STEP CONNECTED PROCESS) ── */}
      <AuditProcessWorkflow onLearnMore={handleScrollToReport} />

      {/* ── 6. ALL AUDIT CHECKS & TECHNICAL DETAILS (NON-TECHNICAL REDESIGN) ── */}
      <AuditChecksSection
        items={friendlyItems}
        addedTasks={addedTasks}
        healthScore={healthScore}
        failedCount={failed}
        warningCount={warnings}
        passedCount={passed}
        categoryFilter={categoryFilter}
        onClearCategoryFilter={() => setCategoryFilter("all")}
        onSelectIssue={(item) => setSelectedIssue(item)}
        onCreateTask={handleCreateTask}
        onRunAudit={handleRunAudit}
        fullReportRef={fullReportRef}
      />

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
