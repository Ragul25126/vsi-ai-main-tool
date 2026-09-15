"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Users, Sparkles } from "lucide-react";

interface CitationAnalysisProps {
  reducedMotion?: boolean;
}

export default function CitationAnalysis({ reducedMotion = false }: CitationAnalysisProps) {
  const containerVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reducedMotion ? 0.01 : 0.2,
        staggerChildren: reducedMotion ? 0 : 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -6 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: reducedMotion ? 0.01 : 0.18 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="border border-border/80 rounded-xl p-2.5 bg-card/80 space-y-2 shadow-2xs"
    >
      <div className="flex items-center justify-between">
        <h4 className="text-[11px] font-black text-foreground flex items-center gap-1">
          <Sparkles size={12} className="text-amber-500" />
          <span>AI Visibility Analysis</span>
        </h4>
        <span className="text-[9px] font-bold text-muted-foreground font-mono">
          Gap Identified
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-muted/40 border border-border/70"
        >
          <span className="text-[10px] font-bold text-muted-foreground">Brand Mention</span>
          <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-500">
            <CheckCircle2 size={11} /> Detected
          </span>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-rose-500/5 border border-rose-500/20"
        >
          <span className="text-[10px] font-bold text-muted-foreground">Citation Link</span>
          <span className="inline-flex items-center gap-1 text-[10px] font-black text-rose-500">
            <XCircle size={11} /> Missing
          </span>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-amber-500/5 border border-amber-500/20"
        >
          <span className="text-[10px] font-bold text-muted-foreground">Competitors</span>
          <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-500">
            <Users size={11} /> 3 cited
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}
