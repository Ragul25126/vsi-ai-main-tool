"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/ui/Page";
import { Notice, StatusLabel } from "@/components/ui/Status";
import { EmptyState } from "@/components/ui/EmptyState";
import { ButtonLink } from "@/components/ui/Button";
import { ChecklistDiagram } from "@/components/diagrams";
import { cn } from "@/lib/utils";
import NewTaskButton from "./NewTaskButton";

export interface BoardTask {
  id: string;
  title: string;
  description: string | null;
  status: "todo" | "in_progress" | "done" | "skipped";
  group: string;
  owner: string | null;
  impact: string | null;
  effort: string | null;
  due: string | null;
  created: string;
  completed: string | null;
  outcome: "verified" | "regressed" | "neutral" | null;
  outcomeNote: string | null;
  keyword: string | null;
  keywordId: string | null;
  source: string | null;
}

export interface TasksBoardData {
  project: { id: string; name: string; domain: string | null } | null;
  loadError: string | null;
  tasks: BoardTask[];
}

const COLUMNS: { status: BoardTask["status"]; title: string }[] = [
  { status: "todo", title: "To do" },
  { status: "in_progress", title: "In progress" },
  { status: "done", title: "Done" },
];

const STATUS_LABEL: Record<BoardTask["status"], string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
  skipped: "Skipped",
};

export default function TasksBoard({ data }: { data: TasksBoardData }) {
  const router = useRouter();
  const [tasks, setTasks] = useState(data.tasks);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  // Take fresh server data after router.refresh() (new task, status change).
  const [serverTasks, setServerTasks] = useState(data.tasks);
  if (data.tasks !== serverTasks) {
    setServerTasks(data.tasks);
    setTasks(data.tasks);
  }

  const byStatus = useMemo(() => {
    const m: Record<string, BoardTask[]> = { todo: [], in_progress: [], done: [], skipped: [] };
    for (const t of tasks) m[t.status]?.push(t);
    return m;
  }, [tasks]);

  async function move(task: BoardTask, status: BoardTask["status"]) {
    const previous = task.status;
    setPending(task.id);
    setError(null);
    setTasks((ts) => ts.map((t) => (t.id === task.id ? { ...t, status } : t)));
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setTasks((ts) => ts.map((t) => (t.id === task.id ? { ...t, status: previous } : t)));
      setError("We couldn't update that task. Please try again.");
    } finally {
      setPending(null);
    }
  }

  const header = (
    <PageHeader
      title="Tasks"
      description="The work your team is doing to fix what VSI found. When a task is done, VSI checks again on the next run and tells you whether it worked."
      meta={data.project?.domain && <span>{data.project.domain}</span>}
      actions={
        data.project ? (
          <>
            <ButtonLink href="/dashboard/next-actions">Find more to do</ButtonLink>
            <NewTaskButton clientId={data.project.id} label="New task" />
          </>
        ) : undefined
      }
    />
  );

  if (!data.project) {
    return (
      <PageContainer>
        {header}
        {data.loadError ? (
          <Notice tone="critical" title={data.loadError}>Refresh the page to try again.</Notice>
        ) : (
          <EmptyState diagram={<ChecklistDiagram />} title="Add a project first" action={<ButtonLink href="/dashboard/clients/new" variant="primary">Add project</ButtonLink>}>
            Tasks belong to a project, so VSI can check whether each one made a difference.
          </EmptyState>
        )}
      </PageContainer>
    );
  }

  if (data.loadError) {
    return (
      <PageContainer>
        {header}
        <Notice tone="critical" title={data.loadError}>Refresh the page to try again. Your tasks are safe.</Notice>
      </PageContainer>
    );
  }

  if (tasks.length === 0) {
    return (
      <PageContainer>
        {header}
        <EmptyState diagram={<ChecklistDiagram />} title="No tasks yet" action={<ButtonLink href="/dashboard/next-actions" variant="primary">See Next Actions</ButtonLink>}>
          Open any finding in Next Actions, Site Audit or AI Visibility and choose Create task. It will appear here with everything your team needs.
        </EmptyState>
      </PageContainer>
    );
  }

  const verified = tasks.filter((t) => t.outcome === "verified").length;

  return (
    <PageContainer>
      {header}

      <p className="text-body text-ink-2">
        {byStatus.todo.length + byStatus.in_progress.length} open, {byStatus.done.length} done
        {verified > 0 ? `, ${verified} confirmed by a re-check` : ""}.
      </p>
      {error && <Notice tone="critical" title={error} />}

      <div className="grid gap-8 lg:grid-cols-3 lg:gap-6">
        {COLUMNS.map((col) => (
          <section key={col.status} aria-label={col.title} className="min-w-0">
            <h2 className="mb-3 flex items-center justify-between border-b border-line pb-2 text-support font-medium text-ink">
              {col.title}
              <span className="tabular text-ink-3">{byStatus[col.status].length}</span>
            </h2>
            {byStatus[col.status].length === 0 ? (
              <p className="text-support text-ink-3">{col.status === "done" ? "Finished tasks appear here." : "Nothing here."}</p>
            ) : (
              <ul className="space-y-2">
                {byStatus[col.status].map((t) => (
                  <li key={t.id} className={cn("rounded-panel border border-line bg-surface", pending === t.id && "opacity-60")}>
                    <div className="space-y-2 p-3.5">
                      <p className="text-body font-medium text-ink">{t.title}</p>
                      <p className="text-caption text-ink-3">
                        {[t.source ?? "Added manually", t.owner, t.keyword ? `"${t.keyword}"` : null].filter(Boolean).join(" · ")}
                      </p>
                      {t.status === "done" && <Outcome task={t} />}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <label className="sr-only" htmlFor={`status-${t.id}`}>
                          Status
                        </label>
                        <select
                          id={`status-${t.id}`}
                          value={t.status}
                          disabled={pending === t.id}
                          onChange={(e) => move(t, e.target.value as BoardTask["status"])}
                          className="h-8 rounded-control border border-line bg-surface px-2 text-support text-ink focus:border-line-strong focus:outline-none"
                        >
                          {(["todo", "in_progress", "done", "skipped"] as const).map((s) => (
                            <option key={s} value={s}>
                              {STATUS_LABEL[s]}
                            </option>
                          ))}
                        </select>
                        {t.description && (
                          <button
                            type="button"
                            onClick={() => setExpanded((v) => (v === t.id ? null : t.id))}
                            aria-expanded={expanded === t.id}
                            className="inline-flex items-center gap-1 text-support text-ink-3 hover:text-ink"
                          >
                            Details
                            <ChevronDown size={14} strokeWidth={1.75} className={cn("transition-transform", expanded === t.id && "rotate-180")} aria-hidden />
                          </button>
                        )}
                      </div>
                    </div>
                    {expanded === t.id && t.description && (
                      <div className="space-y-2 border-t border-line px-3.5 py-3">
                        <p className="whitespace-pre-line text-support text-ink-2">{t.description.replace(/\n*Source: .*$/m, "")}</p>
                        <p className="text-caption text-ink-3">
                          Created {t.created}
                          {t.completed ? `, done ${t.completed}` : ""}
                          {t.due ? `, due ${t.due}` : ""}
                        </p>
                        {t.keywordId && data.project && (
                          <Link href={`/dashboard/clients/${data.project.id}/keywords/${t.keywordId}`} className="text-support font-medium text-ink underline-offset-4 hover:underline">
                            Open the search
                          </Link>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      {byStatus.skipped.length > 0 && (
        <p className="text-support text-ink-3">
          {byStatus.skipped.length} skipped {byStatus.skipped.length === 1 ? "task is" : "tasks are"} hidden.
        </p>
      )}
    </PageContainer>
  );
}

function Outcome({ task }: { task: BoardTask }) {
  if (task.outcome === "verified") return <StatusLabel tone="positive">Confirmed by a re-check</StatusLabel>;
  if (task.outcome === "regressed") return <StatusLabel tone="critical">The re-check found it got worse</StatusLabel>;
  if (task.outcome === "neutral") return <StatusLabel tone="neutral">Re-checked: no clear change yet</StatusLabel>;
  if (task.keywordId) return <StatusLabel tone="info">Waiting for the next check</StatusLabel>;
  return null;
}
