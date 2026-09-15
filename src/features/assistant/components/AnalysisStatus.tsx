"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, Sparkles } from "lucide-react";

interface AnalysisStatusProps {
  status: "idle" | "analyzing" | "completed";
  reducedMotion?: boolean;
}

const ANALYSIS_STEPS = [
  "Analyzing keyword intent...",
  "Checking Google rankings...",
  "Scanning Google AI Overview...",
  "Verifying brand citations...",
  "Extracting competitor citations...",
];

export default function AnalysisStatus({
  status,
  reducedMotion = false,
}: AnalysisStatusProps) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (status !== "analyzing" || reducedMotion) return;

    setStepIndex(0);
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % ANALYSIS_STEPS.length);
    }, 450);

    return () => clearInterval(interval);
  }, [status, reducedMotion]);

  if (status === "idle") return null;

  return (
    <div className="flex items-center gap-2">
      <AnimatePresence mode="wait">
        {status === "analyzing" ? (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 text-xs font-bold shadow-2xs"
          >
            <Loader2 size={13} className="animate-spin text-amber-500" />
            <span>{ANALYSIS_STEPS[stepIndex]}</span>
          </motion.div>
        ) : (
          <motion.div
            key="completed"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/25 text-emerald-700 dark:text-emerald-400 text-xs font-black shadow-2xs"
          >
            <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400" />
            <span>Keyword analyzed</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
