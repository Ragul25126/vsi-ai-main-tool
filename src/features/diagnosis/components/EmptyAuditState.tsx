"use client";

import React from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";
import AuditProcessIllustration from "./illustrations/AuditProcessIllustration";

interface EmptyAuditStateProps {
  onRunFirstAudit: () => void;
}

export default function EmptyAuditState({ onRunFirstAudit }: EmptyAuditStateProps) {
  const highlights = [
    "Website health and crawlability",
    "Search readiness and meta descriptions",
    "AI assistant readiness and direct answers",
    "Content structure and heading readability",
    "Business citations and directory consistency",
  ];

  return (
    <div className="bg-white dark:bg-card border border-border/80 rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-6 shadow-xs animate-fadeIn">
      {/* Visual illustration */}
      <div className="flex items-center justify-center">
        <AuditProcessIllustration className="w-40 h-32" />
      </div>

      <div className="space-y-2">
        <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
          Your website is ready to be checked
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          Run your first automated audit to understand your website&apos;s search and AI readiness, identify issues, and discover opportunities to get cited.
        </p>
      </div>

      <div className="bg-muted/30 border border-border/70 rounded-2xl p-5 text-left max-w-md mx-auto space-y-2.5">
        <p className="text-xs font-bold text-foreground">Your first audit will uncover:</p>
        <div className="space-y-2">
          {highlights.map((h, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
              <span>{h}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onRunFirstAudit}
        className="px-6 py-3.5 rounded-xl bg-[#FF5A1F] hover:bg-[#E04810] text-white text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer inline-flex items-center gap-2"
      >
        <span>Run First Audit</span>
        <ArrowRight size={14} />
      </button>
    </div>
  );
}
