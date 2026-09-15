"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Zap, Plus, Check, ExternalLink, Clock, ArrowRight } from "lucide-react";

interface ActionItem {
  id: string;
  category: "quick-win" | "citation-gap" | "competitor-gap" | "technical";
  badgeText: string;
  badgeColor: string;
  title: string;
  keyword: string;
  impact: "High" | "Medium";
  effort: string;
  description: string;
  targetCompetitor?: string;
}

const ACTION_ITEMS: ActionItem[] = [
  {
    id: "act-1",
    category: "quick-win",
    badgeText: "⚡ QUICK WIN",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    title: "Add Comparison Matrix on Pricing to win Gemini & Perplexity citation",
    keyword: "best CRM for startups",
    impact: "High",
    effort: "2–4 hours",
    description: "Competitor cegeka.com is cited because of a clear table structure with structured JSON-LD.",
    targetCompetitor: "cegeka.com",
  },
  {
    id: "act-2",
    category: "citation-gap",
    badgeText: "🎯 CITATION GAP",
    badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    title: "Implement Service FAQ schema for 'best digital marketing agency'",
    keyword: "best digital marketing agency",
    impact: "High",
    effort: "3–5 hours",
    description: "Google AI Overview extracts direct answers from schema FAQ entities on top-ranking competitors.",
    targetCompetitor: "hubspot.com",
  },
  {
    id: "act-3",
    category: "competitor-gap",
    badgeText: "⚔️ COMPETITOR GAP",
    badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    title: "Publish case study on AI search results capturing 4 target keywords",
    keyword: "enterprise search intelligence",
    impact: "Medium",
    effort: "4–6 hours",
    description: "Brand holds rank #4 in traditional Google but zero AI citations across 4 commercial queries.",
    targetCompetitor: "monday.com",
  },
];

export default function NextActionsModule() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [createdTasks, setCreatedTasks] = useState<Record<string, boolean>>({});
  const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null);

  const categories = [
    { key: "all", label: "All Items", count: 6 },
    { key: "quick-win", label: "Quick Wins", count: 3 },
    { key: "citation-gap", label: "Citation Opportunities", count: 2 },
    { key: "competitor-gap", label: "Competitor Gaps", count: 1 },
  ];

  const filteredItems = activeCategory === "all"
    ? ACTION_ITEMS
    : ACTION_ITEMS.filter((item) => item.category === activeCategory);

  const handleCreateTask = async (item: ActionItem) => {
    setLoadingTaskId(item.id);
    try {
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: "valgrow-labs-001",
          title: item.title,
          group_name: item.category === "quick-win" ? "content_brief" : "citation_outreach",
          description: item.description,
          impact: item.impact.toLowerCase(),
          effort: "medium",
        }),
      });
      setCreatedTasks((prev) => ({ ...prev, [item.id]: true }));
    } catch {
      setCreatedTasks((prev) => ({ ...prev, [item.id]: true }));
    } finally {
      setLoadingTaskId(null);
    }
  };

  return (
    <div className="bg-card border border-border/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#FF5A1F]/15 text-[#FF5A1F] flex items-center justify-center font-bold shrink-0">
            <Zap size={16} />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground tracking-tight flex items-center gap-2">
              <span>Recommended Next Actions</span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#FF5A1F] text-white">
                6 Priority
              </span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              High-impact tasks generated from citation gaps & competitor analysis
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/tasks"
          className="text-xs font-bold text-[#FF5A1F] hover:underline flex items-center gap-1 shrink-0"
        >
          <span>Manage Action Board</span>
          <ArrowRight size={12} />
        </Link>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {categories.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => setActiveCategory(c.key)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeCategory === c.key
                ? "bg-[#FF5A1F] text-white shadow-xs"
                : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/70"
            }`}
          >
            <span>{c.label}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeCategory === c.key ? "bg-white/20 text-white" : "bg-muted-foreground/20 text-foreground"
            }`}>
              {c.count}
            </span>
          </button>
        ))}
      </div>

      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
        {filteredItems.map((item) => {
          const isCreated = createdTasks[item.id];
          const isLoading = loadingTaskId === item.id;

          return (
            <div
              key={item.id}
              className="rounded-xl border border-border/80 bg-background p-4 space-y-3 hover:border-[#FF5A1F]/40 transition-all flex flex-col justify-between shadow-2xs"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className={`font-black px-2 py-0.5 rounded border text-[10px] ${item.badgeColor}`}>
                    {item.badgeText}
                  </span>
                  <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                    <Clock size={11} /> {item.effort}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-foreground leading-snug">
                  {item.title}
                </h4>

                <div className="text-[10px] text-muted-foreground font-mono bg-muted/40 px-2 py-1 rounded border border-border/60">
                  Target: &quot;{item.keyword}&quot;
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-border/60">
                <Link
                  href="/dashboard/check?tab=opportunities"
                  className="flex-1 text-center py-1.5 px-2.5 rounded-lg bg-card hover:bg-muted text-foreground border border-border text-[11px] font-bold transition-colors shadow-2xs flex items-center justify-center gap-1"
                >
                  <span>View Diagnosis</span>
                  <ExternalLink size={10} className="text-muted-foreground" />
                </Link>

                <button
                  type="button"
                  onClick={() => handleCreateTask(item)}
                  disabled={isCreated || isLoading}
                  className={`py-1.5 px-3 rounded-lg text-[11px] font-bold transition-all shadow-2xs flex items-center gap-1 shrink-0 cursor-pointer ${
                    isCreated
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                      : "bg-[#FF5A1F] hover:bg-[#E04810] text-white"
                  }`}
                >
                  {isCreated ? (
                    <><Check size={12} /> On Board</>
                  ) : (
                    <><Plus size={12} /> {isLoading ? "Adding..." : "Create Task"}</>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
