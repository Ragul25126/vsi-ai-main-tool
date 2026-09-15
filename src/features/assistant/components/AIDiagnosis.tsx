"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lightbulb } from "lucide-react";

interface AIDiagnosisProps {
  reducedMotion?: boolean;
}

const DIAGNOSIS_TEXT =
  "Competitor pages provide stronger topic coverage, clearer comparison sections, and more authoritative supporting sources.";

export default function AIDiagnosis({ reducedMotion = false }: AIDiagnosisProps) {
  const [displayedText, setDisplayedText] = useState(reducedMotion ? DIAGNOSIS_TEXT : "");

  useEffect(() => {
    if (reducedMotion) {
      setDisplayedText(DIAGNOSIS_TEXT);
      return;
    }

    setDisplayedText("");
    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      if (idx <= DIAGNOSIS_TEXT.length) {
        setDisplayedText(DIAGNOSIS_TEXT.slice(0, idx));
      } else {
        clearInterval(interval);
      }
    }, 15);

    return () => clearInterval(interval);
  }, [reducedMotion]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="border border-amber-500/30 rounded-xl p-2.5 bg-amber-500/5 dark:bg-amber-500/10 space-y-1.5 shadow-2xs"
    >
      <div className="flex items-center gap-1.5">
        <div className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
          <Lightbulb size={11} />
        </div>
        <h4 className="text-[10px] font-black text-foreground uppercase tracking-wider">
          Why you're not being cited
        </h4>
      </div>

      <p className="text-[11px] text-foreground/90 leading-relaxed pl-5 font-medium">
        <span>{displayedText}</span>
        {displayedText.length < DIAGNOSIS_TEXT.length && !reducedMotion && (
          <span className="inline-block w-1.5 h-3 ml-1 bg-amber-500 animate-pulse align-middle" />
        )}
      </p>
    </motion.div>
  );
}
