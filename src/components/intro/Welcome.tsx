import Link from "next/link";
import { ArrowRight, HeartPulse, Lightbulb, MessageSquareText, Search, Users, type LucideIcon } from "lucide-react";
import { OverviewScene } from "@/components/illustrations";
import { AddWebsiteButton, IntroHero, StepRail } from "./FeatureIntro";

const WHAT_YOU_SEE: { Icon: LucideIcon; label: string; question: string; text: string; href: string }[] = [
  { Icon: HeartPulse, label: "Website health", question: "Is my website healthy?", text: "A free check of your pages, with a plain list of what to fix.", href: "/dashboard/check" },
  { Icon: Search, label: "Search visibility", question: "Can people find me?", text: "Where your website appears on Google for the searches you choose.", href: "/dashboard/services/seo" },
  { Icon: MessageSquareText, label: "AI visibility", question: "Do AI systems mention me?", text: "Whether AI answers mention your business or link to your website.", href: "/dashboard/geo" },
  { Icon: Users, label: "Competitor insights", question: "Where are competitors appearing?", text: "Who shows up instead of you, in Google and in AI answers.", href: "/dashboard/competitors" },
  { Icon: Lightbulb, label: "Recommended actions", question: "What should I improve?", text: "Everything VSI finds, turned into clear actions and tasks.", href: "/dashboard/next-actions" },
];

/** The first screen a brand-new user sees: what VSI is and how to start. */
export function Welcome() {
  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-14 px-4 pb-24 pt-8 md:px-8 md:pt-12">
      <IntroHero
        page="Welcome to VSI"
        headline="Understand how your website appears across search and AI."
        description="Add your website once. VSI checks its health, where it appears on Google and in AI answers, who shows up instead of you, and what to improve."
        illustration={<OverviewScene />}
      />

      <section className="space-y-5">
        <h2 className="text-section font-semibold text-ink">What you&apos;ll see</h2>
        <ol className="divide-y divide-line border-y border-line">
          {WHAT_YOU_SEE.map(({ Icon, label, question, text, href }) => (
            <li key={label}>
              <Link href={href} className="group grid gap-1 py-4 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)_auto] sm:items-center sm:gap-6">
                <span className="flex items-center gap-3">
                  <Icon size={20} strokeWidth={1.6} className="shrink-0 text-ink-2" aria-hidden />
                  <span className="text-body font-medium text-ink">{label}</span>
                </span>
                <span className="pl-8 text-support text-ink-2 sm:pl-0">
                  <span className="text-ink">&ldquo;{question}&rdquo;</span> {text}
                </span>
                <span className="hidden items-center gap-1 text-support text-ink-3 group-hover:text-ink sm:inline-flex">
                  How it works
                  <ArrowRight size={14} strokeWidth={1.75} aria-hidden />
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <StepRail
        title="How VSI works"
        steps={["Connect your website", "Add the searches that matter", "Track your visibility", "Improve what matters"]}
        footer={
          <>
            <p className="text-body text-ink-2">One website powers every part of VSI. You add it once, in four short steps.</p>
            <AddWebsiteButton />
          </>
        }
      />
    </div>
  );
}
