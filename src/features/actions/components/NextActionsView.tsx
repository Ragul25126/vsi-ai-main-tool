"use client";

import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/ui/Page";
import { Notice, StatusIcon } from "@/components/ui/Status";
import { EmptyState } from "@/components/ui/EmptyState";
import { ButtonLink } from "@/components/ui/Button";
import { ActionsScene } from "@/components/illustrations";
import { StepRail } from "@/components/intro/FeatureIntro";
import { SetupPanel } from "@/components/intro/SetupPanel";
import { INTROS } from "@/components/intro/intros";
import type { Finding } from "@/lib/findings";
import { TASK_SOURCE_LABEL, type TaskSource } from "@/lib/task-payload";
import { cn } from "@/lib/utils";
import { FindingDrawer } from "./FindingDrawer";

export interface NextActionsData {
  project: { id: string; name: string; domain: string | null } | null;
  loadError: string | null;
  findings: Finding[];
  withTasks: string[];
  hasAnyData: boolean;
  moduleErrors: string[];
  openKey: string | null;
  /** Real setup state, used before any findings exist. */
  setup: { audit: "done" | "running" | "todo"; searches: number; checked: boolean };
}

type Filter = "all" | TaskSource;

export default function NextActionsView({ data }: { data: NextActionsData }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [created, setCreated] = useState<Set<string>>(new Set(data.withTasks));
  const [open, setOpen] = useState<Finding | null>(() => data.findings.find((f) => f.key === data.openKey) ?? null);

  const sources = useMemo(() => [...new Set(data.findings.map((f) => f.source))], [data.findings]);
  const shown = filter === "all" ? data.findings : data.findings.filter((f) => f.source === filter);
  const withoutTask = data.findings.filter((f) => !created.has(f.key)).length;

  const header = (
    <PageHeader
      title="Next Actions"
      description="Know what to work on next. Everything VSI found across your website, Google and AI answers, most important first."
      meta={data.project?.domain && <span>{data.project.domain}</span>}
      actions={<ButtonLink href="/dashboard/tasks">View tasks</ButtonLink>}
    />
  );

  if (!data.project) {
    return (
      <PageContainer>
        {header}
        <Notice tone="critical" title={data.loadError ?? "We couldn't load your projects."}>Refresh the page to try again.</Notice>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {header}

      {data.moduleErrors.length > 0 && (
        <Notice tone="attention" title="Some results couldn't be loaded">
          <ul className="list-disc pl-4">
            {data.moduleErrors.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </Notice>
      )}

      {data.findings.length === 0 && !data.hasAnyData ? (
        <>
          <SetupPanel
            title="Actions appear after your first checks"
            description="VSI turns what it finds in your site audit, Google rankings and AI answers into clear actions, most important first. Run the checks below to get your first list."
            items={[
              { state: "done", label: "Website added", detail: data.project.domain ?? undefined },
              data.setup.audit === "done"
                ? { state: "done", label: "Site audit", detail: "Done" }
                : data.setup.audit === "running"
                  ? { state: "running", label: "Site audit", detail: "Running now" }
                  : { state: "todo", label: "Site audit", detail: "Not run yet", href: "/dashboard/check", hrefLabel: "Run site audit" },
              data.setup.checked
                ? { state: "done", label: "Search and AI check", detail: "Done" }
                : data.setup.searches > 0
                  ? { state: "todo", label: "Search and AI check", detail: "Not checked yet", href: "/dashboard/geo", hrefLabel: "Run first check" }
                  : { state: "todo", label: "Search and AI check", detail: "Add searches first", href: `/dashboard/clients/${data.project.id}/keywords/new`, hrefLabel: "Add searches" },
            ]}
            illustration={<ActionsScene />}
          />
          <StepRail title={INTROS.actions.stepsTitle} steps={INTROS.actions.steps} />
        </>
      ) : data.findings.length === 0 ? (
        <EmptyState title="Nothing to do right now">
          Your latest checks didn&apos;t find anything to fix. New findings appear here after each check.
        </EmptyState>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-body text-ink-2">
              {data.findings.length} {data.findings.length === 1 ? "action" : "actions"}, {withoutTask} without a task yet.
            </p>
            {sources.length > 1 && (
              <div role="tablist" aria-label="Filter by source" className="flex flex-wrap gap-1 rounded-control border border-line bg-surface p-0.5 text-support">
                {(["all", ...sources] as Filter[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    role="tab"
                    aria-selected={filter === s}
                    onClick={() => setFilter(s)}
                    className={cn("rounded-control px-2.5 py-1", filter === s ? "bg-surface-2 font-medium text-ink" : "text-ink-3 hover:text-ink")}
                  >
                    {s === "all" ? "All" : TASK_SOURCE_LABEL[s]}
                  </button>
                ))}
              </div>
            )}
          </div>

          <ol className="divide-y divide-line rounded-panel border border-line bg-surface">
            {shown.map((f) => (
              <li key={f.key}>
                <button type="button" onClick={() => setOpen(f)} className="flex w-full items-start gap-3 px-4 py-4 text-left hover:bg-surface-2">
                  <span className="mt-0.5">
                    <StatusIcon tone={f.tone} size={18} />
                  </span>
                  <span className="min-w-0 flex-1 space-y-0.5">
                    <span className="block text-body font-medium text-ink">{f.title}</span>
                    <span className="block text-support text-ink-2">{f.whatWeFound}</span>
                    <span className="block text-caption text-ink-3">
                      {f.sourceLabel}
                      {created.has(f.key) ? " · Task created" : ""}
                    </span>
                  </span>
                  <ChevronRight size={16} strokeWidth={1.75} className="mt-1 shrink-0 text-ink-3" aria-hidden />
                </button>
              </li>
            ))}
          </ol>
        </>
      )}

      <FindingDrawer
        finding={open}
        onClose={() => setOpen(null)}
        alreadyCreated={open ? created.has(open.key) : false}
        onCreated={(key) => setCreated((prev) => new Set(prev).add(key))}
      />
    </PageContainer>
  );
}
