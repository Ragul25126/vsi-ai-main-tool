"use client";

import React from "react";
import { AlertCircle, AlertTriangle, ArrowRight, Plus, Check, FileText } from "lucide-react";
import type { FriendlyAuditItem } from "../lib/audit-translations";

interface TopPrioritiesSectionProps {
  priorityItems: FriendlyAuditItem[];
  addedTasks: Set<string>;
  onCreateTask: (item: FriendlyAuditItem) => void;
  onViewPages: (item: FriendlyAuditItem) => void;
}

export default function TopPrioritiesSection({
  priorityItems,
  addedTasks,
  onCreateTask,
  onViewPages,
}: TopPrioritiesSectionProps) {
  if (priorityItems.length === 0) return null;

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm sm:text-base font-black text-foreground tracking-tight flex items-center gap-2">
            <span>What Needs Your Attention</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 border border-rose-500/20 font-bold">
              Top Priorities ({priorityItems.length})
            </span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Fix these high-impact items first to protect your traffic and AI citations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {priorityItems.map((item) => {
          const isAdded = addedTasks.has(item.id);
          const isCritical = item.priority === "critical" || item.rawItem.status === "fail";

          return (
            <div
              key={item.id}
              className={`p-5 rounded-2xl bg-white dark:bg-card border transition-all shadow-xs flex flex-col justify-between space-y-4 ${
                isCritical
                  ? "border-rose-200 dark:border-rose-900/40 hover:border-rose-400"
                  : "border-amber-200 dark:border-amber-900/40 hover:border-amber-400"
              }`}
            >
              <div className="space-y-3">
                {/* Priority & Category Badge */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${
                      isCritical
                        ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                        : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                    }`}
                  >
                    {isCritical ? <AlertCircle size={12} /> : <AlertTriangle size={12} />}
                    <span>{isCritical ? "Critical Issue" : "Important Optimization"}</span>
                  </span>

                  <span className="text-[11px] font-semibold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                    {item.friendlyCategory}
                  </span>
                </div>

                {/* Friendly Title */}
                <h4 className="text-sm sm:text-base font-bold text-foreground leading-snug">
                  {item.friendlyTitle}
                </h4>

                {/* Why It Matters */}
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong className="text-foreground font-semibold">Why this matters: </strong>
                  {item.whyItMatters}
                </p>

                {/* What to do next */}
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-muted/40 p-2.5 rounded-xl border border-border/60">
                  <strong className="text-foreground font-semibold">Recommended fix: </strong>
                  {item.whatToDoNext}
                </p>
              </div>

              {/* Bottom Action Footer */}
              <div className="pt-2 border-t border-border/70 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onViewPages(item)}
                  className="text-xs text-muted-foreground hover:text-foreground font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText size={13} className="text-[#FF5A1F]" />
                  <span>Affects <strong className="text-foreground">{item.affectedPages.length}</strong> {item.affectedPages.length === 1 ? "area" : "pages"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onCreateTask(item)}
                  disabled={isAdded}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                    isAdded
                      ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30"
                      : "bg-[#FF5A1F] hover:bg-[#E04810] text-white"
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check size={13} />
                      <span>Task Added</span>
                    </>
                  ) : (
                    <>
                      <Plus size={13} />
                      <span>Create Task</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
