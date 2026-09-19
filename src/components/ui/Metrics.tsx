import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** A row of plain metrics separated by hairlines. No boxes. */
export function StatStrip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <dl
      className={cn(
        "grid grid-cols-2 gap-y-5 border-y border-line py-6 [header+&]:-mt-4 [header+&]:border-t-0 [header+&]:pt-0 md:auto-cols-fr md:grid-flow-col md:grid-cols-none md:divide-x md:divide-line",
        className,
      )}
    >
      {children}
    </dl>
  );
}

export function Stat({
  label,
  value,
  sub,
  className,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0 px-0 md:px-5 md:first:pl-0", className)}>
      <dt className="text-caption font-medium text-ink-3">{label}</dt>
      <dd className="mt-1.5 text-[1.75rem] font-semibold leading-8 tracking-[-0.02em] tabular text-ink">{value}</dd>
      {sub && <dd className="mt-0.5 text-support text-ink-3">{sub}</dd>}
    </div>
  );
}

/**
 * "11 of 16" with a thin bar. `tone="you"` marks the user's own business
 * in brand gold; everything else stays neutral.
 */
export function Fraction({
  value,
  total,
  tone = "neutral",
  label,
  className,
}: {
  value: number;
  total: number;
  tone?: "you" | "neutral";
  label?: string;
  className?: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className={cn("min-w-0", className)}>
      <div className="flex items-baseline gap-1.5 text-support">
        <span className="font-semibold tabular text-ink">{value}</span>
        <span className="text-ink-3">of {total}{label ? ` ${label}` : ""}</span>
      </div>
      <div
        className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-surface-2"
        role="img"
        aria-label={`${value} of ${total}`}
      >
        <div
          className={cn("h-full rounded-full", tone === "you" ? "bg-brand" : "bg-ink-3")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-skeleton rounded-control bg-surface-2", className)} />;
}
