"use client";

import type { ReactNode } from "react";
import { GUIDE_LABEL, type GuideStep } from "@/lib/onboarding";
import { useGuideStep } from "./OnboardingProvider";

const stroke = { stroke: "var(--brand)", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };

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
          <span className="whitespace-nowrap text-[0.6875rem] font-semibold uppercase leading-4 tracking-[0.14em] text-brand-strong">{label}</span>
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
        <svg viewBox="0 0 64 30" className="h-[30px] w-16 shrink-0" aria-hidden>
          <path d="M61 6.5C47 1.5 31 4 20.5 13C15 17.7 10.5 21 5 23" {...stroke} />
          <path d="M13 26.4L5 23l4.8-7" {...stroke} />
        </svg>
        <span className="-mt-1 flex flex-col items-start gap-0.5">
          <span className="-rotate-2 whitespace-nowrap text-[0.6875rem] font-semibold uppercase leading-4 tracking-[0.14em] text-brand-strong">{label}</span>
          {notNow}
        </span>
      </span>
    </span>
  );
}
