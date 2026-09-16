"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import NextActionsView from "@/features/citation-strategy/components/NextActionsView";
import AIVisibilityView from "@/features/visibility/components/AIVisibilityView";
import SiteAuditView from "@/features/diagnosis/components/SiteAuditView";
import LiveSearchCheckView from "@/features/diagnosis/components/LiveSearchCheckView";

function CheckPageContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");

  // Determine active tab
  const activeTab = tab === "opportunities" 
    ? "opportunities" 
    : tab === "aivisibility" 
    ? "aivisibility" 
    : tab === "quick-check" 
    ? "quick-check" 
    : "audit";

  return (
    <div className="w-full max-w-[1600px] mx-auto p-6 sm:p-7 lg:p-8 font-sans text-foreground">
      {/* ── PERSISTENT FAST TAB VIEWS ── */}
      <div className={activeTab === "audit" ? "block" : "hidden"}>
        <SiteAuditView />
      </div>
      <div className={activeTab === "opportunities" ? "block" : "hidden"}>
        <NextActionsView />
      </div>
      <div className={activeTab === "aivisibility" ? "block" : "hidden"}>
        <AIVisibilityView />
      </div>
      <div className={activeTab === "quick-check" ? "block" : "hidden"}>
        <LiveSearchCheckView />
      </div>
    </div>
  );
}

export default function CheckPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs font-semibold text-muted-foreground flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-5 h-5 animate-spin mr-2 text-primary" />
          Loading Intelligence Hub…
        </div>
      }
    >
      <CheckPageContent />
    </Suspense>
  );
}
