"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface AnimatedQueryProps {
  fullText: string;
  isTyping: boolean;
  onTypingComplete?: () => void;
  speedMs?: number;
  reducedMotion?: boolean;
}

export default function AnimatedQuery({
  fullText,
  isTyping,
  onTypingComplete,
  speedMs = 14,
  reducedMotion = false,
}: AnimatedQueryProps) {
  const [displayedText, setDisplayedText] = useState(reducedMotion ? fullText : "");

  useEffect(() => {
    if (reducedMotion) {
      setDisplayedText(fullText);
      onTypingComplete?.();
      return;
    }

    if (!isTyping) {
      setDisplayedText(fullText);
      return;
    }

    setDisplayedText("");
    let currentIdx = 0;
    const interval = setInterval(() => {
      currentIdx++;
      if (currentIdx <= fullText.length) {
        setDisplayedText(fullText.slice(0, currentIdx));
      } else {
        clearInterval(interval);
        onTypingComplete?.();
      }
    }, speedMs);

    return () => clearInterval(interval);
  }, [fullText, isTyping, speedMs, reducedMotion, onTypingComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex justify-end"
    >
      <div className="bg-[#0F172A] dark:bg-slate-900 border border-slate-800 text-white text-xs sm:text-sm font-medium px-4 py-2.5 rounded-2xl rounded-tr-xs max-w-[90%] sm:max-w-[85%] shadow-md leading-relaxed tracking-wide relative">
        <span>{displayedText}</span>
        {isTyping && displayedText.length < fullText.length && (
          <span
            className="inline-block w-1.5 h-3.5 ml-1 bg-[#FF5A1F] animate-pulse align-middle rounded-xs"
            aria-hidden="true"
          />
        )}
      </div>
    </motion.div>
  );
}
