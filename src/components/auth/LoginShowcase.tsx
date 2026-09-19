import type { LucideIcon } from "lucide-react";
import {
  Check,
  ChevronRight,
  FileText,
  LayoutGrid,
  ListChecks,
  MessageSquareText,
  Search,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";

const BENEFITS: { Icon: LucideIcon; title: string; text: string }[] = [
  { Icon: Search, title: "Search Visibility", text: "Track your rankings and find new opportunities." },
  { Icon: MessageSquareText, title: "AI Presence", text: "See how AI systems mention your business." },
  { Icon: ListChecks, title: "Actionable Insights", text: "Turn data into clear next steps." },
];

/** The three things VSI does. Shown beside the preview on large screens and under the form on small ones. */
export function LoginBenefits({ className = "" }: { className?: string }) {
  return (
    <ul className={`grid gap-5 sm:grid-cols-3 ${className}`}>
      {BENEFITS.map(({ Icon, title, text }) => (
        <li key={title} className="flex items-start gap-3 sm:flex-col sm:gap-3 xl:flex-row">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-strong" aria-hidden>
            <Icon size={18} strokeWidth={1.75} />
          </span>
          <span>
            <span className="block text-body font-semibold text-ink">{title}</span>
            <span className="mt-0.5 block text-support text-ink-2">{text}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

const PREVIEW_NAV: { Icon: LucideIcon; label: string; active?: boolean }[] = [
  { Icon: LayoutGrid, label: "Overview", active: true },
  { Icon: ShieldCheck, label: "Site Audit" },
  { Icon: TrendingUp, label: "Search Visibility" },
  { Icon: MessageSquareText, label: "AI Visibility" },
  { Icon: Users, label: "Competitors" },
  { Icon: ListChecks, label: "Next Actions" },
  { Icon: FileText, label: "Reports" },
];

/** A trend line that draws itself, then fills and marks its latest point. `loop` picks its turn in the loop. */
function Trend({ d, end, tone, loop }: { d: string; end: [number, number]; tone: string; loop: "a" | "b" }) {
  return (
    <svg viewBox="0 0 120 36" className={`mt-3 h-9 w-full overflow-visible ${tone}`} fill="none" aria-hidden>
      <path d={`${d}V36H0Z`} fill="currentColor" fillOpacity={0.1} className={`login-loop-after-${loop}`} />
      <path d={d} pathLength={1} stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={`login-loop-draw-${loop}`} />
      <g className={`login-loop-after-${loop}`}>
        <circle cx={end[0]} cy={end[1]} r={2.5} fill="currentColor" className="login-loop-pulse" />
        <circle cx={end[0]} cy={end[1]} r={2.5} fill="currentColor" />
      </g>
    </svg>
  );
}

/**
 * A small drawing of the VSI dashboard. It is an example, not data: it carries no figures,
 * and it is labelled as a preview.
 */
function ProductPreview() {
  return (
    <div
      role="img"
      aria-label="Product preview: a VSI dashboard showing search visibility, AI visibility, site health and a list of key opportunities"
      className="relative"
    >
      {/* A second sheet behind, for depth */}
      <div className="absolute inset-x-6 -top-2.5 bottom-6 rounded-panel border border-line bg-surface/60" aria-hidden />
      <div className="relative overflow-hidden rounded-panel border border-line bg-surface shadow-overlay" aria-hidden>
        <div className="flex">
          <div className="hidden w-[150px] shrink-0 border-r border-line bg-canvas/60 px-3 py-4 xl:block">
            <p className="px-2 text-section font-semibold tracking-[-0.01em] text-brand-strong">VSI</p>
            <ul className="mt-4 space-y-0.5">
              {PREVIEW_NAV.map(({ Icon, label, active }) => (
                <li
                  key={label}
                  className={`flex items-center gap-2 rounded-control px-2 py-1.5 text-caption ${active ? "bg-brand-soft font-medium text-ink" : "text-ink-3"}`}
                >
                  <Icon size={13} strokeWidth={1.75} />
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <div className="min-w-0 flex-1 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-section font-semibold text-ink">Your website</p>
                <p className="text-caption text-ink-3">example.com</p>
              </div>
              <span className="rounded-full border border-line px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-ink-3">
                Product preview
              </span>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2.5">
              <div className="rounded-control border border-line px-3 pb-2 pt-3">
                <p className="text-caption text-ink-2">Search Visibility</p>
                <Trend d="M0 28C14 26 20 18 34 20S54 27 66 17 88 14 98 9 110 7 116 5" end={[116, 5]} tone="text-positive" loop="a" />
              </div>
              <div className="rounded-control border border-line px-3 pb-2 pt-3">
                <p className="text-caption text-ink-2">AI Visibility</p>
                <Trend d="M0 26C12 27 22 19 34 22S56 12 68 16 90 20 100 11 111 8 116 7" end={[116, 7]} tone="text-info" loop="b" />
              </div>
              <div className="rounded-control border border-line px-3 pb-2 pt-3">
                <p className="text-caption text-ink-2">Site Health</p>
                <div className="mt-3 flex h-9 flex-col justify-center gap-1.5">
                  <span className="login-loop-bar-1 h-1.5 w-full rounded-full bg-brand" />
                  <span className="login-loop-bar-2 h-1.5 w-4/5 rounded-full bg-brand/60" />
                  <span className="login-loop-bar-3 h-1.5 w-3/5 rounded-full bg-brand/30" />
                </div>
              </div>
            </div>

            <p className="mt-5 text-support font-semibold text-ink">Key opportunities</p>
            <ul className="mt-2 space-y-1.5">
              {[
                { tone: "bg-positive", label: "Improve page titles" },
                { tone: "bg-attention", label: "Improve AI visibility" },
                { tone: "bg-critical", label: "Fix technical issues" },
              ].map((o, i) => (
                <li key={o.label} className={`login-loop-row-${i + 1} relative flex items-center gap-2.5 overflow-hidden rounded-control bg-canvas px-3 py-2 text-caption text-ink-2`}>
                  {/* The first opportunity is picked up and ticked off: data turning into an action. */}
                  {i === 0 && <span className="login-loop-pick absolute inset-0 bg-positive-soft" />}
                  <span className="relative flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                    <span className={`h-1.5 w-1.5 rounded-full ${o.tone} ${i === 0 ? "login-loop-dot-out" : ""}`} />
                    {i === 0 && (
                      <span className="login-loop-tick absolute inset-0 flex items-center justify-center rounded-full bg-positive text-white">
                        <Check size={9} strokeWidth={3} />
                      </span>
                    )}
                  </span>
                  <span className="relative min-w-0 flex-1 truncate">{o.label}</span>
                  <ChevronRight size={13} strokeWidth={1.75} className="relative text-ink-3" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/** What VSI is, for someone about to sign in. Large screens only; small screens get LoginBenefits under the form. */
export function LoginShowcase() {
  return (
    <div className="relative hidden overflow-hidden border-l border-line bg-canvas lg:flex lg:flex-col lg:justify-center lg:px-12 lg:py-12 xl:px-20">
      {/* Quiet depth: a warm tint, and thin gold arcs kept to the corners so they never cross the text */}
      <div className="pointer-events-none absolute inset-0 bg-brand-soft/40" aria-hidden />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_45%_at_100%_0%,var(--brand-soft),transparent_70%)]" aria-hidden />
      <svg className="pointer-events-none absolute -right-[280px] -top-[280px] h-[560px] w-[560px] text-brand" viewBox="0 0 560 560" fill="none" aria-hidden>
        <circle cx="280" cy="280" r="279" stroke="currentColor" strokeWidth="1" opacity="0.4" />
        <circle cx="280" cy="280" r="212" stroke="currentColor" strokeWidth="1" opacity="0.2" />
      </svg>

      <div className="relative mx-auto w-full max-w-[620px] animate-rise-in">
        <p className="flex items-center gap-2.5 text-caption font-semibold uppercase tracking-[0.14em] text-brand-strong">
          <span className="h-px w-6 bg-brand" aria-hidden />
          VSI
        </p>
        <p className="mt-4 max-w-[30rem] text-balance text-[1.875rem] font-semibold leading-[2.375rem] tracking-[-0.02em] text-ink">
          Turn search and AI visibility into real business growth.
        </p>
        <p className="mt-3 max-w-[30rem] text-[0.9375rem] leading-6 text-ink-2">
          See how your website performs, find opportunities, and take action — with the power of AI.
        </p>

        <div className="mt-9">
          <ProductPreview />
        </div>

        <LoginBenefits className="mt-10" />
      </div>
    </div>
  );
}
