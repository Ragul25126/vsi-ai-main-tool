"use client";

import React from "react";
import Link from "next/link";
import { Globe, RefreshCw, ArrowRight } from "lucide-react";

interface ProjectContextBarProps {
  clientName: string;
  clientWebsite: string;
  isScanning: boolean;
  lastUpdated?: string;
  onRunScan: () => void;
}

export default function ProjectContextBar({
  clientName,
  clientWebsite,
  isScanning,
  lastUpdated = "Today, 2:30 PM",
  onRunScan,
}: ProjectContextBarProps) {
  const initial = (clientName || "V").charAt(0).toUpperCase();

  return (
    <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all">
      {/* Left: Project Branding & Status */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#FF5A1F] to-[#FFA17A] text-white flex items-center justify-center font-black text-base shadow-xs shrink-0">
          {initial}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight truncate">
              {clientName}
            </h1>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Tracking
            </span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-muted-foreground mt-0.5 font-medium flex-wrap">
            <span className="flex items-center gap-1 truncate max-w-xs">
              <Globe size={13} className="text-slate-400 shrink-0" />
              <a
                href={clientWebsite.startsWith("http") ? clientWebsite : `https://${clientWebsite}`}
                target="_blank"
                rel="noreferrer"
                className="hover:underline text-foreground/80 truncate"
              >
                {clientWebsite.replace(/^https?:\/\//, "")}
              </a>
            </span>
            <span>·</span>
            <span className="text-[11px]">Updated: {lastUpdated}</span>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
        <button
          type="button"
          onClick={onRunScan}
          disabled={isScanning}
          className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#FF5A1F] hover:bg-[#E04810] text-white text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-60"
        >
          <RefreshCw size={13} className={isScanning ? "animate-spin" : ""} />
          <span>{isScanning ? "Scanning SERP & AI..." : "Run AI Scan"}</span>
        </button>
        <Link
          href="/dashboard/check"
          className="px-3.5 py-2 rounded-xl bg-card hover:bg-muted text-foreground text-xs font-bold transition-colors border border-border shadow-2xs flex items-center gap-1 shrink-0"
        >
          <span>Diagnostic Audit</span>
          <ArrowRight size={12} className="text-muted-foreground" />
        </Link>
      </div>
    </div>
  );
}
