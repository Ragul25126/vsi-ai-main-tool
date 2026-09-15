"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Award, Target, AlertCircle, ArrowRight } from "lucide-react";

interface AIVisibilityBreakdownProps {
  winningCount: number;
  mentionedCount: number;
  invisibleCount: number;
  totalKeywords: number;
}

export default function AIVisibilityBreakdown({
  winningCount,
  mentionedCount,
  invisibleCount,
  totalKeywords,
}: AIVisibilityBreakdownProps) {
  const safeTotal = totalKeywords || 1;
  const winningPct = Math.round((winningCount / safeTotal) * 100);
  const mentionedPct = Math.round((mentionedCount / safeTotal) * 100);
  const invisiblePct = Math.round((invisibleCount / safeTotal) * 100);

  return (
    <div className="bg-card border border-border/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm sm:text-base font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <Sparkles size={16} className="text-[#FF5A1F]" />
            <span>AI Search Visibility Breakdown</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium">
            Live visibility status across Google AI Overviews, Google AI Mode, and ChatGPT
          </p>
        </div>
        <Link
          href="/dashboard/check?tab=aivisibility"
          className="text-xs font-bold text-[#FF5A1F] hover:underline flex items-center gap-1 shrink-0"
        >
          <span>View Full Matrix</span>
          <ArrowRight size={12} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* State 1: WINNING */}
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-2.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" />
                <span className="text-xs font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                  Winning ({winningCount})
                </span>
              </div>
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                {winningPct}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mt-2">
              Client ranks in Google Top 10 <strong className="text-foreground">AND</strong> is cited as an authoritative reference in AI Mode.
            </p>
          </div>
          <div className="pt-2 border-t border-emerald-500/20 text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
            <span>Status: Protected</span>
            <Award size={13} />
          </div>
        </div>

        {/* State 2: MENTIONED ONLY */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-2.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs" />
                <span className="text-xs font-black text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                  Mentioned Only ({mentionedCount})
                </span>
              </div>
              <span className="text-xs font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                {mentionedPct}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mt-2">
              AI text references brand name, but domain is <strong className="text-foreground">not yet linked</strong> as a citation source.
            </p>
          </div>
          <div className="pt-2 border-t border-amber-500/20 text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center justify-between">
            <span>High Opportunity to Convert</span>
            <Target size={13} />
          </div>
        </div>

        {/* State 3: AI-INVISIBLE */}
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4 space-y-2.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-xs" />
                <span className="text-xs font-black text-rose-800 dark:text-rose-300 uppercase tracking-wider">
                  AI-Invisible ({invisibleCount})
                </span>
              </div>
              <span className="text-xs font-black text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">
                {invisiblePct}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mt-2">
              Brand is absent from AI answers. Competitors currently hold <strong className="text-foreground">100% citation share</strong> of voice.
            </p>
          </div>
          <div className="pt-2 border-t border-rose-500/20 text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center justify-between">
            <span>Action Needed</span>
            <AlertCircle size={13} />
          </div>
        </div>
      </div>
    </div>
  );
}
