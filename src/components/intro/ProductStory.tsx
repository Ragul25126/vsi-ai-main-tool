import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { STORY_CHAINS, type StoryKey } from "./story";

/**
 * "Where this fits": the page's own chain through VSI, drawn as one line.
 * Every part shows the question it answers; the current part is marked in
 * gold. The other parts stay links to their pages.
 */
export function ProductStory({ current, title = "Where this fits", text }: { current: StoryKey; title?: string; text?: ReactNode }) {
  const chain = STORY_CHAINS[current];

  return (
    <section className="rounded-panel bg-surface-2 px-5 py-8 md:px-9 md:py-10">
      <div className={cn("grid gap-x-14 gap-y-3", text && "lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)]")}>
        <h2 className="text-title font-semibold text-ink">{title}</h2>
        {text && <p className="max-w-[62ch] text-body text-ink-2 md:text-[0.9375rem] md:leading-6">{text}</p>}
      </div>
      <ol
        className={cn("mt-9 grid grid-cols-2 gap-y-7 sm:grid-cols-3", chain.length === 6 ? "lg:grid-cols-6" : "lg:grid-cols-5")}
        aria-label="Where this page fits in VSI"
      >
        {chain.map((n, i) => {
          const isHere = n.key === current;
          return (
            <li key={n.key} className="relative border-t border-line-strong pr-4 pt-4">
              <span
                className={cn(
                  "absolute -top-[5px] left-0 h-[9px] w-[9px] rounded-full border",
                  isHere ? "border-brand bg-brand ring-4 ring-brand/15" : "border-line-strong bg-surface",
                )}
                aria-hidden
              />
              <p className={cn("font-mono text-caption", isHere ? "text-brand-strong" : "text-ink-3")} aria-hidden>
                {String(i + 1).padStart(2, "0")}
              </p>
              <p className="mt-1 text-body">
                {isHere ? (
                  <span aria-current="page" className="font-semibold text-ink underline decoration-brand/70 decoration-[1.5px] underline-offset-[5px]">
                    {n.label}
                  </span>
                ) : n.href ? (
                  <Link href={n.href} className="rounded-sm font-medium text-ink-2 transition-colors hover:text-ink">
                    {n.label}
                  </Link>
                ) : (
                  <span className="font-medium text-ink-2">{n.label}</span>
                )}
              </p>
              <p className="mt-1.5 text-caption text-ink-3">{n.question}</p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
