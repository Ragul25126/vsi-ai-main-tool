"use client";

import React from "react";
import { AlertCircle, AlertTriangle, Check } from "lucide-react";
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

  // Select illustration
  const renderIllustration = () => {
    switch (item.illustration) {
      case "broken_links":
        return <BrokenLinksIllustration className="w-28 sm:w-32 h-24 sm:h-28 shrink-0" />;
      case "ai_search":
        return <AISearchIllustration className="w-28 sm:w-32 h-24 sm:h-28 shrink-0" />;
      case "directory":
        return <DirectoryIllustration className="w-28 sm:w-32 h-24 sm:h-28 shrink-0" />;
      case "performance":
        return <PerformanceIllustration className="w-28 sm:w-32 h-24 sm:h-28 shrink-0" />;
      case "content":
      default:
        return <ContentIllustration className="w-28 sm:w-32 h-24 sm:h-28 shrink-0" />;
    }
  };

  return (
    <div
      className={`rounded-2xl p-5 sm:p-6 bg-white dark:bg-card border transition-all shadow-xs flex flex-col justify-between min-h-[200px] sm:min-h-[220px] relative overflow-hidden group hover:shadow-md ${
        isCritical
          ? "border-rose-200/80 dark:border-rose-900/40 hover:border-rose-400"
          : isImportant
          ? "border-amber-200/80 dark:border-amber-900/40 hover:border-amber-400"
          : "border-border/80 hover:border-[#FF5A1F]/50"
      }`}
    >
      {/* Top Header: Priority Badge & Category */}
      <div className="flex items-center justify-between gap-2 mb-2 z-10">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
            isCritical
              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
              : isImportant
              ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
              : "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20"
          }`}
        >
          {isCritical ? (
            <AlertCircle size={11} className="shrink-0" />
          ) : (
            <AlertTriangle size={11} className="shrink-0" />
          )}
          <span>{item.priorityLabel}</span>
        </span>

        <span className="text-[11px] font-semibold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
          {item.friendlyCategory}
        </span>
      </div>

      {/* Center Layout: Title & Text on Left, SVG Art on Right */}
      <div className="flex items-start justify-between gap-4 z-10 my-auto">
        <div className="space-y-1.5 max-w-sm">
          <h3 className="text-base sm:text-lg font-bold text-foreground leading-snug tracking-tight group-hover:text-[#FF5A1F] transition-colors">
            {item.friendlyTitle}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {item.shortExplanation}
          </p>
        </div>

        {/* Right / Bottom-Right SaaS Illustration */}
        <div className="hidden sm:flex items-center justify-center p-1 opacity-90 group-hover:opacity-100 transition-opacity transform group-hover:scale-105 duration-300">
          {renderIllustration()}
        </div>
      </div>

      {/* Bottom Footer: Affected Count + Single Primary Action */}
      <div className="pt-3 border-t border-border/70 flex items-center justify-between gap-3 z-10 mt-3">
        <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          <span>{item.affectedCountText}</span>
        </div>

        <button
          type="button"
          onClick={() => onActionClick(item)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
            isAdded
              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30"
              : "bg-[#FF5A1F] hover:bg-[#E04810] text-white hover:shadow-md"
          }`}
        >
          {isAdded ? (
            <>
              <Check size={13} />
              <span>Task Created</span>
            </>
          ) : (
            <>
              <span>{item.ctaText}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
