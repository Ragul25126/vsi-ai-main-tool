"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  ArrowUpRight,
  ChevronRight,
  ChevronDown,
  Search,
  ArrowRight,
  BarChart2,
  MousePointerClick,
  Eye,
  Percent,
  Trophy,
  ShieldAlert,
  Link2,
  FileText,
  Image as ImageIcon,
  Download,
  Calendar,
  Layers,
  Sparkles,
  Zap,
  Globe,
  Cpu,
  MessageSquare,
  Award,
  Terminal,
} from "lucide-react";
import { downloadCSV, exportPrintablePDF, ExportDataRow } from "@/utils/export";

interface ServiceModuleViewProps {
  moduleType: "all-services" | "seo-tracked" | "geo-tracked" | "all" | "seo" | "geo";
}

export default function ServiceModuleView({ moduleType }: ServiceModuleViewProps) {
  let normalizedType: "all-services" | "seo-tracked" | "geo-tracked" = "seo-tracked";
  if (moduleType === "geo" || moduleType === "geo-tracked") {
    normalizedType = "geo-tracked";
  } else if (moduleType === "all-services" || moduleType === "all") {
    normalizedType = "all-services";
  } else {
    normalizedType = "seo-tracked";
  }

  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [showDateMenu, setShowDateMenu] = useState(false);

  const handleExport = () => {
    const rows: ExportDataRow[] = [
      {
        keyword: "enterprise seo platform",
        clientName: "Valgrow Labs",
        trackType: "SEO Tracked",
        rankPosition: 1,
        aioPresent: true,
        classification: "aligned",
        createdAt: new Date().toISOString(),
      },
      {
        keyword: "best AI rank tracker",
        clientName: "Valgrow Labs",
        trackType: "SEO Tracked",
        rankPosition: 2,
        aioPresent: true,
        classification: "aligned",
        createdAt: new Date().toISOString(),
      },
      {
        keyword: "generative engine optimization",
        clientName: "Valgrow Labs",
        trackType: "SEO Tracked",
        rankPosition: 3,
        aioPresent: true,
        classification: "aligned",
        createdAt: new Date().toISOString(),
      },
    ];
    downloadCSV("SEO_Tracking_Report", rows);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto font-sans bg-background min-h-screen animate-fadeIn">
      
      {/* ── BREADCRUMB ── */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/dashboard" className="hover:text-foreground transition-colors flex items-center gap-1">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span>Dashboard</span>
        </Link>
        <ChevronRight size={12} className="text-muted-foreground/60" />
        <span className="text-muted-foreground">Services</span>
        <ChevronRight size={12} className="text-muted-foreground/60" />
        <span className="text-foreground font-bold">SEO Tracking</span>
      </nav>

      {/* ── TOP HEADER & CONTROLS ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            SEO Tracking Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            See how your website is performing on Google and find simple opportunities to grow.
          </p>
        </div>

        {/* Top Right Controls: Date Range Selector + Export Report Button */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDateMenu(!showDateMenu)}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-card border border-border text-xs font-semibold text-foreground shadow-xs hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <Calendar size={14} className="text-muted-foreground" />
              <span>{dateRange}</span>
              <ChevronDown size={13} className="text-muted-foreground ml-1" />
            </button>

            {showDateMenu && (
              <div className="absolute right-0 mt-1 z-30 w-36 rounded-xl bg-popover border border-border shadow-xl p-1 text-xs space-y-0.5 animate-in zoom-in-95 duration-100">
                {["Last 7 Days", "Last 30 Days", "Last 90 Days", "All Time"].map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => {
                      setDateRange(range);
                      setShowDateMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      dateRange === range ? "bg-[#FF5A1F]/10 text-[#FF5A1F] font-bold" : "text-foreground hover:bg-muted"
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <Download size={14} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* ── 1. TOP 5 METRIC CARDS ROW ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Card 1: Website Visitors from Google */}
        <div className="bg-white dark:bg-card border border-border/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-start gap-3.5 mb-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <BarChart2 size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground leading-tight">
                Website Visitors
              </p>
              <p className="text-[11px] text-muted-foreground/80 leading-tight">
                from Google
              </p>
            </div>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-foreground tracking-tight">142.8K</p>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              <span>↑ +14.2%</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              More people found your website
            </p>
          </div>
        </div>

        {/* Card 2: People Who Clicked */}
        <div className="bg-white dark:bg-card border border-border/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-start gap-3.5 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <MousePointerClick size={20} className="stroke-[2.2]" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground leading-tight">
                People Who Clicked
              </p>
              <p className="text-[11px] text-muted-foreground/80 leading-tight">
                to Your Website
              </p>
            </div>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-foreground tracking-tight">128.4K</p>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              <span>↑ 9.6%</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              More people clicked your link
            </p>
          </div>
        </div>

        {/* Card 3: How Many Times Your Site Appeared */}
        <div className="bg-white dark:bg-card border border-border/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-start gap-3.5 mb-3">
            <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Eye size={20} className="stroke-[2.2]" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground leading-tight">
                How Many Times
              </p>
              <p className="text-[11px] text-muted-foreground/80 leading-tight">
                Your Site Appeared
              </p>
            </div>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-foreground tracking-tight">1.84M</p>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              <span>↑ 11.3%</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Your site showed up more often
            </p>
          </div>
        </div>

        {/* Card 4: Click Rate (CTR) */}
        <div className="bg-white dark:bg-card border border-border/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-start gap-3.5 mb-3">
            <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Percent size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground leading-tight">
                Click Rate
              </p>
              <p className="text-[11px] text-muted-foreground/80 leading-tight">
                (CTR)
              </p>
            </div>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-foreground tracking-tight">7.76%</p>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              <span>↑ 0.8%</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              More people clicked when they saw it
            </p>
          </div>
        </div>

        {/* Card 5: Average Position on Google */}
        <div className="bg-white dark:bg-card border border-border/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-start gap-3.5 mb-3">
            <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <Trophy size={20} className="stroke-[2.2]" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground leading-tight">
                Average Position
              </p>
              <p className="text-[11px] text-muted-foreground/80 leading-tight">
                on Google
              </p>
            </div>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-foreground tracking-tight">4.2</p>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              <span>↓ -0.6</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              You&apos;re ranking higher
            </p>
          </div>
        </div>

      </div>

      {/* ── 2. MIDDLE ROW (3 COLUMNS: LINE CHART + DONUT CHART + WEBSITE HEALTH) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Column 1: How Your Rankings Are Improving (Area Line Chart) */}
        <div className="lg:col-span-6 bg-white dark:bg-card border border-border/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="text-blue-500">
                  <TrendingUp size={18} className="stroke-[2.5]" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground">
                    How Your Rankings Are Improving
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    This shows how many of your keywords are appearing on Google over time.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground bg-slate-50 dark:bg-muted/40 border border-border px-2.5 py-1 rounded-lg shrink-0">
                <span>Last 30 Days</span>
                <ChevronDown size={12} />
              </div>
            </div>

            {/* SVG Area Chart */}
            <div className="relative pt-6 pb-2">
              
              {/* Orange Floating Pill Tag */}
              <div className="absolute top-1 right-2 bg-[#FF5A1F] text-white text-[11px] font-black px-2.5 py-1 rounded-lg shadow-sm z-10">
                892 keywords
              </div>

              <svg viewBox="0 0 500 150" className="w-full h-40 overflow-visible" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="rankAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(255, 90, 31, 0.35)" />
                    <stop offset="100%" stopColor="rgba(255, 90, 31, 0.0)" />
                  </linearGradient>
                </defs>

                {/* Area */}
                <path
                  d="M 0,110 Q 50,105 100,90 T 200,85 T 300,60 T 400,45 T 500,20 L 500,150 L 0,150 Z"
                  fill="url(#rankAreaGrad)"
                />

                {/* Line */}
                <path
                  d="M 0,110 Q 50,105 100,90 T 200,85 T 300,60 T 400,45 T 500,20"
                  fill="none"
                  stroke="#FF5A1F"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Dots along the curve */}
                {[
                  { cx: 0, cy: 110 },
                  { cx: 50, cy: 106 },
                  { cx: 100, cy: 90 },
                  { cx: 150, cy: 92 },
                  { cx: 200, cy: 85 },
                  { cx: 250, cy: 80 },
                  { cx: 300, cy: 60 },
                  { cx: 350, cy: 62 },
                  { cx: 400, cy: 45 },
                  { cx: 450, cy: 38 },
                  { cx: 500, cy: 20 },
                ].map((pt, i) => (
                  <circle key={i} cx={pt.cx} cy={pt.cy} r="4" fill="#FF5A1F" stroke="#ffffff" strokeWidth="2" />
                ))}
              </svg>

              {/* X-axis Dates */}
              <div className="flex justify-between text-[10px] text-muted-foreground font-medium pt-2">
                {["Aug 17", "Aug 20", "Aug 23", "Aug 26", "Aug 29", "Sep 01", "Sep 04", "Sep 07", "Sep 10", "Sep 13"].map((date) => (
                  <span key={date}>{date}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Callout Box */}
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-orange-50/70 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 text-xs">
            <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/40 text-[#FF5A1F] flex items-center justify-center shrink-0">
              <BarChart2 size={16} className="stroke-[2.5]" />
            </div>
            <div>
              <span className="font-extrabold text-[#FF5A1F] mr-1.5">+62%</span>
              <span className="text-muted-foreground">
                Your keywords are showing up more frequently on Google compared to last month.
              </span>
            </div>
          </div>
        </div>

        {/* Column 2: Where Your Keywords Rank (Exact Match to User Reference Image, Compact & Balanced) */}
        <div className="lg:col-span-6 bg-white dark:bg-card border border-border/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div className="mb-4">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-foreground tracking-tight">
              Where Your Keywords Rank
            </h2>
            <p className="text-xs text-slate-500 dark:text-muted-foreground mt-0.5 font-medium">
              Out of 1,240 keywords we&apos;re tracking.
            </p>
          </div>

          {/* Symmetrical 2-Column Layout Filling Container */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 my-auto py-2">
            
            {/* Left: Prominent Solid SVG Pie Chart */}
            <div className="w-full sm:w-1/2 flex justify-center items-center shrink-0">
              <div className="relative w-52 h-52 sm:w-56 sm:h-56">
                <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-xs">
                  {/* Top 3: 39% (Green #00BA7C) */}
                  <path
                    d="M 100 100 L 100 12 A 88 88 0 0 1 156.09 168.04 Z"
                    fill="#00BA7C"
                  />
                  {/* Position 4 - 10: 50% (Blue #2F80ED) */}
                  <path
                    d="M 100 100 L 156.09 168.04 A 88 88 0 0 1 43.91 31.96 Z"
                    fill="#2F80ED"
                  />
                  {/* Position 11 - 20: 11% (Amber #F5A623) */}
                  <path
                    d="M 100 100 L 43.91 31.96 A 88 88 0 0 1 100 12 Z"
                    fill="#F5A623"
                  />

                  {/* Percentage Text Labels Inside Wedges */}
                  {/* 11% Amber Wedge Label */}
                  <text
                    x="76"
                    y="52"
                    fill="#FFFFFF"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="font-bold"
                    style={{ fontSize: "14px", fontWeight: "800" }}
                  >
                    11%
                  </text>

                  {/* 39% Green Wedge Label */}
                  <text
                    x="146"
                    y="86"
                    fill="#FFFFFF"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="font-bold"
                    style={{ fontSize: "15px", fontWeight: "800" }}
                  >
                    39%
                  </text>

                  {/* 50% Blue Wedge Label */}
                  <text
                    x="62"
                    y="136"
                    fill="#FFFFFF"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="font-bold"
                    style={{ fontSize: "16px", fontWeight: "800" }}
                  >
                    50%
                  </text>
                </svg>
              </div>
            </div>

            {/* Right: Legend Breakdown Matching Reference */}
            <div className="w-full sm:w-1/2 flex flex-col justify-center space-y-4 sm:pl-2">
              
              {/* Item 1: Top 3 */}
              <div className="flex items-start gap-3.5">
                <span className="w-4 h-4 rounded-full bg-[#00BA7C] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 dark:text-foreground text-sm sm:text-base leading-none">
                    Top 3
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-muted-foreground font-medium leading-tight">
                    482 keywords
                  </p>
                  <div>
                    <span className="inline-block mt-1 px-3 py-1 rounded-lg text-xs font-semibold bg-[#E8F8F0] text-[#00A86B] dark:bg-emerald-950/50 dark:text-emerald-300">
                      Great - brings most traffic
                    </span>
                  </div>
                </div>
              </div>

              {/* Item 2: Position 4 - 10 */}
              <div className="flex items-start gap-3.5">
                <span className="w-4 h-4 rounded-full bg-[#2F80ED] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 dark:text-foreground text-sm sm:text-base leading-none">
                    Position 4 - 10
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-muted-foreground font-medium leading-tight">
                    620 keywords
                  </p>
                  <div>
                    <span className="inline-block mt-1 px-3 py-1 rounded-lg text-xs font-semibold bg-[#EBF3FF] text-[#2F80ED] dark:bg-blue-950/50 dark:text-blue-300">
                      Good - close to top
                    </span>
                  </div>
                </div>
              </div>

              {/* Item 3: Position 11 - 20 */}
              <div className="flex items-start gap-3.5">
                <span className="w-4 h-4 rounded-full bg-[#F5A623] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 dark:text-foreground text-sm sm:text-base leading-none">
                    Position 11 - 20
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-muted-foreground font-medium leading-tight">
                    138 keywords
                  </p>
                  <div>
                    <span className="inline-block mt-1 px-3 py-1 rounded-lg text-xs font-semibold bg-[#FFF6E9] text-[#D97706] dark:bg-amber-950/50 dark:text-amber-300">
                      Needs improvement
                    </span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>

      {/* ── 3. LOWER SECTION (WEBSITE HEALTH + TOP KEYWORDS) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Column: Website Health (Issues & Audit) */}
        <div className="lg:col-span-4 bg-white dark:bg-card border border-border/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldAlert size={18} className="text-blue-500" />
              <h2 className="text-base font-bold text-foreground">
                Website Health
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Things to fix to get better results.
            </p>
          </div>

          {/* 3 Issue Item Buttons */}
          <div className="space-y-2.5">
            
            {/* Issue 1: Broken Links */}
            <Link
              href="/dashboard/check"
              className="flex items-center justify-between p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 hover:bg-rose-100/70 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <Link2 size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-rose-950 dark:text-rose-200">3 broken links</p>
                  <p className="text-[11px] text-muted-foreground">Some links are not working</p>
                </div>
              </div>
              <ChevronRight size={14} className="text-rose-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            {/* Issue 2: Missing Meta Descriptions */}
            <Link
              href="/dashboard/check"
              className="flex items-center justify-between p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 hover:bg-amber-100/70 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <FileText size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-amber-950 dark:text-amber-200">12 missing meta descriptions</p>
                  <p className="text-[11px] text-muted-foreground">Add short descriptions to your pages</p>
                </div>
              </div>
              <ChevronRight size={14} className="text-amber-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            {/* Issue 3: Low Image Alt Text */}
            <Link
              href="/dashboard/check"
              className="flex items-center justify-between p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 hover:bg-blue-100/70 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <ImageIcon size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-950 dark:text-blue-200">Low image alt text</p>
                  <p className="text-[11px] text-muted-foreground">Add alt text to images for better visibility</p>
                </div>
              </div>
              <ChevronRight size={14} className="text-blue-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

          </div>

          {/* View All Issues Action */}
          <Link
            href="/dashboard/check"
            className="w-full py-2.5 px-4 rounded-xl bg-blue-50 dark:bg-muted text-blue-600 dark:text-blue-400 hover:bg-blue-100 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors text-center"
          >
            <span>View All Issues</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Column: Top Keywords Table */}
        <div className="lg:col-span-8 bg-white dark:bg-card border border-border/80 rounded-2xl p-6 shadow-xs space-y-4">
          
          {/* Table Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
                <Search size={16} />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">Top Keywords</h2>
                <p className="text-xs text-muted-foreground">
                  These are the keywords bringing the most visitors to your website.
                </p>
              </div>
            </div>

            <Link
              href="/dashboard/check?tab=quick-check"
              className="text-xs font-bold text-[#FF5A1F] hover:underline flex items-center gap-1"
            >
              <span>View All Keywords</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          {/* Table View */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 text-muted-foreground font-bold text-[11px]">
                  <th className="pb-3 w-10">#</th>
                  <th className="pb-3">Keyword</th>
                  <th className="pb-3">Your Position</th>
                  <th className="pb-3">Monthly Clicks</th>
                  <th className="pb-3">Trend</th>
                  <th className="pb-3">What it means</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-medium">
                {[
                  { rank: 1, kw: "enterprise seo platform", pos: 1, clicks: "18,420", trend: "+3", meaning: "Brings a lot of traffic" },
                  { rank: 2, kw: "best AI rank tracker", pos: 2, clicks: "14,100", trend: "+1", meaning: "Very good visibility" },
                  { rank: 3, kw: "generative engine optimization", pos: 3, clicks: "9,850", trend: "0", meaning: "Stable position" },
                  { rank: 4, kw: "search citation analytics", pos: 4, clicks: "7,200", trend: "-1", meaning: "Slight drop, keep an eye" },
                  { rank: 5, kw: "seo tools for startups", pos: 6, clicks: "5,480", trend: "+2", meaning: "Growing well" },
                ].map((row) => (
                  <tr key={row.rank} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 text-muted-foreground font-bold">{row.rank}</td>
                    <td className="py-3.5 font-bold text-foreground">{row.kw}</td>
                    <td className="py-3.5">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black ${
                        row.pos <= 3
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400"
                      }`}>
                        {row.pos}
                      </span>
                    </td>
                    <td className="py-3.5 font-bold text-foreground">{row.clicks}</td>
                    <td className="py-3.5">
                      {row.trend === "+3" && <span className="font-bold text-emerald-600">↑ +3</span>}
                      {row.trend === "+1" && <span className="font-bold text-emerald-600">↑ +1</span>}
                      {row.trend === "0" && <span className="text-muted-foreground">—</span>}
                      {row.trend === "-1" && <span className="font-bold text-rose-500">↓ -1</span>}
                      {row.trend === "+2" && <span className="font-bold text-emerald-600">↑ +2</span>}
                    </td>
                    <td className="py-3.5 text-muted-foreground">{row.meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

      </div>

    </div>
  );
}
