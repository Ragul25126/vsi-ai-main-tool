"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Check, ExternalLink, Loader2, Plus } from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { Disclosure } from "@/components/ui/Disclosure";
import { StatusLabel } from "@/components/ui/Status";
import { createTask } from "@/lib/task-client";
import type { Finding } from "@/lib/findings";

type TaskState = { kind: "idle" } | { kind: "creating" } | { kind: "created" } | { kind: "error"; message: string };

/**
 * One detail view for every finding in VSI: what we found, why it matters,
 * what to do, where, technical details, and a task in the shared task system.
 */
export function FindingDrawer({
  finding,
  onClose,
  alreadyCreated,
  onCreated,
  extra,
}: {
  finding: Finding | null;
  extra?: ReactNode;
  onClose: () => void;
  alreadyCreated?: boolean;
  onCreated?: (key: string) => void;
}) {
  const [task, setTask] = useState<TaskState>({ kind: "idle" });
  const [forKey, setForKey] = useState(finding?.key);
  if (finding?.key !== forKey) {
    setForKey(finding?.key);
    setTask({ kind: "idle" });
  }

  if (!finding) return null;
  const created = alreadyCreated || task.kind === "created";

  async function handleCreate() {
    if (!finding?.draft) return;
    setTask({ kind: "creating" });
    const res = await createTask(finding.draft);
    if (res.ok) {
      setTask({ kind: "created" });
      onCreated?.(finding.key);
    } else {
      setTask({ kind: "error", message: res.message });
    }
  }

  return (
    <Drawer
      open
      onClose={onClose}
      title={finding.title}
      subtitle={
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <StatusLabel tone={finding.tone}>{finding.statusText}</StatusLabel>
          <span>Found by {finding.sourceLabel}</span>
        </span>
      }
      footer={
        finding.draft ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            {created ? (
              <p className="flex items-center gap-1.5 text-support text-positive">
                <Check size={15} strokeWidth={1.75} aria-hidden />
                Added to your tasks. We&apos;ll check it again on the next run.
              </p>
            ) : task.kind === "error" ? (
              <p role="alert" className="text-support text-critical">
                {task.message}
              </p>
            ) : (
              <p className="text-support text-ink-3">Turn this into a task for your team.</p>
            )}
            {created ? (
              <Link href="/dashboard/tasks" className="text-support font-medium text-ink underline underline-offset-4">
                View tasks
              </Link>
            ) : (
              <Button variant="primary" onClick={handleCreate} disabled={task.kind === "creating"}>
                {task.kind === "creating" ? (
                  <Loader2 size={15} strokeWidth={1.75} className="animate-spin" aria-hidden />
                ) : (
                  <Plus size={15} strokeWidth={1.75} aria-hidden />
                )}
                Create task
              </Button>
            )}
          </div>
        ) : undefined
      }
    >
      <div className="space-y-7">
        <DrawerSection title="What we found">{finding.whatWeFound}</DrawerSection>
        <DrawerSection title="Why it matters">{finding.whyItMatters}</DrawerSection>
        <DrawerSection title="What to do">{finding.whatToDo}</DrawerSection>

        {finding.affected.length > 0 && (
          <section className="space-y-2">
            <h3 className="text-caption font-medium text-ink-3">Where</h3>
            <ul className="divide-y divide-line rounded-panel border border-line">
              {finding.affected.map((a, i) => (
                <li key={i} className="px-3 py-2 text-support">
                  {a.href ? (
                    <a
                      href={a.href}
                      target={a.external ? "_blank" : undefined}
                      rel={a.external ? "noopener noreferrer" : undefined}
                      className="inline-flex max-w-full items-center gap-1 break-all text-ink hover:underline"
                    >
                      {a.label}
                      {a.external && <ExternalLink size={12} strokeWidth={1.75} className="shrink-0 text-ink-3" aria-hidden />}
                    </a>
                  ) : (
                    <span className="break-all text-ink">{a.label}</span>
                  )}
                  {a.note && <span className="block text-caption text-ink-3">{a.note}</span>}
                </li>
              ))}
            </ul>
          </section>
        )}

        {extra}

        {finding.technical && finding.technical.length > 0 && (
          <Disclosure summary="Technical details">
            <dl className="space-y-2 rounded-panel bg-surface-2 p-3 text-support">
              {finding.technical.map((t, i) => (
                <div key={i} className="grid grid-cols-[minmax(0,10rem)_1fr] gap-3">
                  <dt className="text-ink-3">{t.label}</dt>
                  <dd className="break-words font-mono text-caption text-ink-2">{t.value}</dd>
                </div>
              ))}
            </dl>
          </Disclosure>
        )}
      </div>
    </Drawer>
  );
}

function DrawerSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-1.5">
      <h3 className="text-caption font-medium text-ink-3">{title}</h3>
      <p className="text-body text-ink">{children}</p>
    </section>
  );
}
