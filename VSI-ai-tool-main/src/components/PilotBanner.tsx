"use client";

import { useState } from "react";
import { useFeedback } from "@/contexts/FeedbackContext";
import { X } from "lucide-react";

export default function PilotBanner() {
  const { openFeedback } = useFeedback();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 sm:px-8 py-2.5 flex items-center justify-between gap-4 transition-all">
      <p className="text-xs sm:text-sm text-foreground leading-relaxed flex-1 font-medium">
        <span className="inline-block rounded-full bg-amber-500 text-black text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 mr-2 align-middle shadow-xs">
          PILOT
        </span>
        Thanks for testing SearchIntel. Please try every feature — generate briefs, run citation analyses, ship tasks — and send feedback via the{" "}
        <button
          type="button"
          onClick={openFeedback}
          className="font-bold text-amber-500 underline underline-offset-2 hover:text-amber-600 transition-colors cursor-pointer"
          aria-label="Open feedback form"
        >
          Feedback
        </button>{" "}
        button.
      </p>

      {/* Dismiss / Cancel Button */}
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted-bg transition-colors cursor-pointer shrink-0"
        aria-label="Dismiss banner"
        title="Dismiss message"
      >
        <X size={16} />
      </button>
    </div>
  );
}
