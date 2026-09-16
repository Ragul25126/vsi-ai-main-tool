"use client";

import React from "react";
import { ShieldCheck, Cpu, FileText, Share2, Search, ArrowRight } from "lucide-react";
import type { FriendlyAuditItem } from "../lib/audit-translations";

interface CategoryHealthOverviewProps {
  items: FriendlyAuditItem[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function CategoryHealthOverview({
  items,
  activeCategory,
  onSelectCategory,
}: CategoryHealthOverviewProps) {
  const categories = [
    {
      id: "technical",
      friendlyName: "Technical Health",
      desc: "Speed, crawling permissions, and internal links",
      icon: ShieldCheck,
      fallbackScore: 82,
    },
    {
      id: "content",
      friendlyName: "Content & Structure",
      desc: "Clear headings, image descriptions, and author credibility",
      icon: FileText,
      fallbackScore: 75,
    },
    {
      id: "ai_readiness",
      friendlyName: "AI Search Readiness",
      desc: "Direct answers and entity context for AI models",
      icon: Cpu,
      fallbackScore: 88,
    },
    {
      id: "visibility",
      friendlyName: "Search Visibility",
      desc: "Search result descriptions and organic snippets",
      icon: Search,
      fallbackScore: 74,
    },
    {
      id: "citations",
      friendlyName: "Web Authority",
      desc: "Social previews and directory consistency",
      icon: Share2,
      fallbackScore: 65,
    },
  ];

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm sm:text-base font-black text-foreground tracking-tight">
            Website Health by Category
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Click any category to focus on its specific checks and recommendations.
          </p>
        </div>
        {activeCategory !== "all" && (
          <button
            type="button"
            onClick={() => onSelectCategory("all")}
            className="text-xs text-[#FF5A1F] hover:underline font-bold cursor-pointer"
          >
            Show All Categories
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          const Icon = cat.icon;
          const score = cat.fallbackScore;

          // Color for progress bar
          let barColor = "bg-emerald-500";
          let textColor = "text-emerald-600 dark:text-emerald-400";
          if (score < 70) {
            barColor = "bg-amber-500";
            textColor = "text-amber-600 dark:text-amber-400";
          }

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(isActive ? "all" : cat.id)}
              className={`p-4 rounded-2xl bg-white dark:bg-card border text-left transition-all cursor-pointer shadow-xs flex flex-col justify-between space-y-3 ${
                isActive
                  ? "border-[#FF5A1F] ring-2 ring-[#FF5A1F]/20 bg-[#FF5A1F]/5"
                  : "border-border/80 hover:border-border hover:shadow-sm"
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 rounded-lg bg-muted/60 flex items-center justify-center text-foreground">
                    <Icon size={14} className={isActive ? "text-[#FF5A1F]" : "text-muted-foreground"} />
                  </div>
                  <span className={`text-xs font-black ${textColor}`}>
                    {score}%
                  </span>
                </div>

                <h4 className="text-xs font-bold text-foreground leading-snug">
                  {cat.friendlyName}
                </h4>

                <p className="text-[10px] text-muted-foreground leading-tight line-clamp-2">
                  {cat.desc}
                </p>
              </div>

              <div className="w-full bg-muted/60 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                  style={{ width: `${score}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
