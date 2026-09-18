import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Empty and first-run states: say what is missing and how to get it.
 * The diagram slot takes one of the VSI concept diagrams.
 */
export function EmptyState({
  diagram,
  title,
  children,
  action,
  className,
}: {
  diagram?: ReactNode;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6 rounded-panel border border-dashed border-line-strong bg-surface p-6 sm:flex-row sm:items-center md:p-8",
        className,
      )}
    >
      {diagram && <div className="w-40 shrink-0 text-ink-3">{diagram}</div>}
      <div className="min-w-0 space-y-2">
        <h3 className="text-section font-semibold text-ink">{title}</h3>
        {children && <div className="max-w-[60ch] text-body text-ink-2">{children}</div>}
        {action && <div className="pt-2">{action}</div>}
      </div>
    </div>
  );
}
