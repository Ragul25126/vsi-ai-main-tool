"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useFeedback } from "@/contexts/FeedbackContext";

const DISMISS_KEY = "vsi_pilot_banner_dismissed";

export default function PilotBanner() {
  const { openFeedback } = useFeedback();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(DISMISS_KEY) === "true");
    } catch {
      setDismissed(false);
    }
  }, []);

  if (dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "true");
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 border-b border-line bg-brand-soft px-4 py-2 md:px-6">
      <p className="text-support text-ink-2">
        You're using the VSI pilot. Tell us what works and what doesn't through{" "}
        <button type="button" onClick={openFeedback} className="font-medium text-ink underline underline-offset-2 hover:text-brand-strong">
          Feedback
        </button>
        .
      </p>
      <button
        type="button"
        onClick={dismiss}
        className="shrink-0 rounded-control p-1 text-ink-3 hover:bg-surface hover:text-ink"
        aria-label="Dismiss pilot message"
      >
        <X size={16} strokeWidth={1.75} />
      </button>
    </div>
  );
}
