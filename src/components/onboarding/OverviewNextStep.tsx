"use client";

import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { RunAuditButton } from "@/features/diagnosis/components/RunAuditButton";
import { RunChecksButton } from "@/features/geo/components/RunChecksButton";
import { GuideTarget } from "./GuideTarget";
import { useGuideStep } from "./OnboardingProvider";
import { Eyebrow } from "@/components/ui/Page";

function Box({ title, children, action }: { title: string; children: ReactNode; action: ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-panel border border-line bg-surface p-6">
      <span className="absolute inset-y-0 left-0 w-[3px] bg-brand" aria-hidden />
      <Eyebrow>Your next step</Eyebrow>
      <p className="mt-3 text-[1.0625rem] font-semibold leading-6 text-ink">{title}</p>
      <p className="mt-2 text-body text-ink-2">{children}</p>
      <div className="pt-5">{action}</div>
    </div>
  );
}

/** The one next setup action on the Overview, driven by the project's real state. */
export function OverviewNextStep({ projectId, activeSearches, anyChecks }: { projectId: string; activeSearches: number; anyChecks: boolean }) {
  const { step } = useGuideStep();

  if (step === "searches") {
    return (
      <Box
        title="Add the searches your customers use"
        action={
          <GuideTarget step="searches">
            <ButtonLink href={`/dashboard/clients/${projectId}/keywords/new`} variant="primary">
              Add searches
            </ButtonLink>
          </GuideTarget>
        }
      >
        VSI checks each search in Google and in AI answers, so this is what every report and recommendation is based on.
      </Box>
    );
  }

  if (step === "competitors") {
    return (
      <Box
        title="Add your competitors"
        action={
          <GuideTarget step="competitors">
            <ButtonLink href="/dashboard/competitors" variant="primary">
              Add competitors
            </ButtonLink>
          </GuideTarget>
        }
      >
        VSI compares you with them in Google and AI answers. It&apos;s optional: VSI also finds competitors in your checks.
      </Box>
    );
  }

  if (step === "audit") {
    return (
      <Box
        title="Run your free site audit"
        action={
          <GuideTarget step="audit">
            <RunAuditButton clientId={projectId} label="Run site audit" align="start" />
          </GuideTarget>
        }
      >
        VSI checks your website and up to 9 more of its pages and lists what to fix. It&apos;s free and usually takes about a minute.
      </Box>
    );
  }

  if (!anyChecks && activeSearches > 0) {
    return (
      <Box title="Run your first search and AI check" action={<RunChecksButton clientId={projectId} searches={activeSearches} label="Run first check" align="start" />}>
        One check looks up your Google position and asks AI systems about each of your {activeSearches}{" "}
        {activeSearches === 1 ? "search" : "searches"}. It uses search credits, so VSI only runs it when you start it.
      </Box>
    );
  }

  return null;
}
