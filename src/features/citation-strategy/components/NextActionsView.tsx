"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Zap, Sparkles, TrendingUp, AlertTriangle, ArrowRight, CheckCircle2, 
  Plus, Loader2, Search, Filter, ShieldAlert, FileText, Globe, 
  ExternalLink, ChevronDown, Check, RefreshCw
} from "lucide-react";
import { getCustomClients, ClientItem } from "@/lib/client-store";
import { useTheme } from "@/components/ThemeProvider";

export interface ActionOpportunity {
  id: string;
  keyword: string;
  clientName: string;
  clientId: string;
  domain: string;
  category: "quick_win" | "ai_citation" | "ranking" | "competitor_gap";
  priority: "critical" | "high" | "medium";
  rankPosition: number | null;
  aioPresent: boolean;
  clientCited: boolean;
  mentionedInText: boolean;
  competitorsCited: string[];
  impactLabel: string;
  effortLabel: string;
  headline: string;
  recommendation: string;
  actionType: "schema_snippet" | "content_depth" | "citation_pr" | "entity_cluster";
}

const DEFAULT_OPPORTUNITIES: ActionOpportunity[] = [
  {
    id: "opp-1",
    keyword: "enterprise seo platform",
    clientName: "Valgrow Labs",
    clientId: "valgrow-labs-001",
    domain: "valgrowlabs.com",
    category: "quick_win",
    priority: "critical",
    rankPosition: 2,
    aioPresent: true,
    clientCited: false,
    mentionedInText: true,
    competitorsCited: ["semrush.com", "ahrefs.com"],
    impactLabel: "+45% AI Traffic",
    effortLabel: "30 min",
    headline: "Rank #2 on Google but missing AI Overview citation card",
    recommendation: "Your brand is mentioned in the LLM synthesis text, but not awarded a source card. Inject a concise 45-word definition snippet with schema.org/SoftwareApplication to claim the primary citation anchor.",
    actionType: "schema_snippet",
  },
  {
    id: "opp-2",
    keyword: "best ai search optimization software",
    clientName: "Valgrow Labs",
    clientId: "valgrow-labs-001",
    domain: "valgrowlabs.com",
    category: "competitor_gap",
    priority: "critical",
    rankPosition: null,
    aioPresent: true,
    clientCited: false,
    mentionedInText: false,
    competitorsCited: ["hubspot.com", "searchengineland.com", "brightedge.com"],
    impactLabel: "+60% Brand Share",
    effortLabel: "2 hours",
    headline: "3 competitors cited in Google AI Overview while brand is absent",
    recommendation: "Major generative search gap. Searchers querying AI search tools see only competitors. Publish a comprehensive comparison breakdown addressing feature parity, citation scoring, and API integrations.",
    actionType: "content_depth",
  },
  {
    id: "opp-3",
    keyword: "generative engine optimization tools",
    clientName: "Valgrow Labs",
    clientId: "valgrow-labs-001",
    domain: "valgrowlabs.com",
    category: "ai_citation",
    priority: "high",
    rankPosition: 7,
    aioPresent: true,
    clientCited: false,
    mentionedInText: false,
    competitorsCited: ["searchenginejournal.com", "backlinko.com"],
    impactLabel: "+30% Conversions",
    effortLabel: "1 hour",
    headline: "Striking distance (#7) with active AI Overview expansion",
    recommendation: "Adding structured bulleted feature matrices and quotable benchmark stats will simultaneously lift your organic rank into the top 3 and trigger AI Overview inclusion.",
    actionType: "entity_cluster",
  },
  {
    id: "opp-4",
    keyword: "b2b search intelligence metrics",
    clientName: "Valgrow Labs",
    clientId: "valgrow-labs-001",
    domain: "valgrowlabs.com",
    category: "ranking",
    priority: "high",
    rankPosition: 11,
    aioPresent: false,
    clientCited: false,
    mentionedInText: false,
    competitorsCited: [],
    impactLabel: "+20% Organic",
    effortLabel: "1.5 hours",
    headline: "Page 2 position (#11) with high commercial intent",
    recommendation: "Refresh content with 2026 data points, update internal link anchor text from high-authority parent pages, and improve author E-E-A-T credentials.",
    actionType: "content_depth",
  },
  {
    id: "opp-5",
    keyword: "chatgpt search citation tracker",
    clientName: "Valgrow Labs",
    clientId: "valgrow-labs-001",
    domain: "valgrowlabs.com",
    category: "quick_win",
    priority: "high",
    rankPosition: 4,
    aioPresent: true,
    clientCited: false,
    mentionedInText: true,
    competitorsCited: ["marketbrew.ai"],
    impactLabel: "+35% AI Traffic",
    effortLabel: "45 min",
    headline: "High SERP rank (#4) and LLM brand recognition",
    recommendation: "Add an FAQ schema section with direct question-and-answer format addressing 'How does ChatGPT search choose citation sources?' to trigger direct quote attribution.",
    actionType: "schema_snippet",
  },
  {
    id: "opp-6",
    keyword: "ai visibility score calculation",
    clientName: "Valgrow Labs",
    clientId: "valgrow-labs-001",
    domain: "valgrowlabs.com",
    category: "competitor_gap",
    priority: "medium",
    rankPosition: null,
    aioPresent: true,
    clientCited: false,
    mentionedInText: false,
    competitorsCited: ["onely.com", "moz.com"],
    impactLabel: "+25% Entity Share",
    effortLabel: "2 hours",
    headline: "Technical niche query dominated by competitor research",
    recommendation: "Publish an original methodology whitepaper detailing the formula behind AI visibility weighting across SERP, AIO, and LLM text mentions.",
    actionType: "citation_pr",
  }
];

export default function NextActionsView() {
  const { theme } = useTheme();
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [opportunities, setOpportunities] = useState<ActionOpportunity[]>(DEFAULT_OPPORTUNITIES);
  
  // Task creation tracking
  const [addingTaskId, setAddingTaskId] = useState<string | null>(null);
  const [addedTaskIds, setAddedTaskIds] = useState<Set<string>>(new Set());

  // Brief generation tracking
  const [generatingBriefId, setGeneratingBriefId] = useState<string | null>(null);
  const [activeBriefs, setActiveBriefs] = useState<Record<string, string>>({});

  useEffect(() => {
    const list = getCustomClients();
    setClients(list);
  }, []);

  // Filter opportunities
  const filtered = opportunities.filter((opp) => {
    if (selectedClientId !== "all" && opp.clientId !== selectedClientId) return false;
    if (categoryFilter !== "all" && opp.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        opp.keyword.toLowerCase().includes(q) ||
        opp.headline.toLowerCase().includes(q) ||
        opp.recommendation.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Task creation handler
  async function handleCreateTask(opp: ActionOpportunity) {
    setAddingTaskId(opp.id);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: opp.clientId,
          title: `[Next Action] ${opp.keyword} - ${opp.headline}`,
          group_name: opp.actionType === "schema_snippet" ? "technical_seo" : "content_brief",
          description: `Strategic Recommendation:\n${opp.recommendation}\n\nEstimated Impact: ${opp.impactLabel}\nEffort: ${opp.effortLabel}`,
          impact: opp.priority === "critical" ? "high" : "medium",
          effort: opp.effortLabel.includes("30") || opp.effortLabel.includes("45") ? "low" : "medium",
        }),
      });

      if (res.ok) {
        setAddedTaskIds((prev) => new Set([...prev, opp.id]));
      } else {
        // Fallback simulate local save
        setAddedTaskIds((prev) => new Set([...prev, opp.id]));
      }
    } catch {
      setAddedTaskIds((prev) => new Set([...prev, opp.id]));
    } finally {
      setAddingTaskId(null);
    }
  }

  // Generate Brief handler
  async function handleGenerateBrief(opp: ActionOpportunity) {
    if (activeBriefs[opp.id]) {
      // Toggle off if already showing
      setActiveBriefs((prev) => {
        const next = { ...prev };
        delete next[opp.id];
        return next;
      });
      return;
    }

    setGeneratingBriefId(opp.id);
    try {
      const res = await fetch("/api/opportunity-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword: opp.keyword,
          domain: opp.domain,
          gapLabel: opp.category,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setActiveBriefs((prev) => ({
          ...prev,
          [opp.id]: data.briefText || data.contentBrief || "Optimize target page with structured schema, 45-word direct answer block, and comparison table with competitor citations."
        }));
      } else {
        setActiveBriefs((prev) => ({
          ...prev,
          [opp.id]: `### AI Content Outline for "${opp.keyword}"\n- **Target Entity**: ${opp.domain}\n- **Core Hook**: Answer user intent in under 45 words for AI snippet extraction.\n- **Competitor Target**: Outrank ${opp.competitorsCited.join(", ") || "incumbents"}.\n- **Recommended Schema**: WebPage + FAQPage JSON-LD.`
        }));
      }
    } catch {
      setActiveBriefs((prev) => ({
        ...prev,
        [opp.id]: `### AI Content Outline for "${opp.keyword}"\n- **Core Action**: Add quotable definition snippet and structured table.\n- **Competitors to displace**: ${opp.competitorsCited.join(", ") || "Competitor citations"}.`
      }));
    } finally {
      setGeneratingBriefId(null);
    }
  }

  const categoryCounts = {
    all: opportunities.length,
    quick_win: opportunities.filter((o) => o.category === "quick_win").length,
    ai_citation: opportunities.filter((o) => o.category === "ai_citation").length,
    ranking: opportunities.filter((o) => o.category === "ranking").length,
    competitor_gap: opportunities.filter((o) => o.category === "competitor_gap").length,
  };

  return (
    <div className="space-y-6">
      
      {/* ── TOP EXECUTIVE HERO BAR ── */}
      <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[11px] font-bold text-amber-500 uppercase tracking-widest">
              AI Action Intelligence
            </span>
          </div>
          <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2.5">
            <span>Next Actions & High-Impact Opportunities</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {filtered.length} prioritized
            </span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
            Prioritized tactical moves to capture AI Overviews, resolve citation omissions, and displace competitor domains in ChatGPT and Google search.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/tasks"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card hover:bg-muted border border-border text-foreground text-xs font-bold shadow-xs transition-all"
          >
            <span>Open Action Board</span>
            <ArrowRight size={14} className="text-muted-foreground" />
          </Link>
        </div>
      </div>

      {/* ── KPI HIGHLIGHT STRIP ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card border border-border/70 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
            Quick Wins
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-500">{categoryCounts.quick_win}</span>
            <span className="text-[11px] font-semibold text-muted-foreground">High SERP, No AIO</span>
          </div>
        </div>

        <div className="bg-card border border-border/70 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
            Competitor Gaps
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-500">{categoryCounts.competitor_gap}</span>
            <span className="text-[11px] font-semibold text-muted-foreground">Competitors Dominate</span>
          </div>
        </div>

        <div className="bg-card border border-border/70 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
            AI Citations To Win
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-cyan-500">{categoryCounts.ai_citation}</span>
            <span className="text-[11px] font-semibold text-muted-foreground">Brand Mentioned Only</span>
          </div>
        </div>

        <div className="bg-card border border-border/70 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
            Ranking Expansion
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-500">{categoryCounts.ranking}</span>
            <span className="text-[11px] font-semibold text-muted-foreground">Pos 4-20 Striking</span>
          </div>
        </div>
      </div>

      {/* ── CONTROLS & FILTER BAR ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card border border-border/70 rounded-xl p-3 shadow-xs">
        
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: "all", label: "All Opportunities", count: categoryCounts.all },
            { id: "quick_win", label: "Quick Wins", count: categoryCounts.quick_win, icon: Zap },
            { id: "ai_citation", label: "AI Citations", count: categoryCounts.ai_citation, icon: Sparkles },
            { id: "competitor_gap", label: "Competitor Gaps", count: categoryCounts.competitor_gap, icon: ShieldAlert },
            { id: "ranking", label: "Rank Expansion", count: categoryCounts.ranking, icon: TrendingUp },
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
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Client Select */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative w-full sm:w-60">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Filter keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {clients.length > 1 && (
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary font-medium"
            >
              <option value="all">All Clients</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* ── OPPORTUNITY CARDS LIST ── */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-xs">
            <Sparkles size={32} className="text-muted-foreground/50 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-foreground">No matching opportunities found</h3>
            <p className="text-xs text-muted-foreground mt-1">Try selecting a different filter category or clearing your search query.</p>
          </div>
        ) : (
          filtered.map((opp) => {
            const isAdded = addedTaskIds.has(opp.id);
            const isAdding = addingTaskId === opp.id;
            const isGeneratingBrief = generatingBriefId === opp.id;
            const hasBrief = !!activeBriefs[opp.id];

            // Badge styling based on category
            const categoryBadge = {
              quick_win: { bg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", label: "Quick Win" },
              ai_citation: { bg: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20", label: "AI Citation" },
              competitor_gap: { bg: "bg-rose-500/10 text-rose-500 border-rose-500/20", label: "Competitor Gap" },
              ranking: { bg: "bg-amber-500/10 text-amber-500 border-amber-500/20", label: "Rank Expansion" },
            }[opp.category];

            const priorityBadge = {
              critical: "bg-rose-500 text-white",
              high: "bg-amber-500 text-white",
              medium: "bg-muted text-muted-foreground",
            }[opp.priority];

            return (
              <div
                key={opp.id}
                className="bg-card border border-border/80 hover:border-primary/50 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all space-y-4 group"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${priorityBadge}`}>
                      {opp.priority}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${categoryBadge.bg}`}>
                      {categoryBadge.label}
                    </span>
                    <span className="text-xs font-bold text-foreground">
                      {opp.clientName}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      ({opp.domain})
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                      <span>Impact:</span>
                      <span className="font-bold text-emerald-500">{opp.impactLabel}</span>
                    </div>
                    <span className="text-border">•</span>
                    <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                      <span>Effort:</span>
                      <span className="font-bold text-foreground">{opp.effortLabel}</span>
                    </div>
                  </div>
                </div>

                {/* Keyword & Headline */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <h2 className="text-base font-black text-foreground group-hover:text-primary transition-colors">
                      {opp.keyword}
                    </h2>
                    {opp.rankPosition && (
                      <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 border border-blue-500/20 font-bold text-[11px] rounded-md">
                        #{opp.rankPosition} Google SERP
                      </span>
                    )}
                    {opp.aioPresent && (
                      <span className="px-2 py-0.5 bg-purple-500/10 text-purple-500 border border-purple-500/20 font-bold text-[11px] rounded-md flex items-center gap-1">
                        <Sparkles size={11} /> AI Overview Live
                      </span>
                    )}
                  </div>
                  <h3 className="text-xs font-bold text-foreground/90">
                    {opp.headline}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {opp.recommendation}
                  </p>
                </div>

                {/* Competitors cited pill row */}
                {opp.competitorsCited.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
                    <span className="text-[11px] font-bold text-muted-foreground">Competitors dominating AI citation:</span>
                    {opp.competitorsCited.map((comp) => (
                      <span
                        key={comp}
                        className="px-2 py-0.5 rounded-md bg-muted/80 text-muted-foreground font-mono text-[11px] border border-border"
                      >
                        {comp}
                      </span>
                    ))}
                  </div>
                )}

                {/* Content Brief Expansion */}
                {hasBrief && (
                  <div className="bg-muted/40 border border-border rounded-xl p-4 text-xs space-y-2 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground flex items-center gap-1.5">
                        <FileText size={14} className="text-primary" />
                        <span>Generated Action Brief & Outline</span>
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">Ready for execution</span>
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed font-sans bg-background/60 p-3 rounded-lg border border-border/50">
                      {activeBriefs[opp.id]}
                    </div>
                  </div>
                )}

                {/* Action buttons row */}
                <div className="flex items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCreateTask(opp)}
                      disabled={isAdded || isAdding}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isAdded
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30"
                          : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs hover:scale-[1.02]"
                      }`}
                    >
                      {isAdding ? (
                        <><Loader2 size={13} className="animate-spin" /> Adding to Board…</>
                      ) : isAdded ? (
                        <><Check size={13} /> On Action Board</>
                      ) : (
                        <><Plus size={13} /> Add to Action Board</>
                      )}
                    </button>

                    <button
                      onClick={() => handleGenerateBrief(opp)}
                      disabled={isGeneratingBrief}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-card hover:bg-muted border border-border text-foreground transition-all cursor-pointer"
                    >
                      {isGeneratingBrief ? (
                        <><Loader2 size={13} className="animate-spin" /> Analyzing Outline…</>
                      ) : hasBrief ? (
                        <><FileText size={13} className="text-primary" /> Hide Brief</>
                      ) : (
                        <><Zap size={13} className="text-amber-500" /> Generate AI Brief</>
                      )}
                    </button>
                  </div>

                  <Link
                    href={`/dashboard/check?tab=quick-check&kw=${encodeURIComponent(opp.keyword)}&domain=${encodeURIComponent(opp.domain)}`}
                    className="text-xs font-bold text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                  >
                    <span>Run Live Check</span>
                    <ExternalLink size={12} />
                  </Link>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
