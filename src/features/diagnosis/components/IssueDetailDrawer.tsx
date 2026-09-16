"use client";

import React, { useState } from "react";
import { 
  X, AlertCircle, AlertTriangle, Globe, 
  Plus, Check, Code2, ChevronDown, ChevronUp 
} from "lucide-react";
import type { FriendlyAuditItem } from "../lib/audit-translations";

interface IssueDetailDrawerProps {
  item: FriendlyAuditItem | null;
  isOpen: boolean;
  isTaskAdded: boolean;
  onClose: () => void;
  onCreateTask: (item: FriendlyAuditItem) => void;
}

export default function IssueDetailDrawer({
  item,
  isOpen,
  isTaskAdded,
  onClose,
  onCreateTask,
}: IssueDetailDrawerProps) {
  const [showTechnical, setShowTechnical] = useState(false);

  if (!isOpen || !item) return null;

  const isCritical = item.priority === "critical" || item.rawItem.status === "fail";
  const isImportant = item.priority === "important" || item.rawItem.status === "warning";

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end animate-fadeIn">
      {/* Slide-over Drawer Panel */}
      <div className="bg-white dark:bg-card border-l border-border/80 w-full max-w-lg h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-slideLeft">
        
        {/* Drawer Header */}
        <div className="p-6 border-b border-border/80 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                  isCritical
                    ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                    : isImportant
                    ? "bg-amber-500/10 text-amber-700 border-amber-500/20"
                    : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                }`}
              >
                {isCritical ? <AlertCircle size={11} /> : <AlertTriangle size={11} />}
                <span>{item.priorityLabel} Issue</span>
              </span>

              <span className="text-[11px] font-semibold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                {item.friendlyCategory}
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground p-1.5 rounded-xl hover:bg-muted transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <h2 className="text-lg sm:text-xl font-black text-foreground tracking-tight leading-snug">
            {item.friendlyTitle}
          </h2>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          
          {/* Section 1: What We Found */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-wider">
              What We Found
            </h3>
            <p className="text-xs sm:text-sm text-foreground font-medium leading-relaxed bg-muted/30 p-3.5 rounded-xl border border-border/70">
              {item.shortExplanation}
            </p>
          </div>

          {/* Section 2: Why It Matters */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-wider">
              Why It Matters
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {item.whyItMatters}
            </p>
          </div>

          {/* Section 3: Affected Pages */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-muted-foreground uppercase tracking-wider">
                Affected Pages ({item.affectedPages.length})
              </h3>
              <span className="text-[11px] text-muted-foreground font-semibold">
                {item.affectedCountText}
              </span>
            </div>

            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {item.affectedPages.map((page, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/70 text-xs text-foreground font-mono"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Globe size={13} className="text-[#FF5A1F] shrink-0" />
                    <span className="truncate">{page}</span>
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase px-2 py-0.5 rounded bg-background border border-border/60 shrink-0">
                    Target
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: What You Should Do */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-wider">
              What You Should Do
            </h3>
            <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-foreground space-y-1">
              <p className="font-bold text-amber-800 dark:text-amber-300">Recommended Action:</p>
              <p className="text-muted-foreground leading-relaxed">{item.whatToDoNext}</p>
            </div>
          </div>

          {/* Section 5: Advanced Technical Details (Collapsible) */}
          <div className="pt-2 border-t border-border/70 space-y-2">
            <button
              type="button"
              onClick={() => setShowTechnical(!showTechnical)}
              className="w-full py-2 flex items-center justify-between text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Code2 size={13} className="text-[#FF5A1F]" />
                <span>Advanced technical details</span>
              </span>
              {showTechnical ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showTechnical && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-2.5 font-sans animate-fadeIn">
                <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground pb-1 border-b border-border/60">
                  <span>TEST: {item.rawItem.title}</span>
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
                    <strong className="text-[#FF5A1F]">Developer remediation: </strong>
                    {item.rawItem.recommendation}
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Drawer Footer Actions */}
        <div className="p-5 border-t border-border/80 bg-muted/20 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-bold transition-all cursor-pointer"
          >
            Close
          </button>

          <button
            type="button"
            onClick={() => onCreateTask(item)}
            disabled={isTaskAdded}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ${
              isTaskAdded
                ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30"
                : "bg-[#FF5A1F] hover:bg-[#E04810] text-white hover:shadow-md"
            }`}
          >
            {isTaskAdded ? (
              <>
                <Check size={14} />
                <span>Task Created</span>
              </>
            ) : (
              <>
                <Plus size={14} />
                <span>Create Task</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
