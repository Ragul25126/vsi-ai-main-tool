"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, Sparkles, CheckCircle2, XCircle, Bot, Globe } from "lucide-react";

interface VisibilityMetricsProps {
  reducedMotion?: boolean;
}

const METRICS = [
  { label: "KEYWORD", value: "best CRM for startups", icon: Globe, color: "text-foreground" },
  { label: "GOOGLE RANK", value: "#4 (Top 5)", icon: TrendingUp, color: "text-blue-500" },
  { label: "AI OVERVIEW", value: "Present", icon: Sparkles, color: "text-purple-500" },
  { label: "AI CITATION", value: "Not cited", icon: XCircle, color: "text-rose-500" },
  { label: "BRAND MENTION", value: "Mentioned", icon: CheckCircle2, color: "text-cyan-500" },
  { label: "CHATGPT", value: "Visible", icon: Bot, color: "text-emerald-500" },
];

export default function VisibilityMetrics({ reducedMotion = false }: VisibilityMetricsProps) {
  const containerVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reducedMotion ? 0.01 : 0.25,
        staggerChildren: reducedMotion ? 0 : 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 6, scale: 0.96 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: reducedMotion ? 0.01 : 0.2, ease: "easeOut" as const },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="border border-border/80 rounded-xl p-3 bg-muted/20 shadow-2xs space-y-2"
    >
      <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
        <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">
          SERP & AI Extraction Metrics
        </span>
        <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
          Live Snapshot
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {METRICS.map((m) => (
          <motion.div
            key={m.label}
            variants={itemVariants}
            className="p-2 rounded-lg bg-card border border-border/80 shadow-2xs space-y-0.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-[8px] font-extrabold uppercase tracking-wider text-muted-foreground">
                {m.label}
              </span>
              <m.icon size={11} className={m.color} />
            </div>
            <p className={`text-[11px] sm:text-xs font-black tracking-tight ${m.color} truncate`}>
              {m.value}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
