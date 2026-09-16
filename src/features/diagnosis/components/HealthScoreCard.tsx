"use client";

import React from "react";
import { Sparkles, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";

interface HealthScoreCardProps {
  score: number;
  criticalCount: number;
  needsWorkCount: number;
  lastAudit?: string;
}

export default function HealthScoreCard({
  score,
  criticalCount,
  needsWorkCount,
  lastAudit = "Today",
}: HealthScoreCardProps) {
  // Determine verdict and visual accent
  let verdictTitle = "Your website is in good shape";
  let verdictDesc = "Most core SEO and AI search signals are healthy, with a few recommended improvements.";
  let badgeColor = "text-emerald-500 bg-emerald-500/10 border-emerald-500/25";
  let scoreColor = "text-emerald-500";
  let StatusIcon = CheckCircle2;

  if (score < 60 || criticalCount >= 2) {
    verdictTitle = "Important issues need attention";
    verdictDesc = "Your site has critical issues that could prevent search engines and AI models from reading your pages.";
    badgeColor = "text-rose-500 bg-rose-500/10 border-rose-500/25";
    scoreColor = "text-rose-500";
    StatusIcon = AlertCircle;
  } else if (score < 80 || needsWorkCount > 3) {
    verdictTitle = "Good shape with room to improve";
    verdictDesc = `Your website is healthy, but fixing ${criticalCount > 0 ? `${criticalCount} critical and ` : ""}${needsWorkCount} recommended items will boost your AI visibility.`;
    badgeColor = "text-amber-500 bg-amber-500/10 border-amber-500/25";
    scoreColor = "text-amber-500";
    StatusIcon = AlertTriangle;
  }

  return (
    <div className="bg-white dark:bg-card border border-border/80 rounded-2xl lg:rounded-[20px] p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
      {/* Background glow accent */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF5A1F]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left z-10">
        {/* Large Score Dial / Badge */}
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-muted/40 dark:bg-muted/20 border-2 border-border/80 flex flex-col items-center justify-center shrink-0 shadow-inner">
          <span className={`text-4xl sm:text-5xl font-black ${scoreColor} tracking-tight`}>
            {score}
          </span>
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mt-0.5">
            Health Score
          </span>
          <div className="absolute -bottom-2.5 px-2.5 py-0.5 rounded-full bg-card border border-border/80 text-[10px] font-bold text-muted-foreground shadow-2xs">
            out of 100
          </div>
        </div>

        {/* Verdict & Plain-English Description */}
        <div className="space-y-2 max-w-xl">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badgeColor}`}>
            <StatusIcon size={13} />
            <span>{verdictTitle}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            How Healthy is Your Website?
          </h2>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {verdictDesc}
          </p>

          <div className="flex items-center justify-center sm:justify-start gap-3 pt-1 text-[11px] text-muted-foreground">
            <span>Last audit: <strong className="text-foreground">{lastAudit}</strong></span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Sparkles size={12} className="text-[#FF5A1F]" />
              AI Search Readiness: <strong className="text-foreground">88%</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Quick Progress Bar Visual */}
      <div className="w-full md:w-60 bg-muted/30 border border-border/70 rounded-2xl p-4 space-y-2.5 shrink-0 z-10">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-foreground">Overall Health</span>
          <span className="font-black text-[#FF5A1F]">{score}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-700"
            style={{ width: `${score}%` }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground leading-tight">
          Calculated across technical crawl signals, content readability, and AI citation models.
        </p>
      </div>
    </div>
  );
}
