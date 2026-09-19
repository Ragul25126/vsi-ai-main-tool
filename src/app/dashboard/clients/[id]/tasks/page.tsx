import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAgency } from "@/lib/auth";
import TaskFilterBar from "@/components/TaskFilterBar";
import NewTaskButton from "@/components/NewTaskButton";
import SortableTaskList from "@/components/SortableTaskList";
import { isTaskStale, type TaskRow } from "@/lib/tasks";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageContainer, PageHeader } from "@/components/ui/Page";

export const dynamic = "force-dynamic";

interface SearchParams { status?: string; group?: string; owner?: string }

export default async function ClientTasksPage({
 params, searchParams,
}: {
 params: Promise<{ id: string }>;
 searchParams: Promise<SearchParams>;
}) {
 const { id } = await params;
 const sp = await searchParams;
 const session = await requireAgency();
 const supabase = await createClient();

 const isSuperAdmin = session.role === "super_admin";
 const clientQ = supabase.from("clients").select("id, name, brand_name").eq("id", id);
 const { data: client } = await (isSuperAdmin ? clientQ : clientQ.eq("agency_id", session.agencyId)).single();
 if (!client) notFound();

 const tasksQ = supabase
 .from("tasks")
 .select("*, tracked_keywords(id, keyword)")
 .eq("client_id", id)
 .order("status", { ascending: true })
 .order("priority", { ascending: true })
 .order("created_at", { ascending: false })
 .limit(300);
 const { data: rawTasks } = await (isSuperAdmin ? tasksQ : tasksQ.eq("agency_id", session.agencyId));

 type Joined = TaskRow & {
 tracked_keywords: { id: string; keyword: string } | { id: string; keyword: string }[] | null;
 };
 const tasks = (rawTasks ?? []) as Joined[];

 const keywordIds = Array.from(new Set(tasks.map((t) => t.tracked_keyword_id).filter(Boolean) as string[]));
 type Sig = { rankPosition: number | null; gapLabel: string; aioPresent: boolean | null; clientCited: boolean | null; citedDomainCount: number };
 const latestByKw = new Map<string, Sig>();
 if (keywordIds.length > 0) {
 const { data: rows } = await supabase
 .from("search_results")
 .select("tracked_keyword_id, rank_position, aio_present, client_cited, cited_domains, gap_label, created_at")
 .in("tracked_keyword_id", keywordIds)
 .order("created_at", { ascending: false });
 for (const r of rows ?? []) {
 const k = r.tracked_keyword_id as string;
 if (latestByKw.has(k)) continue;
 latestByKw.set(k, {
 rankPosition: r.rank_position as number | null,
 gapLabel: r.gap_label as string,
 aioPresent: r.aio_present as boolean | null,
 clientCited: r.client_cited as boolean | null,
 citedDomainCount: ((r.cited_domains as string[] | null) ?? []).length,
 });
 }
 }
 function staleFor(task: Joined): boolean {
 if (!task.tracked_keyword_id) return false;
 const cur = latestByKw.get(task.tracked_keyword_id);
 if (!cur) return false;
 return isTaskStale(task.context_snapshot, cur);
 }

 const counts = {
 all: tasks.length,
 todo: tasks.filter((t) => t.status === "todo").length,
 in_progress: tasks.filter((t) => t.status === "in_progress").length,
 done: tasks.filter((t) => t.status === "done").length,
 };

 const statusFilter = sp.status ?? "open";
 const filtered = tasks.filter((t) => {
 if (statusFilter === "open" && (t.status === "done" || t.status === "skipped")) return false;
 if (statusFilter !== "open" && statusFilter !== "all" && t.status !== statusFilter) return false;
 if (sp.group && t.group_name !== sp.group) return false;
 if (sp.owner && t.owner !== sp.owner) return false;
 return true;
 });

 // Group by keyword
 const byKeyword = new Map<string, { label: string; href: string | null; rows: Joined[] }>();
 const NO_KW = "__no_keyword__";
 for (const t of filtered) {
 const kw = Array.isArray(t.tracked_keywords) ? t.tracked_keywords[0] : t.tracked_keywords;
 const key = kw?.id ?? NO_KW;
 const label = kw?.keyword ?? "Tasks for the whole project";
 const href = kw ? `/dashboard/clients/${id}/keywords/${kw.id}` : null;
 const arr = byKeyword.get(key) ?? { label, href, rows: [] };
 arr.rows.push(t);
 byKeyword.set(key, arr);
 }

 return (
 <PageContainer>
 <PageHeader
 title="Tasks"
 description="Every task for this project, grouped by the search it belongs to. Drag to reorder, filter by status, group or owner."
 meta={
 <>
 <Link href={`/dashboard/clients/${id}`} className="hover:text-ink">
 {client.brand_name ?? client.name}
 </Link>
 <Link href="/dashboard/next-actions" className="hover:text-ink">
 Next Actions
 </Link>
 <Link href="/dashboard/tasks" className="hover:text-ink">
 Task board
 </Link>
 </>
 }
 actions={<NewTaskButton clientId={id} />}
 />

 <div className="border-b border-line pb-5">
 <TaskFilterBar
 counts={counts}
 groups={[
 { value: "Content", label: "Content" },
 { value: "Technical", label: "Technical" },
 { value: "Off-page", label: "Off-page" },
 ]}
 owners={[
 { value: "Writer", label: "Writer" },
 { value: "Developer", label: "Developer" },
 { value: "SEO", label: "SEO" },
 { value: "Outreach", label: "Outreach" },
 ]}
 />
 </div>

 {filtered.length === 0 ? (
 <EmptyState title={tasks.length === 0 ? "No tasks yet" : "No tasks match these filters"}>
 {tasks.length === 0
 ? "Tasks come from findings. Open a finding in Next Actions and choose Create task, or add one with New task."
 : "Try clearing the status, group or owner filter."}
 </EmptyState>
 ) : (
 <div className="space-y-10">
 {Array.from(byKeyword.entries()).map(([key, group]) => (
 <section key={key} className="space-y-4">
 <div className="flex items-center justify-between gap-3 border-t-2 border-line-strong pt-3">
 <h2 className="min-w-0 text-[1.0625rem] font-semibold leading-6 text-ink">
 {group.href ? (
 <Link href={group.href} className="underline-offset-4 hover:underline">
 &ldquo;{group.label}&rdquo;
 </Link>
 ) : (
 <span>{group.label}</span>
 )}
 </h2>
 <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-surface-2 px-1.5 text-caption font-medium tabular text-ink-2">
 {group.rows.length}
 </span>
 </div>
 <SortableTaskList
 rows={group.rows.map((t) => ({
 task: t as TaskRow,
 keywordLabel: null,
 keywordHref: null,
 isStale: staleFor(t),
 }))}
 />
 </section>
 ))}
 </div>
 )}
 </PageContainer>
 );
}
