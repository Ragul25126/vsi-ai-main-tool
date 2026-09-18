"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { STORY_CHAINS, type StoryKey } from "./story";

/**
 * "Where this fits": the page's own chain through VSI. One quiet caption
 * under the chain says what the current part answers; hovering or focusing
 * another part swaps the caption. No tooltips.
 */
export function ProductStory({ current }: { current: StoryKey }) {
  const chain = STORY_CHAINS[current];
  const here = chain.find((n) => n.key === current)!;
  const [focus, setFocus] = useState<string | null>(null);
  const shown = chain.find((n) => n.key === focus) ?? here;

  return (
    <section className="space-y-3 border-t border-line pt-8">
      <h2 className="text-section font-semibold text-ink">Where this fits</h2>
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-2 text-support" aria-label="Where this page fits in VSI" onMouseLeave={() => setFocus(null)}>
        {chain.map((n, i) => {
          const isHere = n.key === current;
          const hover = { onMouseEnter: () => setFocus(n.key), onFocus: () => setFocus(n.key), onBlur: () => setFocus(null) };
          return (
            <li key={n.key} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight size={13} strokeWidth={1.75} className="text-line-strong" aria-hidden />}
              {isHere ? (
                <span
                  aria-current="page"
                  onMouseEnter={hover.onMouseEnter}
                  className="font-medium text-ink underline decoration-brand/70 decoration-[1.5px] underline-offset-[5px]"
                >
                  {n.label}
                </span>
              ) : n.href ? (
                <Link href={n.href} {...hover} className="rounded-sm text-ink-3 transition-colors hover:text-ink">
                  {n.label}
                </Link>
              ) : (
                <span onMouseEnter={hover.onMouseEnter} className="text-ink-3">
                  {n.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
      <p className="min-h-5 text-caption text-ink-3">
        {shown.key === "website" || shown.key === "checks" ? shown.question : <>&ldquo;{shown.question}&rdquo;</>}
      </p>
    </section>
  );
}
