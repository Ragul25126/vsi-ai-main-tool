"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bot, Play, Pause, RotateCcw
} from "lucide-react";

import AnimatedQuery from "./AnimatedQuery";
import AnalysisStatus from "./AnalysisStatus";
import VisibilityMetrics from "./VisibilityMetrics";
import CitationAnalysis from "./CitationAnalysis";
import CompetitorAnalysisCard from "./CompetitorAnalysisCard";
import AIDiagnosis from "./AIDiagnosis";
import NextActionCard from "./NextActionCard";

export type DemoStage =
  | "query"
  | "analyzing"
  | "analyzed"
  | "metrics"
  | "visibility"
  | "competitors"
  | "diagnosis"
  | "recommendation"
  | "complete";

const STAGES_ORDER: DemoStage[] = [
  "query",
  "analyzing",
  "analyzed",
  "metrics",
  "visibility",
  "competitors",
  "diagnosis",
  "recommendation",
  "complete",
];

export default function AIChatDemo() {
  const [stage, setStage] = useState<DemoStage>("query");
  const [isPlaying, setIsPlaying] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Check prefers-reduced-motion
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReducedMotion(mq.matches);
      if (mq.matches) {
        setStage("complete");
        setIsPlaying(false);
      }
      const listener = (e: MediaQueryListEvent) => {
        setReducedMotion(e.matches);
        if (e.matches) {
          setStage("complete");
          setIsPlaying(false);
        }
      };
      mq.addEventListener("change", listener);
      return () => mq.removeEventListener("change", listener);
    }
  }, []);

  // Master State Machine Timeline
  useEffect(() => {
    if (!isPlaying || reducedMotion) return;

    let timer: NodeJS.Timeout;

    if (stage === "query") {
      timer = setTimeout(() => setStage("analyzing"), 1400);
    } else if (stage === "analyzing") {
      timer = setTimeout(() => setStage("analyzed"), 900);
    } else if (stage === "analyzed") {
      timer = setTimeout(() => setStage("metrics"), 500);
    } else if (stage === "metrics") {
      timer = setTimeout(() => setStage("visibility"), 1400);
    } else if (stage === "visibility") {
      timer = setTimeout(() => setStage("competitors"), 1100);
    } else if (stage === "competitors") {
      timer = setTimeout(() => setStage("diagnosis"), 1400);
    } else if (stage === "diagnosis") {
      timer = setTimeout(() => setStage("recommendation"), 1400);
    } else if (stage === "recommendation") {
      timer = setTimeout(() => setStage("complete"), 2000);
    } else if (stage === "complete") {
      // Hold complete state for 3.5 seconds, then restart smoothly
      timer = setTimeout(() => {
        setCycleCount((c) => c + 1);
        setStage("query");
      }, 3500);
    }

    return () => clearTimeout(timer);
  }, [stage, isPlaying, reducedMotion]);

  // Auto-scroll downwards as new insights appear
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: reducedMotion ? "auto" : "smooth",
      });
    }
  }, [stage, reducedMotion]);

  const stageIndex = STAGES_ORDER.indexOf(stage);
  const isAtLeast = (target: DemoStage) => stageIndex >= STAGES_ORDER.indexOf(target);

  const handleRestart = () => {
    setStage("query");
    setIsPlaying(true);
    setCycleCount((c) => c + 1);
  };

  return (
    <div className="w-full max-w-[600px] xl:max-w-[640px] bg-card border border-border/80 rounded-2xl shadow-xl overflow-hidden flex flex-col h-[520px] sm:h-[560px] lg:h-[600px] xl:h-[640px] max-h-[calc(100vh-135px)] relative">
      
      {/* ── Compact Header Bar (VSI Assistant ● Active) ── */}
      <div className="px-4 py-2.5 border-b border-border bg-card/95 backdrop-blur-sm flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#FF5A1F] to-[#FFA17A] flex items-center justify-center text-white font-black text-xs shadow-xs">
            <Bot size={15} />
          </div>
          <div>
            <h3 className="text-xs font-black text-foreground flex items-center gap-2 leading-none">
              <span>VSI Assistant</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </span>
            </h3>
            <p className="text-[10px] text-muted-foreground font-semibold mt-1 leading-none">
              AI Search Intelligence
            </p>
          </div>
        </div>

        {/* Playback Controls & Scrubber */}
        <div className="flex items-center gap-2">
          {/* Step indicator dots */}
          <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted/50 border border-border/70">
            {STAGES_ORDER.slice(0, -1).map((s, idx) => (
              <button
                key={s}
                onClick={() => {
                  setStage(s);
                  setIsPlaying(false);
                }}
                title={`Jump to ${s}`}
                className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                  idx <= stageIndex ? "bg-[#FF5A1F] scale-110" : "bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? "Pause demo" : "Resume demo"}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} className="text-[#FF5A1F]" />}
          </button>

          <button
            onClick={handleRestart}
            title="Restart demo"
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* ── Chat Messages Stream ── */}
      <div 
        ref={scrollRef}
        className="flex-1 p-3 sm:p-3.5 overflow-y-auto space-y-2.5 bg-background/50 custom-scrollbar"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={cycleCount}
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.3 }}
            transition={{ duration: 0.25 }}
            className="space-y-2.5"
          >
            {/* STEP 1: User Query */}
            <AnimatedQuery
              fullText="Why isn't my website being cited for best CRM for startups?"
              isTyping={stage === "query"}
              reducedMotion={reducedMotion}
            />

            {/* STEP 2 & 3: Status & Analyzing Badge */}
            {isAtLeast("analyzing") && (
              <AnalysisStatus
                status={stage === "analyzing" ? "analyzing" : "completed"}
                reducedMotion={reducedMotion}
              />
            )}

            {/* STEP 4: Key Metrics Grid */}
            {isAtLeast("metrics") && (
              <VisibilityMetrics reducedMotion={reducedMotion} />
            )}

            {/* STEP 5: AI Visibility Breakdown */}
            {isAtLeast("visibility") && (
              <CitationAnalysis reducedMotion={reducedMotion} />
            )}

            {/* STEP 6: Competitor Analysis Comparison */}
            {isAtLeast("competitors") && (
              <CompetitorAnalysisCard reducedMotion={reducedMotion} />
            )}

            {/* STEP 7: AI Diagnosis */}
            {isAtLeast("diagnosis") && (
              <AIDiagnosis reducedMotion={reducedMotion} />
            )}

            {/* STEP 8: Recommendation & Next Action */}
            {isAtLeast("recommendation") && (
              <NextActionCard reducedMotion={reducedMotion} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Polished SaaS Input Bar ── */}
      <div className="p-3 border-t border-border bg-card/95 shrink-0 space-y-1.5 z-10">
        <div className="flex items-center gap-2 border border-border rounded-xl px-3.5 py-2 bg-background shadow-2xs focus-within:border-[#FF5A1F] transition-colors">
          <input
            type="text"
            readOnly
            value="Why isn't my website being cited for best CRM for startups?"
            className="flex-1 bg-transparent text-[11px] text-muted-foreground focus:outline-none cursor-default truncate font-medium"
          />
          <span className="text-[9px] font-extrabold text-muted-foreground/70 uppercase tracking-wider hidden sm:inline px-1.5 py-0.5 rounded bg-muted/60">
            Product Demo
          </span>
        </div>

        <div className="flex items-center justify-between text-[10px] text-muted-foreground px-1 font-medium">
          <span>AI Search Intelligence</span>
          <span className="text-emerald-500 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Continuous Live Audit
          </span>
        </div>
      </div>

    </div>
  );
}
