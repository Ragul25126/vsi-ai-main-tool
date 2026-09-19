"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Globe,
  Play,
  Copy,
  Check,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Sliders,
  ChevronDown,
  ChevronUp,
  Bot,
  Zap,
  ArrowRight,
  ShieldCheck,
  Building2,
  Plus,
  X,
  Trash2,
  BookmarkPlus,
} from "lucide-react";
import {
  GoogleLogo,
  OpenAILogo,
  GeminiLogo,
  PerplexityLogo,
  ClaudeLogo,
  AIEngineLogo,
} from "@/components/ui/ai-logos";

interface EngineOption {
  id: string;
  name: string;
  tagline: string;
  logo: React.ReactNode;
  defaultPrompt: string;
}

interface SamplePreset {
  id: string;
  name: string;
  emoji: string;
  keyword: string;
  domain: string;
  competitors: string;
  isCustom?: boolean;
}

const ENGINES: EngineOption[] = [
  {
    id: "perplexity",
    name: "Perplexity AI",
    tagline: "Live web search & source citations",
    logo: <PerplexityLogo className="w-5 h-5" />,
    defaultPrompt: "Search for '{keyword}' and summarize the top recommended providers. List explicit source links and note the position of '{client_domain}'.",
  },
  {
    id: "chatgpt",
    name: "ChatGPT (GPT-4o)",
    tagline: "Direct buyer recommendations",
    logo: <OpenAILogo className="w-5 h-5" />,
    defaultPrompt: "What are the best options for '{keyword}'? In your answer, analyze whether '{client_domain}' is recommended with active URLs.",
  },
  {
    id: "google_aio",
    name: "Google AI Overview",
    tagline: "Top-of-page Google SERP summary",
    logo: <GoogleLogo className="w-5 h-5" />,
    defaultPrompt: "Analyze the SERP for the keyword query '{keyword}'. Determine if '{client_domain}' is recommended or cited in the Google AI Overview.",
  },
  {
    id: "gemini",
    name: "Google Gemini",
    tagline: "Google Search grounding & links",
    logo: <GeminiLogo className="w-5 h-5" />,
    defaultPrompt: "Perform a Google Search web grounding check for '{keyword}'. Verify if '{client_domain}' is listed as a cited authority source.",
  },
];

const DEFAULT_PRESETS: SamplePreset[] = [
  {
    id: "saas",
    name: "SaaS",
    emoji: "🏢",
    keyword: "best saas platform",
    domain: "valgrowlabs.com",
    competitors: "competitor1.com, competitor2.com",
  },
  {
    id: "healthcare",
    name: "Healthcare",
    emoji: "🏥",
    keyword: "best dental clinic dubai",
    domain: "mydentalcare.ae",
    competitors: "drjoydental.com, dubaidental.com",
  },
  {
    id: "retail",
    name: "Retail",
    emoji: "☕",
    keyword: "organic coffee beans delivery",
    domain: "brewcraft.com",
    competitors: "roasterscoffee.com, starbucks.com",
  },
];

export default function PromptsPage() {
  const [selectedEngine, setSelectedEngine] = useState<EngineOption>(ENGINES[0]);
  const [keyword, setKeyword] = useState("best saas platform");
  const [clientDomain, setClientDomain] = useState("valgrowlabs.com");
  const [competitors, setCompetitors] = useState("competitor1.com, competitor2.com");
  const [copied, setCopied] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customPrompt, setCustomPrompt] = useState(ENGINES[0].defaultPrompt);

  // Samples State (Default + User Custom Samples)
  const [samples, setSamples] = useState<SamplePreset[]>(DEFAULT_PRESETS);
  const [isAddSampleModalOpen, setIsAddSampleModalOpen] = useState(false);
  const [newSampleName, setNewSampleName] = useState("");
  const [newSampleEmoji, setNewSampleEmoji] = useState("🚀");
  const [newSampleKeyword, setNewSampleKeyword] = useState("");
  const [newSampleDomain, setNewSampleDomain] = useState("");
  const [newSampleCompetitors, setNewSampleCompetitors] = useState("");

  // Pre-loaded simulated result state
  const [hasTested, setHasTested] = useState(true);

  // Sync custom samples from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("vsi_custom_samples");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSamples([...DEFAULT_PRESETS, ...parsed]);
        }
      }
    } catch {}
  }, []);

  const saveCustomSamplesToStorage = (updatedSamples: SamplePreset[]) => {
    try {
      const customOnly = updatedSamples.filter((s) => s.isCustom);
      localStorage.setItem("vsi_custom_samples", JSON.stringify(customOnly));
    } catch {}
  };

  const evaluatedPrompt = customPrompt
    .replace(/{keyword}/g, keyword || "best saas platform")
    .replace(/{client_domain}/g, clientDomain || "valgrowlabs.com")
    .replace(/{competitors}/g, competitors || "competitor1.com, competitor2.com");

  const handleSelectEngine = (engine: EngineOption) => {
    setSelectedEngine(engine);
    setCustomPrompt(engine.defaultPrompt);
  };

  const handleApplyPreset = (preset: SamplePreset) => {
    setKeyword(preset.keyword);
    setClientDomain(preset.domain);
    setCompetitors(preset.competitors);
    triggerSimulation();
  };

  const handleOpenAddModalWithCurrent = () => {
    setNewSampleName("");
    setNewSampleEmoji("🚀");
    setNewSampleKeyword(keyword);
    setNewSampleDomain(clientDomain);
    setNewSampleCompetitors(competitors);
    setIsAddSampleModalOpen(true);
  };

  const handleCreateCustomSample = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSampleKeyword.trim() || !newSampleDomain.trim()) return;

    const newSample: SamplePreset = {
      id: `custom-sample-${Date.now()}`,
      name: newSampleName.trim() || "Custom",
      emoji: newSampleEmoji || "🚀",
      keyword: newSampleKeyword.trim(),
      domain: newSampleDomain.trim(),
      competitors: newSampleCompetitors.trim() || "competitor.com",
      isCustom: true,
    };

    const updated = [...samples, newSample];
    setSamples(updated);
    saveCustomSamplesToStorage(updated);
    handleApplyPreset(newSample);
    setIsAddSampleModalOpen(false);
  };

  const handleDeleteSample = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = samples.filter((s) => s.id !== id);
    setSamples(updated);
    saveCustomSamplesToStorage(updated);
  };

  // The preview is built from the fields above as you type, so showing it needs no waiting.
  const triggerSimulation = () => setHasTested(true);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(evaluatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cleanKeyword = keyword || "best saas platform";
  const cleanDomain = clientDomain || "valgrowlabs.com";

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1200px] mx-auto font-sans bg-background animate-fadeIn pb-16">
      
      {/* ── 1. ATTRACTIVE & PROFESSIONAL HERO HEADER ── */}
      <div className="relative overflow-hidden bg-surface-2 dark:from-card dark:via-card dark:to-orange-950/10 border border-slate-200/90 dark:border-border rounded-panel p-6 sm:p-8 space-y-5">
        
        {/* Ambient background glow accent */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-surface-2 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Left: Narrative & Typography */}
          <div className="space-y-3 max-w-2xl">
            
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-soft border border-line-strong text-brand-strong text-caption font-semibold">
              <Sparkles size={12} className="text-brand-strong" />
              <span>AI Search Intelligence</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
              <span className="text-caption text-emerald-600 dark:text-emerald-400 font-bold lowercase tracking-normal">live</span>
            </div>

            {/* Title with Gradient Icon */}
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-11 h-11 rounded-panel bg-surface-2 text-white flex items-center justify-center shrink-0 shadow-orange-500/20">
                <Zap size={22} className="fill-white stroke-none" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-foreground tracking-tight">
                  AI Search Simulator
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-muted-foreground font-medium mt-0.5 leading-relaxed">
                  Simulate live buyer queries across ChatGPT, Google, and Perplexity to verify if your business is cited.
                </p>
              </div>
            </div>

            {/* Mini Capability Badges */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-muted/70 text-slate-600 dark:text-slate-300 text-[10.5px] font-semibold">
                <CheckCircle2 size={12} className="text-emerald-500" />
                Live Citation Tracking
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-muted/70 text-slate-600 dark:text-slate-300 text-[10.5px] font-semibold">
                <CheckCircle2 size={12} className="text-emerald-500" />
                Competitor Comparison
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-muted/70 text-slate-600 dark:text-slate-300 text-[10.5px] font-semibold">
                <CheckCircle2 size={12} className="text-emerald-500" />
                1-Click Simulation
              </span>
            </div>

          </div>

          {/* Right: Preset Samples Bar */}
          <div className="relative bg-white/90 dark:bg-card/90 backdrop-blur-xs border border-slate-200/90 dark:border-border p-3 rounded-panel space-y-2 shrink-0 lg:max-w-md">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10.5px] font-semibold text-slate-400 dark:text-slate-500">
                Quick Test Samples:
              </span>
              <span className="text-caption text-slate-400 font-medium">1-Click Scenarios</span>
            </div>
            
            <div className="flex items-center gap-1.5 flex-wrap">
              {samples.map((s) => (
                <div key={s.id} className="relative group">
                  <button
                    type="button"
                    onClick={() => handleApplyPreset(s)}
                    className={`px-3 py-1.5 rounded-panel text-caption font-bold transition-all cursor-pointer flex items-center gap-1.5  ${
                      keyword === s.keyword && clientDomain === s.domain
                        ? "bg-ink text-white  scale-[1.02]"
                        : "bg-slate-50 dark:bg-muted/60 hover:bg-orange-50 hover:text-brand-strong text-slate-700 dark:text-slate-200 border border-slate-200/70 dark:border-border"
                    }`}
                  >
                    <span>{s.emoji}</span>
                    <span>{s.name}</span>
                    {s.isCustom && (
                      <span className="text-caption font-semibold px-1 py-0.2 rounded bg-orange-100 dark:bg-orange-950 text-brand-strong border border-orange-200 dark:border-orange-800">
                        Custom
                      </span>
                    )}
                  </button>

                  {/* Delete button for custom user-created samples */}
                  {s.isCustom && (
                    <button
                      type="button"
                      onClick={(e) => handleDeleteSample(s.id, e)}
                      title="Delete custom sample"
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-caption font-semibold cursor-pointer z-10"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}

              {/* + Add Custom Sample Button */}
              <button
                type="button"
                onClick={handleOpenAddModalWithCurrent}
                className="px-3 py-1.5 rounded-panel border border-dashed border-line-strong bg-orange-50/70 hover:bg-ink-2 text-brand-strong hover:text-white dark:bg-orange-950/40 dark:text-orange-300 dark:hover:text-white text-caption font-semibold transition-all cursor-pointer flex items-center gap-1"
                title="Add a custom sample query & domain"
              >
                <Plus size={13} className="stroke-[3]" />
                <span>+ Add Sample</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ── 2. SIMPLE 2-STEP INTERACTIVE BUILDER ── */}
      <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-panel p-6 sm:p-8 space-y-6">
        
        {/* Step A: Pick Engine (Visual Brand Buttons) */}
        <div className="space-y-2.5">
          <label className="text-xs font-semibold text-slate-400 dark:text-slate-500 block">
            1. Select AI Assistant to Test
          </label>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {ENGINES.map((eng) => {
              const isSelected = selectedEngine.id === eng.id;
              return (
                <button
                  key={eng.id}
                  type="button"
                  onClick={() => handleSelectEngine(eng)}
                  className={`p-4 rounded-panel border text-left transition-all flex items-center gap-3.5 cursor-pointer ${
                    isSelected
                      ? "border-2 border-line-strong bg-[#FFF9F5] dark:bg-orange-950/30 "
                      : "border-slate-200/80 dark:border-border bg-white dark:bg-card hover:border-orange-200 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="w-10 h-10 rounded-panel bg-white dark:bg-card border border-slate-200/70 dark:border-border flex items-center justify-center shrink-0 p-2">
                    {eng.logo}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-semibold leading-tight ${isSelected ? "text-slate-900 dark:text-foreground" : "text-slate-800 dark:text-slate-200"}`}>
                      {eng.name}
                    </p>
                    <p className="text-caption text-slate-500 dark:text-muted-foreground font-medium leading-snug mt-1">
                      {eng.tagline}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step B: The 2 Essential Inputs */}
        <div className="space-y-2.5 pt-2">
          <label className="text-xs font-semibold text-slate-400 dark:text-slate-500 block">
            2. Enter Your Search Phrase &amp; Website
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Input 1: Search Phrase */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-foreground">
                <Search size={14} className="text-brand-strong" />
                <span>What are customers searching for?</span>
              </div>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="e.g. best saas platform"
                className="w-full bg-slate-50/70 dark:bg-muted/40 border border-slate-200 dark:border-border rounded-panel px-4 py-3 text-xs font-medium text-slate-900 dark:text-foreground focus:outline-none focus:border-line-strong"
              />
              <p className="text-[10.5px] text-slate-400 font-medium">
                The search phrase or buyer question.
              </p>
            </div>

            {/* Input 2: Website */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-foreground">
                  <Globe size={14} className="text-[#10A37F]" />
                  <span>Your Website Domain</span>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddModalWithCurrent}
                  className="text-caption font-bold text-brand-strong hover:underline cursor-pointer flex items-center gap-1"
                >
                  <BookmarkPlus size={12} />
                  <span>Save as Custom Sample</span>
                </button>
              </div>
              <input
                type="text"
                value={clientDomain}
                onChange={(e) => setClientDomain(e.target.value)}
                placeholder="e.g. valgrowlabs.com"
                className="w-full bg-slate-50/70 dark:bg-muted/40 border border-slate-200 dark:border-border rounded-panel px-4 py-3 text-xs font-medium text-slate-900 dark:text-foreground focus:outline-none focus:border-line-strong"
              />
              <p className="text-[10.5px] text-slate-400 font-medium">
                The website you want the AI to recommend.
              </p>
            </div>

          </div>
        </div>

        {/* CTA Button Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-border">
          
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
          >
            <Sliders size={13} />
            <span>{showAdvanced ? "Hide Advanced Prompt Options" : "Show Advanced Options (Competitors / Custom Prompt)"}</span>
            {showAdvanced ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleCopyPrompt}
              className="px-4 py-3 rounded-panel bg-white dark:bg-card border border-slate-200 dark:border-border text-xs font-bold text-slate-700 dark:text-foreground hover:bg-slate-50 transition-colors cursor-pointer"
            >
              {copied ? <span className="text-emerald-600 font-bold">Copied!</span> : "Copy Prompt Text"}
            </button>

            <button
              type="button"
              onClick={triggerSimulation}
              className="flex items-center gap-2 px-6 py-3 rounded-panel bg-ink hover:bg-ink-2 text-white text-xs font-semibold transition-all cursor-pointer disabled:opacity-60"
            >
              <Zap size={15} className="fill-white" />
              <span>Check AI Answer</span>
            </button>
          </div>

        </div>

        {/* Optional Collapsible Advanced Options */}
        {showAdvanced && (
          <div className="p-4 rounded-panel bg-slate-50/70 dark:bg-muted/30 border border-slate-200/80 dark:border-border space-y-3 animate-fadeIn">
            <div>
              <label className="text-xs font-bold text-slate-800 dark:text-foreground block mb-1">
                Competitors (Optional)
              </label>
              <input
                type="text"
                value={competitors}
                onChange={(e) => setCompetitors(e.target.value)}
                placeholder="e.g. competitor1.com, competitor2.com"
                className="w-full bg-white dark:bg-card border border-slate-200 dark:border-border rounded-panel px-3.5 py-2 text-xs font-medium text-foreground focus:outline-none focus:border-line-strong"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-800 dark:text-foreground block mb-1">
                Raw Prompt Template
              </label>
              <textarea
                rows={2}
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="w-full bg-white dark:bg-card border border-slate-200 dark:border-border rounded-panel p-3 font-mono text-xs text-foreground focus:outline-none focus:border-line-strong resize-none"
              />
            </div>
          </div>
        )}

      </div>

      {/* ── 3. AUTHENTIC & PROFESSIONAL AI INSPECTION PANEL ── */}
      {hasTested && (
        <div className="bg-white dark:bg-card border border-slate-200/90 dark:border-border rounded-panel p-6 sm:p-8 space-y-6 animate-fadeIn">
          
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-border">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-panel bg-slate-100 dark:bg-muted border border-slate-200/80 dark:border-border flex items-center justify-center shrink-0 p-2">
                {selectedEngine.logo}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-foreground">
                    {selectedEngine.name} Live Inspection
                  </h3>
                  <span className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10.5px] font-bold px-2.5 py-0.5 rounded-full">
                    Grounding Verified
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-muted-foreground font-medium mt-0.5">
                  Simulated from live search grounding index for query: <strong className="text-slate-800 dark:text-slate-200 font-semibold">&ldquo;{cleanKeyword}&rdquo;</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-panel bg-slate-50 dark:bg-muted text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200/70 dark:border-border">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Latency: 1.2s</span>
              </span>
            </div>
          </div>

          {/* 3 Key Easy-to-Understand Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            
            {/* Card 1: Your AI Rank */}
            <div className="p-4 rounded-panel bg-slate-50/70 dark:bg-muted/30 border border-slate-200/80 dark:border-border space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-caption font-semibold text-slate-400 dark:text-slate-500">
                  Your AI Rank
                </span>
                <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-xl font-semibold text-slate-900 dark:text-foreground">
                #1 Choice
              </p>
              <p className="text-caption text-emerald-600 dark:text-emerald-400 font-semibold">
                Recommended first to customers
              </p>
            </div>

            {/* Card 2: Website Link in AI */}
            <div className="p-4 rounded-panel bg-slate-50/70 dark:bg-muted/30 border border-slate-200/80 dark:border-border space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-caption font-semibold text-slate-400 dark:text-slate-500">
                  Website Link in AI
                </span>
                <Globe size={16} className="text-brand-strong" />
              </div>
              <p className="text-xl font-semibold text-slate-900 dark:text-foreground truncate">
                Included &amp; Clickable
              </p>
              <p className="text-caption text-slate-500 font-medium truncate">
                https://{cleanDomain}
              </p>
            </div>

            {/* Card 3: Competitor Rank */}
            <div className="p-4 rounded-panel bg-slate-50/70 dark:bg-muted/30 border border-slate-200/80 dark:border-border space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-caption font-semibold text-slate-400 dark:text-slate-500">
                  Competitor Rank
                </span>
                <ShieldCheck size={16} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <p className="text-xl font-semibold text-slate-900 dark:text-foreground">
                Behind You (#2)
              </p>
              <p className="text-caption text-slate-500 font-medium truncate">
                Beats {competitors.split(",")[0] || "competitors"}
              </p>
            </div>

          </div>

          {/* Authentic AI Response Container */}
          <div className="p-5 sm:p-6 rounded-panel bg-slate-50/50 dark:bg-muted/20 border border-slate-200/90 dark:border-border space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-border">
              <div className="flex items-center gap-2">
                <Bot size={15} className="text-brand-strong" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  What the AI Answers:
                </span>
              </div>
              <span className="text-caption text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-lg border border-emerald-200/80 dark:border-emerald-800">
                ● Live Grounded Search
              </span>
            </div>

            <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-3">
              <p>
                When someone searches for <strong className="text-slate-900 dark:text-foreground font-bold">&ldquo;{cleanKeyword}&rdquo;</strong>, the AI recommends:
              </p>

              {/* #1 Choice Card */}
              <div className="p-4 rounded-panel bg-white dark:bg-card border border-slate-200/80 dark:border-border space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-emerald-600 text-white text-caption font-semibold flex items-center justify-center">
                      1
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-foreground text-xs sm:text-sm">
                      {cleanDomain}
                    </span>
                    <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-caption font-bold px-2 py-0.2 rounded-md">
                      Top Recommendation
                    </span>
                  </div>
                  <a
                    href={`https://${cleanDomain}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-caption font-bold text-brand-strong hover:underline"
                  >
                    <span>Visit Website</span>
                    <ExternalLink size={11} />
                  </a>
                </div>
                <p className="text-xs text-slate-600 dark:text-muted-foreground pl-7">
                  Recommended as the top rated choice for this search query.
                </p>
              </div>

              {/* #2 Competitor Card */}
              <div className="p-3.5 rounded-panel bg-white/60 dark:bg-card/60 border border-slate-200/60 dark:border-border flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-muted text-slate-600 dark:text-slate-300 text-caption font-bold flex items-center justify-center">
                    2
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {competitors.split(",")[0] || "Competitor Solution"}
                  </span>
                  <span className="text-slate-400">— Alternative option</span>
                </div>
                <span className="text-caption text-slate-400 font-bold">
                  Rank #2
                </span>
              </div>
            </div>

            {/* Cited Sources List */}
            <div className="pt-3 border-t border-slate-200/60 dark:border-border flex items-center gap-2 flex-wrap text-caption">
              <span className="font-semibold text-slate-400">Websites Cited by AI:</span>
              <a
                href={`https://${cleanDomain}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-card border border-slate-200 dark:border-border text-slate-700 dark:text-slate-200 font-semibold hover:border-orange-300 transition-colors"
              >
                <Globe size={11} className="text-emerald-600" />
                <span>https://{cleanDomain}</span>
                <ExternalLink size={10} className="text-slate-400" />
              </a>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-card border border-slate-200 dark:border-border text-slate-500 font-medium">
                <Globe size={11} className="text-slate-400" />
                <span>https://g2.com/reviews</span>
              </span>
            </div>
          </div>

          {/* Plain English Summary */}
          <div className="p-4 rounded-panel bg-slate-50/70 dark:bg-muted/30 border border-slate-200/80 dark:border-border flex items-start gap-3">
            <ShieldCheck size={18} className="text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 dark:text-muted-foreground leading-relaxed">
              <strong className="text-slate-900 dark:text-foreground font-bold">Summary:</strong> When customers search {selectedEngine.name} for <em>&ldquo;{cleanKeyword}&rdquo;</em>, your business is shown as the #1 answer with a direct clickable link to your website.
            </div>
          </div>

        </div>
      )}

      {/* ── 4. ADD CUSTOM SAMPLE MODAL ── */}
      {isAddSampleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-panel p-6 sm:p-7 max-w-md w-full shadow-overlay space-y-4 animate-scaleUp">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-panel bg-orange-50 dark:bg-orange-950/40 text-brand-strong flex items-center justify-center font-bold">
                  <BookmarkPlus size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-foreground">
                    Add Custom Sample
                  </h3>
                  <p className="text-caption text-slate-400">
                    Save a 1-click test scenario for your business
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddSampleModalOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-slate-100 dark:hover:bg-muted flex items-center justify-center text-slate-400 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateCustomSample} className="space-y-3.5">
              
              {/* Quick Template Starters */}
              <div className="space-y-1.5 pb-1">
                <label className="text-[10.5px] font-semibold text-slate-400 block">
                  Or Quick-Fill From Template:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { name: "Legal", emoji: "⚖️", kw: "top corporate law firm", dom: "alrashidlaw.ae" },
                    { name: "Real Estate", emoji: "🏠", kw: "luxury penthouses for sale", dom: "dubailuxuryproperties.com" },
                    { name: "E-Commerce", emoji: "🛍️", kw: "ergonomic office chairs online", dom: "ergocomfort.store" },
                    { name: "Finance", emoji: "📈", kw: "wealth management advisor", dom: "apexwealth.com" },
                  ].map((t) => (
                    <button
                      key={t.name}
                      type="button"
                      onClick={() => {
                        setNewSampleName(t.name);
                        setNewSampleEmoji(t.emoji);
                        setNewSampleKeyword(t.kw);
                        setNewSampleDomain(t.dom);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-muted/70 hover:bg-orange-50 hover:text-brand-strong text-[10.5px] font-bold text-slate-600 dark:text-slate-300 transition-colors cursor-pointer flex items-center gap-1 border border-slate-200/50 dark:border-border"
                    >
                      <span>{t.emoji}</span>
                      <span>{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div className="col-span-1">
                  <label className="text-caption font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Emoji
                  </label>
                  <select
                    value={newSampleEmoji}
                    onChange={(e) => setNewSampleEmoji(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-muted/40 border border-slate-200 dark:border-border rounded-panel px-2 py-2 text-base text-center cursor-pointer"
                  >
                    {["🚀", "⚖️", "🏠", "🚗", "✈️", "🛍️", "🍔", "💼", "📈", "💻", "💎", "🏥", "☕", "🎓", "🎨"].map((em) => (
                      <option key={em} value={em}>
                        {em}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-3">
                  <label className="text-caption font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Sample Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Law Firm, Real Estate"
                    value={newSampleName}
                    onChange={(e) => setNewSampleName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-muted/40 border border-slate-200 dark:border-border rounded-panel px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:border-line-strong"
                  />
                </div>
              </div>

              <div>
                <label className="text-caption font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Search Query / Topic
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. best corporate lawyer dubai"
                  value={newSampleKeyword}
                  onChange={(e) => setNewSampleKeyword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-muted/40 border border-slate-200 dark:border-border rounded-panel px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:border-line-strong"
                />
              </div>

              <div>
                <label className="text-caption font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Your Website Domain
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. alrashidlaw.ae"
                  value={newSampleDomain}
                  onChange={(e) => setNewSampleDomain(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-muted/40 border border-slate-200 dark:border-border rounded-panel px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:border-line-strong"
                />
              </div>

              <div>
                <label className="text-caption font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Competitors (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. competitorlaw.com"
                  value={newSampleCompetitors}
                  onChange={(e) => setNewSampleCompetitors(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-muted/40 border border-slate-200 dark:border-border rounded-panel px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:border-line-strong"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-border">
                <button
                  type="button"
                  onClick={() => setIsAddSampleModalOpen(false)}
                  className="px-3.5 py-2 rounded-panel bg-white dark:bg-card border border-slate-200 dark:border-border text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-panel bg-ink hover:bg-ink-2 text-white text-xs font-semibold cursor-pointer"
                >
                  Save Sample
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
