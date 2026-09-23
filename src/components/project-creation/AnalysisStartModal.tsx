"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AnalysisStartModalProps {
  isOpen: boolean;
  onFinished: () => void;
}

const START_STEPS = [
  "Setting up your project...",
  "Analyzing your website...",
  "Checking search visibility...",
  "Analyzing competitors...",
  "Analyzing AI search visibility...",
  "Preparing your results...",
];

export function AnalysisStartModal({ isOpen, onFinished }: AnalysisStartModalProps) {
  const [completedIndex, setCompletedIndex] = useState<number>(-1);

  useEffect(() => {
    if (!isOpen) {
      setCompletedIndex(-1);
      return;
    }

    const timer = setInterval(() => {
      setCompletedIndex((prev) => {
        const next = prev + 1;
        if (next >= START_STEPS.length) {
          clearInterval(timer);
          setTimeout(onFinished, 800);
          return prev;
        }
        return next;
      });
    }, 650);

    return () => clearInterval(timer);
  }, [isOpen, onFinished]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-[480px] rounded-2xl border border-line bg-surface p-7 shadow-overlay"
        >
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-soft text-brand-strong ring-8 ring-brand-soft/30">
              <Sparkles className="h-8 w-8 animate-spin text-brand" />
            </div>

            <h2 className="text-2xl font-semibold text-ink">Starting your analysis</h2>
            <p className="mt-1 text-support text-ink-2">
              VSI is initializing your SEO &amp; GEO intelligence pipeline.
            </p>

            <div className="mt-7 w-full space-y-3 text-left">
              {START_STEPS.map((stepLabel, idx) => {
                const isDone = idx <= completedIndex;
                const isCurrent = idx === completedIndex + 1;

                return (
                  <div
                    key={stepLabel}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 transition-all ${
                      isDone
                        ? "border-positive/30 bg-positive-soft/50 text-ink"
                        : isCurrent
                        ? "border-brand/40 bg-brand-soft/40 text-ink"
                        : "border-line/40 bg-surface-2/30 text-ink-3"
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-4 w-4 text-positive shrink-0" />
                    ) : isCurrent ? (
                      <Loader2 className="h-4 w-4 text-brand animate-spin shrink-0" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-line-strong shrink-0" />
                    )}
                    <span className="text-body font-medium">{stepLabel}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
