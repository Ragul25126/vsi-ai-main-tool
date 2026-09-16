"use client";

import React from "react";
import { RefreshCw, Loader2, History, ShieldCheck } from "lucide-react";

interface AuditHeaderProps {
  clientName: string;
  clientWebsite: string;
  lastChecked?: string;
  isRunning: boolean;
  onRunAudit: () => void;
  onViewHistory?: () => void;
}

export default function AuditHeader({
  clientName,
  clientWebsite,
  lastChecked = "Today, 2:30 PM",
  isRunning,
  onRunAudit,
  onViewHistory,
}: AuditHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Left: Blue Shield icon + Title + Subtitle + Client Info */}
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-2xs">
          <ShieldCheck size={26} className="stroke-[2.2]" />
        </div>
        <div className="space-y-0.5">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-foreground tracking-tight">
            Site Audit
          </h1>
          <p className="text-xs text-slate-500 dark:text-muted-foreground font-medium">
            Find issues. Improve visibility. Get cited.
          </p>
          <div className="flex items-center gap-2 text-xs pt-0.5">
            <span className="font-extrabold text-slate-900 dark:text-foreground">{clientName}</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-500 dark:text-muted-foreground font-medium">{clientWebsite}</span>
          </div>
        </div>
      </div>

      {/* Right: Last checked timestamp + View History + Run New Audit Button */}
      <div className="flex items-center gap-3 shrink-0 flex-wrap">
        <p className="text-xs text-slate-500 dark:text-muted-foreground font-medium hidden md:block mr-1">
          Last checked: <strong className="text-slate-900 dark:text-foreground font-bold">{lastChecked}</strong>
        </p>

        <button
          type="button"
          onClick={onViewHistory}
          className="px-4 py-2.5 rounded-xl bg-white dark:bg-card border border-slate-200 dark:border-border hover:bg-slate-50 dark:hover:bg-muted text-slate-800 dark:text-foreground text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2"
        >
          <History size={14} className="text-slate-500" />
          <span>View History</span>
        </button>

        <button
          type="button"
          onClick={onRunAudit}
          disabled={isRunning}
          className="px-5 py-2.5 rounded-xl bg-[#FF5A1F] hover:bg-[#E04B14] text-white text-xs font-black transition-all shadow-xs hover:shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-2"
        >
          {isRunning ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Scanning Site...</span>
            </>
          ) : (
            <>
              <RefreshCw size={14} className="stroke-[2.5]" />
              <span>Run New Audit</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
