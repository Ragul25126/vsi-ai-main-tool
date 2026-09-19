import type { ReactNode } from "react";
import { ArrowRight, Check, Plus, type LucideIcon } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Page";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";
import { SETUP_HREF, type StoryKey } from "./story";
import { ProductStory } from "./ProductStory";
import { GuideTarget } from "@/components/onboarding/GuideTarget";

/** The one primary action when there is no project yet. Same label on every page. */
export function AddWebsiteButton({ className, size = "md" }: { className?: string; size?: "md" | "lg" }) {
  const lg = size === "lg";
  return (
    <ButtonLink
      href={SETUP_HREF}
      variant="primary"
      className={cn(lg && "h-11 gap-2 px-5 text-[0.9375rem] transition-[background-color,transform] hover:-translate-y-px", className)}
    >
      <Plus size={lg ? 17 : 15} strokeWidth={lg ? 2.25 : 2} className={cn(lg && "text-brand-light")} aria-hidden />
      Add your website
    </ButtonLink>
  );
}

/** Page name line above an intro headline. The category (e.g. GEO) is optional and appears once. */
export function IntroTitle({ page, category }: { page: string; category?: string }) {
  return (
    <h1 className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
      <Eyebrow rule>{page}</Eyebrow>
      {category && (
        <>
          <span className="h-3 w-px bg-line-strong" aria-hidden />
          <span className="text-caption text-ink-3">{category}</span>
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
  note,
}: {
  page: string;
  category?: string;
  headline: string;
  description: string;
  illustration: ReactNode;
  action?: ReactNode;
  /** One true line under the button, e.g. what happens next or what it costs. */
  note?: ReactNode;
}) {
  return (
    <section className="grid items-center gap-10 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-14">
      <div className="animate-rise-in">
        <IntroTitle page={page} category={category} />
        <p className="mt-5 max-w-[19ch] text-balance text-[2rem] font-semibold leading-[1.12] tracking-[-0.025em] text-ink md:text-[2.5rem] xl:text-[2.75rem]">
          {headline}
        </p>
        <p className="mt-5 max-w-[50ch] text-[1rem] leading-7 text-ink-2">{description}</p>
        <div className="mt-8">
          {action ?? (
            <GuideTarget step="website">
              <AddWebsiteButton size="lg" />
            </GuideTarget>
          )}
        </div>
        {note && (
          <p className="mt-4 flex items-start gap-2 text-support text-ink-3">
            <Check size={14} strokeWidth={2} className="mt-0.5 shrink-0 text-brand" aria-hidden />
            <span>{note}</span>
          </p>
        )}
      </div>
      <div
        className={cn(
          "mx-auto w-full max-w-[440px] animate-rise-in rounded-panel border border-line bg-surface px-5 py-5 text-ink-2 [animation-delay:120ms] md:max-w-[520px] md:px-7 md:py-6 lg:max-w-none",
          "bg-[radial-gradient(var(--line)_1px,transparent_1px)] [background-size:18px_18px]",
        )}
      >
        {illustration}
      </div>
    </section>
  );
}

/** Heading block used by every intro section: small gold label, a headline, one supporting line. */
export function SectionHeading({
  eyebrow,
  title,
  text,
  aside,
}: {
  eyebrow?: string;
  title: string;
  text?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
      <div className="min-w-0">
        {eyebrow && <Eyebrow rule>{eyebrow}</Eyebrow>}
        <h2 className={cn("text-[1.375rem] font-semibold leading-7 tracking-[-0.015em] text-ink md:text-[1.625rem] md:leading-8", eyebrow && "mt-3")}>
          {title}
        </h2>
        {text && <p className="mt-2 max-w-[62ch] text-body text-ink-2 md:text-[0.9375rem] md:leading-6">{text}</p>}
      </div>
      {aside}
    </div>
  );
}

export interface Capability {
  Icon: LucideIcon;
  title: string;
  text: string;
  /** Concrete detail, e.g. which checks sit behind this item. Comma separated. */
  detail?: string;
  /** Optional small drawing on the right of the panel (wide screens only). */
  art?: ReactNode;
}

const sentence = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function CapabilityList({
  title,
  eyebrow,
  text,
  items,
  note,
  aside,
  example = false,
}: {
  title: string;
  /** Small gold label above the title. */
  eyebrow?: string;
  text?: ReactNode;
  items: Capability[];
  note?: ReactNode;
  aside?: ReactNode;
  /** Marks every item as an example, visibly different from real data. */
  example?: boolean;
}) {
  const two = items.length === 4 || items.length === 2;
  return (
    <section className="space-y-7">
      <SectionHeading eyebrow={eyebrow} title={title} text={text} aside={aside} />
      <ul className={cn("grid gap-4", two ? "lg:grid-cols-2" : "sm:grid-cols-2 xl:grid-cols-3")}>
        {items.map(({ Icon, title: t, text: body, detail, art }, i) => (
          <li
            key={t}
            className={cn(
              "rounded-panel border bg-surface p-5 transition-colors duration-200 md:p-6",
              example ? "border-dashed border-line-strong" : "border-line hover:border-line-strong",
            )}
          >
            <div className="flex gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-brand-soft text-brand-strong">
                <Icon size={20} strokeWidth={1.6} aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 font-mono text-caption text-brand-strong">
                  <span aria-hidden>{String(i + 1).padStart(2, "0")}</span>
                  {example && <span className="font-sans text-ink-3">Example</span>}
                </p>
                <h3 className="mt-1 text-[1.0625rem] font-semibold leading-6 text-ink">{t}</h3>
                <p className="mt-1 text-body text-ink-2">{body}</p>
              </div>
              {art && <div className="-my-1 hidden w-[124px] shrink-0 text-ink-2 sm:block">{art}</div>}
            </div>
            {detail && (
              <ul className="mt-4 grid gap-x-5 gap-y-2 sm:grid-cols-2 sm:pl-[60px]">
                {detail.split(", ").map((d) => (
                  <li key={d} className="flex items-start gap-2 text-support text-ink-2">
                    <span className="mt-px flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border border-brand/50 text-brand-strong">
                      <Check size={11} strokeWidth={2.25} aria-hidden />
                    </span>
                    {sentence(d)}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
      {note && <div className="text-support text-ink-3">{note}</div>}
    </section>
  );
}

export interface FlowStep {
  title: string;
  text?: string;
  Icon?: LucideIcon;
}

/**
 * Numbered steps on one line: gold marks joined by a dotted line on wide
 * screens, stacked on phones. `steps` can be plain labels or richer items.
 */
export function StepRail({
  title = "How it works",
  eyebrow,
  text,
  steps,
  footer,
}: {
  title?: string;
  eyebrow?: string;
  text?: ReactNode;
  steps: (string | FlowStep)[];
  footer?: ReactNode;
}) {
  const items = steps.map((s) => (typeof s === "string" ? { title: s } : s));
  return (
    <section className="rounded-panel border border-line bg-surface px-5 py-7 md:px-8 md:py-8">
      <SectionHeading eyebrow={eyebrow} title={title} text={text} />
      <ol className={cn("mt-8 grid gap-y-6 sm:grid-cols-2 sm:gap-x-8 xl:gap-x-0", items.length === 5 ? "xl:grid-cols-5" : "xl:grid-cols-4")}>
        {items.map(({ title: t, text: sub, Icon }, i) => {
          const last = i === items.length - 1;
          const n = String(i + 1).padStart(2, "0");
          return (
            <li key={t} className="flex items-start gap-3.5 xl:pr-3">
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-soft font-mono text-support font-medium text-brand-strong"
                aria-hidden
              >
                {Icon ? <Icon size={20} strokeWidth={1.6} /> : n}
              </span>
              <div className="min-w-0 xl:max-w-[9.5rem] 2xl:max-w-[11.5rem]">
                {Icon && (
                  <span className="inline-block rounded bg-brand-soft px-1.5 font-mono text-caption text-brand-strong" aria-hidden>
                    {n}
                  </span>
                )}
                <p className={cn("text-body font-semibold text-ink", Icon ? "mt-1" : "mt-0.5")}>
                  <span className="sr-only">Step {i + 1}: </span>
                  {t}
                </p>
                {sub && <p className="mt-0.5 text-support text-ink-3">{sub}</p>}
              </div>
              {!last && (
                <span className="mt-3 hidden min-w-12 flex-1 items-center xl:flex" aria-hidden>
                  <span
                    className="h-px flex-1 origin-left animate-line-grow border-t border-dashed border-line-strong"
                    style={{ animationDelay: `${450 + i * 160}ms` }}
                  />
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-ink-2">
                    <ArrowRight size={12} strokeWidth={2} />
                  </span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
      {footer && <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5">{footer}</div>}
    </section>
  );
}

/** The last thing on a first-use page: one sentence and the one way to start. */
export function ClosingAction({ title, text, action }: { title: string; text: ReactNode; action?: ReactNode }) {
  return (
    <section className="flex flex-col gap-6 border-t border-line-strong pt-10 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
      <div>
        <span className="block h-0.5 w-8 bg-brand" aria-hidden />
        <h2 className="mt-5 text-balance text-[1.5rem] font-semibold leading-8 tracking-[-0.015em] text-ink md:text-[1.75rem] md:leading-9">{title}</h2>
        <p className="mt-2 max-w-[60ch] text-body text-ink-2 md:text-[0.9375rem] md:leading-6">{text}</p>
      </div>
      <div className="shrink-0">{action ?? <AddWebsiteButton size="lg" />}</div>
    </section>
  );
}

/**
 * The first-use page for a feature: what it is, how it works, what you
 * learn, how it connects, and one way to start.
 */
export function FeatureIntro({
  page,
  category,
  headline,
  description,
  illustration,
  capabilities,
  middle,
  flow,
  steps,
  stepsTitle,
  stepsNote,
  story,
  storyTitle,
  storyText,
  closing,
}: {
  page: string;
  category?: string;
  headline: string;
  description: string;
  illustration: ReactNode;
  capabilities?: { title: string; eyebrow?: string; text?: ReactNode; items: Capability[]; note?: ReactNode; aside?: ReactNode; example?: boolean };
  /** Replaces or adds to the capability list for pages that need a different middle section. */
  middle?: ReactNode;
  /** Headline and one line for the steps strip. */
  flow?: { eyebrow?: string; title: string; text?: string };
  steps: (string | FlowStep)[];
  stepsTitle?: string;
  stepsNote: string;
  story: StoryKey;
  storyTitle?: string;
  storyText?: ReactNode;
  closing?: { title: string; text: string };
}) {
  return (
    <div className="mx-auto w-full max-w-[1240px] space-y-14 px-4 pb-24 pt-8 md:space-y-16 md:px-8 md:pt-12 xl:px-10">
      <IntroHero page={page} category={category} headline={headline} description={description} illustration={illustration} note={stepsNote} />
      <StepRail eyebrow={flow?.eyebrow ?? stepsTitle ?? "How it works"} title={flow?.title ?? stepsTitle ?? "How it works"} text={flow?.text} steps={steps} />
      {capabilities && (
        <Reveal>
          <CapabilityList {...capabilities} />
        </Reveal>
      )}
      {middle && <Reveal>{middle}</Reveal>}
      <Reveal>
        <ProductStory current={story} title={storyTitle} text={storyText} />
      </Reveal>
      <Reveal>
        <ClosingAction title={closing?.title ?? "Ready to see what VSI finds?"} text={closing?.text ?? "Add your website once. Every part of VSI starts from it."} />
      </Reveal>
    </div>
  );
}
