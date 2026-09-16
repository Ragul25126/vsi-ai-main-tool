"use client";

import React from "react";
import { 
  Globe, 
  FileText, 
  BarChart3, 
  CheckSquare, 
  Search, 
  Link2, 
  FileCheck, 
  Square, 
  ArrowRight 
} from "lucide-react";

interface AuditProcessWorkflowProps {
  onLearnMore?: () => void;
}

export default function AuditProcessWorkflow({ onLearnMore }: AuditProcessWorkflowProps) {
  return (
    <div className="bg-white dark:bg-card border border-border/80 rounded-2xl lg:rounded-[24px] p-6 sm:p-8 lg:p-10 shadow-xs relative overflow-hidden space-y-8">
      
      {/* ── SECTION HEADER ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <span className="text-xs font-black tracking-wider text-blue-600 dark:text-blue-400 uppercase block">
            Our Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            How VSI checks your website
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
            We scan your website, find important issues, and give you simple recommendations.
          </p>
        </div>

        <button
          type="button"
          onClick={onLearnMore}
          className="flex items-center gap-1.5 text-xs font-bold text-[#FF5A1F] hover:text-[#E04810] px-3.5 py-1.5 rounded-full hover:bg-[#FF5A1F]/10 transition-colors shrink-0 mt-1 cursor-pointer"
        >
          <span>Learn how it works</span>
          <ArrowRight size={13} />
        </button>
      </div>

      {/* ── 4 LARGE VISUAL PROCESS CARDS WITH PROGRESSION ARROWS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-row items-stretch gap-4 sm:gap-5 lg:gap-2.5 xl:gap-3.5 relative">
        
        {/* ── CARD 01: SCAN ── */}
        <div className="relative bg-[#F4F9FF] dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-2xs space-y-5 flex-1 min-w-0 group hover:shadow-sm transition-all">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                <Globe size={18} />
              </div>
              <div>
                <span className="text-xs font-black text-blue-600 dark:text-blue-400 font-mono tracking-wider block">
                  01
                </span>
                <h3 className="text-base font-extrabold text-foreground tracking-tight leading-tight">
                  Scan
                </h3>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We inspect your website pages, crawlability, and server speed.
            </p>
          </div>

          {/* Card 01 Illustration: Browser & Search Bar */}
          <div className="h-[135px] flex flex-col justify-center">
            <div className="bg-white dark:bg-card border border-blue-200/70 dark:border-blue-800/40 rounded-xl p-3 shadow-xs space-y-2.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="w-2 h-2 rounded-full bg-blue-300" />
                <span className="w-2 h-2 rounded-full bg-blue-200" />
              </div>
              <div className="bg-slate-50 dark:bg-muted/50 border border-blue-100 dark:border-blue-900/30 rounded-lg px-2.5 py-1.5 flex items-center justify-between">
                <span className="text-[11px] font-mono text-muted-foreground">https://</span>
                <Search size={14} className="text-blue-500 shrink-0" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold border border-blue-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span>Scanning...</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── PROGRESSION ARROW: 01 → 02 ── */}
        <div className="hidden lg:flex items-center justify-center text-slate-400 dark:text-slate-500 shrink-0 w-6 xl:w-7">
          <svg className="w-5 h-5 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>

        {/* ── CARD 02: UNDERSTAND ── */}
        <div className="relative bg-[#FAF5FF] dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-2xs space-y-5 flex-1 min-w-0 group hover:shadow-sm transition-all">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/15 border border-purple-500/25 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                <FileText size={18} />
              </div>
              <div>
                <span className="text-xs font-black text-purple-600 dark:text-purple-400 font-mono tracking-wider block">
                  02
                </span>
                <h3 className="text-base font-extrabold text-foreground tracking-tight leading-tight">
                  Understand
                </h3>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We analyze how search engines and AI assistants read your content.
            </p>
          </div>

          {/* Card 02 Illustration: Document sheet with 3 category tags */}
          <div className="h-[135px] flex flex-col justify-center">
            <div className="flex items-center gap-3">
              <div className="bg-white dark:bg-card border border-purple-200/70 dark:border-purple-800/40 rounded-xl p-3 shadow-xs flex-1 space-y-2">
                <div className="w-4/5 h-1.5 bg-purple-200 dark:bg-purple-800/50 rounded-full" />
                <div className="w-full h-1.5 bg-purple-200 dark:bg-purple-800/50 rounded-full" />
                <div className="w-3/5 h-1.5 bg-purple-200 dark:bg-purple-800/50 rounded-full" />
                <div className="w-4/5 h-1.5 bg-purple-200 dark:bg-purple-800/50 rounded-full" />
              </div>
              <div className="flex flex-col gap-1.5 shrink-0">
                <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-[10px] font-bold text-center">
                  Content
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-[10px] font-bold text-center">
                  Structure
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-[10px] font-bold text-center">
                  Technical
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── PROGRESSION ARROW: 02 → 03 ── */}
        <div className="hidden lg:flex items-center justify-center text-slate-400 dark:text-slate-500 shrink-0 w-6 xl:w-7">
          <svg className="w-5 h-5 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>

        {/* ── CARD 03: FIND OPPORTUNITIES ── */}
        <div className="relative bg-[#FFF9F5] dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/40 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-2xs space-y-5 flex-1 min-w-0 group hover:shadow-sm transition-all">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-500/15 border border-orange-500/25 flex items-center justify-center text-[#FF5A1F] shrink-0">
                <BarChart3 size={18} />
              </div>
              <div>
                <span className="text-xs font-black text-[#FF5A1F] font-mono tracking-wider block">
                  03
                </span>
                <h3 className="text-base font-extrabold text-foreground tracking-tight leading-tight">
                  Find Opportunities
                </h3>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We identify citation gaps, missing direct answers, and broken links.
            </p>
          </div>

          {/* Card 03 Illustration: 3 Issue & Opportunity finding pills */}
          <div className="h-[135px] flex flex-col justify-center">
            <div className="space-y-1.5">
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl px-2.5 py-1.5 flex items-center gap-2 text-[11px] font-bold">
                <div className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                  !
                </div>
                <span>Missing answers</span>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 rounded-xl px-2.5 py-1.5 flex items-center gap-2 text-[11px] font-bold">
                <Link2 size={13} className="shrink-0 text-amber-600" />
                <span>Broken links</span>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl px-2.5 py-1.5 flex items-center gap-2 text-[11px] font-bold">
                <FileCheck size={13} className="shrink-0 text-blue-600" />
                <span>Citation opportunities</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── PROGRESSION ARROW: 03 → 04 ── */}
        <div className="hidden lg:flex items-center justify-center text-slate-400 dark:text-slate-500 shrink-0 w-6 xl:w-7">
          <svg className="w-5 h-5 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>

        {/* ── CARD 04: TAKE ACTION ── */}
        <div className="relative bg-[#F2FBF6] dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-2xs space-y-5 flex-1 min-w-0 group hover:shadow-sm transition-all">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <CheckSquare size={18} />
              </div>
              <div>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-wider block">
                  04
                </span>
                <h3 className="text-base font-extrabold text-foreground tracking-tight leading-tight">
                  Take Action
                </h3>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Turn findings into concrete tasks for your team to implement.
            </p>
          </div>

          {/* Card 04 Illustration: Action Checklist */}
          <div className="h-[135px] flex flex-col justify-center">
            <div className="bg-white dark:bg-card border border-emerald-200/70 dark:border-emerald-800/40 rounded-xl p-2.5 shadow-xs space-y-1.5">
              <div className="flex items-center gap-2 text-[11px] font-semibold text-foreground">
                <CheckSquare size={13} className="text-emerald-500 shrink-0" />
                <span>Fix technical issues</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-semibold text-foreground">
                <CheckSquare size={13} className="text-emerald-500 shrink-0" />
                <span>Add direct answers</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-semibold text-foreground">
                <CheckSquare size={13} className="text-emerald-500 shrink-0" />
                <span>Improve internal linking</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                <Square size={13} className="text-muted-foreground/60 shrink-0" />
                <span>Track progress</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── BOTTOM SEGMENTED PROGRESS & ANNOTATION (Matching Reference) ── */}
      <div className="pt-2 relative flex items-center justify-center">
        {/* Center Progress Segments */}
        <div className="flex items-center justify-center gap-1.5">
          <span className="w-6 h-1.5 bg-blue-500 rounded-full" />
          <span className="w-1.5 h-1.5 bg-slate-200 dark:bg-muted rounded-full" />
          <span className="w-1.5 h-1.5 bg-slate-200 dark:bg-muted rounded-full" />
          <span className="w-1.5 h-1.5 bg-slate-200 dark:bg-muted rounded-full" />
        </div>

        {/* Right Subtle Hand-Drawn Annotation */}
        <div className="absolute right-0 bottom-0 hidden md:flex items-center gap-2 text-[11px] font-medium text-slate-400 dark:text-muted-foreground italic select-none pointer-events-none">
          <div className="text-right leading-tight">
            <p className="text-[11px]">Better visibility</p>
            <p className="font-semibold text-slate-500 dark:text-slate-400 text-[11px]">Higher impact</p>
          </div>
          <svg className="w-6 h-6 text-slate-400 -mt-1.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 19C10 17 15 14 18 7" />
            <path d="M12 7H18V13" />
          </svg>
        </div>
      </div>

    </div>
  );
}


