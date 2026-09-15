"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, TrendingUp, CheckCircle2, AlertCircle, Clock, ExternalLink } from "lucide-react";

interface ActivityItem {
  id: string;
  type: "citation_gained" | "rank_improved" | "ai_gap" | "task_completed";
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
  keyword: string;
  timeAgo: string;
  details: string;
  linkHref?: string;
  linkText?: string;
}

const ACTIVITIES: ActivityItem[] = [
  {
    id: "act-1",
    type: "citation_gained",
    icon: Sparkles,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
    title: "New AI Citation Discovered",
    keyword: "best CRM for startups",
    timeAgo: "2 hours ago",
    details: "Google AI Overview now cites ValGrow product comparison page as source #2.",
    linkHref: "/dashboard/check?tab=aivisibility",
    linkText: "View Citation",
  },
  {
    id: "act-2",
    type: "rank_improved",
    icon: TrendingUp,
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-500",
    title: "Google Ranking Gained +2 Positions",
    keyword: "enterprise search intelligence",
    timeAgo: "5 hours ago",
    details: "Moved from #6 to #4 on Google US Desktop SERP.",
    linkHref: "/dashboard/check?tab=quick-check",
    linkText: "View SERP",
  },
  {
    id: "act-3",
    type: "ai_gap",
    icon: AlertCircle,
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-500",
    title: "Competitor Citation Surge Detected",
    keyword: "best digital marketing agency",
    timeAgo: "Yesterday",
    details: "HubSpot published new structured FAQ and captured Perplexity & ChatGPT citation answers.",
    linkHref: "/dashboard/competitors",
    linkText: "Analyze Gap",
  },
  {
    id: "act-4",
    type: "task_completed",
    icon: CheckCircle2,
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-500",
    title: "Verification Task Shipped",
    keyword: "AI visibility tracker",
    timeAgo: "2 days ago",
    details: "Added schema.org Product markup to comparison matrix.",
    linkHref: "/dashboard/tasks",
    linkText: "View Board",
  },
];

export default function RecentActivityModule() {
  return (
    <div className="bg-card border border-border/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
            <Clock size={16} />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground tracking-tight">
              Recent AI & SERP Activity
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live audit timeline of detected citations, ranking movements, and competitor shifts
            </p>
          </div>
        </div>

        <span className="text-[11px] font-bold text-muted-foreground font-mono bg-muted/50 px-2.5 py-1 rounded-lg border border-border/60">
          ● Live Stream
        </span>
      </div>

      <div className="space-y-3">
        {ACTIVITIES.map((act) => {
          const IconComponent = act.icon;
          return (
            <div
              key={act.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-muted/20 border border-border/60 hover:border-border transition-all"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-lg ${act.iconBg} ${act.iconColor} flex items-center justify-center shrink-0 mt-0.5`}>
                  <IconComponent size={15} />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs font-bold text-foreground truncate">
                      {act.title}
                    </h4>
                    <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.2 rounded font-mono">
                      &quot;{act.keyword}&quot;
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    {act.details}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                <span className="text-[10px] text-muted-foreground font-medium">
                  {act.timeAgo}
                </span>
                {act.linkHref && (
                  <Link
                    href={act.linkHref}
                    className="text-[11px] font-bold text-[#FF5A1F] hover:underline flex items-center gap-0.5"
                  >
                    <span>{act.linkText}</span>
                    <ExternalLink size={10} />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
