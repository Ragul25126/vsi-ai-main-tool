"use client";

import React from "react";
import { X, ExternalLink, Globe, AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { FriendlyAuditItem } from "../lib/audit-translations";

interface AffectedPagesModalProps {
  item: FriendlyAuditItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AffectedPagesModal({
  item,
  isOpen,
  onClose,
}: AffectedPagesModalProps) {
  if (!isOpen || !item) return null;

  const isCritical = item.priority === "critical" || item.rawItem.status === "fail";
  const isWarning = item.rawItem.status === "warning";

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-card border border-border/80 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-scaleIn">
        {/* Modal Header */}
        <div className="p-5 border-b border-border/80 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                  isCritical
                    ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                    : isWarning
                    ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                    : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                }`}
              >
                {isCritical ? <AlertCircle size={11} /> : isWarning ? <AlertTriangle size={11} /> : <CheckCircle2 size={11} />}
                <span>{item.friendlyCategory}</span>
              </span>
            </div>
            <h3 className="text-base font-bold text-foreground">
              {item.friendlyTitle}
            </h3>
            <p className="text-xs text-muted-foreground">
              {item.whyItMatters}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors cursor-pointer shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Affected Pages List */}
        <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>Affected Pages & Sections ({item.affectedPages.length})</span>
            <span className="text-[11px]">Recommended action applies to:</span>
          </div>

          <div className="space-y-2">
            {item.affectedPages.map((page, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/70 text-xs font-medium text-foreground hover:bg-muted/70 transition-colors"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <Globe size={14} className="text-[#FF5A1F] shrink-0" />
                  <span className="truncate font-mono text-[11px]">{page}</span>
                </div>
                <span className="text-[10px] font-bold text-muted-foreground/70 uppercase px-2 py-0.5 rounded bg-background border border-border/60 shrink-0">
                  Target URL
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 space-y-1">
            <p className="font-bold">What to do on these pages:</p>
            <p className="text-[11px] leading-relaxed text-muted-foreground">{item.whatToDoNext}</p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-muted/20 border-t border-border/80 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
