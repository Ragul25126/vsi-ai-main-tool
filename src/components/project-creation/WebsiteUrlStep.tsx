"use client";

import { useState, type FormEvent } from "react";
import { Globe, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface WebsiteUrlStepProps {
  initialUrl?: string;
  onAnalyze: (url: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function WebsiteUrlStep({ initialUrl = "", onAnalyze, isLoading, error }: WebsiteUrlStepProps) {
  const [url, setUrl] = useState(initialUrl);
  const [localError, setLocalError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLocalError(null);

    const trimmed = url.trim();
    if (!trimmed) {
      setLocalError("Please enter a valid website URL.");
      return;
    }

    // Basic format validation
    const hasDot = trimmed.includes(".") && !trimmed.endsWith(".");
    if (!hasDot || trimmed.length < 4) {
      setLocalError("Please enter a valid website URL.");
      return;
    }

    void onAnalyze(trimmed);
  }

  const displayError = error || localError;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="mx-auto w-full max-w-[620px] space-y-8 py-4"
    >
      <div className="space-y-3 text-center sm:text-left">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand-strong ring-8 ring-brand-soft/40">
          <Globe className="h-6 w-6" />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Let&apos;s analyze your website
        </h1>
        <p className="text-base leading-relaxed text-ink-2">
          Enter your website and we&apos;ll automatically understand your business, SEO opportunities, and AI search visibility.
        </p>
      </div>

      {displayError && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="flex items-start gap-3 rounded-xl border border-critical-soft bg-critical-soft/60 p-4 text-body text-critical"
          role="alert"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-medium">{displayError}</p>
          </div>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="website-url" className="block text-support font-medium text-ink">
            Website URL
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-ink-3">
              <Globe className="h-5 w-5" />
            </div>
            <input
              id="website-url"
              type="text"
              inputMode="url"
              autoComplete="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (localError) setLocalError(null);
              }}
              disabled={isLoading}
              className="h-12 w-full rounded-xl border border-line-strong bg-surface pl-10 pr-4 text-body text-ink placeholder:text-ink-3 transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:opacity-50"
              autoFocus
            />
          </div>
          <p className="text-caption text-ink-3">
            Example: <span className="font-mono text-ink-2">https://nike.com</span>
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading || !url.trim()}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-ink text-body font-medium text-white shadow-sm transition-all hover:bg-ink-2 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Connecting to website...</span>
            </>
          ) : (
            <>
              <span>Analyze Website</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}
