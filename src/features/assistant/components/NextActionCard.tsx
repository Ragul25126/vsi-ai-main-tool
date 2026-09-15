"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Zap, Plus, Check, ExternalLink, Clock } from "lucide-react";

interface NextActionCardProps {
  reducedMotion?: boolean;
}

export default function NextActionCard({ reducedMotion = false }: NextActionCardProps) {
  const [taskCreated, setTaskCreated] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  async function handleCreateTask() {
    setIsCreating(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: "valgrow-labs-001",
          title: "Expand comparison section for 'best CRM for startups'",
          group_name: "content_brief",
          description: "Add structured CRM comparison matrix, 45-word quotable answer snippet, and schema.org JSON-LD to claim AI Overview citation.",
          impact: "high",
          effort: "medium",
        }),
      });
      setTaskCreated(true);
    } catch {
      setTaskCreated(true);
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="border border-border rounded-xl p-3 bg-gradient-to-br from-card to-muted/40 shadow-2xs space-y-2"
    >
      <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
        <div className="flex items-center gap-1.5">
          <Zap size={12} className="text-[#FF5A1F]" />
          <h4 className="text-[11px] font-black text-foreground">Recommended Next Action</h4>
        </div>
        <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          High Priority
        </span>
      </div>

      <div className="space-y-0.5">
        <h5 className="text-xs font-black text-foreground">
          Expand the comparison section
        </h5>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
          <span className="flex items-center gap-1">
            <Clock size={10} className="text-primary" />
            <span>Effort: 2–4 hours</span>
          </span>
          <span>•</span>
          <span className="text-emerald-500 font-bold">+40% Citation Potential</span>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-0.5">
        <Link
          href="/dashboard/check?tab=opportunities"
          className="px-2.5 py-1 rounded-lg bg-card hover:bg-muted border border-border text-foreground text-[11px] font-bold transition-all flex items-center gap-1 shadow-2xs"
        >
          <span>View Diagnosis</span>
          <ExternalLink size={10} className="text-muted-foreground" />
        </Link>

        <button
          onClick={handleCreateTask}
          disabled={taskCreated || isCreating}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shadow-2xs cursor-pointer ${
            taskCreated
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
              : "bg-[#FF5A1F] hover:bg-[#E04810] text-white"
          }`}
        >
          {taskCreated ? (
            <><Check size={11} /> On Board</>
          ) : (
            <><Plus size={11} /> Create Task</>
          )}
        </button>
      </div>
    </motion.div>
  );
}
