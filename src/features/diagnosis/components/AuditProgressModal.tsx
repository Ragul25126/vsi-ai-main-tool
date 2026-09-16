"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, Loader2, Sparkles, ArrowRight } from "lucide-react";
import AuditProcessIllustration from "./illustrations/AuditProcessIllustration";

interface AuditProgressModalProps {
  isOpen: boolean;
  score: number;
  criticalCount: number;
  needsAttentionCount: number;
  passedCount: number;
  onClose: () => void;
}

export default function AuditProgressModal({
  isOpen,
  score,
  criticalCount,
  needsAttentionCount,
  passedCount,
  onClose,
}: AuditProgressModalProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const steps = [
    "Checking website structure & loading speeds",
    "Checking important pages & navigation links",
    "Checking search result preview descriptions",
    "Analyzing AI Search readiness & question answers",
    "Verifying business directory profiles & authority",
  ];

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setStepIndex((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setIsCompleted(true);
          return prev;
        }
      });
    }, 650);

    return () => clearInterval(interval);
  }, [isOpen, steps.length]);

  const handleComplete = () => {
    setStepIndex(0);
    setIsCompleted(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-card border border-border/80 rounded-3xl w-full max-w-md shadow-2xl p-6 sm:p-8 space-y-6 animate-scaleIn text-center relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#FF5A1F]/10 rounded-full blur-2xl pointer-events-none -mr-16 -mt-16" />

        {!isCompleted ? (
          /* Scanning Progress State */
          <div className="space-y-5">
            {/* Animated website illustration */}
            <div className="flex items-center justify-center">
              <AuditProcessIllustration className="w-36 h-28" />
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF5A1F]/10 text-[#FF5A1F] text-xs font-bold">
                <Sparkles size={12} />
                <span>Checking Your Website...</span>
              </div>
              <h3 className="text-xl font-black text-foreground tracking-tight">
                Analyzing Search & AI Readiness
              </h3>
              <p className="text-xs text-muted-foreground">
                We are scanning your pages, citations, and content structure.
              </p>
            </div>

            {/* Checklist items */}
            <div className="space-y-2 text-left bg-muted/30 border border-border/70 p-4 rounded-2xl">
              {steps.map((step, idx) => {
                const isDone = idx < stepIndex;
                const isCurrent = idx === stepIndex;

                return (
                  <div key={idx} className="flex items-center gap-2.5 text-xs">
                    {isDone ? (
                      <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                    ) : isCurrent ? (
                      <Loader2 size={15} className="animate-spin text-[#FF5A1F] shrink-0" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-border shrink-0" />
                    )}
                    <span
                      className={`font-medium ${
                        isDone
                          ? "text-muted-foreground line-through opacity-75"
                          : isCurrent
                          ? "text-foreground font-bold"
                          : "text-muted-foreground/60"
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Completed Result Summary State */
          <div className="space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-500">
              <CheckCircle2 size={32} />
            </div>

            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold border border-emerald-500/20">
                <span>Audit Complete</span>
              </div>
              <h3 className="text-2xl font-black text-foreground tracking-tight">
                Your Website Health: <span className="text-[#FF5A1F]">{score} / 100</span>
              </h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                We inspected all signals across your domain and prepared prioritized action items.
              </p>
            </div>

            {/* Quick Result Stat Pills */}
            <div className="grid grid-cols-3 gap-2 bg-muted/30 p-3 rounded-2xl border border-border/70 text-center">
              <div className="space-y-0.5">
                <span className="text-lg font-black text-rose-500">{criticalCount}</span>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Critical</p>
              </div>
              <div className="space-y-0.5 border-x border-border/70">
                <span className="text-lg font-black text-amber-500">{needsAttentionCount}</span>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Attention</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-lg font-black text-emerald-500">{passedCount}</span>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Passed</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleComplete}
              className="w-full py-3 rounded-xl bg-[#FF5A1F] hover:bg-[#E04810] text-white text-xs font-bold transition-all cursor-pointer shadow-xs hover:shadow-md flex items-center justify-center gap-2"
            >
              <span>View Results</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
