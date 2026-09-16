"use client";

import React from "react";
import type { FriendlyAuditItem } from "../lib/audit-translations";
import VisualIssueCard from "./VisualIssueCard";

interface VisualIssueGridProps {
  items: FriendlyAuditItem[];
  addedTasks: Set<string>;
  onSelectIssue: (item: FriendlyAuditItem) => void;
}

export default function VisualIssueGrid({
  items,
  addedTasks,
  onSelectIssue,
}: VisualIssueGridProps) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            What Needs Your Attention
          </h2>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 border border-rose-500/20 font-bold">
            {items.length} Issues to Fix
          </span>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          A few improvements can make your website easier to find, understand and cite across Google and AI search engines.
        </p>
      </div>

      {/* 2-Column Responsive Grid on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {items.map((item) => (
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
