import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** "Technical details" and other progressive disclosure. Native <details>, no JS. */
export function Disclosure({
  summary,
  children,
  className,
  defaultOpen = false,
}: {
  summary: ReactNode;
  children: ReactNode;
  className?: string;
  defaultOpen?: boolean;
}) {
  return (
    <details className={cn("group", className)} open={defaultOpen}>
      <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 text-support font-medium text-ink-2 hover:text-ink [&::-webkit-details-marker]:hidden">
        <ChevronRight
          size={14}
          strokeWidth={1.75}
          aria-hidden
          className="transition-transform duration-150 group-open:rotate-90"
        />
        {summary}
      </summary>
      <div className="mt-3">{children}</div>
    </details>
  );
}
