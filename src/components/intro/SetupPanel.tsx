import type { ReactNode } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type SetupItemState = "done" | "todo" | "running";

export interface SetupItem {
  state: SetupItemState;
  label: string;
  /** Real detail, e.g. "12 searches" or "Not run yet". */
  detail?: ReactNode;
  /** Optional link to fix a missing step. */
  href?: string;
  hrefLabel?: string;
}

/** A checklist built only from the project's real state. */
export function SetupChecklist({ items, className }: { items: SetupItem[]; className?: string }) {
  return (
    <ul className={cn("divide-y divide-line border-y border-line", className)}>
      {items.map((item) => (
        <li key={item.label} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-3">
          {item.state === "done" ? (
            <CheckCircle2 size={18} strokeWidth={1.75} className="shrink-0 text-positive" aria-label="Done" />
          ) : item.state === "running" ? (
            <Loader2 size={18} strokeWidth={1.75} className="shrink-0 animate-spin text-info" aria-label="In progress" />
          ) : (
            <Circle size={18} strokeWidth={1.75} className="shrink-0 text-line-strong" aria-label="Not done yet" />
          )}
          <span className={cn("min-w-0 flex-1 text-body", item.state === "done" ? "text-ink" : "font-medium text-ink")}>{item.label}</span>
          {item.detail && <span className="text-support text-ink-3">{item.detail}</span>}
          {item.href && item.state !== "done" && (
            <Link href={item.href} className="text-support font-medium text-ink underline-offset-4 hover:underline">
              {item.hrefLabel ?? "Set up"}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}

/**
 * The "project exists, no data yet" state: what has been set up for real,
 * what is missing, and the one action that moves it forward.
 */
export function SetupPanel({
  title,
  description,
  items,
  action,
  illustration,
}: {
  title: string;
  description: ReactNode;
  items: SetupItem[];
  action?: ReactNode;
  illustration?: ReactNode;
}) {
  return (
    <section className="grid items-start gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-12">
      <div className="space-y-5">
        <div className="space-y-2">
          <h2 className="text-title font-semibold text-ink">{title}</h2>
          <p className="max-w-[60ch] text-body text-ink-2">{description}</p>
        </div>
        <SetupChecklist items={items} />
        {action && <div>{action}</div>}
      </div>
      {illustration && (
        <div className="mx-auto hidden w-full max-w-[420px] rounded-panel bg-surface-2 px-6 py-5 text-ink-3 sm:block lg:max-w-none">{illustration}</div>
      )}
    </section>
  );
}
