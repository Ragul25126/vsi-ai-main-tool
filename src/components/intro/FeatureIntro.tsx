import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight, Plus, type LucideIcon } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { SETUP_HREF, STORY, type StoryKey } from "./story";
import { GuideTarget } from "@/components/onboarding/GuideTarget";

/** The one primary action when there is no project yet. Same label on every page. */
export function AddWebsiteButton({ className }: { className?: string }) {
  return (
    <ButtonLink href={SETUP_HREF} variant="primary" className={className}>
      <Plus size={15} strokeWidth={2} aria-hidden />
      Add your website
    </ButtonLink>
  );
}

/** Page name line above an intro headline. The category (e.g. GEO) is optional and appears once. */
export function IntroTitle({ page, category }: { page: string; category?: string }) {
  return (
    <h1 className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-support font-medium text-ink-2">
      <span>{page}</span>
      {category && (
        <>
          <span className="h-3.5 w-px bg-line-strong" aria-hidden />
          <span className="font-normal text-ink-3">{category}</span>
        </>
      )}
    </h1>
  );
}

export function IntroHero({
  page,
  category,
  headline,
  description,
  illustration,
  action,
}: {
  page: string;
  category?: string;
  headline: string;
  description: string;
  illustration: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="grid items-center gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-12">
      <div className="space-y-4">
        <IntroTitle page={page} category={category} />
        <p className="max-w-[22ch] text-display font-semibold text-ink md:text-[2rem] md:leading-10">{headline}</p>
        <p className="max-w-[52ch] text-body text-ink-2 md:text-[0.9375rem] md:leading-6">{description}</p>
        <div className="pt-2">
          {action ?? (
            <GuideTarget step="website">
              <AddWebsiteButton />
            </GuideTarget>
          )}
        </div>
      </div>
      <div className="mx-auto w-full max-w-[480px] rounded-panel bg-surface-2 px-6 py-5 text-ink-3 lg:max-w-none">{illustration}</div>
    </section>
  );
}

export interface Capability {
  Icon: LucideIcon;
  title: string;
  text: string;
  /** Concrete detail, e.g. which checks sit behind this item. */
  detail?: string;
}

export function CapabilityList({
  title,
  items,
  note,
  example = false,
}: {
  title: string;
  items: Capability[];
  note?: ReactNode;
  /** Marks every item as an example, visibly different from real data. */
  example?: boolean;
}) {
  return (
    <section className="space-y-6">
      <h2 className="text-section font-semibold text-ink">{title}</h2>
      <ul className={cn("grid gap-x-10 gap-y-7", items.length === 4 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3")}>
        {items.map(({ Icon, title: t, text, detail }) => (
          <li
            key={t}
            className={cn("flex gap-3.5", example && "rounded-panel border border-dashed border-line-strong p-4")}
          >
            <Icon size={20} strokeWidth={1.6} className="mt-0.5 shrink-0 text-ink-2" aria-hidden />
            <div className="min-w-0 space-y-1">
              <p className="flex flex-wrap items-center gap-2 text-body font-medium text-ink">
                {t}
                {example && <span className="text-caption font-normal text-ink-3">Example</span>}
              </p>
              <p className="text-support text-ink-2">{text}</p>
              {detail && <p className="text-caption text-ink-3">{detail}</p>}
            </div>
          </li>
        ))}
      </ul>
      {note && <div className="text-support text-ink-3">{note}</div>}
    </section>
  );
}

/** Numbered steps joined by a hairline. Horizontal on wide screens, stacked on phones. */
export function StepRail({ title = "How it works", steps, footer }: { title?: string; steps: string[]; footer?: ReactNode }) {
  return (
    <section className="space-y-6 rounded-panel bg-surface-2 px-5 py-7 md:px-8">
      <h2 className="text-section font-semibold text-ink">{title}</h2>
      <ol className={cn("grid gap-4 sm:grid-cols-2 sm:gap-6", steps.length === 5 ? "lg:grid-cols-5" : "lg:grid-cols-4")}>
        {steps.map((s, i) => (
          <li key={s} className="flex items-baseline gap-3 sm:block sm:space-y-2.5">
            <div className="flex shrink-0 items-center gap-3" aria-hidden>
              <span className="font-mono text-caption text-ink-3">{String(i + 1).padStart(2, "0")}</span>
              {i < steps.length - 1 && (
                <span className="hidden flex-1 items-center lg:flex">
                  <span className="h-px flex-1 bg-line-strong" />
                  <ChevronRight size={14} strokeWidth={1.75} className="-ml-1.5 shrink-0 text-ink-3" />
                </span>
              )}
            </div>
            <p className="text-body font-medium text-ink">
              <span className="sr-only">Step {i + 1}: </span>
              {s}
            </p>
          </li>
        ))}
      </ol>
      {footer && <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line-strong/60 pt-5">{footer}</div>}
    </section>
  );
}

/**
 * Shows where this page sits in the VSI story: your website, then the parts
 * of VSI around this one (two before, two after), each linking to its page.
 */
export function ProductStory({ current }: { current: StoryKey }) {
  const index = STORY.findIndex((s) => s.key === current);
  const from = Math.max(0, index - 2);
  const shown = STORY.slice(from, index + 3);
  return (
    <section className="space-y-4 border-t border-line pt-8">
      <h2 className="text-section font-semibold text-ink">Where this fits</h2>
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-2 text-support" aria-label="Where this page fits in VSI">
        <li className="text-ink-3">Website</li>
        {from > 0 && (
          <li className="flex items-center gap-1.5 text-ink-3" aria-hidden>
            <ChevronRight size={13} strokeWidth={1.75} className="text-line-strong" />
            …
          </li>
        )}
        {shown.map((s) => (
          <li key={s.key} className="flex items-center gap-1.5">
            <ChevronRight size={13} strokeWidth={1.75} className="text-line-strong" aria-hidden />
            {s.key === current ? (
              <span aria-current="page" title={s.question} className="font-medium text-ink underline decoration-brand decoration-2 underline-offset-[6px]">
                {s.label}
              </span>
            ) : (
              <Link href={s.href} title={s.question} className="text-ink-3 hover:text-ink hover:underline">
                {s.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

/**
 * The first-use page for a feature: what it is, what you learn, how it works,
 * how it connects, and one way to start.
 */
export function FeatureIntro({
  page,
  category,
  headline,
  description,
  illustration,
  capabilities,
  middle,
  steps,
  stepsTitle,
  story,
}: {
  page: string;
  category?: string;
  headline: string;
  description: string;
  illustration: ReactNode;
  capabilities?: { title: string; items: Capability[]; note?: ReactNode; example?: boolean };
  /** Replaces or adds to the capability list for pages that need a different middle section. */
  middle?: ReactNode;
  steps: string[];
  stepsTitle?: string;
  story: StoryKey;
}) {
  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-14 px-4 pb-24 pt-8 md:px-8 md:pt-12">
      <IntroHero page={page} category={category} headline={headline} description={description} illustration={illustration} />
      {capabilities && <CapabilityList {...capabilities} />}
      {middle}
      <StepRail
        title={stepsTitle}
        steps={steps}
        footer={
          <>
            <p className="text-body text-ink-2">Everything starts with your website. You add it once and every part of VSI uses it.</p>
            <AddWebsiteButton />
          </>
        }
      />
      <ProductStory current={story} />
    </div>
  );
}
