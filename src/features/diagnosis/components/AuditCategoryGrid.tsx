"use client";

import React from "react";
import { ShieldCheck, Cpu, FileText, Search, Share2, ArrowRight } from "lucide-react";

interface CategoryInfo {
  id: string;
  name: string;
  score: number;
  explanation: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

interface AuditCategoryGridProps {
  onSelectCategory: (category: string) => void;
}

export default function AuditCategoryGrid({ onSelectCategory }: AuditCategoryGridProps) {
  const categories: CategoryInfo[] = [
    {
      id: "technical",
      name: "Technical SEO",
      score: 82,
      explanation: "Website structure, speed, and crawling permissions are mostly healthy.",
      icon: ShieldCheck,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      id: "ai_readiness",
      name: "AI Search Readiness",
      score: 88,
      explanation: "Structured answers and brand identity allow AI models to cite your pages.",
      icon: Cpu,
      iconBg: "bg-cyan-500/10",
      iconColor: "text-cyan-600 dark:text-cyan-400",
    },
    {
      id: "content",
      name: "Content & Structure",
      score: 75,
      explanation: "Clear headings and descriptive images help readers and algorithms scan your site.",
      icon: FileText,
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
    {
      id: "visibility",
      name: "Search Visibility",
      score: 74,
      explanation: "Page descriptions and search snippets influence organic click-through rates.",
      icon: Search,
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      id: "citations",
      name: "Business Authority",
      score: 65,
      explanation: "Standardized business directory listings and social cards build web trust.",
      icon: Share2,
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
  ];

  return (
    <div className="space-y-4 pt-2">
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
          Your Website at a Glance
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          High-level health breakdown across key search, content, and AI discovery pillars.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isHigh = cat.score >= 80;

          return (
            <div
              key={cat.id}
              className="bg-white dark:bg-card border border-border/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3 shadow-2xs hover:shadow-sm hover:border-[#FF5A1F]/40 transition-all group"
            >
              <div className="space-y-2">
                {/* Category Icon & Score Badge */}
                <div className="flex items-center justify-between">
                  <div className={`w-8 h-8 rounded-xl ${cat.iconBg} flex items-center justify-center`}>
                    <Icon size={16} className={cat.iconColor} />
                  </div>
                  <span className={`text-xs font-black ${isHigh ? "text-emerald-600" : "text-amber-600"}`}>
                    {cat.score} / 100
                  </span>
                </div>

                <h3 className="text-xs sm:text-sm font-bold text-foreground group-hover:text-[#FF5A1F] transition-colors leading-snug">
                  {cat.name}
                </h3>

                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {cat.explanation}
                </p>
              </div>

              {/* Action Link */}
              <button
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className="pt-2 border-t border-border/60 text-xs font-bold text-[#FF5A1F] hover:text-[#E04810] flex items-center gap-1 cursor-pointer transition-all"
              >
                <span>View details</span>
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
