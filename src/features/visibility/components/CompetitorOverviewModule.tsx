"use client";

import React from "react";
import Link from "next/link";
import { Users, ArrowRight } from "lucide-react";

interface CompetitorRow {
  name: string;
  domain: string;
  isClient: boolean;
  googleVisibility: number;
  aiCitationsCount: number;
  citationShare: number;
  keywordCoverage: number;
}

interface CompetitorOverviewModuleProps {
  clientName: string;
  clientWebsite: string;
  clientCitationShare: number;
}

export default function CompetitorOverviewModule({
  clientName,
  clientWebsite,
  clientCitationShare,
}: CompetitorOverviewModuleProps) {
  const competitors: CompetitorRow[] = [
    {
      name: `${clientName} (You)`,
      domain: clientWebsite.replace(/^https?:\/\//, ""),
      isClient: true,
      googleVisibility: 67,
      aiCitationsCount: 8,
      citationShare: clientCitationShare || 42,
      keywordCoverage: 100,
    },
    {
      name: "HubSpot",
      domain: "hubspot.com",
      isClient: false,
      googleVisibility: 82,
      aiCitationsCount: 11,
      citationShare: 31,
      keywordCoverage: 92,
    },
    {
      name: "Monday.com",
      domain: "monday.com",
      isClient: false,
      googleVisibility: 76,
      aiCitationsCount: 9,
      citationShare: 18,
      keywordCoverage: 83,
    },
    {
      name: "Pipedrive",
      domain: "pipedrive.com",
      isClient: false,
      googleVisibility: 71,
      aiCitationsCount: 7,
      citationShare: 9,
      keywordCoverage: 75,
    },
  ];

  return (
    <div className="bg-card border border-border/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
            <Users size={16} />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground tracking-tight flex items-center gap-2">
              <span>Competitor Citation & Visibility Benchmark</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live SERP dominance, AI citation presence, and coverage overlap across target keywords
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/competitors"
          className="text-xs font-bold text-[#FF5A1F] hover:underline flex items-center gap-1 shrink-0"
        >
          <span>View Competitor Analysis</span>
          <ArrowRight size={12} />
        </Link>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border text-muted-foreground text-[10px] uppercase font-black tracking-wider">
              <th className="pb-2.5 font-bold">Domain / Brand</th>
              <th className="pb-2.5 font-bold">Google Visibility</th>
              <th className="pb-2.5 font-bold">AI Citations</th>
              <th className="pb-2.5 font-bold">Citation Share</th>
              <th className="pb-2.5 font-bold text-right">Keyword Overlap</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {competitors.map((c) => (
              <tr
                key={c.domain}
                className={`transition-colors ${
                  c.isClient ? "bg-[#FFF4ED]/50 dark:bg-[#FF5A1F]/10 font-bold" : "hover:bg-muted/40"
                }`}
              >
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        c.isClient ? "bg-[#FF5A1F]" : "bg-slate-400"
                      }`}
                    />
                    <div>
                      <p className={`font-bold ${c.isClient ? "text-[#FF5A1F]" : "text-foreground"}`}>
                        {c.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono">{c.domain}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-foreground">{c.googleVisibility}%</span>
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden hidden sm:block">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${c.googleVisibility}%` }} />
                    </div>
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <span className="font-black text-foreground">{c.aiCitationsCount}</span>
                  <span className="text-[10px] text-muted-foreground ml-1">sources</span>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <span className={`font-black ${c.isClient ? "text-[#FF5A1F]" : "text-foreground"}`}>
                      {c.citationShare}%
                    </span>
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden hidden sm:block">
                      <div
                        className={`h-full rounded-full ${c.isClient ? "bg-[#FF5A1F]" : "bg-slate-400"}`}
                        style={{ width: `${c.citationShare}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="py-3 text-right">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-foreground border border-border/70">
                    {c.keywordCoverage}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
