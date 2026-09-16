"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";

interface AuditSummaryPillarsProps {
  passedCount: number;
  needsAttentionCount: number;
  criticalCount: number;
  activeFilter: string;
  onSelectFilter: (filter: string) => void;
}

export default function AuditSummaryPillars({
  passedCount,
  needsAttentionCount,
  criticalCount,
  activeFilter,
  onSelectFilter,
}: AuditSummaryPillarsProps) {
  const cards = [
    {
      id: "pass",
      title: "Passed",
      count: passedCount,
      unit: "checks verified",
      desc: "Working smoothly across search & AI",
      icon: CheckCircle2,
      color: "text-emerald-500",
      badge: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      borderColor: "hover:border-emerald-500/50",
      activeBorder: "border-emerald-500 ring-2 ring-emerald-500/20",
    },
    {
      id: "warning",
      title: "Needs Attention",
      count: needsAttentionCount,
      unit: "optimizations",
      desc: "Worth fixing to improve performance",
      icon: AlertTriangle,
      color: "text-amber-500",
      badge: "bg-amber-500/10 text-amber-600 border-amber-500/20",
      borderColor: "hover:border-amber-500/50",
      activeBorder: "border-amber-500 ring-2 ring-amber-500/20",
    },
    {
      id: "fail",
      title: "Critical",
      count: criticalCount,
      unit: "important issues",
      desc: "Should fix as soon as possible",
      icon: AlertCircle,
      color: "text-rose-500",
      badge: "bg-rose-500/10 text-rose-600 border-rose-500/20",
      borderColor: "hover:border-rose-500/50",
      activeBorder: "border-rose-500 ring-2 ring-rose-500/20",
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black text-muted-foreground uppercase tracking-wider">
          Your Website at a Glance
        </h3>
        {activeFilter !== "all" && (
          <button
            type="button"
            onClick={() => onSelectFilter("all")}
            className="text-xs text-[#FF5A1F] hover:underline font-bold cursor-pointer"
          >
            Show All Checks
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        {cards.map((c) => {
          const isActive = activeFilter === c.id;
          const Icon = c.icon;

          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelectFilter(isActive ? "all" : c.id)}
              className={`p-5 rounded-2xl bg-white dark:bg-card border border-border/80 text-left transition-all cursor-pointer shadow-xs ${c.borderColor} ${
                isActive ? c.activeBorder : ""
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon size={16} className={c.color} />
                  <span className="text-xs font-bold text-foreground">{c.title}</span>
                </div>
                <span className={`text-[11px] px-2 py-0.5 rounded-md font-extrabold border ${c.badge}`}>
                  {c.count}
                </span>
              </div>

              <div className="flex items-baseline gap-1.5 mt-1">
                <span className={`text-3xl font-black ${c.color} tracking-tight`}>
                  {c.count}
                </span>
                <span className="text-xs font-semibold text-muted-foreground">
                  {c.unit}
                </span>
              </div>

              <p className="text-[11px] text-muted-foreground mt-1.5 leading-snug">
                {c.desc}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
