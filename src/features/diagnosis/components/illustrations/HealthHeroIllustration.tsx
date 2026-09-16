"use client";

import React from "react";

export default function HealthHeroIllustration({ className = "w-72 h-48" }: { className?: string }) {
  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      {/* Ambient background glow circle */}
      <div className="absolute w-56 h-56 rounded-full bg-blue-50/70 dark:bg-blue-950/20 blur-2xl pointer-events-none" />

      <div className="relative flex items-center gap-4 z-10">
        
        {/* Browser Window Mockup */}
        <div className="w-44 bg-white dark:bg-card border border-slate-200 dark:border-border rounded-xl shadow-xs p-2.5 space-y-2">
          {/* Header with 3 dots & URL bar */}
          <div className="flex items-center gap-1.5 pb-1 border-b border-slate-100 dark:border-border/60">
            <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
            <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <div className="ml-1.5 flex-1 h-3.5 bg-slate-100 dark:bg-muted rounded-md flex items-center px-1.5">
              <div className="w-12 h-1.5 bg-slate-300 dark:bg-muted-foreground/40 rounded-full" />
            </div>
          </div>

          {/* Search Result 1 with Orange Highlight Pill */}
          <div className="space-y-1 bg-blue-50/50 dark:bg-blue-950/30 p-1.5 rounded-lg border border-blue-100/60 dark:border-blue-900/30">
            <div className="flex items-center justify-between">
              <div className="w-20 h-2 bg-blue-500 rounded-full" />
              <div className="w-8 h-3 rounded-full bg-[#FF5A1F]/20 border border-[#FF5A1F]/40" />
            </div>
            <div className="w-28 h-1.5 bg-slate-200 dark:bg-muted-foreground/30 rounded-full" />
            <div className="w-24 h-1.5 bg-slate-200 dark:bg-muted-foreground/30 rounded-full" />
          </div>

          {/* Search Result 2 */}
          <div className="space-y-1 px-1">
            <div className="w-16 h-1.5 bg-purple-400 rounded-full" />
            <div className="w-28 h-1.5 bg-slate-200 dark:bg-muted-foreground/30 rounded-full" />
          </div>
        </div>

        {/* Upward Green Curved Arrow SVG */}
        <div className="relative w-8 h-24 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 40 100" className="w-full h-full overflow-visible">
            <path
              d="M 5,85 Q 25,65 15,25"
              fill="none"
              stroke="#00BA7C"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Arrowhead */}
            <path
              d="M 8,32 L 15,22 L 24,30"
              fill="none"
              stroke="#00BA7C"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* 2 Floating Benefit Pills */}
        <div className="space-y-3 shrink-0">
          {/* Top Pill: Higher visibility */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-card border border-slate-200 dark:border-border shadow-xs">
            <div className="flex items-end gap-0.5 h-3.5 w-3.5">
              <span className="w-1 h-2 bg-blue-500 rounded-xs" />
              <span className="w-1 h-3 bg-blue-500 rounded-xs" />
              <span className="w-1 h-3.5 bg-blue-500 rounded-xs" />
            </div>
            <span className="text-xs font-extrabold text-slate-800 dark:text-foreground">
              Higher visibility
            </span>
          </div>

          {/* Bottom Pill: More customers */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-card border border-slate-200 dark:border-border shadow-xs">
            <div className="w-4 h-4 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
              <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            <span className="text-xs font-extrabold text-slate-800 dark:text-foreground">
              More customers
            </span>
          </div>
        </div>

      </div>

      {/* Playful Handwritten Script Note */}
      <div className="mt-3">
        <p className="font-serif italic text-[11px] text-slate-400 dark:text-muted-foreground tracking-wide transform -rotate-2">
          A healthier site gets more opportunities
        </p>
      </div>
    </div>
  );
}
