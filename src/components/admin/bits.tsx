import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { formatDateTime, formatWhen } from "@/lib/format";
import { Notice, StatusLabel, type Tone } from "@/components/ui/Status";
import { HEALTH_LABEL, type HealthState } from "@/lib/admin/health-model";
import { JOB_STATUS_LABEL, type AdminJob } from "@/lib/admin/jobs-model";
import { cn } from "@/lib/utils";

/** A time, relative when recent, with the exact time on hover. Missing times say so. */
export function When({ iso, missing = "Not recorded" }: { iso: string | null | undefined; missing?: string }) {
  if (!iso) return <span className="text-ink-3">{missing}</span>;
  return (
    <time dateTime={iso} title={formatDateTime(iso)} className="tabular whitespace-nowrap">
      {formatWhen(iso)}
    </time>
  );
}

export const HEALTH_TONE: Record<HealthState, Tone> = {
  healthy: "positive",
  attention: "attention",
  unavailable: "critical",
  not_configured: "neutral",
  configured: "info",
};

export function HealthLabel({ state }: { state: HealthState }) {
  return <StatusLabel tone={HEALTH_TONE[state]}>{HEALTH_LABEL[state]}</StatusLabel>;
}

export function JobStatus({ job }: { job: Pick<AdminJob, "status" | "stuck" | "warnings"> }) {
  if (job.stuck) return <StatusLabel tone="attention">Stuck</StatusLabel>;
  const tone: Tone = job.status === "failed" ? "critical" : job.status === "running" ? "info" : job.status === "queued" ? "neutral" : job.warnings > 0 ? "attention" : "positive";
  return (
    <StatusLabel tone={tone}>
      {JOB_STATUS_LABEL[job.status]}
      {job.status === "completed" && job.warnings > 0 ? ` with ${job.warnings} ${job.warnings === 1 ? "error" : "errors"}` : ""}
    </StatusLabel>
  );
}

/** Account or organization status in words. */
export function AccountStatus({ disabled, orgDisabled, pilot }: { disabled?: boolean; orgDisabled?: boolean; pilot?: boolean }) {
  if (disabled) return <StatusLabel tone="critical">Disabled</StatusLabel>;
  if (orgDisabled) return <StatusLabel tone="attention">Organization disabled</StatusLabel>;
  return <StatusLabel tone="positive">{pilot ? "Active, pilot" : "Active"}</StatusLabel>;
}

/** A section's data couldn't load. The rest of the page still works. */
export function LoadFailed({ message }: { message: string }) {
  return (
    <Notice tone="critical" title={message}>
      Refresh the page to try again. Nothing was changed.
    </Notice>
  );
}

/** Some columns or sources are missing (e.g. a migration isn't applied yet). */
export function PartialData({ children }: { children: ReactNode }) {
  return <p className="text-support text-ink-3">{children}</p>;
}

/** URL-driven tabs for detail pages (no client state). */
export function Tabs({ tabs, current }: { tabs: { key: string; label: string; href: string }[]; current: string }) {
  return (
    <nav aria-label="Sections" className="flex gap-1 overflow-x-auto border-b border-line">
      {tabs.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          aria-current={t.key === current ? "page" : undefined}
          className={cn(
            "-mb-px shrink-0 border-b-2 px-3 py-2 text-support",
            t.key === current ? "border-ink font-medium text-ink" : "border-transparent text-ink-3 hover:text-ink",
          )}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}

/** Label/value pairs for detail pages. */
export function DetailList({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
      {items.map((i) => (
        <div key={i.label} className="min-w-0 border-t border-line pt-3">
          <dt className="text-caption text-ink-3">{i.label}</dt>
          <dd className="mt-0.5 text-body text-ink">{i.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Back to a list page. */
export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1.5 text-support text-ink-3 hover:text-ink">
      <ArrowLeft size={14} strokeWidth={1.75} aria-hidden />
      {children}
    </Link>
  );
}
