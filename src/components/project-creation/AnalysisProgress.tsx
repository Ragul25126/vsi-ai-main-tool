"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface AnalysisProgressProps {
  onComplete: () => void;
}

const PROGRESS_STEPS = [
  "Website connected",
  "Business information found",
  "Main topics identified",
  "SEO information collected",
  "Preparing your project",
];

export function AnalysisProgress({ onComplete }: AnalysisProgressProps) {
  const [completedIndex, setCompletedIndex] = useState<number>(-1);

  useEffect(() => {
    const timer = setInterval(() => {
      setCompletedIndex((prev) => {
        const next = prev + 1;
        if (next >= PROGRESS_STEPS.length) {
          clearInterval(timer);
          setTimeout(onComplete, 600);
          return prev;
        }
        return next;
      });
    }, 700);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mx-auto my-8 w-full max-w-[500px] rounded-2xl border border-line bg-surface p-8 shadow-overlay"
    >
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-brand-strong">
          <Sparkles className="h-7 w-7 animate-pulse text-brand" />
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75"></span>
            <span className="relative inline-flex h-4 w-4 rounded-full bg-brand"></span>
          </span>
        </div>

        <h2 className="text-xl font-semibold text-ink">Analyzing your website...</h2>
        <p className="mt-1 text-support text-ink-2">
          We&apos;re reading your pages to understand your brand and search market.
        </p>

        <div className="mt-8 w-full space-y-3.5 text-left">
          {PROGRESS_STEPS.map((stepLabel, idx) => {
            const isDone = idx <= completedIndex;
            const isCurrent = idx === completedIndex + 1;

            return (
              <motion.div
                key={stepLabel}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-3 rounded-xl border border-line/60 bg-surface-2/50 px-4 py-3"
              >
                {isDone ? (
                  <CheckCircle2 className="h-5 w-5 text-positive shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="h-5 w-5 text-brand animate-spin shrink-0" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-line-strong shrink-0" />
                )}
                <span
                  className={`text-body font-medium transition-colors ${
                    isDone
                      ? "text-ink font-semibold"
                      : isCurrent
                      ? "text-ink"
                      : "text-ink-3"
                  }`}
                >
                  {stepLabel}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
