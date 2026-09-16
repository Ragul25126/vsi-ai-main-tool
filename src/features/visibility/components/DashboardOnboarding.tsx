"use client";

import React, { useState } from "react";
import { Globe, Sparkles, ArrowRight } from "lucide-react";

interface DashboardOnboardingProps {
  onStartTracking: (domain: string) => void;
}

export default function DashboardOnboarding({ onStartTracking }: DashboardOnboardingProps) {
  const [domainInput, setDomainInput] = useState("");

  const steps = [
    {
      num: "1",
      title: "Add your website domain",
      desc: "Connect your production domain to track citations across Google AI Overviews and ChatGPT.",
      status: "current",
    },
    {
      num: "2",
      title: "Add target search keywords",
      desc: "Input primary commercial search phrases and high-intent brand queries.",
      status: "upcoming",
    },
    {
      num: "3",
      title: "Track top competitors",
      desc: "Benchmark your domain against 3 competitors dominating your category.",
      status: "upcoming",
    },
    {
      num: "4",
      title: "Run your first AI diagnostic scan",
      desc: "Extract live AI citations, discover gaps, and generate your first action board.",
      status: "upcoming",
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (domainInput.trim()) {
      onStartTracking(domainInput.trim());
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-175px)] bg-white dark:bg-card border border-border/80 rounded-2xl lg:rounded-[20px] p-6 sm:p-8 lg:p-12 shadow-xs flex flex-col justify-between animate-fadeIn">
      {/* Top Content & Primary Action */}
      <div className="space-y-6 sm:space-y-8 pt-2 sm:pt-4">
        {/* Title & Description */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FF5A1F]/10 border border-[#FF5A1F]/25 text-[#FF5A1F] text-xs font-black">
            <Sparkles size={13} className="text-[#FF5A1F]" />
            <span>VSI Search Intelligence Onboarding</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground tracking-tight">
            Connect your domain to start tracking AI visibility
          </h1>
          <p className="text-xs sm:text-sm lg:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Monitor your brand across Google AI Mode, Google AI Overviews, and ChatGPT. Find out why competitors get cited and turn gaps into execution tasks.
          </p>
        </div>

        {/* Website Input Form */}
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-3xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2"
        >
          <div className="relative flex-1">
            <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              placeholder="Enter website (e.g. yourcompany.com)"
              className="w-full pl-11 pr-4 py-3.5 bg-muted/40 dark:bg-muted/20 border border-border rounded-xl text-xs sm:text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/30 focus:border-[#FF5A1F] transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={!domainInput.trim()}
            className="w-full sm:w-[190px] px-6 py-3.5 rounded-xl bg-[#FF5A1F] hover:bg-[#E04810] text-white text-xs sm:text-sm font-bold transition-all shadow-xs hover:shadow-md cursor-pointer disabled:opacity-40 shrink-0 flex items-center justify-center gap-2"
          >
            <span>Start Tracking</span>
            <ArrowRight size={15} />
          </button>
        </form>
      </div>

      {/* How VSI Intelligence Works - Full Width 4-Column Grid */}
      <div className="border-t border-border/70 pt-6 sm:pt-8 mt-8 sm:mt-10">
        <h3 className="text-xs font-black text-muted-foreground uppercase tracking-wider mb-5 text-center">
          How VSI Intelligence Works
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 w-full">
          {steps.map((step) => (
            <div
              key={step.num}
              className="p-5 sm:p-6 rounded-2xl bg-muted/30 dark:bg-muted/15 border border-border/70 space-y-3 flex flex-col justify-between hover:border-[#FF5A1F]/30 transition-colors"
            >
              <div className="space-y-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FF5A1F]/15 text-[#FF5A1F] flex items-center justify-center font-black text-xs sm:text-sm">
                  {step.num}
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-foreground leading-snug">
                  {step.title}
                </h4>
                <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
                  {step.desc}
                </p>
              </div>
              <span className="text-[10px] font-semibold text-muted-foreground/80 uppercase tracking-wide pt-2">
                Step {step.num} of 4
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
