"use client";

import React from "react";
import { motion } from "framer-motion";
import { Users, CheckCircle2, XCircle } from "lucide-react";

interface CompetitorAnalysisCardProps {
  reducedMotion?: boolean;
}

const COMPARISONS = [
  { name: "YOUR SITE (ValGrow)", rank: "#4 Google", cited: false, isClient: true },
  { name: "Competitor A (HubSpot)", rank: "#2 Google", cited: true, isClient: false },
  { name: "Competitor B (Monday.com)", rank: "#6 Google", cited: true, isClient: false },
  { name: "Competitor C (Pipedrive)", rank: "#8 Google", cited: true, isClient: false },
];

export default function CompetitorAnalysisCard({ reducedMotion = false }: CompetitorAnalysisCardProps) {
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

  const rowVariants = {
    hidden: { opacity: 0, x: -5 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: reducedMotion ? 0.01 : 0.15 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="border border-border/80 rounded-xl p-2.5 bg-card shadow-2xs space-y-2"
    >
      <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
        <div className="flex items-center gap-1.5">
          <Users size={12} className="text-primary" />
          <h4 className="text-[11px] font-black text-foreground">Competitor Citation Comparison</h4>
        </div>
        <span className="text-[9px] text-muted-foreground font-semibold">
          3 Competitors Cited
        </span>
      </div>

      <div className="space-y-1">
        {COMPARISONS.map((row) => (
          <motion.div
            key={row.name}
            variants={rowVariants}
            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] transition-colors ${
              row.isClient
                ? "bg-[#FF5A1F]/10 border border-[#FF5A1F]/30 font-bold"
                : "bg-muted/30 border border-border/60 font-medium"
            }`}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              {row.isClient ? (
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A1F]" />
              ) : (
                <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
              )}
              <span className={`truncate ${row.isClient ? "text-[#FF5A1F] font-black" : "text-foreground"}`}>
                {row.name}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] font-mono font-bold text-muted-foreground">
                {row.rank}
              </span>
              <span
                className={`inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.2 rounded ${
                  row.cited
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                }`}
              >
                {row.cited ? (
                  <><CheckCircle2 size={10} /> Cited</>
                ) : (
                  <><XCircle size={10} /> Missing</>
                )}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
