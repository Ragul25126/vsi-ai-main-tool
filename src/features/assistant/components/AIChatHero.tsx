"use client";

import React from "react";
import Link from "next/link";
import { 
  Sparkles, MessageSquare, Globe, Zap, ArrowRight, ShieldCheck
} from "lucide-react";
import AIChatDemo from "./AIChatDemo";

export default function AIChatHero() {
  return (
    <div className="w-full max-w-[1360px] mx-auto flex items-center justify-center">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-14 items-center w-full">
        
        {/* ── LEFT COLUMN (VSI Narrative & Proportional Typography) ── */}
        <div className="lg:col-span-5 xl:col-span-5 space-y-4 sm:space-y-5 min-w-0 max-w-[500px]">
          
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF5A1F]/10 border border-[#FF5A1F]/25 text-[#FF5A1F] text-[11px] font-black shadow-2xs">
            <Sparkles size={12} className="text-[#FF5A1F]" />
            <span className="uppercase tracking-wider">AI Search Intelligence</span>
          </div>

          {/* VSI Headline — Balanced SaaS scale */}
          <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-black text-foreground tracking-tight leading-[1.18]">
            Understand why AI mentions your competitors and skips your brand.
          </h1>

          {/* Supporting Copy */}
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md">
            VSI analyzes Google and AI search visibility, identifies citation gaps, explains why competitors are being cited, and turns findings into verified execution tasks.
          </p>

          {/* Feature Bullets — Compact & Crisp */}
          <div className="space-y-2.5 pt-1">
            
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-[#FF5A1F]/10 border border-[#FF5A1F]/20 flex items-center justify-center shrink-0 mt-0.5 text-[#FF5A1F]">
                <MessageSquare size={13} />
              </div>
              <p className="text-xs font-bold text-foreground">
                Ask questions about your search visibility in plain language
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-[#FF5A1F]/10 border border-[#FF5A1F]/20 flex items-center justify-center shrink-0 mt-0.5 text-[#FF5A1F]">
                <Globe size={13} />
              </div>
              <p className="text-xs font-bold text-foreground">
                Get answers grounded in live VSI SERP and AI citation data
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-[#FF5A1F]/10 border border-[#FF5A1F]/20 flex items-center justify-center shrink-0 mt-0.5 text-[#FF5A1F]">
                <Zap size={13} />
              </div>
              <p className="text-xs font-bold text-foreground">
                Analyze rankings, AI citations, and competitor dominance
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-[#FF5A1F]/10 border border-[#FF5A1F]/20 flex items-center justify-center shrink-0 mt-0.5 text-[#FF5A1F]">
                <ShieldCheck size={13} />
              </div>
              <p className="text-xs font-bold text-foreground">
                Turn AI visibility gaps directly into verified execution tasks
              </p>
            </div>

          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex items-center gap-2.5 flex-wrap">
            <Link
              href="/dashboard/tasks"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#FF5A1F] hover:bg-[#E04810] text-white text-xs font-black shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <span>Explore Action Board</span>
              <ArrowRight size={13} />
            </Link>

            <Link
              href="/dashboard/check?tab=quick-check"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-card hover:bg-muted border border-border text-foreground text-xs font-bold shadow-2xs transition-colors"
            >
              <span>Run Live Check</span>
            </Link>
          </div>

        </div>

        {/* ── RIGHT COLUMN (Compact Viewport-Fitting AI Demo) ── */}
        <div className="lg:col-span-7 xl:col-span-7 flex justify-center lg:justify-end min-w-0 w-full">
          <AIChatDemo />
        </div>

      </div>
    </div>
  );
}
