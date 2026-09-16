"use client";

import React from "react";
import { ShieldCheck, Cpu, FileText, Search, Share2, ChevronRight } from "lucide-react";

interface CategoryInfo {
  id: string;
  name: string;
  score: number;
  explanation: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  scoreColor: string;
}

interface AuditCategoryGridProps {
  onSelectCategory: (category: string) => void;
}

export default function AuditCategoryGrid({ onSelectCategory }: AuditCategoryGridProps) {
  const categories: CategoryInfo[] = [
    {
      id: "technical",
      name: "Technical Health",
      score: 82,
      explanation: "Your website structure is healthy.",
      icon: ShieldCheck,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      scoreColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      id: "ai_readiness",
      name: "AI Search Readiness",
      score: 75,
      explanation: "Good foundation, some opportunities.",
      icon: Cpu,
      iconBg: "bg-cyan-500/10",
      iconColor: "text-cyan-600 dark:text-cyan-400",
      scoreColor: "text-cyan-600 dark:text-cyan-400",
    },
    {
      id: "content",
      name: "Content",
      score: 68,
      explanation: "Some pages can be improved.",
      icon: FileText,
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-600 dark:text-purple-400",
      scoreColor: "text-amber-600 dark:text-amber-400",
    },
    {
      id: "visibility",
      name: "Search Visibility",
      score: 72,
      explanation: "Your content is getting seen.",
      icon: Search,
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600 dark:text-blue-400",
      scoreColor: "text-blue-600 dark:text-blue-400",
    },
    {
      id: "citations",
      name: "Business Authority",
      score: 65,
      explanation: "Your business information needs more consistency.",
      icon: Share2,
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-600 dark:text-amber-400",
      scoreColor: "text-amber-600 dark:text-amber-400",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
          Your website at a glance
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          See how your website is performing across key areas.
        </p>
      </div>

      {/* Compact horizontal cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {categories.map((cat) => {
          const Icon = cat.icon;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className="bg-white dark:bg-card border border-border/80 rounded-xl p-4 flex flex-col gap-2.5 shadow-2xs hover:shadow-sm hover:border-[#FF5A1F]/40 transition-all group text-left cursor-pointer w-full"
            >
              {/* Icon + chevron */}
              <div className="flex items-center justify-between">
                <div className={`w-8 h-8 rounded-lg ${cat.iconBg} flex items-center justify-center shrink-0`}>
                  <Icon size={15} className={cat.iconColor} />
                </div>
                <ChevronRight
                  size={14}
                  className="text-muted-foreground/50 group-hover:text-[#FF5A1F] group-hover:translate-x-0.5 transition-all"
                />
              </div>

              {/* Name */}
              <p className="text-xs font-bold text-foreground leading-snug group-hover:text-[#FF5A1F] transition-colors">
                {cat.name}
              </p>

              {/* Score */}
              <p className={`text-lg font-black leading-none ${cat.scoreColor}`}>
                {cat.score}
                <span className="text-xs font-bold text-muted-foreground ml-0.5">/ 100</span>
              </p>

              {/* Explanation */}
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {cat.explanation}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
