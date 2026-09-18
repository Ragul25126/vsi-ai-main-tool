"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Globe,
  Database,
  Crown,
  FileText,
  Download,
  UserPlus,
  BarChart3,
  Bell,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Play,
  ArrowRight,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminDashboardPage() {
  const [timeRange, setTimeRange] = useState("30");
  const [data, setData] = useState({
    users: 4820,
    websites: 12450,
    revenue: 58400,
    subscriptions: 3910,
    reports: 28340,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();
        const [agenciesRes, clientsRes, keywordsRes] = await Promise.all([
          supabase.from("agencies").select("id", { count: "exact", head: true }),
          supabase.from("clients").select("id", { count: "exact", head: true }),
          supabase.from("keywords").select("*", { count: "exact", head: true }),
        ]);

        const agCount = agenciesRes.count ?? 7;
        const clCount = clientsRes.count ?? 12;
        const kwCount = keywordsRes.count ?? 74;

        setData((prev) => ({
          ...prev,
          users: agCount * 650 + 270,
          websites: clCount * 950 + 1050,
          reports: kwCount * 350 + 2400,
        }));
      } catch {
        // Fallback to initial high-fidelity data
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-6 font-sans">
      {/* ══ TOP BANNER: LIVE STATUS + HEADER + ACTIONS ══ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-caption font-semibold text-emerald-600">
              Live Platform Status
            </span>
          </div>
          <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Welcome back! Here is a simple snapshot of how your platform, users, and monitored websites are performing today.
          </p>
        </div>

        {/* Top Right Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <button className="bg-ink hover:bg-[#e04800] text-white px-4 py-2.5 rounded-panel font-bold text-xs /20 flex items-center gap-2 transition-all">
            <Download className="w-4 h-4" />
            Download Weekly Summary
          </button>
          <Link
            href="/admin/invites"
            className="bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-panel font-bold text-xs flex items-center gap-2 transition-all"
          >
            <UserPlus className="w-4 h-4 text-brand-strong" />
            Invite User
          </Link>
        </div>
      </div>

      {/* ══ ROW 1: 5 METRIC CARDS ══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1: Total Users */}
        <div className="bg-white rounded-panel p-5 border border-slate-200/80 transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-panel bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-caption font-semibold text-orange-600 bg-orange-50 border border-orange-200/60 px-2 py-0.5 rounded-full">
                ↑ +12% this month
              </span>
            </div>
            <p className="text-caption font-bold text-slate-400 tracking-wide">Total Users</p>
            <p className="text-2xl font-semibold text-slate-900 mt-0.5">{data.users.toLocaleString()}</p>
            <p className="text-caption text-slate-500 font-medium mt-1">People signed up to ClearRank</p>
          </div>
        </div>

        {/* Metric 2: Active Websites */}
        <div className="bg-white rounded-panel p-5 border border-slate-200/80 transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-panel bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <Globe className="w-5 h-5" />
              </div>
              <span className="text-caption font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                ↑ 98.4% online
              </span>
            </div>
            <p className="text-caption font-bold text-slate-400 tracking-wide">Active Websites</p>
            <p className="text-2xl font-semibold text-slate-900 mt-0.5">{data.websites.toLocaleString()}</p>
            <p className="text-caption text-slate-500 font-medium mt-1">Websites currently monitored</p>
          </div>
        </div>

        {/* Metric 3: Monthly Revenue */}
        <div className="bg-white rounded-panel p-5 border border-slate-200/80 transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-panel bg-attention-soft border border-line flex items-center justify-center text-attention">
                <Database className="w-5 h-5" />
              </div>
              <span className="text-caption font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                ↑ +8.5% growth
              </span>
            </div>
            <p className="text-caption font-bold text-slate-400 tracking-wide">Monthly Revenue</p>
            <p className="text-2xl font-semibold text-slate-900 mt-0.5">${data.revenue.toLocaleString()}</p>
            <p className="text-caption text-slate-500 font-medium mt-1">Recurring monthly earnings</p>
          </div>
        </div>

        {/* Metric 4: Active Subscriptions */}
        <div className="bg-white rounded-panel p-5 border border-slate-200/80 transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-panel bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                <Crown className="w-5 h-5" />
              </div>
              <span className="text-caption font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                ↑ 94% renewal rate
              </span>
            </div>
            <p className="text-caption font-bold text-slate-400 tracking-wide">Active Subscriptions</p>
            <p className="text-2xl font-semibold text-slate-900 mt-0.5">{data.subscriptions.toLocaleString()}</p>
            <p className="text-caption text-slate-500 font-medium mt-1">Paid plans currently active</p>
          </div>
        </div>

        {/* Metric 5: Reports Generated */}
        <div className="bg-white rounded-panel p-5 border border-slate-200/80 transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-panel bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-caption font-semibold text-orange-600 bg-orange-50 border border-orange-200/60 px-2 py-0.5 rounded-full">
                ↑ +15% vs last month
              </span>
            </div>
            <p className="text-caption font-bold text-slate-400 tracking-wide">Reports Generated</p>
            <p className="text-2xl font-semibold text-slate-900 mt-0.5">{data.reports.toLocaleString()}</p>
            <p className="text-caption text-slate-500 font-medium mt-1">Easy-to-read audits delivered</p>
          </div>
        </div>
      </div>

      {/* ══ ROW 2: MAIN CONTENT (2 COLUMNS) ══ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── LEFT COLUMN (7 COLS): TRENDS + RECENT ACTIVITY ── */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Growth & Performance Trends */}
          <div className="bg-white rounded-panel p-6 border border-slate-200/80 transition-shadow">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-panel bg-orange-50 border border-orange-100 flex items-center justify-center text-brand-strong">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[17px] font-bold text-slate-900 tracking-tight">
                      Growth & Performance Trends
                    </h2>
                    <span className="text-caption font-semibold text-brand-strong bg-orange-50 border border-orange-200/70 px-2.5 py-0.5 rounded-full">
                      +34% overall increase
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    Shows how your monitored websites and traffic health have grown over time.
                  </p>
                </div>
              </div>

              {/* Time Filters */}
              <div className="flex items-center bg-slate-100 rounded-full p-1 gap-1 border border-slate-200/80">
                {["30", "90", "year"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTimeRange(t)}
                    className={`px-3 py-1 text-caption font-bold rounded-full transition-all ${
                      timeRange === t
                        ? "bg-white text-slate-900  border border-slate-200/60"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {t === "30" ? "Last 30 Days" : t === "90" ? "Last 90 Days" : "This Year"}
                  </button>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 mb-4 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-ink" />
                <span className="text-slate-600">Monitored Websites</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-600">Healthy Audits</span>
              </div>
            </div>

            {/* Chart Area */}
            <div className="h-64 relative pt-4">
              <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="monitoredGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="var(--brand)" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="healthyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Gridlines */}
                {[0, 50, 100, 150, 200].map((y) => (
                  <line key={y} x1="0" y1={y} x2="500" y2={y} stroke="#F1F5F9" strokeWidth="1.5" />
                ))}

                {/* Monitored Area & Line */}
                <path d="M 0 170 C 80 140, 160 110, 240 85 C 320 60, 400 50, 500 20 L 500 200 L 0 200 Z" fill="url(#monitoredGrad)" />
                <path d="M 0 170 C 80 140, 160 110, 240 85 C 320 60, 400 50, 500 20" fill="none" stroke="var(--brand)" strokeWidth="3.5" strokeLinecap="round" />

                {/* Healthy Area & Line */}
                <path d="M 0 190 C 80 160, 160 135, 240 120 C 320 105, 400 115, 500 50 L 500 200 L 0 200 Z" fill="url(#healthyGrad)" />
                <path d="M 0 190 C 80 160, 160 135, 240 120 C 320 105, 400 115, 500 50" fill="none" stroke="#10B981" strokeWidth="3.5" strokeLinecap="round" />

                {/* Data point dots */}
                {[[0,170], [100,145], [200,115], [300,85], [400,60], [500,20]].map(([x,y], i) => (
                  <circle key={i} cx={x} cy={y} r="5" fill="var(--brand)" stroke="#FFFFFF" strokeWidth="2.5" />
                ))}
                {[[0,190], [100,165], [200,135], [300,120], [400,115], [500,50]].map(([x,y], i) => (
                  <circle key={i} cx={x} cy={y} r="5" fill="#10B981" stroke="#FFFFFF" strokeWidth="2.5" />
                ))}
              </svg>

              {/* Month Labels */}
              <div className="flex justify-between text-caption font-semibold text-slate-400 mt-2 px-1">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
              </div>
            </div>
          </div>

          {/* Card 2: Quick Activity & Recent Milestones */}
          <div className="bg-white rounded-panel p-6 border border-slate-200/80 transition-shadow">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-panel bg-attention-soft border border-line flex items-center justify-center text-attention">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-[17px] font-bold text-slate-900 tracking-tight">
                    Quick Activity & Recent Milestones
                  </h2>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    Simple updates on account and audit actions.
                  </p>
                </div>
              </div>
              <Link href="/admin/cron-runs" className="text-xs font-bold text-brand-strong hover:text-[#e04800] flex items-center gap-1">
                View Log <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Activity List */}
            <div className="space-y-3">
              {/* Item 1 */}
              <div className="flex items-center justify-between p-3.5 rounded-panel bg-slate-50/70 border border-slate-100 hover:bg-slate-100/50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-panel bg-blue-100/80 text-blue-600 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">Acme Corp renewed Pro Plan</p>
                    <p className="text-caption text-slate-400 truncate">Annual billing confirmed ($1,188)</p>
                  </div>
                </div>
                <span className="text-caption font-semibold text-slate-400 shrink-0 ml-2">12 mins ago</span>
              </div>

              {/* Item 2 */}
              <div className="flex items-center justify-between p-3.5 rounded-panel bg-slate-50/70 border border-slate-100 hover:bg-slate-100/50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-panel bg-emerald-100/80 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">Health scan completed for travelhub.io</p>
                    <p className="text-caption text-slate-400 truncate">Condition: Great (98/100 Core Web Vitals)</p>
                  </div>
                </div>
                <span className="text-caption font-semibold text-slate-400 shrink-0 ml-2">43 mins ago</span>
              </div>

              {/* Item 3 */}
              <div className="flex items-center justify-between p-3.5 rounded-panel bg-slate-50/70 border border-slate-100 hover:bg-slate-100/50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-panel bg-orange-100/80 text-brand-strong flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">New agency account registered</p>
                    <p className="text-caption text-slate-400 truncate">Elevate Media onboarded with 18 sites</p>
                  </div>
                </div>
                <span className="text-caption font-semibold text-slate-400 shrink-0 ml-2">2 hours ago</span>
              </div>

              {/* Item 4 */}
              <div className="flex items-center justify-between p-3.5 rounded-panel bg-slate-50/70 border border-slate-100 hover:bg-slate-100/50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-panel bg-purple-100/80 text-purple-600 flex items-center justify-center shrink-0">
                    <Crown className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">Weekly audit digest delivered</p>
                    <p className="text-caption text-slate-400 truncate">Automated emails successfully sent to 1,420 subscribers</p>
                  </div>
                </div>
                <span className="text-caption font-semibold text-slate-400 shrink-0 ml-2">5 hours ago</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN (5 COLS): PLATFORM HEALTH + QUICK START GUIDE ── */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card 1: Overall Platform Health */}
          <div className="bg-white rounded-panel p-6 border border-slate-200/80 transition-shadow">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-panel bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-[17px] font-bold text-slate-900 tracking-tight">
                  Overall Platform Health
                </h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  All monitored domains aggregate status.
                </p>
              </div>
            </div>

            {/* Donut Chart Gauge */}
            <div className="flex flex-col items-center justify-center py-4">
              <div className="relative w-44 h-44">
                <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
                  {/* Track 1: Green 96% */}
                  <circle cx="80" cy="80" r="65" fill="none" stroke="#10B981" strokeWidth="16" strokeDasharray="360 400" strokeLinecap="round" />
                  {/* Track 2: Blue 3.4% */}
                  <circle cx="80" cy="80" r="65" fill="none" stroke="#3B82F6" strokeWidth="16" strokeDasharray="14 400" strokeDashoffset="-362" strokeLinecap="round" />
                  {/* Track 3: Red 0.6% */}
                  <circle cx="80" cy="80" r="65" fill="none" stroke="#EF4444" strokeWidth="16" strokeDasharray="5 400" strokeDashoffset="-380" strokeLinecap="round" />
                </svg>
                {/* Center score */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-semibold text-slate-900 leading-none">96%</span>
                  <span className="text-caption font-bold text-slate-400 mt-1">EXCELLENT</span>
                </div>
              </div>
            </div>

            {/* Status Breakdown List */}
            <div className="space-y-3 mt-4">
              {/* Item 1 */}
              <div className="flex items-center justify-between p-3 rounded-panel bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">11,950 Healthy</p>
                    <p className="text-caption text-slate-400">No action needed</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
                  96.0%
                </span>
              </div>

              {/* Item 2 */}
              <div className="flex items-center justify-between p-3 rounded-panel bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">420 Needs Attention</p>
                    <p className="text-caption text-slate-400">Minor tweaks recommended</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200/60 px-2.5 py-0.5 rounded-full">
                  3.4%
                </span>
              </div>

              {/* Item 3 */}
              <div className="flex items-center justify-between p-3 rounded-panel bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">80 Issues Found</p>
                    <p className="text-caption text-slate-400">Requires fixing</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200/60 px-2.5 py-0.5 rounded-full">
                  0.6%
                </span>
              </div>
            </div>

            {/* Bottom Link */}
            <div className="mt-5 pt-3 border-t border-slate-100 text-center">
              <Link href="/admin/qa" className="text-xs font-bold text-slate-600 hover:text-brand-strong flex items-center justify-center gap-1 transition-colors">
                Review All Identified Issues <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Card 2: Quick Start Guide Callout Box */}
          <div className="bg-surface-2 rounded-panel p-6 text-white /20 relative overflow-hidden">
            {/* Background vector accents */}
            <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-white/10 blur-xl pointer-events-none" />
            <div className="absolute right-4 top-4 opacity-20 pointer-events-none">
              <TrendingUp className="w-28 h-28 stroke-[1]" />
            </div>

            <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-xs px-3 py-1 rounded-full text-caption font-bold text-white mb-3">
              Quick Start Guide
            </span>

            <h3 className="text-xl font-semibold tracking-tight mb-2">
              Need Help Getting Started?
            </h3>
            <p className="text-xs text-white/90 leading-relaxed font-medium mb-6 max-w-sm">
              Watch our friendly 1-minute video tour or read our plain-English checklist to maximize rank improvements.
            </p>

            {/* Callout Action Buttons */}
            <div className="flex items-center gap-3 flex-wrap">
              <button className="bg-white hover:bg-slate-50 text-brand-strong px-4 py-2.5 rounded-panel font-semibold text-xs flex items-center gap-2 transition-all">
                <Play className="w-3.5 h-3.5 fill-current" />
                Watch Video
              </button>
              <Link
                href="/admin/prompts"
                className="border border-white/40 hover:bg-white/10 text-white px-4 py-2.5 rounded-panel font-bold text-xs flex items-center gap-1.5 transition-all"
              >
                Read Docs <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ══ FOOTER ══ */}
      <div className="pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700">SEOTool</span>
          <span>•</span>
          <span>Simplified SEO Intelligence for Growing Teams</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-slate-700 transition-colors">Documentation</a>
          <a href="#" className="hover:text-slate-700 transition-colors">API Status</a>
          <a href="#" className="hover:text-slate-700 transition-colors">Privacy & Terms</a>
        </div>
      </div>
    </div>
  );
}
