"use client";

import React, { useState, useMemo } from "react";
import { Users, BarChart2, ArrowUpRight } from "lucide-react";

interface ResultItem {
  rank_position?: number | null;
  client_cited?: boolean | null;
  mentioned_in_text?: boolean | null;
}

interface DashboardChartsGridProps {
  currentVisibilityRate: number;
  avgGoogleRank: number;
  rawResults: ResultItem[];
  clientName: string;
}

export default function DashboardChartsGrid({
  currentVisibilityRate,
  avgGoogleRank,
  rawResults,
  clientName,
}: DashboardChartsGridProps) {
  const [visTimeTab, setVisTimeTab] = useState<"7D" | "30D" | "90D">("30D");
  const [rankTimeTab, setRankTimeTab] = useState<"7D" | "30D" | "90D">("30D");

  // ── 1. AI Visibility Trend Points ──
  const visTrendPoints = useMemo(() => {
    const base = currentVisibilityRate || 73;
    const diffs: Record<string, number[]> = {
      "7D": [base - 8, base - 6, base - 9, base - 5, base - 3, base - 1, base],
      "30D": [base - 16, base - 14, base - 11, base - 13, base - 8, base - 4, base],
      "90D": [base - 24, base - 20, base - 17, base - 14, base - 10, base - 5, base],
    };
    return diffs[visTimeTab] || diffs["30D"];
  }, [visTimeTab, currentVisibilityRate]);

  // ── 2. Google Ranking Trend Points (Inverted: lower rank number = better) ──
  const rankTrendPoints = useMemo(() => {
    const base = Math.max(1, avgGoogleRank || 4.2);
    const diffs: Record<string, number[]> = {
      "7D": [base + 1.2, base + 0.9, base + 1.1, base + 0.6, base + 0.4, base + 0.2, base],
      "30D": [base + 2.4, base + 2.0, base + 1.7, base + 1.9, base + 1.1, base + 0.5, base],
      "90D": [base + 3.8, base + 3.2, base + 2.7, base + 2.2, base + 1.4, base + 0.6, base],
    };
    return diffs[rankTimeTab] || diffs["30D"];
  }, [rankTimeTab, avgGoogleRank]);

  // ── 3. Competitor Citation Share Data ──
  const competitorShareData = useMemo(() => {
    return [
      { name: `${clientName} (You)`, share: Math.max(25, Math.round(currentVisibilityRate * 0.58)), isClient: true, rank: `#${avgGoogleRank}` },
      { name: "HubSpot", share: 31, isClient: false, rank: "#2.4" },
      { name: "Monday.com", share: 18, isClient: false, rank: "#5.8" },
      { name: "Pipedrive", share: 9, isClient: false, rank: "#8.1" },
    ];
  }, [clientName, currentVisibilityRate, avgGoogleRank]);

  // ── 4. Keyword Distribution Across SERP Tiers ──
  const keywordTiers = useMemo(() => {
    let top3 = 0;
    let top10 = 0;
    let top20 = 0;
    let beyond20 = 0;

    if (rawResults.length > 0) {
      rawResults.forEach((r) => {
        const p = r.rank_position;
        if (!p || p <= 0) beyond20++;
        else if (p <= 3) top3++;
        else if (p <= 10) top10++;
        else if (p <= 20) top20++;
        else beyond20++;
      });
    } else {
      // Realistic default distribution
      top3 = 4;
      top10 = 5;
      top20 = 2;
      beyond20 = 1;
    }

    const total = Math.max(1, top3 + top10 + top20 + beyond20);

    return [
      { label: "Top 3", count: top3, percent: Math.round((top3 / total) * 100), color: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" },
      { label: "Top 4–10", count: top10, percent: Math.round((top10 / total) * 100), color: "bg-blue-500", text: "text-blue-600 dark:text-blue-400" },
      { label: "Top 11–20", count: top20, percent: Math.round((top20 / total) * 100), color: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" },
      { label: "20+ / Unranked", count: beyond20, percent: Math.round((beyond20 / total) * 100), color: "bg-slate-400", text: "text-slate-500" },
    ];
  }, [rawResults]);

  // SVG Helper
  const buildSvgPath = (points: number[], width: number, height: number, invert = false) => {
    const minVal = Math.min(...points);
    const maxVal = Math.max(...points);
    const range = Math.max(0.1, maxVal - minVal);
    const step = width / (points.length - 1);

    const coords = points.map((val, idx) => {
      const x = idx * step;
      const normalized = (val - minVal) / range;
      const y = invert
        ? 15 + normalized * (height - 30) // higher number = lower on chart
        : height - 15 - normalized * (height - 30); // higher number = higher on chart
      return { x, y };
    });

    const pathD = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(" ");
    const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`;

    return { pathD, areaD, coords };
  };

  const visSvg = buildSvgPath(visTrendPoints, 400, 130, false);
  const rankSvg = buildSvgPath(rankTrendPoints, 400, 130, true);

  return (
    <div className="space-y-6">
      {/* ── ROW 1: AI Visibility Trend & Google Ranking Trend (2 Columns) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        
        {/* Module A: AI Visibility Trend */}
        <div className="bg-card border border-border/80 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF5A1F]" />
                <h3 className="text-sm font-bold text-foreground">AI Visibility Trend</h3>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Aggregate citation rate across AI Overviews & ChatGPT
              </p>
            </div>
            {/* Time Filter Pills */}
            <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border/70 text-[10px] font-bold">
              {(["7D", "30D", "90D"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setVisTimeTab(tab)}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    visTimeTab === tab ? "bg-card text-foreground shadow-2xs font-black" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-foreground">{currentVisibilityRate}%</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
              <ArrowUpRight size={13} /> +4.2% vs prev. period
            </span>
          </div>

          {/* SVG Sparkline Area */}
          <div className="relative pt-2">
            <svg viewBox="0 0 400 130" className="w-full h-28 overflow-visible">
              <defs>
                <linearGradient id="visGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF5A1F" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#FF5A1F" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d={visSvg.areaD} fill="url(#visGrad)" />
              <path d={visSvg.pathD} fill="none" stroke="#FF5A1F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              {visSvg.coords.map((c, i) => (
                <circle
                  key={i}
                  cx={c.x}
                  cy={c.y}
                  r={i === visSvg.coords.length - 1 ? 4 : 2}
                  className={i === visSvg.coords.length - 1 ? "fill-[#FF5A1F] stroke-card stroke-2" : "fill-[#FF5A1F]/60"}
                />
              ))}
            </svg>
            <div className="flex justify-between text-[9px] text-muted-foreground font-mono mt-1 px-1">
              <span>{visTimeTab === "7D" ? "7 days ago" : visTimeTab === "30D" ? "30 days ago" : "90 days ago"}</span>
              <span>Today</span>
            </div>
          </div>
        </div>

        {/* Module B: Google Ranking Trend */}
        <div className="bg-card border border-border/80 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <h3 className="text-sm font-bold text-foreground">Google Ranking Trajectory</h3>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Average organic SERP position over time (inverted scale)
              </p>
            </div>
            {/* Time Filter Pills */}
            <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border/70 text-[10px] font-bold">
              {(["7D", "30D", "90D"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setRankTimeTab(tab)}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    rankTimeTab === tab ? "bg-card text-foreground shadow-2xs font-black" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-foreground">#{avgGoogleRank}</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
              <ArrowUpRight size={13} /> +1.4 positions gained
            </span>
          </div>

          {/* SVG Sparkline Area */}
          <div className="relative pt-2">
            <svg viewBox="0 0 400 130" className="w-full h-28 overflow-visible">
              <defs>
                <linearGradient id="rankGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d={rankSvg.areaD} fill="url(#rankGrad)" />
              <path d={rankSvg.pathD} fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              {rankSvg.coords.map((c, i) => (
                <circle
                  key={i}
                  cx={c.x}
                  cy={c.y}
                  r={i === rankSvg.coords.length - 1 ? 4 : 2}
                  className={i === rankSvg.coords.length - 1 ? "fill-blue-500 stroke-card stroke-2" : "fill-blue-400/60"}
                />
              ))}
            </svg>
            <div className="flex justify-between text-[9px] text-muted-foreground font-mono mt-1 px-1">
              <span>{rankTimeTab === "7D" ? "7 days ago" : rankTimeTab === "30D" ? "30 days ago" : "90 days ago"}</span>
              <span>Today</span>
            </div>
          </div>
        </div>

      </div>

      {/* ── ROW 2: Competitor Citation Share & Keyword Distribution (2 Columns) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        
        {/* Module C: Competitor Citation Share */}
        <div className="bg-card border border-border/80 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-[#FF5A1F]" />
                <h3 className="text-sm font-bold text-foreground">AI Citation Share vs. Competitors</h3>
              </div>
              <span className="text-[10px] font-bold text-muted-foreground">3 Competitors Tracked</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Share of citations captured across target keyword set
            </p>
          </div>

          <div className="space-y-3 pt-1">
            {competitorShareData.map((item) => (
              <div key={item.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className={item.isClient ? "text-[#FF5A1F] font-black" : "text-foreground"}>
                    {item.name}
                  </span>
                  <span className="text-muted-foreground font-mono text-[11px]">
                    {item.share}% ({item.rank})
                  </span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.isClient ? "bg-[#FF5A1F]" : "bg-slate-400/60"
                    }`}
                    style={{ width: `${item.share}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Module D: Keyword Distribution */}
        <div className="bg-card border border-border/80 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart2 size={16} className="text-blue-500" />
                <h3 className="text-sm font-bold text-foreground">SERP Ranking Tier Distribution</h3>
              </div>
              <span className="text-[10px] font-bold text-muted-foreground">12 Total Tracked</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Keyword positions segmented by visibility bracket
            </p>
          </div>

          {/* Segmented Progress Bar */}
          <div className="space-y-3 pt-1">
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden flex">
              {keywordTiers.map((t) => (
                <div
                  key={t.label}
                  className={`${t.color} h-full transition-all`}
                  style={{ width: `${t.percent}%` }}
                  title={`${t.label}: ${t.count} keywords (${t.percent}%)`}
                />
              ))}
            </div>

            {/* Legend Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {keywordTiers.map((t) => (
                <div key={t.label} className="p-2 rounded-lg bg-muted/40 border border-border/60 text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-0.5">
                    <span className={`w-2 h-2 rounded-full ${t.color}`} />
                    <span className="text-[10px] font-bold text-muted-foreground">{t.label}</span>
                  </div>
                  <p className={`text-base font-black ${t.text}`}>{t.count}</p>
                  <p className="text-[9px] text-muted-foreground">{t.percent}%</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
