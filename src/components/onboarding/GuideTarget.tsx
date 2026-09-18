"use client";

import type { ReactNode } from "react";
import { GUIDE_LABEL, type GuideStep } from "@/lib/onboarding";
import { useGuideStep } from "./OnboardingProvider";

const stroke = { stroke: "var(--brand)", strokeWidth: 1.75, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };

/**
 * Wraps the button for one setup step. When that step is the user's current
 * next action (from real project state), a small hand-drawn "Start here!" /
 * "Next step" note points at it. Otherwise it renders the button unchanged.
 * Nothing blocks the page; optional steps can be dismissed with "Not now".
 */
export function GuideTarget({ step, children }: { step: GuideStep; children: ReactNode }) {
  const { step: current, skip } = useGuideStep();
  if (current !== step) return <>{children}</>;

  const label = GUIDE_LABEL[step];
  const canSkip = step !== "website";
  const notNow = canSkip ? (
    <button type="button" onClick={() => skip(step)} className="pointer-events-auto text-caption text-ink-3 underline-offset-2 hover:text-ink hover:underline">
      Not now
    </button>
  ) : null;

  return (
    <span className="relative inline-flex flex-col items-start sm:flex-row sm:items-center">
      {/* Phones: note sits above the button, arrow curving down onto it. */}
      <span role="note" aria-label={`${label} Suggested next step`} className="mb-1 flex animate-guide-in-down items-end gap-1 pl-4 sm:hidden">
        <svg viewBox="0 0 30 28" className="h-7 w-[30px] shrink-0" aria-hidden>
          <path d="M26 5C17 4 9.5 10 9 23.5" {...stroke} />
          <path d="M4.5 18.5L9 24l4.6-5.3" {...stroke} />
        </svg>
        <span className="mb-4 flex items-baseline gap-2.5">
          <span className="whitespace-nowrap text-caption font-semibold uppercase tracking-wide text-brand-strong">{label}</span>
          {notNow}
        </span>
      </span>

      {children}

      {/* Wider screens: note sits to the right, level with the button, arrow curving back into it. */}
      <span
        role="note"
        aria-label={`${label} Suggested next step`}
        className="pointer-events-none absolute left-full top-1/2 ml-1.5 hidden -translate-y-[62%] animate-guide-in items-start sm:flex"
      >
        <svg viewBox="0 0 56 28" className="h-7 w-14 shrink-0" aria-hidden>
          <path d="M52 7C40 3 27 5 18 12C13 16 9 19 4.5 21" {...stroke} />
          <path d="M12 23.8L4.5 21l4.4-6.4" {...stroke} />
        </svg>
        <span className="-mt-1 flex flex-col items-start gap-0.5">
          <span className="-rotate-2 whitespace-nowrap text-caption font-semibold uppercase tracking-wide text-brand-strong">{label}</span>
          {notNow}
        </span>
      </span>
    </span>
  );
}
