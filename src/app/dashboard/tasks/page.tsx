import type { Metadata } from "next";
import { requireAgency, isDummySupabase } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getProjectContext } from "@/lib/project-context";
import { displayDomain } from "@/lib/project-types";
import { parseTaskSource } from "@/lib/task-payload";
import { formatDate } from "@/lib/format";
import { loadSetupStatus } from "@/lib/setup-status";
import { Intro } from "@/components/intro/intros";
import TasksBoard, { type BoardTask, type TasksBoardData } from "@/features/tasks/components/TasksBoard";

export const metadata: Metadata = { title: "Tasks" };
export const dynamic = "force-dynamic";

type TaskRow = {
  id: string;
  title: string;
  description: string | null;
  status: BoardTask["status"];
  group_name: string;
  owner: string | null;
  impact: string | null;
  effort: string | null;
  due_date: string | null;
  created_at: string;
  completed_at: string | null;
  outcome_status: BoardTask["outcome"];
  outcome_note: string | null;
  tracked_keyword_id: string | null;
  tracked_keywords: { keyword: string } | { keyword: string }[] | null;
};

export default async function TasksPage() {
  const session = await requireAgency();
  const { active, error } = await getProjectContext(session);

  if (!active && !error) return <Intro name="tasks" />;
  if (!active) {
    return <TasksBoard data={{ project: null, loadError: error, tasks: [] }} />;
  }
  const project = { id: active.id, name: active.name, domain: displayDomain(active.website) };

  let loadError: string | null = null;
  let tasks: BoardTask[] = [];
  if (isDummySupabase()) {
    loadError = "VSI isn't connected to its database in this environment.";
  } else {
    const supabase = await createClient();
    const { data, error: qErr } = await supabase
      .from("tasks")
      .select("id, title, description, status, group_name, owner, impact, effort, due_date, created_at, completed_at, outcome_status, outcome_note, tracked_keyword_id, tracked_keywords(keyword)")
      .eq("client_id", active.id)
      .order("priority", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(500);
    if (qErr) {
      console.error("[tasks] load failed", { code: qErr.code });
      loadError = "We couldn't load your tasks right now.";
    } else {
      tasks = ((data ?? []) as unknown as TaskRow[]).map((t) => {
        const kw = Array.isArray(t.tracked_keywords) ? t.tracked_keywords[0]?.keyword : t.tracked_keywords?.keyword;
        return {
          id: t.id,
          title: t.title,
          description: t.description,
          status: t.status,
          group: t.group_name,
          owner: t.owner,
          impact: t.impact,
          effort: t.effort,
          due: t.due_date ? formatDate(t.due_date) : null,
          created: formatDate(t.created_at),
          completed: t.completed_at ? formatDate(t.completed_at) : null,
          outcome: t.outcome_status,
          outcomeNote: t.outcome_note,
          keyword: kw ?? null,
          keywordId: t.tracked_keyword_id,
          source: parseTaskSource(t.description)?.label ?? null,
        };
      });
    }
  }

  const status = tasks.length === 0 && !loadError ? await loadSetupStatus(active.id) : null;
  const data: TasksBoardData = {
    project,
    loadError,
    tasks,
    setup: status ? { audit: status.audits > 0, checked: status.checks > 0 } : undefined,
  };
  return <TasksBoard data={data} />;
}
