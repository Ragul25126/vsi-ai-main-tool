"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import HealthHeroIllustration from "./illustrations/HealthHeroIllustration";

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
  score = 70,
  criticalCount = 1,
  needsAttentionCount = 3,
  passedCount = 8,
}: WebsiteHealthHeroProps) {
  // Determine dynamic health tier based on score
  const isHigh = score >= 80 && criticalCount === 0;
  const isMedium = score >= 65 && score < 80 && criticalCount < 2;
  const isLow = !isHigh && !isMedium;

  // Config based on health tier
  let statusBadgeBg = "bg-[#FFEAEA] text-[#E02424] dark:bg-rose-950/60 dark:text-rose-400";
  let statusBadgeLabel = "Needs Work";
  let verdictText = "Below Average";
  let verdictTextColor = "text-slate-500 dark:text-muted-foreground";
  let headline = "Your website needs some attention";
  let description = "A few important issues are affecting how often your website appears in search and AI results.";
  let progressBarColor = "#F04438"; // Coral red

  if (isHigh) {
    statusBadgeBg = "bg-[#E8F8F0] text-[#00A86B] dark:bg-emerald-950/60 dark:text-emerald-400";
    statusBadgeLabel = "Great Shape";
    verdictText = "Optimal";
    verdictTextColor = "text-emerald-600 dark:text-emerald-400";
    headline = "Your website is in great shape";
    description = "Your website is performing well and is optimized to appear frequently in Google search and AI results.";
    progressBarColor = "#00BA7C"; // Emerald
  } else if (isMedium) {
    statusBadgeBg = "bg-[#FFF4E5] text-[#D97706] dark:bg-amber-950/60 dark:text-amber-400";
    statusBadgeLabel = "Fair Shape";
    verdictText = "Good Shape";
    verdictTextColor = "text-amber-600 dark:text-amber-400";
    headline = "Good shape, with a few things worth fixing";
    description = "Your website is performing well. Fixing a few pending items will significantly boost your visibility.";
    progressBarColor = "#F5A623"; // Amber
  }

  return (
    <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* ── LEFT & CENTER: Exact Symbol + Details + Linear Progress + 3 Stat Boxes ── */}
        <div className="lg:col-span-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8">
          
          {/* Left Exact Dynamic Health Symbol */}
          <div className="flex flex-col items-center justify-center shrink-0 mx-auto sm:mx-0">
            <div className="relative w-28 h-28 flex items-center justify-center">
              
              {/* Dynamic SVG Symbol */}
              <svg viewBox="0 0 120 120" className="w-full h-full">
                
                {/* 1. LOW HEALTH STATE (<65 Score): Coral Red Warning Triangle with Floating Radiating Rays */}
                {isLow && (
                  <g>
                    {/* Soft Pink Background Circle */}
                    <circle cx="60" cy="60" r="54" fill="#FFEAEA" className="dark:fill-rose-950/40" />

                    {/* 4 Floating Coral Red Ray Dashes (Completely separated, no overlap) */}
                    <line x1="26" y1="28" x2="34" y2="36" stroke="#F04438" strokeWidth="3.5" strokeLinecap="round" />
                    <line x1="20" y1="52" x2="28" y2="52" stroke="#F04438" strokeWidth="3.5" strokeLinecap="round" />
                    <line x1="94" y1="28" x2="86" y2="36" stroke="#F04438" strokeWidth="3.5" strokeLinecap="round" />
                    <line x1="100" y1="52" x2="92" y2="52" stroke="#F04438" strokeWidth="3.5" strokeLinecap="round" />

                    {/* Smooth Rounded Coral Red Warning Triangle */}
                    <path
                      d="M 54.5,28 C 57,23.5 63,23.5 65.5,28 L 84.5,63 C 87,67.5 84,73 78.5,73 L 41.5,73 C 36,73 33,67.5 35.5,63 Z"
                      fill="#F04438"
                    />

                    {/* White Exclamation Mark: Pill + Circle Dot */}
                    <rect x="57.5" y="40" width="5" height="16" rx="2.5" fill="#FFFFFF" />
                    <circle cx="60" cy="63.5" r="2.8" fill="#FFFFFF" />
                  </g>
                )}

                {/* 2. MEDIUM HEALTH STATE (65-79 Score): Amber Warning Triangle */}
                {isMedium && (
                  <g>
                    {/* Soft Amber Background Circle */}
                    <circle cx="60" cy="60" r="54" fill="#FFF4E5" className="dark:fill-amber-950/40" />

                    {/* 4 Floating Amber Ray Dashes */}
                    <line x1="26" y1="28" x2="34" y2="36" stroke="#F5A623" strokeWidth="3.5" strokeLinecap="round" />
                    <line x1="20" y1="52" x2="28" y2="52" stroke="#F5A623" strokeWidth="3.5" strokeLinecap="round" />
                    <line x1="94" y1="28" x2="86" y2="36" stroke="#F5A623" strokeWidth="3.5" strokeLinecap="round" />
                    <line x1="100" y1="52" x2="92" y2="52" stroke="#F5A623" strokeWidth="3.5" strokeLinecap="round" />

                    {/* Smooth Rounded Amber Triangle */}
                    <path
                      d="M 54.5,28 C 57,23.5 63,23.5 65.5,28 L 84.5,63 C 87,67.5 84,73 78.5,73 L 41.5,73 C 36,73 33,67.5 35.5,63 Z"
                      fill="#F5A623"
                    />

                    {/* White Exclamation Mark */}
                    <rect x="57.5" y="40" width="5" height="16" rx="2.5" fill="#FFFFFF" />
                    <circle cx="60" cy="63.5" r="2.8" fill="#FFFFFF" />
                  </g>
                )}

                {/* 3. HIGH HEALTH STATE (>=80 Score): Emerald Success Badge */}
                {isHigh && (
                  <g>
                    {/* Soft Emerald Background Circle */}
                    <circle cx="60" cy="60" r="54" fill="#E8F8F0" className="dark:fill-emerald-950/40" />

                    {/* 4 Floating Emerald Ray Dashes (Clean separation around badge) */}
                    <line x1="26" y1="28" x2="34" y2="36" stroke="#00BA7C" strokeWidth="3.5" strokeLinecap="round" />
                    <line x1="20" y1="56" x2="28" y2="56" stroke="#00BA7C" strokeWidth="3.5" strokeLinecap="round" />
                    <line x1="94" y1="28" x2="86" y2="36" stroke="#00BA7C" strokeWidth="3.5" strokeLinecap="round" />
                    <line x1="100" y1="56" x2="92" y2="56" stroke="#00BA7C" strokeWidth="3.5" strokeLinecap="round" />

                    {/* Smooth Solid Emerald Circle */}
                    <circle cx="60" cy="56" r="22" fill="#00BA7C" />

                    {/* White Bold Centered Checkmark */}
                    <path
                      d="M 49 56 L 56 63 L 71 48"
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                )}

              </svg>
            </div>

            {/* Label Below Symbol */}
            <div className="mt-1.5 text-center">
              <p className="text-sm font-black text-slate-900 dark:text-foreground leading-tight">
                Website Health
              </p>
              <p className={`text-xs font-semibold leading-tight mt-0.5 ${verdictTextColor}`}>
                {verdictText}
              </p>
            </div>
          </div>

          {/* Right Details Column */}
          <div className="flex-1 space-y-4 w-full">
            
            {/* Status Pill + Headline + Description */}
            <div className="space-y-1.5">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black ${statusBadgeBg}`}>
                {statusBadgeLabel}
              </span>

              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-foreground tracking-tight leading-tight">
                {headline}
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                {description}
              </p>
            </div>

            {/* Linear Progress Bar with Score */}
            <div className="flex items-center gap-4 pt-1">
              <div className="flex-1 h-3.5 bg-slate-100 dark:bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${Math.min(100, Math.max(5, score))}%`,
                    backgroundColor: progressBarColor,
                  }}
                />
              </div>
              <div className="shrink-0 text-sm font-black text-slate-900 dark:text-foreground">
                <span style={{ color: progressBarColor }} className="text-base font-black">
                  {score}
                </span>
                <span className="text-slate-400 dark:text-muted-foreground font-bold"> / 100</span>
              </div>
            </div>

            {/* 3 Metric Stat Boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              
              {/* Box 1: Checks passed */}
              <div className="bg-[#E8F8F0] dark:bg-emerald-950/30 border border-[#D1F2E2] dark:border-emerald-900/40 rounded-2xl px-3.5 py-3 flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#00BA7C] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                  ✓
                </div>
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-base font-black text-slate-900 dark:text-foreground leading-none">
                      {passedCount}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-tight mt-0.5">
                    Checks passed
                  </p>
                </div>
              </div>

              {/* Box 2: Need attention */}
              <div className="bg-[#FFF6E9] dark:bg-amber-950/30 border border-[#FFE8CC] dark:border-amber-900/40 rounded-2xl px-3.5 py-3 flex items-center gap-3">
                <div className="w-6 h-6 rounded-lg bg-[#F5A623]/20 text-[#D97706] dark:text-amber-400 flex items-center justify-center shrink-0">
                  <AlertTriangle size={15} className="stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-base font-black text-slate-900 dark:text-foreground leading-none">
                      {needsAttentionCount}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-tight mt-0.5">
                    Need attention
                  </p>
                </div>
              </div>

              {/* Box 3: Critical issues */}
              <div className="bg-[#FFF0F0] dark:bg-rose-950/30 border border-[#FFE0E0] dark:border-rose-900/40 rounded-2xl px-3.5 py-3 flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#EF4444] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                  !
                </div>
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-base font-black text-slate-900 dark:text-foreground leading-none">
                      {criticalCount}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-tight mt-0.5">
                    Critical issues
                  </p>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* ── RIGHT: Symmetrical Visual Mockup with Vertical Border Divider ── */}
        <div className="lg:col-span-4 flex items-center justify-center lg:border-l border-slate-100 dark:border-border/60 lg:pl-6 py-2">
          <HealthHeroIllustration className="w-full max-w-sm" />
        </div>

      </div>

    </div>
  );
}
