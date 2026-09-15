"use client";

import React, { useEffect, useState } from "react";
import { Loader2, CheckCircle2, X, Cpu } from "lucide-react";

interface ScanProgressModalProps {
  isOpen: boolean;
  clientName: string;
  onClose: () => void;
  onComplete: () => void;
}

const PIPELINE_STEPS = [
  { label: "Connecting to live Google Desktop & Mobile SERP...", duration: 600 },
  { label: "Extracting Google AI Overview & Generative answers...", duration: 700 },
  { label: "Scanning ChatGPT Web & Perplexity citation references...", duration: 650 },
  { label: "Benchmarking competitor citation overlap & domain authority...", duration: 650 },
  { label: "Generating high-impact execution briefs & priority tasks...", duration: 500 },
];

export default function ScanProgressModal({
  isOpen,
  clientName,
  onClose,
  onComplete,
}: ScanProgressModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let timeoutId: NodeJS.Timeout;
    const runPipeline = (step: number) => {
      if (step < PIPELINE_STEPS.length) {
        setCurrentStep(step);
        timeoutId = setTimeout(() => {
          runPipeline(step + 1);
        }, PIPELINE_STEPS[step].duration);
      } else {
        setIsFinished(true);
        setTimeout(() => {
          onComplete();
        }, 800);
      }
    };

    const startTimer = setTimeout(() => {
      runPipeline(0);
    }, 100);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(timeoutId);
    };
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  const progressPct = Math.round(((currentStep + 1) / PIPELINE_STEPS.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 relative">
        {/* Close button if finished */}
        {isFinished && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        )}

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF5A1F] to-[#FFA17A] text-white flex items-center justify-center font-black shadow-xs">
            <Cpu size={20} />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-foreground">
              VSI AI Diagnostic Scan
            </h3>
            <p className="text-xs text-muted-foreground">
              Active Project: <strong className="text-foreground">{clientName}</strong>
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-muted-foreground">Pipeline Progress</span>
            <span className="text-[#FF5A1F]">{progressPct}%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#FF5A1F] to-[#FFA17A] rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Pipeline Steps List */}
        <div className="space-y-3 pt-1">
          {PIPELINE_STEPS.map((step, idx) => {
            const isDone = idx < currentStep || isFinished;
            const isCurrent = idx === currentStep && !isFinished;

            return (
              <div
                key={idx}
                className={`flex items-center gap-3 p-2.5 rounded-xl text-xs transition-all ${
                  isCurrent
                    ? "bg-[#FFF4ED] dark:bg-[#FF5A1F]/15 text-[#FF5A1F] font-bold border border-[#FF5A1F]/30"
                    : isDone
                    ? "text-foreground font-medium"
                    : "text-muted-foreground/60"
                }`}
              >
                {isDone ? (
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 size={16} className="animate-spin text-[#FF5A1F] shrink-0" />
                ) : (
                  <span className="w-4 h-4 rounded-full border border-muted-foreground/30 flex items-center justify-center text-[10px] shrink-0">
                    {idx + 1}
                  </span>
                )}
                <span className="truncate">{step.label}</span>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-border/70 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Targeting Google SERP, Gemini, Perplexity & ChatGPT</span>
          <span className="text-emerald-500 font-bold">● High Precision</span>
        </div>
      </div>
    </div>
  );
}
