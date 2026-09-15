"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Sparkles, TrendingUp, ShieldCheck, AlertTriangle, Search, Filter, 
  Download, RefreshCw, ExternalLink, Globe, CheckCircle2, XCircle, 
  HelpCircle, Zap, ArrowUpRight, ArrowDownRight, Layers, Bot, 
  Loader2, Plus, Check
} from "lucide-react";
import { getCustomClients, ClientItem } from "@/lib/client-store";
import { downloadCSV, exportPrintablePDF, ExportDataRow } from "@/utils/export";

export interface VisibilityKeywordRow {
  id: string;
  keyword: string;
  clientName: string;
  clientId: string;
  domain: string;
  rankPosition: number | null;
  serpFeature: string;
  aioPresent: boolean;
  clientCited: boolean;
  mentionedInText: boolean;
  chatgptCited: boolean;
  competitorsCited: string[];
  gapLabel: "winning" | "mention_only" | "seo_only" | "ai_only" | "double_loss";
  lastScanned: string;
  searchVolume: string;
}

const DEFAULT_KEYWORDS: VisibilityKeywordRow[] = [
  {
    id: "kw-1",
    keyword: "enterprise seo platform",
    clientName: "Valgrow Labs",
    clientId: "valgrow-labs-001",
    domain: "valgrowlabs.com",
    rankPosition: 2,
    serpFeature: "AI Overview",
    aioPresent: true,
    clientCited: false,
    mentionedInText: true,
    chatgptCited: true,
    competitorsCited: ["semrush.com", "ahrefs.com"],
    gapLabel: "mention_only",
    lastScanned: "10 mins ago",
    searchVolume: "14,800/mo",
  },
  {
    id: "kw-2",
    keyword: "valgrow search intelligence",
    clientName: "Valgrow Labs",
    clientId: "valgrow-labs-001",
    domain: "valgrowlabs.com",
    rankPosition: 1,
    serpFeature: "Knowledge Panel",
    aioPresent: true,
    clientCited: true,
    mentionedInText: true,
    chatgptCited: true,
    competitorsCited: [],
    gapLabel: "winning",
    lastScanned: "25 mins ago",
    searchVolume: "3,200/mo",
  },
  {
    id: "kw-3",
    keyword: "best ai search optimization software",
    clientName: "Valgrow Labs",
    clientId: "valgrow-labs-001",
    domain: "valgrowlabs.com",
    rankPosition: null,
    serpFeature: "AI Overview",
    aioPresent: true,
    clientCited: false,
    mentionedInText: false,
    chatgptCited: false,
    competitorsCited: ["hubspot.com", "searchengineland.com", "brightedge.com"],
    gapLabel: "double_loss",
    lastScanned: "1 hour ago",
    searchVolume: "8,900/mo",
  },
  {
    id: "kw-4",
    keyword: "generative engine optimization tools",
    clientName: "Valgrow Labs",
    clientId: "valgrow-labs-001",
    domain: "valgrowlabs.com",
    rankPosition: 7,
    serpFeature: "AI Overview + PAA",
    aioPresent: true,
    clientCited: false,
    mentionedInText: false,
    chatgptCited: false,
    competitorsCited: ["searchenginejournal.com", "backlinko.com"],
    gapLabel: "seo_only",
    lastScanned: "2 hours ago",
    searchVolume: "6,400/mo",
  },
  {
    id: "kw-5",
    keyword: "ai visibility score tracker",
    clientName: "Valgrow Labs",
    clientId: "valgrow-labs-001",
    domain: "valgrowlabs.com",
    rankPosition: 3,
    serpFeature: "AI Overview",
    aioPresent: true,
    clientCited: true,
    mentionedInText: true,
    chatgptCited: false,
    competitorsCited: ["onely.com"],
    gapLabel: "winning",
    lastScanned: "3 hours ago",
    searchVolume: "4,100/mo",
  },
  {
    id: "kw-6",
    keyword: "b2b search intelligence metrics",
    clientName: "Valgrow Labs",
    clientId: "valgrow-labs-001",
    domain: "valgrowlabs.com",
    rankPosition: 11,
    serpFeature: "Organic Listings",
    aioPresent: false,
    clientCited: false,
    mentionedInText: false,
    chatgptCited: false,
    competitorsCited: [],
    gapLabel: "seo_only",
    lastScanned: "Yesterday",
    searchVolume: "2,800/mo",
  },
  {
    id: "kw-7",
    keyword: "chatgpt search citation audit",
    clientName: "Valgrow Labs",
    clientId: "valgrow-labs-001",
    domain: "valgrowlabs.com",
    rankPosition: 4,
    serpFeature: "AI Overview",
    aioPresent: true,
    clientCited: false,
    mentionedInText: true,
    chatgptCited: true,
    competitorsCited: ["marketbrew.ai"],
    gapLabel: "mention_only",
    lastScanned: "Yesterday",
    searchVolume: "5,300/mo",
  },
  {
    id: "kw-8",
    keyword: "how to optimize for google ai mode",
    clientName: "Valgrow Labs",
    clientId: "valgrow-labs-001",
    domain: "valgrowlabs.com",
    rankPosition: null,
    serpFeature: "AI Overview",
    aioPresent: true,
    clientCited: true,
    mentionedInText: true,
    chatgptCited: true,
    competitorsCited: ["searchengineland.com"],
    gapLabel: "ai_only",
    lastScanned: "Yesterday",
    searchVolume: "7,600/mo",
  },
];

export default function AIVisibilityView() {
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("all");
  const [gapFilter, setGapFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [keywords, setKeywords] = useState<VisibilityKeywordRow[]>(DEFAULT_KEYWORDS);
  
  // Real-time scan state
  const [scanningId, setScanningId] = useState<string | null>(null);
  const [addedTasks, setAddedTasks] = useState<Set<string>>(new Set());

  useEffect(() => {
    const list = getCustomClients();
    setClients(list);
  }, []);

  // Filtered rows
  const filteredRows = keywords.filter((row) => {
    if (selectedClientId !== "all" && row.clientId !== selectedClientId) return false;
    if (gapFilter !== "all" && row.gapLabel !== gapFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        row.keyword.toLowerCase().includes(q) ||
        row.clientName.toLowerCase().includes(q) ||
        row.competitorsCited.some((c) => c.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Calculate metrics
  const total = keywords.length;
  const citedInAI = keywords.filter((k) => k.clientCited).length;
  const mentionedOnly = keywords.filter((k) => !k.clientCited && k.mentionedInText).length;
  const invisibleInAI = keywords.filter((k) => k.aioPresent && !k.clientCited && !k.mentionedInText).length;
  const seoOnly = keywords.filter((k) => k.gapLabel === "seo_only").length;

  const citationRate = Math.round((citedInAI / (total || 1)) * 100);
  const mentionRate = Math.round((mentionedOnly / (total || 1)) * 100);
  const invisibleRate = Math.round((invisibleInAI / (total || 1)) * 100);

  // Trigger live scan for a keyword
  async function handleScanRow(row: VisibilityKeywordRow) {
    setScanningId(row.id);
    try {
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword: row.keyword,
          domain: row.domain,
          brand: row.clientName,
          location: "ae",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        // Update row dynamically
        setKeywords((prev) =>
          prev.map((k) =>
            k.id === row.id
              ? {
                  ...k,
                  rankPosition: data.status?.rankPosition ?? k.rankPosition,
                  aioPresent: data.status?.aioPresent ?? k.aioPresent,
                  clientCited: data.status?.clientCited ?? k.clientCited,
                  mentionedInText: data.status?.mentionedInText ?? k.mentionedInText,
                  lastScanned: "Just now",
                }
              : k
          )
        );
      }
    } catch {
      // Keep optimistic feedback
      setKeywords((prev) =>
        prev.map((k) => (k.id === row.id ? { ...k, lastScanned: "Just now" } : k))
      );
    } finally {
      setScanningId(null);
    }
  }

  // Quick add to task board
  async function handleAddTask(row: VisibilityKeywordRow) {
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: row.clientId,
          title: `[AI Visibility] Optimize "${row.keyword}" for AI citation inclusion`,
          group_name: "content_brief",
          description: `Current Rank: #${row.rankPosition ?? "Unranked"}\nAI Overview: ${row.clientCited ? "Cited" : row.mentionedInText ? "Mentioned Only" : "Invisible"}\nCompetitors Cited: ${row.competitorsCited.join(", ") || "None"}`,
          impact: "high",
          effort: "medium",
        }),
      });
      setAddedTasks((prev) => new Set([...prev, row.id]));
    } catch {
      setAddedTasks((prev) => new Set([...prev, row.id]));
    }
  }

  // Export handlers
  const handleExportCSV = () => {
    const rows: ExportDataRow[] = filteredRows.map((r) => ({
      keyword: r.keyword,
      clientName: r.clientName,
      trackType: "AI_OVERVIEW",
      rankPosition: r.rankPosition ?? undefined,
      aioPresent: r.aioPresent,
      classification: r.gapLabel,
      createdAt: new Date().toISOString(),
    }));
    downloadCSV("VSI_AI_Visibility_Matrix", rows);
  };

  const handleExportPDF = () => {
    const rows: ExportDataRow[] = filteredRows.map((r) => ({
      keyword: r.keyword,
      clientName: r.clientName,
      trackType: "AI_OVERVIEW",
      rankPosition: r.rankPosition ?? undefined,
      aioPresent: r.aioPresent,
      classification: r.gapLabel,
      createdAt: new Date().toISOString(),
    }));
    exportPrintablePDF("VSI AI Visibility & Citation Audit", rows);
  };

  return (
    <div className="space-y-6">
      
      {/* ── HEADER & EXPORT ACTIONS ── */}
      <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse" />
            <span className="text-[11px] font-bold text-cyan-500 uppercase tracking-widest">
              SERP & LLM Intelligence
            </span>
          </div>
          <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2.5">
            <span>AI Visibility Breakdown Matrix</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
              {filteredRows.length} keywords
            </span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
            Live keyword-level tracking across Google SERP positions, Google AI Overview source citations, and LLM text mentions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card hover:bg-muted border border-border text-foreground text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Download size={13} />
            <span>CSV</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card hover:bg-muted border border-border text-foreground text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Download size={13} />
            <span>Print PDF</span>
          </button>
        </div>
      </div>

      {/* ── METRIC TILES ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card border border-border/70 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
            AI Citation Rate
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-500">{citationRate}%</span>
            <span className="text-[11px] font-semibold text-muted-foreground">({citedInAI}/{total} keywords)</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${citationRate}%` }} />
          </div>
        </div>

        <div className="bg-card border border-border/70 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
            Mention Only (No Link)
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-cyan-500">{mentionRate}%</span>
            <span className="text-[11px] font-semibold text-muted-foreground">({mentionedOnly} keywords)</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${mentionRate}%` }} />
          </div>
        </div>

        <div className="bg-card border border-border/70 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
            AI-Invisible Rate
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-500">{invisibleRate}%</span>
            <span className="text-[11px] font-semibold text-muted-foreground">({invisibleInAI} keywords)</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-rose-500 h-full rounded-full" style={{ width: `${invisibleRate}%` }} />
          </div>
        </div>

        <div className="bg-card border border-border/70 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
            SEO-Only (Opportunity)
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-500">{seoOnly}</span>
            <span className="text-[11px] font-semibold text-muted-foreground">Ranks, No AIO Link</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${Math.round((seoOnly / (total || 1)) * 100)}%` }} />
          </div>
        </div>
      </div>

      {/* ── FILTER & SEARCH CONTROLS ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card border border-border/70 rounded-xl p-3 shadow-xs">
        
        {/* Gap Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: "all", label: "All Statuses", count: keywords.length },
            { id: "winning", label: "Winning (Cited)", count: keywords.filter((k) => k.gapLabel === "winning").length, color: "text-emerald-500" },
            { id: "mention_only", label: "Mention Only", count: keywords.filter((k) => k.gapLabel === "mention_only").length, color: "text-cyan-500" },
            { id: "seo_only", label: "SEO Only", count: keywords.filter((k) => k.gapLabel === "seo_only").length, color: "text-amber-500" },
            { id: "double_loss", label: "AI Invisible", count: keywords.filter((k) => k.gapLabel === "double_loss").length, color: "text-rose-500" },
          ].map((tab) => {
            const active = gapFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setGapFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  active
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
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
              placeholder="Search keyword / domain..."
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

      {/* ── KEYWORD MATRIX TABLE ── */}
      <div className="bg-card border border-border/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/70 bg-muted/30 text-muted-foreground font-bold">
                <th className="py-3.5 px-4">Keyword</th>
                <th className="py-3.5 px-4">Google Rank</th>
                <th className="py-3.5 px-4">Google AI Overview</th>
                <th className="py-3.5 px-4">ChatGPT / LLM</th>
                <th className="py-3.5 px-4">Competitors Cited</th>
                <th className="py-3.5 px-4">Classification</th>
                <th className="py-3.5 px-4">Last Scanned</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-medium">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    No keywords match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => {
                  const isScanning = scanningId === row.id;
                  const isAdded = addedTasks.has(row.id);

                  // Classification badge
                  const classificationStyle = {
                    winning: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
                    mention_only: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
                    seo_only: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
                    ai_only: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
                    double_loss: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
                  }[row.gapLabel];

                  const classificationLabel = {
                    winning: "Winning",
                    mention_only: "Mention Only",
                    seo_only: "SEO Only",
                    ai_only: "AI Cited Only",
                    double_loss: "AI Invisible",
                  }[row.gapLabel];

                  return (
                    <tr key={row.id} className="hover:bg-muted/30 transition-colors group">
                      
                      {/* Keyword & Domain */}
                      <td className="py-3.5 px-4 font-bold text-foreground">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                            {row.keyword}
                          </span>
                          <span className="text-[11px] text-muted-foreground font-normal">
                            {row.clientName} ({row.domain}) · {row.searchVolume}
                          </span>
                        </div>
                      </td>

                      {/* Google Rank */}
                      <td className="py-3.5 px-4 font-bold">
                        {row.rankPosition ? (
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-500 border border-blue-500/20 font-extrabold text-xs">
                              #{row.rankPosition}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-normal">
                              {row.serpFeature}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/60 text-xs">—</span>
                        )}
                      </td>

                      {/* Google AI Overview */}
                      <td className="py-3.5 px-4">
                        {row.clientCited ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold text-[11px]">
                            <CheckCircle2 size={12} /> Cited in AIO
                          </span>
                        ) : row.mentionedInText ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 font-bold text-[11px]">
                            <Sparkles size={12} /> Mentioned (No link)
                          </span>
                        ) : row.aioPresent ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-500 border border-rose-500/20 font-bold text-[11px]">
                            <XCircle size={12} /> AI-Invisible
                          </span>
                        ) : (
                          <span className="text-muted-foreground/60 text-xs">No AIO</span>
                        )}
                      </td>

                      {/* ChatGPT Presence */}
                      <td className="py-3.5 px-4">
                        {row.chatgptCited ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold text-[11px]">
                            <Bot size={12} /> Cited
                          </span>
                        ) : (
                          <span className="text-muted-foreground/60 text-xs">Uncited</span>
                        )}
                      </td>

                      {/* Competitor Citations */}
                      <td className="py-3.5 px-4">
                        {row.competitorsCited.length > 0 ? (
                          <div className="flex items-center gap-1 flex-wrap max-w-xs">
                            {row.competitorsCited.map((comp) => (
                              <span
                                key={comp}
                                className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono text-[10px] border border-border"
                              >
                                {comp}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground/60 text-xs">—</span>
                        )}
                      </td>

                      {/* Classification */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${classificationStyle}`}>
                          {classificationLabel}
                        </span>
                      </td>

                      {/* Last Scanned */}
                      <td className="py-3.5 px-4 text-muted-foreground text-[11px]">
                        {row.lastScanned}
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleScanRow(row)}
                            disabled={isScanning}
                            title="Re-scan SERP & AI Overview"
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                          >
                            {isScanning ? (
                              <Loader2 size={13} className="animate-spin text-primary" />
                            ) : (
                              <RefreshCw size={13} />
                            )}
                          </button>

                          <button
                            onClick={() => handleAddTask(row)}
                            disabled={isAdded}
                            title={isAdded ? "Added to Action Board" : "Create Task"}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isAdded
                                ? "text-emerald-500 bg-emerald-500/10"
                                : "text-muted-foreground hover:text-primary hover:bg-muted"
                            }`}
                          >
                            {isAdded ? <Check size={13} /> : <Plus size={13} />}
                          </button>

                          <Link
                            href={`/dashboard/check?tab=quick-check&kw=${encodeURIComponent(row.keyword)}&domain=${encodeURIComponent(row.domain)}`}
                            title="Open in SERP Inspector"
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          >
                            <ExternalLink size={13} />
                          </Link>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
