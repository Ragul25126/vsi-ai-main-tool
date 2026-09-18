import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Content column for every product page. */
export function PageContainer({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("mx-auto w-full max-w-[1200px] px-4 pb-24 pt-6 md:px-8 md:pt-8", className)}>
      <div className="space-y-10">{children}</div>
    </div>
  );
}

interface PageHeaderProps {
  /** Small category label above the title, e.g. "GEO". One per page at most. */
  category?: string;
  title: string;
  description?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ category, title, description, meta, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 border-b border-line pb-6 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0 space-y-1.5">
        {category && <p className="text-caption font-medium text-brand-strong">{category}</p>}
        <h1 className="text-title font-semibold text-ink">{title}</h1>
        {description && <p className="max-w-[65ch] text-body text-ink-2">{description}</p>}
        {meta && <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-support text-ink-3">{meta}</div>}
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
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="space-y-0.5">
          <h2 className="text-section font-semibold text-ink">{title}</h2>
          {description && <p className="max-w-[65ch] text-support text-ink-3">{description}</p>}
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
