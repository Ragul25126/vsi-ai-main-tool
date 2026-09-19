import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Content column for every product page. */
export function PageContainer({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("mx-auto w-full max-w-[1240px] animate-fade-in px-4 pb-24 pt-6 md:px-8 md:pt-9 xl:px-10", className)}>
      <div className="space-y-10">{children}</div>
    </div>
  );
}

/**
 * The one small uppercase label in VSI: gold, letter-spaced, optionally led by
 * a short rule. Names a page or a section; never used for data.
 */
export function Eyebrow({ children, rule = false, className }: { children: ReactNode; rule?: boolean; className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5 text-caption font-semibold uppercase tracking-[0.14em] text-brand-strong", className)}>
      {rule && <span className="h-px w-6 shrink-0 bg-brand" aria-hidden />}
      {children}
    </span>
  );
}

interface PageHeaderProps {
  /** Small category label above the title, e.g. the GEO name on AI Visibility. One per page at most. */
  category?: string;
  title: string;
  description?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ category, title, description, meta, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-5 border-b border-line pb-7 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {category && <p className="mb-2 text-caption font-medium text-ink-3">{category}</p>}
        <h1 className="text-display font-semibold text-ink">{title}</h1>
        {description && <p className="mt-2 max-w-[65ch] text-body text-ink-2 md:text-[0.9375rem] md:leading-6">{description}</p>}
        {meta && (
          <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-support text-ink-3 [&>*+*]:before:mr-2.5 [&>*+*]:before:text-line-strong [&>*+*]:before:content-['·']">
            {meta}
          </div>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 md:shrink-0">{actions}</div>}
    </header>
  );
}

interface SectionProps {
  title: string;
  description?: ReactNode;
  action?: { label: string; href: string };
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
  id?: string;
}

export function Section({ title, description, action, aside, children, className, id }: SectionProps) {
  return (
    <section id={id} className={cn("space-y-4", className)}>
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <div className="space-y-1">
          <h2 className="text-[1.0625rem] font-semibold leading-6 tracking-[-0.01em] text-ink">{title}</h2>
          {description && <p className="max-w-[65ch] text-support text-ink-2">{description}</p>}
        </div>
        {action && <TextLink href={action.href}>{action.label}</TextLink>}
        {aside}
      </div>
      {children}
    </section>
  );
}

export function TextLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1 text-support font-medium text-ink-2 underline-offset-4 hover:text-ink hover:underline",
        className,
      )}
    >
      {children}
      <ArrowRight size={14} strokeWidth={1.75} aria-hidden />
    </Link>
  );
}

export function Panel({
  children,
  className,
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return <div className={cn("rounded-panel border border-line bg-surface", padded && "p-5", className)}>{children}</div>;
}
