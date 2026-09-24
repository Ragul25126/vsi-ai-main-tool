"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatusIcon } from "@/components/ui/Status";
import { FindingDrawer } from "@/features/actions/components/FindingDrawer";
import type { Finding } from "@/lib/findings";

/**
 * AI Visibility findings in the shared Next Actions shape: what VSI found,
 * why it matters and what to do. "View opportunity" opens the same drawer
 * Next Actions uses, where the finding can become a task.
 */
export function Opportunities({ findings }: { findings: Finding[] }) {
  const [open, setOpen] = useState<Finding | null>(null);
  const [created, setCreated] = useState<Set<string>>(new Set());

  return (
    <>
      <ol className="divide-y divide-line rounded-panel border border-line bg-surface">
        {findings.map((f) => (
          <li key={f.key} className="grid gap-4 px-4 py-5 transition-colors hover:bg-canvas/50 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)] lg:gap-6 md:px-5">
            <div className="flex min-w-0 gap-3">
              <span className="mt-0.5">
                <StatusIcon tone={f.tone} size={18} />
              </span>
              <div className="min-w-0">
                <p className="text-caption font-medium text-ink-3">Finding</p>
                <h3 className="mt-0.5 text-body font-semibold text-ink">{f.title}</h3>
                <p className="mt-1 text-support text-ink-2">{f.whatWeFound}</p>
              </div>
            </div>
            <div className="min-w-0 pl-[30px] lg:pl-0">
              <p className="text-caption font-medium text-ink-3">Why it matters</p>
              <p className="mt-0.5 line-clamp-4 text-support text-ink-2">{f.whyItMatters}</p>
            </div>
            <div className="flex min-w-0 flex-col items-start gap-3 pl-[30px] lg:pl-0">
              <div>
                <p className="text-caption font-medium text-ink-3">Recommended action</p>
                <p className="mt-0.5 line-clamp-4 text-support text-ink-2">{f.whatToDo}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm" onClick={() => setOpen(f)}>
                  View opportunity
                  <ArrowRight size={14} strokeWidth={1.75} aria-hidden />
                </Button>
                {created.has(f.key) && <span className="text-caption text-positive">Task created</span>}
              </div>
            </div>
          </li>
        ))}
      </ol>
      <FindingDrawer
        finding={open}
        onClose={() => setOpen(null)}
        alreadyCreated={open ? created.has(open.key) : false}
        onCreated={(key) => setCreated((prev) => new Set(prev).add(key))}
      />
    </>
  );
}
