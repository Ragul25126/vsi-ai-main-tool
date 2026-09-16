"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import type { FriendlyAuditItem } from "../lib/audit-translations";
import VisualIssueCard from "./VisualIssueCard";

interface VisualIssueGridProps {
  items: FriendlyAuditItem[];
  addedTasks: Set<string>;
  onSelectIssue: (item: FriendlyAuditItem) => void;
  onViewAll?: () => void;
}

export default function VisualIssueGrid({
  items,
  addedTasks,
  onSelectIssue,
  onViewAll,
}: VisualIssueGridProps) {
  // Always show top 3 only
  const topItems = items.slice(0, 3);

  if (topItems.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            What needs your attention
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Fix these important items first to improve your visibility.
          </p>
        </div>

        <button
          type="button"
          onClick={onViewAll}
          className="flex items-center gap-1.5 text-xs font-bold text-[#FF5A1F] hover:text-[#E04810] transition-colors shrink-0 mt-1 cursor-pointer"
        >
          <span>View all issues</span>
          <ArrowRight size={13} />
        </button>
      </div>

      {/* 3-Column Grid on large desktop, 2-col tablet, 1-col mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {topItems.map((item) => (
          <VisualIssueCard
            key={item.id}
            item={item}
            isAdded={addedTasks.has(item.id)}
            onActionClick={onSelectIssue}
          />
        ))}
      </div>
    </div>
  );
}
