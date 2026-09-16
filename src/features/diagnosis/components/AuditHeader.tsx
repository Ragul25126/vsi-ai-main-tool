"use client";

import React from "react";
import { RefreshCw, Globe, Loader2 } from "lucide-react";

interface AuditHeaderProps {
  clientName: string;
  clientWebsite: string;
  lastChecked?: string;
  isRunning: boolean;
  onRunAudit: () => void;
}

export default function AuditHeader({
  clientName,
  clientWebsite,
  lastChecked = "Today, 2:30 PM",
  isRunning,
  onRunAudit,
}: AuditHeaderProps) {
  return (
    <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            Site Audit
          </h1>
          <span className="text-muted-foreground/60 hidden sm:inline">•</span>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-muted/60 text-foreground text-xs font-bold border border-border/70">
            <span>{clientName}</span>
            <span className="text-muted-foreground font-normal">({clientWebsite})</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Globe size={12} className="text-[#FF5A1F]" />
          <span>Last checked: <strong className="text-foreground font-medium">{lastChecked}</strong></span>
        </p>
      </div>

      <button
        type="button"
        onClick={onRunAudit}
        disabled={isRunning}
        className="px-5 py-2.5 rounded-xl bg-[#FF5A1F] hover:bg-[#E04810] text-white text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer disabled:opacity-50 shrink-0 flex items-center justify-center gap-2"
      >
        {isRunning ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            <span>Scanning Site...</span>
          </>
        ) : (
          <>
            <RefreshCw size={14} />
            <span>Run Full Audit</span>
          </>
        )}
      </button>
    </div>
  );
}
