"use client";

import React from "react";
import { Search, Cpu, Sparkles, CheckSquare } from "lucide-react";

export default function AuditProcessWorkflow() {
  const steps = [
    {
      num: "01",
      title: "Scan",
      desc: "We inspect your website pages, crawlability, and server speed.",
      icon: Search,
      badgeColor: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      accentBg: "bg-blue-500",
    },
    {
      num: "02",
      title: "Understand",
      desc: "We analyze how search engines and AI assistants read your content.",
      icon: Cpu,
      badgeColor: "bg-purple-500/10 text-purple-600 border-purple-500/20",
      accentBg: "bg-purple-500",
    },
    {
      num: "03",
      title: "Find Opportunities",
      desc: "We identify citation gaps, missing direct answers, and broken links.",
      icon: Sparkles,
      badgeColor: "bg-[#FF5A1F]/10 text-[#FF5A1F] border-[#FF5A1F]/20",
      accentBg: "bg-[#FF5A1F]",
    },
    {
      num: "04",
      title: "Take Action",
      desc: "Turn findings into concrete tasks for your team to implement.",
      icon: CheckSquare,
      badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      accentBg: "bg-emerald-500",
    },
  ];

  return (
    <div className="bg-white dark:bg-card border border-border/80 rounded-2xl lg:rounded-[22px] p-6 sm:p-8 lg:p-10 shadow-xs space-y-6">
      <div className="space-y-1">
        <span className="text-xs font-black text-[#FF5A1F] uppercase tracking-widest block">
          Automated Intelligence
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
          How VSI Checks Your Website
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
          Four simple steps from comprehensive website scan to clear, prioritized action tasks.
        </p>
      </div>

      {/* 4 Connected Steps Flow */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isLast = idx === steps.length - 1;

          return (
            <div key={step.num} className="relative flex flex-col justify-between space-y-3">
              {/* Connector line for desktop */}
              {!isLast && (
                <div className="hidden lg:block absolute top-4 left-[calc(100%-12px)] w-[calc(100%-24px)] h-0.5 bg-gradient-to-r from-border to-transparent -translate-y-1/2 z-0 pointer-events-none" />
              )}

              <div className="space-y-3 z-10">
                {/* Step number badge & Icon */}
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-xl font-mono text-xs font-black flex items-center justify-center border shadow-2xs ${step.badgeColor}`}>
                    {step.num}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-muted/60 flex items-center justify-center text-foreground">
                    <Icon size={15} />
                  </div>
                </div>

                {/* Step Title & Explanation */}
                <h3 className="text-sm font-bold text-foreground">
                  {step.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {step.desc}
                </p>
              </div>

              <div className="pt-2">
                <div className="w-full bg-muted/40 h-1 rounded-full overflow-hidden">
                  <div className={`h-full w-full ${step.accentBg} opacity-80`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
