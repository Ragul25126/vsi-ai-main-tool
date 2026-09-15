"use client";

import React from "react";
import { BarChart3 } from "lucide-react";

export interface DashboardMetricsData {
  aiVisibilityScore: number;
  avgGoogleRank: string;
  aiCitationRate: number;
  brandMentionRate: number;
  chatgptVisibilityScore: number;
  totalKeywords: number;
  competitorCitationsCount: number;
  nextActionsCount: number;
  citedCount: number;
  mentionedCount: number;
}

interface AIVisibilityMetricsRowProps {
  metrics: DashboardMetricsData;
}

export default function AIVisibilityMetricsRow({ metrics }: AIVisibilityMetricsRowProps) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-black text-muted-foreground tracking-widest uppercase flex items-center gap-1.5">
          <BarChart3 size={13} className="text-[#FF5A1F]" />
          Search & AI Visibility Metrics
        </h2>
        <span className="text-[11px] text-muted-foreground font-medium">Period: Last 30 Days</span>
      </div>

      {/* Responsive Grid: 2 cols on mobile, 4 cols on tablet/laptop, 8 cols on large desktop (>= 1280px) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
        {/* KPI 1: AI Visibility */}
        <div className="bg-card border border-border/80 rounded-xl p-3 shadow-2xs flex flex-col justify-between h-[115px] hover:border-[#FF5A1F]/40 transition-all">
          <div>
            <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider truncate">
              AI Visibility
            </p>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-foreground tracking-tight">
                {metrics.aiVisibilityScore}%
              </span>
              <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                +4%
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-[#FF5A1F] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, metrics.aiVisibilityScore)}%` }}
              />
            </div>
            <p className="text-[9px] text-muted-foreground font-medium truncate">
              Healthy trend
            </p>
          </div>
        </div>

        {/* KPI 2: Avg Google Rank */}
        <div className="bg-card border border-border/80 rounded-xl p-3 shadow-2xs flex flex-col justify-between h-[115px] hover:border-[#FF5A1F]/40 transition-all">
          <div>
            <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider truncate">
              Avg Google Rank
            </p>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-foreground tracking-tight">
                #{metrics.avgGoogleRank}
              </span>
              <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                Top 5
              </span>
            </div>
          </div>
          <p className="text-[9px] text-muted-foreground font-medium truncate">
            Top 10 SERP coverage
          </p>
        </div>

        {/* KPI 3: AI Citation Rate */}
        <div className="bg-card border border-border/80 rounded-xl p-3 shadow-2xs flex flex-col justify-between h-[115px] hover:border-[#FF5A1F]/40 transition-all">
          <div>
            <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider truncate">
              AI Citation Rate
            </p>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-foreground tracking-tight">
                {metrics.aiCitationRate}%
              </span>
              <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                +8%
              </span>
            </div>
          </div>
          <p className="text-[9px] text-muted-foreground font-medium truncate">
            {metrics.citedCount}/{metrics.totalKeywords} keywords cited
          </p>
        </div>

        {/* KPI 4: Brand Mentions */}
        <div className="bg-card border border-border/80 rounded-xl p-3 shadow-2xs flex flex-col justify-between h-[115px] hover:border-[#FF5A1F]/40 transition-all">
          <div>
            <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider truncate">
              Brand Mentions
            </p>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-foreground tracking-tight">
                {metrics.brandMentionRate}%
              </span>
              <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
                High
              </span>
            </div>
          </div>
          <p className="text-[9px] text-muted-foreground font-medium truncate">
            {metrics.mentionedCount}/{metrics.totalKeywords} AI answers
          </p>
        </div>

        {/* KPI 5: ChatGPT Visibility */}
        <div className="bg-card border border-border/80 rounded-xl p-3 shadow-2xs flex flex-col justify-between h-[115px] hover:border-[#FF5A1F]/40 transition-all">
          <div>
            <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider truncate">
              ChatGPT Vis.
            </p>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-foreground tracking-tight">
                {metrics.chatgptVisibilityScore}%
              </span>
              <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                Strong
              </span>
            </div>
          </div>
          <p className="text-[9px] text-muted-foreground font-medium truncate">
            11 queries discovered
          </p>
        </div>

        {/* KPI 6: Tracked Keywords */}
        <div className="bg-card border border-border/80 rounded-xl p-3 shadow-2xs flex flex-col justify-between h-[115px] hover:border-[#FF5A1F]/40 transition-all">
          <div>
            <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider truncate">
              Keywords
            </p>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-foreground tracking-tight">
                {metrics.totalKeywords}
              </span>
              <span className="text-[9px] font-bold text-slate-600 dark:text-slate-300 bg-muted px-1.5 py-0.5 rounded">
                Active
              </span>
            </div>
          </div>
          <p className="text-[9px] text-muted-foreground font-medium truncate">
            Monitored weekly
          </p>
        </div>

        {/* KPI 7: Competitor Citations */}
        <div className="bg-card border border-border/80 rounded-xl p-3 shadow-2xs flex flex-col justify-between h-[115px] hover:border-[#FF5A1F]/40 transition-all">
          <div>
            <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider truncate">
              Comp. Citations
            </p>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-foreground tracking-tight">
                {metrics.competitorCitationsCount}
              </span>
              <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                3 Comp.
              </span>
            </div>
          </div>
          <p className="text-[9px] text-muted-foreground font-medium truncate">
            Active gaps identified
          </p>
        </div>

        {/* KPI 8: Next Actions */}
        <div className="bg-card border border-[#FF5A1F]/35 bg-[#FFF4ED]/30 dark:bg-[#FF5A1F]/5 rounded-xl p-3 shadow-2xs flex flex-col justify-between h-[115px] hover:border-[#FF5A1F] transition-all">
          <div>
            <p className="text-[10px] font-extrabold text-[#FF5A1F] uppercase tracking-wider truncate">
              Next Actions
            </p>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-[#FF5A1F] tracking-tight">
                {metrics.nextActionsCount}
              </span>
              <span className="text-[9px] font-black text-white bg-[#FF5A1F] px-1.5 py-0.5 rounded-full">
                PRIORITY
              </span>
            </div>
          </div>
          <p className="text-[9px] text-muted-foreground font-medium truncate">
            3 quick wins available
          </p>
        </div>
      </div>
    </div>
  );
}
