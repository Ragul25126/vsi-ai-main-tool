"use client";

import React, { useState } from "react";
import { 
  CheckCircle2, AlertTriangle, AlertCircle, ChevronDown, ChevronUp, 
  Plus, Check, FileText, Code2, ArrowRight 
} from "lucide-react";
import type { FriendlyAuditItem } from "../lib/audit-translations";

interface AuditIssueCardProps {
  item: FriendlyAuditItem;
  isAdded: boolean;
  onCreateTask: (item: FriendlyAuditItem) => void;
  onViewPages: (item: FriendlyAuditItem) => void;
  onToggleStatus: (id: string) => void;
}

export default function AuditIssueCard({
  item,
  isAdded,
  onCreateTask,
  onViewPages,
  onToggleStatus,
}: AuditIssueCardProps) {
  const [showTechnical, setShowTechnical] = useState(false);

  const status = item.rawItem.status;
  const isPassed = status === "pass";
  const isCritical = status === "fail" || item.priority === "critical";
  const isWarning = status === "warning";

  const statusConfig = {
    pass: {
      label: "Passed",
      badge: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      icon: CheckCircle2,
    },
    warning: {
      label: "Needs Attention",
      badge: "bg-amber-500/10 text-amber-600 border-amber-500/20",
      icon: AlertTriangle,
    },
    fail: {
      label: "Critical Issue",
      badge: "bg-rose-500/10 text-rose-600 border-rose-500/20",
      icon: AlertCircle,
    },
  }[status];

  const StatusIcon = statusConfig.icon;

  return (
    <div
      className={`p-5 rounded-2xl bg-white dark:bg-card border transition-all shadow-xs space-y-3.5 ${
        isCritical
          ? "border-rose-200/80 dark:border-rose-900/30 hover:border-rose-400"
          : isWarning
          ? "border-amber-200/80 dark:border-amber-900/30 hover:border-amber-400"
          : "border-border/70 hover:border-border"
      }`}
    >
      {/* Header Row: Badges, Title, Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Status Badge */}
          <button
            type="button"
            onClick={() => onToggleStatus(item.id)}
            title="Click to toggle status for QA verification"
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold border cursor-pointer ${statusConfig.badge}`}
          >
            <StatusIcon size={12} />
            <span>{statusConfig.label}</span>
          </button>

          {/* Category */}
          <span className="text-[11px] font-semibold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
            {item.friendlyCategory}
          </span>

          {/* Friendly Title */}
          <h4 className="text-sm font-bold text-foreground">
            {item.friendlyTitle}
          </h4>
        </div>

        {/* Primary Action Button */}
        {!isPassed && (
          <button
            type="button"
            onClick={() => onCreateTask(item)}
            disabled={isAdded}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-xs ${
              isAdded
                ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30"
                : "bg-[#FF5A1F] hover:bg-[#E04810] text-white"
            }`}
          >
            {isAdded ? (
              <>
                <Check size={13} />
                <span>Task Created</span>
              </>
            ) : (
              <>
                <Plus size={13} />
                <span>Create Task</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Body: Why it matters and Recommended Action */}
      <div className="space-y-2 text-xs">
        <p className="text-muted-foreground leading-relaxed">
          <strong className="text-foreground font-semibold">Why this matters: </strong>
          {item.whyItMatters}
        </p>

        {!isPassed && (
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-muted/30 p-2.5 rounded-xl border border-border/60">
            <strong className="text-foreground font-semibold">What you should do: </strong>
            {item.whatToDoNext}
          </p>
        )}
      </div>

      {/* Sub-Footer: Affected Pages Button + Collapsible Technical Details */}
      <div className="pt-2 border-t border-border/60 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onViewPages(item)}
          className="text-xs text-muted-foreground hover:text-foreground font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <FileText size={13} className="text-[#FF5A1F]" />
          <span>Affects <strong className="text-foreground">{item.affectedPages.length}</strong> {item.affectedPages.length === 1 ? "page" : "pages"}</span>
          <span className="text-[10px] text-[#FF5A1F] underline ml-1">View pages</span>
        </button>

        <button
          type="button"
          onClick={() => setShowTechnical(!showTechnical)}
          className="text-[11px] text-muted-foreground hover:text-foreground font-medium flex items-center gap-1 cursor-pointer transition-colors"
        >
          <Code2 size={12} className="text-muted-foreground/70" />
          <span>Advanced technical details</span>
          {showTechnical ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {/* Advanced Technical Details Dropdown */}
      {showTechnical && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-2 font-sans animate-fadeIn">
          <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground pb-1 border-b border-border/60">
            <span>TECHNICAL CHECK: <strong className="text-foreground font-semibold">{item.rawItem.title}</strong></span>
            <span className="bg-muted px-1.5 py-0.5 rounded font-bold">[{item.id}]</span>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Observed crawler state: </strong>
              {item.rawItem.details}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              <strong className="text-[#FF5A1F]">Developer remediation plan: </strong>
              {item.rawItem.recommendation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
