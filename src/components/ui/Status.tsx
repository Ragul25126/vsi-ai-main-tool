import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, MinusCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type Tone = "positive" | "attention" | "critical" | "info" | "neutral";

const toneText: Record<Tone, string> = {
  positive: "text-positive",
  attention: "text-attention",
  critical: "text-critical",
  info: "text-info",
  neutral: "text-ink-3",
};

const toneSoft: Record<Tone, string> = {
  positive: "bg-positive-soft",
  attention: "bg-attention-soft",
  critical: "bg-critical-soft",
  info: "bg-info-soft",
  neutral: "bg-surface-2",
};

const toneIcon: Record<Tone, typeof CheckCircle2> = {
  positive: CheckCircle2,
  attention: AlertTriangle,
  critical: XCircle,
  info: Info,
  neutral: MinusCircle,
};

export function toneTextClass(tone: Tone) {
  return toneText[tone];
}

/** Status is always an icon plus words, never color alone. */
export function StatusLabel({ tone, children, className }: { tone: Tone; children: ReactNode; className?: string }) {
  const Icon = toneIcon[tone];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-support font-medium", toneText[tone], className)}>
      <Icon size={15} strokeWidth={1.75} aria-hidden className="shrink-0" />
      <span>{children}</span>
    </span>
  );
}

export function StatusIcon({ tone, size = 16 }: { tone: Tone; size?: number }) {
  const Icon = toneIcon[tone];
  return <Icon size={size} strokeWidth={1.75} aria-hidden className={cn("shrink-0", toneText[tone])} />;
}

/** Inline message for setup-needed, error and informational states. */
export function Notice({
  tone = "info",
  title,
  children,
  action,
  className,
}: {
  tone?: Tone;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  const Icon = toneIcon[tone];
  return (
    <div
      role={tone === "critical" ? "alert" : "status"}
      className={cn("flex flex-col gap-3 rounded-panel p-4 sm:flex-row sm:items-start", toneSoft[tone], className)}
    >
      <Icon size={18} strokeWidth={1.75} aria-hidden className={cn("mt-0.5 shrink-0", toneText[tone])} />
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-body font-medium text-ink">{title}</p>
        {children && <div className="text-support text-ink-2">{children}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
