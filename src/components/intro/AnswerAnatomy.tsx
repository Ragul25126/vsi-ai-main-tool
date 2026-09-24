import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * How VSI reads an AI answer: the question, the answer, your brand named in
 * it, your website linked as a source and a competitor recommended too.
 * Always labelled as an example, with placeholder names, so it can never be
 * mistaken for a real result. The marks fill in once; reduced motion shows
 * them filled straight away (see .anatomy-mark in globals.css).
 */
export function AnswerAnatomy({ className, framed = true }: { className?: string; framed?: boolean }) {
  return (
    <figure
      aria-label="Example: how VSI reads an AI answer"
      className={cn("min-w-0 text-left", framed && "rounded-panel border border-line bg-surface shadow-[0_1px_0_rgb(20_23_31/0.03)]", className)}
    >
      <div className={cn("flex items-center justify-between gap-3 border-b border-line py-3", framed ? "px-4 md:px-5" : "pb-3 pt-0")}>
        <figcaption className="text-caption font-medium text-ink-3">How VSI reads an AI answer</figcaption>
        <span className="rounded-full border border-dashed border-line-strong px-2 py-0.5 text-caption text-ink-3">Example</span>
      </div>

      <div className={cn("space-y-4 py-4", framed ? "px-4 md:px-5" : "")}>
        <div>
          <p className="text-caption font-medium text-ink-3">Question</p>
          <p className="mt-1 text-body font-medium text-ink">&ldquo;Which accounting software is best for small businesses?&rdquo;</p>
        </div>

        <div className="border-l-2 border-line pl-3.5">
          <p className="text-caption font-medium text-ink-3">AI answer</p>
          <p className="mt-1 text-support leading-6 text-ink-2">
            For most small businesses,{" "}
            <Mark n={1} you delay={350}>
              Your brand
            </Mark>{" "}
            is a strong choice for simple invoicing and reporting.{" "}
            <Mark n={3} delay={750}>
              Competitor A
            </Mark>{" "}
            and <Mark delay={900}>Competitor B</Mark> are also popular with growing teams.
          </p>
        </div>

        <div>
          <p className="text-caption font-medium text-ink-3">Sources</p>
          <ol className="mt-1.5 space-y-1.5 text-support">
            <li className="flex items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-caption text-white tabular">1</span>
              <span className="anatomy-mark min-w-0 truncate rounded-control px-1 font-medium text-ink [--d:550ms]">yourwebsite.com/pricing</span>
              <Marker n={2} you />
            </li>
            <li className="flex items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-2 text-caption text-ink-3 tabular">2</span>
              <span className="min-w-0 truncate px-1 text-ink-3">competitor-a.com/guide</span>
            </li>
          </ol>
        </div>
      </div>

      <dl className={cn("grid gap-3 border-t border-line py-3.5 sm:grid-cols-3", framed ? "px-4 md:px-5" : "pb-0")}>
        <Legend n={1} you term="Mention" text="Your brand is named." />
        <Legend n={2} you term="Citation" text="Your website is a source." />
        <Legend n={3} term="Competitor" text="Another business is named." />
      </dl>
    </figure>
  );
}

function Marker({ n, you = false }: { n: number; you?: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border align-[0.15em] font-mono text-[0.625rem] leading-none",
        you ? "border-brand text-brand-strong" : "border-line-strong text-ink-3",
      )}
    >
      {n}
    </span>
  );
}

function Mark({ children, n, you = false, delay }: { children: ReactNode; n?: number; you?: boolean; delay: number }) {
  return (
    <span className="whitespace-nowrap">
      {you ? (
        <mark className="anatomy-mark rounded-control bg-transparent px-0.5 font-medium text-ink" style={{ ["--d" as string]: `${delay}ms` }}>
          {children}
        </mark>
      ) : (
        <span className="font-medium text-ink underline decoration-ink-3/60 decoration-dotted decoration-[1.5px] underline-offset-4">{children}</span>
      )}
      {n && (
        <>
          {" "}
          <Marker n={n} you={you} />
        </>
      )}
    </span>
  );
}

function Legend({ n, term, text, you = false }: { n: number; term: string; text: string; you?: boolean }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5">
        <Marker n={n} you={you} />
      </span>
      <div className="min-w-0">
        <dt className="text-caption font-semibold text-ink">{term}</dt>
        <dd className="text-caption text-ink-3">{text}</dd>
      </div>
    </div>
  );
}
