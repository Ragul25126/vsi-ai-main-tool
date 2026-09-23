"use client";

import { ArrowLeft, ArrowRight, Sparkles, Loader2 } from "lucide-react";

interface StepFooterProps {
  currentStep: number;
  totalSteps?: number;
  onBack?: () => void;
  onNext?: () => void;
  onSkip?: () => void;
  nextLabel?: string;
  isSubmitting?: boolean;
  canContinue?: boolean;
}

export function StepFooter({
  currentStep,
  totalSteps = 4,
  onBack,
  onNext,
  onSkip,
  nextLabel,
  isSubmitting = false,
  canContinue = true,
}: StepFooterProps) {
  const isLastStep = currentStep === totalSteps;
  const defaultLabel = isLastStep ? "Start Analysis" : "Continue";
  const label = nextLabel || defaultLabel;

  return (
    <div className="sticky bottom-0 z-30 -mx-4 mt-12 border-t border-line bg-surface/95 px-4 py-4 backdrop-blur-md md:-mx-8 md:px-8 xl:-mx-10 xl:px-10">
      <div className="mx-auto flex w-full max-w-[1240px] items-center justify-between gap-4">
        {/* Left: Back button & step counter */}
        <div className="flex items-center gap-4">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={onBack}
              disabled={isSubmitting}
              className="flex h-10 items-center gap-2 rounded-control border border-line bg-surface px-4 text-support font-medium text-ink transition-colors hover:bg-surface-2 disabled:opacity-50"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          <span className="hidden font-mono text-support font-medium text-ink-3 sm:inline-block">
            Step {currentStep} of {totalSteps}
          </span>
        </div>

        {/* Right: Skip and Continue / Start Analysis button */}
        <div className="flex items-center gap-3">
          {onSkip && !isLastStep && (
            <button
              type="button"
              onClick={onSkip}
              disabled={isSubmitting}
              className="px-3 text-support font-medium text-ink-3 hover:text-ink transition-colors disabled:opacity-50"
            >
              Skip for now
            </button>
          )}

          <button
            type="button"
            onClick={onNext}
            disabled={isSubmitting || !canContinue}
            className={`flex h-11 items-center justify-center gap-2 rounded-xl px-6 text-body font-medium text-white shadow-sm transition-all active:scale-[0.99] disabled:opacity-50 ${
              isLastStep
                ? "bg-brand-strong hover:bg-brand text-white font-semibold shadow-md"
                : "bg-ink hover:bg-ink-2"
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Setting up project...</span>
              </>
            ) : isLastStep ? (
              <>
                <Sparkles className="h-4 w-4" />
                <span>{label}</span>
              </>
            ) : (
              <>
                <span>{label}</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
