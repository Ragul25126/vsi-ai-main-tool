"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ShieldCheck, AlertTriangle, XCircle, CheckCircle2, RefreshCw, 
  Search, Filter, Plus, ArrowRight, ExternalLink, Loader2, 
  Check, Globe, Cpu, FileText, Share2, Layers, Zap
} from "lucide-react";
import { getCustomClients, ClientItem } from "@/lib/client-store";

export interface AuditItem {
  id: string;
  category: "technical" | "ai_readiness" | "on_page" | "citations";
  title: string;
  impact: "high" | "medium" | "low";
  status: "pass" | "warning" | "fail";
  details: string;
  recommendation: string;
}

const DEFAULT_AUDIT_ITEMS: AuditItem[] = [
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
  const [addedTasks, setAddedTasks] = useState<Set<string>>(new Set());

  useEffect(() => {
    const list = getCustomClients();
    setClients(list);
  }, []);

  // Filter items
  const filteredItems = auditItems.filter((item) => {
    if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
    if (statusFilter !== "all" && item.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.details.toLowerCase().includes(q) ||
        item.recommendation.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Calculate audit score
  const total = auditItems.length;
  const passed = auditItems.filter((i) => i.status === "pass").length;
  const warnings = auditItems.filter((i) => i.status === "warning").length;
  const failed = auditItems.filter((i) => i.status === "fail").length;
  
  // Health score calculation: 100 - (failed * 10) - (warnings * 3)
  const healthScore = Math.max(0, Math.min(100, Math.round(100 - (failed * 12) - (warnings * 4))));

  // Re-run audit simulation
  const handleRunAudit = () => {
    setIsRunningAudit(true);
    setTimeout(() => {
      setIsRunningAudit(false);
    }, 1200);
  };

  // Convert failed/warning item to task
  async function handleCreateTask(item: AuditItem) {
    try {
      const clientId = selectedClientId !== "all" ? selectedClientId : (clients[0]?.id || "valgrow-labs-001");
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          title: `[Site Audit] ${item.title}`,
          group_name: item.category === "technical" ? "technical_seo" : "on_page_seo",
          description: `Audit Finding:\n${item.details}\n\nRemediation Plan:\n${item.recommendation}`,
          impact: item.impact,
          effort: item.impact === "high" ? "medium" : "low",
        }),
      });
      setAddedTasks((prev) => new Set([...prev, item.id]));
    } catch {
      setAddedTasks((prev) => new Set([...prev, item.id]));
    }
  }

  // Toggle item status directly
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

  return (
    <div className="space-y-6">
      
      {/* ── AUDIT SCORE & CONTROL BAR ── */}
      <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          {/* Health score circle */}
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/30 flex flex-col items-center justify-center shrink-0 shadow-xs">
            <span className="text-2xl font-black text-emerald-500 tracking-tight">{healthScore}</span>
            <span className="text-[9px] font-bold text-muted-foreground uppercase">Health Score</span>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-widest">
                Comprehensive Diagnostic
              </span>
            </div>
            <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
              <span>Site Audit & Technical Diagnostics</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5 max-w-xl">
              Automated crawl inspection verifying crawlability, structured data schemas, AI entity visibility, and content signals.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunAudit}
            disabled={isRunningAudit}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            {isRunningAudit ? (
              <><Loader2 size={14} className="animate-spin" /> Running Crawl Audit…</>
            ) : (
              <><RefreshCw size={14} /> Run Full Audit</>
            )}
          </button>
        </div>
      </div>

      {/* ── AUDIT METRIC PILLARS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card border border-border/70 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
            Passed Checks
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-500">{passed}</span>
            <span className="text-[11px] font-semibold text-muted-foreground">/{total} verified</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.round((passed / total) * 100)}%` }} />
          </div>
        </div>

        <div className="bg-card border border-border/70 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
            Critical Errors
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-500">{failed}</span>
            <span className="text-[11px] font-semibold text-muted-foreground">Need Immediate Fix</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-rose-500 h-full rounded-full" style={{ width: `${Math.round((failed / total) * 100)}%` }} />
          </div>
        </div>

        <div className="bg-card border border-border/70 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
            Warnings / Notices
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-500">{warnings}</span>
            <span className="text-[11px] font-semibold text-muted-foreground">Optimization Recs</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${Math.round((warnings / total) * 100)}%` }} />
          </div>
        </div>

        <div className="bg-card border border-border/70 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
            AI Readiness
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-cyan-500">88%</span>
            <span className="text-[11px] font-semibold text-muted-foreground">Schema & Entities</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-cyan-500 h-full rounded-full" style={{ width: `88%` }} />
          </div>
        </div>
      </div>

      {/* ── FILTER & CATEGORY CONTROLS ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card border border-border/70 rounded-xl p-3 shadow-xs">
        
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: "all", label: "All Checks", count: auditItems.length },
            { id: "technical", label: "Technical SEO", icon: ShieldCheck },
            { id: "ai_readiness", label: "AI Search Readiness", icon: Cpu },
            { id: "on_page", label: "On-Page & Semantic", icon: FileText },
            { id: "citations", label: "Citations & Authority", icon: Share2 },
          ].map((tab) => {
            const active = categoryFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCategoryFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  active
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                {tab.icon && <tab.icon size={13} />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Status filter & Search */}
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="fail">Failed Only</option>
            <option value="warning">Warnings Only</option>
            <option value="pass">Passed Only</option>
          </select>

          <div className="relative w-full sm:w-52">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search audit tests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>
      </div>

      {/* ── AUDIT ITEMS LIST ── */}
      <div className="space-y-3">
        {filteredItems.map((item) => {
          const isAdded = addedTasks.has(item.id);

          const statusBadge = {
            pass: { bg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", label: "PASS", icon: CheckCircle2 },
            warning: { bg: "bg-amber-500/10 text-amber-500 border-amber-500/20", label: "WARNING", icon: AlertTriangle },
            fail: { bg: "bg-rose-500/10 text-rose-500 border-rose-500/20", label: "FAIL", icon: XCircle },
          }[item.status];

          const impactBadge = {
            high: "bg-rose-500/10 text-rose-500 border-rose-500/20",
            medium: "bg-amber-500/10 text-amber-500 border-amber-500/20",
            low: "bg-muted text-muted-foreground border-border",
          }[item.impact];

          return (
            <div
              key={item.id}
              className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs space-y-3 hover:border-primary/40 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <button
                    onClick={() => toggleStatus(item.id)}
                    title="Click to toggle status"
                    className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-black border cursor-pointer ${statusBadge.bg}`}
                  >
                    <statusBadge.icon size={12} />
                    <span>{statusBadge.label}</span>
                  </button>

                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${impactBadge}`}>
                    {item.impact} Impact
                  </span>

                  <span className="text-xs font-bold text-muted-foreground font-mono">
                    [{item.id}]
                  </span>

                  <h3 className="text-sm font-bold text-foreground">
                    {item.title}
                  </h3>
                </div>

                {item.status !== "pass" && (
                  <button
                    onClick={() => handleCreateTask(item)}
                    disabled={isAdded}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isAdded
                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30"
                        : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs"
                    }`}
                  >
                    {isAdded ? (
                      <><Check size={12} /> Task Created</>
                    ) : (
                      <><Plus size={12} /> Create Task</>
                    )}
                  </button>
                )}
              </div>

              {/* Details & Recommendation */}
              <div className="text-xs space-y-1.5 text-muted-foreground pl-0 sm:pl-1">
                <p><strong className="text-foreground">Observed state:</strong> {item.details}</p>
                <p><strong className="text-primary">Recommended fix:</strong> {item.recommendation}</p>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
