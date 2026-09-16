"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, RefreshCw, FileText, Sparkles } from "lucide-react";

interface WebsiteHealthHeroProps {
  score: number;
  criticalCount: number;
  needsAttentionCount: number;
  passedCount: number;
  lastChecked?: string;
  onRunAudit: () => void;
  onViewReport: () => void;
}

export default function WebsiteHealthHero({
  score,
  criticalCount,
  needsAttentionCount,
  passedCount,
  lastChecked = "Today, 2:30 PM",
  onRunAudit,
  onViewReport,
}: WebsiteHealthHeroProps) {
  // Score color gradient & circular progress calculation
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let scoreColor = "#10B981"; // emerald
  let verdictTitle = "Your website is in good shape";
  let verdictDesc = "Search and AI readiness signals are active, with a few things worth fixing to maximize your visibility.";

  if (score < 65 || criticalCount >= 2) {
    scoreColor = "#EF4444"; // red/rose
    verdictTitle = "A few important issues need attention";
    verdictDesc = "Addressing critical link and structured answer issues will protect your organic traffic and AI citations.";
  } else if (score < 80 || needsAttentionCount >= 3) {
    scoreColor = "#F59E0B"; // amber
    verdictTitle = "Good shape, with a few things worth fixing";
    verdictDesc = `Fixing ${criticalCount + needsAttentionCount} recommended items will significantly improve how Google and AI search engines cite your brand.`;
  }

  return (
    <div className="bg-white dark:bg-card border border-border/80 rounded-2xl lg:rounded-[22px] p-6 sm:p-8 lg:p-10 shadow-xs relative overflow-hidden">
      {/* Subtle background radial ambient glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#FF5A1F]/5 rounded-full blur-3xl pointer-events-none -mt-32" />

      <div className="flex flex-col lg:flex-row items-center justify-between gap-8 z-10 relative">
        
        {/* Left / Center Content */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 lg:gap-8 text-center sm:text-left">
          
          {/* Circular SVG Health Score Ring Indicator */}
          <div className="relative w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              {/* Background Track Ring */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                className="stroke-muted/50 dark:stroke-muted/30"
                strokeWidth="10"
                fill="transparent"
              />
              {/* Active Score Ring */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                stroke={scoreColor}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Inner Score Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl sm:text-4xl font-black text-foreground tracking-tight leading-none">
                {score}
              </span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">
                / 100
              </span>
            </div>
          </div>

          {/* Verdict Text & Description */}
          <div className="space-y-3 max-w-xl">
            <div className="space-y-1">
              <span className="text-xs font-black text-[#FF5A1F] uppercase tracking-widest block">
                Website Health
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                {verdictTitle}
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {verdictDesc}
            </p>

            {/* 3 Quick Status Check Badges */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                <CheckCircle2 size={13} className="text-emerald-500" />
                <span>{passedCount} Healthy Signals</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20 text-xs font-bold">
                <Sparkles size={13} className="text-cyan-500" />
                <span>AI Readiness</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-xs font-bold">
                <AlertTriangle size={13} className="text-amber-500" />
                <span>{criticalCount + needsAttentionCount} Issues to Review</span>
              </div>
            </div>

            {lastChecked && (
              <p className="text-[11px] text-muted-foreground font-medium pt-0.5">
                Last checked: {lastChecked}
              </p>
            )}
          </div>
        </div>

        {/* Right CTA Action Buttons */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-center gap-3 w-full sm:w-auto shrink-0">
          <button
            type="button"
            onClick={onViewReport}
            className="w-full sm:w-48 px-5 py-3 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <FileText size={14} />
            <span>View Full Report</span>
          </button>

          <button
            type="button"
            onClick={onRunAudit}
            className="w-full sm:w-48 px-5 py-3 rounded-xl bg-[#FF5A1F] hover:bg-[#E04810] text-white text-xs font-bold transition-all shadow-xs hover:shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw size={14} />
            <span>Run New Audit</span>
          </button>
        </div>

      </div>
    </div>
  );
}
