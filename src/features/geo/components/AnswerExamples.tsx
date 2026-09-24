"use client";

import { useState } from "react";
import { TextLink } from "@/components/ui/Page";
import { StatusLabel } from "@/components/ui/Status";
import type { AnswerEvidence } from "@/lib/geo-load";
import { cn } from "@/lib/utils";

/**
 * Real AI answers from the project's stored checks, laid out the way VSI
 * reads them: the question, the answer, whether you're named, whether
 * you're linked, and who else the answer points to.
 */
export function AnswerExamples({ items, projectId }: { items: AnswerEvidence[]; projectId: string }) {
  const [index, setIndex] = useState(0);
  const item = items[Math.min(index, items.length - 1)];
  const named = item.segments.some((s) => s.you);
  const yourSource = item.sources.find((s) => s.you);
  const others = item.sources.filter((s) => !s.you);

  return (
    <figure className="overflow-hidden rounded-panel border border-line bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3 md:px-5">
        <figcaption className="text-caption text-ink-3">
          {item.engineLabel} answer · checked {item.checkedAt}
        </figcaption>
        {items.length > 1 && (
          <div role="tablist" aria-label="Example answers" className="flex rounded-control border border-line p-0.5 text-caption">
            {items.map((it, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === index}
                onClick={() => setIndex(i)}
                className={cn("rounded-control px-2.5 py-1 transition-colors", i === index ? "bg-surface-2 font-medium text-ink" : "text-ink-3 hover:text-ink")}
              >
                {it.appears ? "Mentions you" : "Leaves you out"}
              </button>
            ))}
          </div>
        )}
      </div>

      <div key={index} className="grid animate-fade-in lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:divide-x lg:divide-line">
        <div className="space-y-4 px-4 py-5 md:px-5">
          <div>
            <p className="text-caption font-medium text-ink-3">Question</p>
            <p className="mt-1 text-[1.0625rem] font-semibold leading-6 text-ink">&ldquo;{item.keyword}&rdquo;</p>
          </div>
          <div className="border-l-2 border-line pl-3.5">
            <p className="text-caption font-medium text-ink-3">AI answer</p>
            <blockquote className="mt-1 text-support leading-6 text-ink-2">
              {item.segments.map((seg, i) =>
                seg.you ? (
                  <mark key={i} className="rounded-control bg-brand-soft px-0.5 font-medium text-ink">
                    {seg.text}
                  </mark>
                ) : (
                  <span key={i}>{seg.text}</span>
                ),
              )}
            </blockquote>
          </div>
        </div>

        <dl className="divide-y divide-line border-t border-line bg-canvas/40 lg:border-t-0">
          <div className="px-4 py-3.5 md:px-5">
            <dt className="text-caption font-medium text-ink-3">Mention</dt>
            <dd className="mt-1">
              <StatusLabel tone={named ? "positive" : "attention"} className="font-normal">
                <span className="text-ink">{named ? "Your business is named" : "Your business isn't named"}</span>
              </StatusLabel>
            </dd>
          </div>
          <div className="px-4 py-3.5 md:px-5">
            <dt className="text-caption font-medium text-ink-3">Citation</dt>
            <dd className="mt-1 min-w-0">
              {yourSource ? (
                <a href={yourSource.url} target="_blank" rel="noopener noreferrer" className="flex min-w-0 items-center gap-2 text-support font-medium text-ink hover:underline">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-caption text-white tabular">{yourSource.position}</span>
                  <span className="truncate">{yourSource.url.replace(/^https?:\/\/(www\.)?/, "")}</span>
                </a>
              ) : (
                <StatusLabel tone="attention" className="font-normal">
                  <span className="text-ink">Your website isn&apos;t linked</span>
                </StatusLabel>
              )}
            </dd>
          </div>
          <div className="px-4 py-3.5 md:px-5">
            <dt className="text-caption font-medium text-ink-3">Other sources in this answer</dt>
            <dd className="mt-1.5">
              {others.length === 0 ? (
                <p className="text-support text-ink-3">None</p>
              ) : (
                <ol className="space-y-1.5">
                  {others.map((s) => (
                    <li key={s.position} className="flex min-w-0 items-center gap-2 text-support">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-2 text-caption text-ink-3 tabular">{s.position}</span>
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="truncate text-ink-2 hover:text-ink hover:underline">
                        {s.name}
                      </a>
                    </li>
                  ))}
                </ol>
              )}
            </dd>
          </div>
          {item.keywordId && (
            <div className="px-4 py-3 md:px-5">
              <TextLink href={`/dashboard/clients/${projectId}/keywords/${item.keywordId}`}>See this search in detail</TextLink>
            </div>
          )}
        </dl>
      </div>
    </figure>
  );
}
