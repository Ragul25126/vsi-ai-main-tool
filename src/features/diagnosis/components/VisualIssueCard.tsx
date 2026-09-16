"use client";

import React from "react";
import { AlertCircle, AlertTriangle, Check, ArrowRight } from "lucide-react";
import type { FriendlyAuditItem } from "../lib/audit-translations";

import BrokenLinksIllustration from "./illustrations/BrokenLinksIllustration";
import AISearchIllustration from "./illustrations/AISearchIllustration";
import DirectoryIllustration from "./illustrations/DirectoryIllustration";
import ContentIllustration from "./illustrations/ContentIllustration";
import PerformanceIllustration from "./illustrations/PerformanceIllustration";

interface VisualIssueCardProps {
  item: FriendlyAuditItem;
  isAdded: boolean;
  onActionClick: (item: FriendlyAuditItem) => void;
}

export default function VisualIssueCard({
  item,
  isAdded,
  onActionClick,
}: VisualIssueCardProps) {
  const isCritical = item.priority === "critical" || item.rawItem.status === "fail";
  const isImportant = item.priority === "important" || item.rawItem.status === "warning";

  // CTA label matching reference
  const ctaLabel = isCritical ? "Fix this" : "View pages";

  // Card border/background tint per severity
  const cardClass = isCritical
    ? "border-rose-200/70 dark:border-rose-900/30 bg-rose-50/30 dark:bg-rose-950/10"
    : isImportant
    ? "border-amber-200/70 dark:border-amber-900/30 bg-amber-50/30 dark:bg-amber-950/10"
    : "border-blue-200/60 dark:border-blue-900/25 bg-blue-50/20 dark:bg-blue-950/10";

  // Priority badge styles
  const badgeClass = isCritical
    ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
    : isImportant
    ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
    : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";

  // Select illustration component
  const Illustration = (() => {
    switch (item.illustration) {
      case "broken_links":   return BrokenLinksIllustration;
      case "ai_search":      return AISearchIllustration;
      case "directory":      return DirectoryIllustration;
      case "performance":    return PerformanceIllustration;
      case "content":
      default:               return ContentIllustration;
    }
  })();

  return (
    <div
      className={`rounded-2xl border transition-all shadow-xs hover:shadow-md group relative overflow-hidden flex flex-col ${cardClass}`}
    >
      {/* Illustration — top-right corner, absolute */}
      <div className="absolute top-3 right-3 opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300 pointer-events-none">
        <Illustration className="w-24 h-20" />
      </div>

      {/* Card body */}
      <div className="p-5 flex flex-col flex-1 gap-3 z-10">

        {/* Priority badge */}
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badgeClass}`}
          >
            {isCritical ? (
              <AlertCircle size={11} className="shrink-0" />
            ) : (
              <AlertTriangle size={11} className="shrink-0" />
            )}
            <span>{item.priorityLabel}</span>
          </span>
        </div>

        {/* Title — leave space for illustration */}
        <div className="pr-24 sm:pr-28">
          <h3 className="text-sm sm:text-base font-bold text-foreground leading-snug tracking-tight group-hover:text-[#FF5A1F] transition-colors">
            {item.friendlyTitle}
          </h3>
        </div>

        {/* Short explanation */}
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 pr-20 sm:pr-24">
          {item.shortExplanation}
        </p>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom row: affected count + CTA */}
        <div className="pt-3 border-t border-white/60 dark:border-border/40 flex items-center justify-between gap-3">
          <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
            {item.affectedCountText}
          </span>

          <button
            type="button"
            onClick={() => onActionClick(item)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0 ${
              isAdded
                ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30"
                : "bg-[#FF5A1F] hover:bg-[#E04810] text-white hover:shadow-md"
            }`}
          >
            {isAdded ? (
              <>
                <Check size={12} />
                <span>Task Created</span>
              </>
            ) : (
              <>
                <span>{ctaLabel}</span>
                <ArrowRight size={12} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
