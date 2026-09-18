"use client";

import { createContext, useCallback, useContext, useSyncExternalStore, type ReactNode } from "react";
import { nextGuideStep, type GuideStep, type OnboardingState } from "@/lib/onboarding";

interface OnboardingValue {
  state: OnboardingState;
  projectId: string | null;
}

const OnboardingContext = createContext<OnboardingValue | null>(null);

const SKIP_EVENT = "vsi:guide-skip";
const skipKey = (projectId: string | null) => `vsi_guide_skipped_${projectId ?? "none"}`;

function readSkipped(projectId: string | null): string {
  try {
    return localStorage.getItem(skipKey(projectId)) ?? "";
  } catch {
    return "";
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(SKIP_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(SKIP_EVENT, onChange);
  };
}

/** Gives every page the real setup state of the active project (loaded on the server). */
export function OnboardingProvider({ state, projectId, children }: OnboardingValue & { children: ReactNode }) {
  return <OnboardingContext.Provider value={{ state, projectId }}>{children}</OnboardingContext.Provider>;
}

/**
 * The single step to point at right now, or null. "Not now" choices are a
 * per-browser convenience; progress itself always comes from project data.
 */
export function useGuideStep(): { step: GuideStep | null; skip: (step: GuideStep) => void } {
  const ctx = useContext(OnboardingContext);
  const projectId = ctx?.projectId ?? null;
  const raw = useSyncExternalStore(
    subscribe,
    () => readSkipped(projectId),
    () => "",
  );
  const skipped = raw.split(",").filter(Boolean) as GuideStep[];

  const skip = useCallback(
    (step: GuideStep) => {
      try {
        const next = [...new Set([...readSkipped(projectId).split(",").filter(Boolean), step])].join(",");
        localStorage.setItem(skipKey(projectId), next);
      } catch {
        /* storage unavailable: the guide just stays visible */
      }
      window.dispatchEvent(new Event(SKIP_EVENT));
    },
    [projectId],
  );

  return { step: ctx ? nextGuideStep(ctx.state, skipped) : null, skip };
}
