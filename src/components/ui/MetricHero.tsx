import type { ReactNode } from "react";
import { Eyebrow } from "./Page";

/**
 * The lead of a data page: the one number, what it means in one sentence,
 * and how it has moved. One per page. Every value comes from the caller's
 * real data; with no number yet, `value` is a short phrase like "Not yet".
 */
export function MetricHero({
  ariaLabel,
  label,
  value,
  suffix,
  note,
  meter,
  conclusion,
  children,
  chart,
  chartEmpty,
}: {
  ariaLabel: string;
  label: string;
  value: ReactNode;
  suffix?: ReactNode;
  /** Small line under the number, e.g. the change since the last check. */
  note?: ReactNode;
  /** 0 to 100. Draws a thin gold meter under the number. */
  meter?: number | null;
  conclusion: ReactNode;
  /** Supporting detail under the conclusion: status labels, a fraction. */
  children?: ReactNode;
  /** The trend chart, or null when there are fewer than two points. */
  chart: ReactNode | null;
  chartEmpty: string;
}) {
  return (
    <section
      aria-label={ariaLabel}
      className="grid divide-y divide-line overflow-hidden rounded-panel border border-line bg-surface lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)_minmax(0,19rem)] lg:divide-x lg:divide-y-0"
    >
      <div className="p-6">
        <p className="text-caption font-medium text-ink-3">{label}</p>
        <p className="mt-2 flex items-baseline gap-1.5">
          <span className="text-metric font-semibold tabular text-ink">{value}</span>
          {suffix && <span className="text-body text-ink-3">{suffix}</span>}
        </p>
        {typeof meter === "number" && (
          <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-surface-2" aria-hidden>
            <div className="h-full origin-left animate-line-grow rounded-full bg-brand" style={{ width: `${Math.max(0, Math.min(100, meter))}%` }} />
          </div>
        )}
        {note && <p className="mt-3 text-support text-ink-3">{note}</p>}
      </div>
      <div className="p-6 lg:px-8">
        <Eyebrow rule>In short</Eyebrow>
        <p className="mt-3 max-w-[48ch] text-balance text-[1.1875rem] font-semibold leading-7 tracking-[-0.01em] text-ink">{conclusion}</p>
        {children && <div className="mt-4">{children}</div>}
      </div>
      <div className="p-6">
        <p className="mb-2 text-caption font-medium text-ink-3">Over time</p>
        {chart ?? <p className="py-4 text-support text-ink-3">{chartEmpty}</p>}
      </div>
    </section>
  );
}
