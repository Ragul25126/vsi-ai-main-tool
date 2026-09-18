import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAgency, isDummySupabase } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getProjectContext } from "@/lib/project-context";
import { displayDomain } from "@/lib/project-types";
import { formatDate } from "@/lib/format";
import { PageContainer, PageHeader } from "@/components/ui/Page";
import { Notice } from "@/components/ui/Status";
import { EmptyState } from "@/components/ui/EmptyState";
import { ButtonLink } from "@/components/ui/Button";
import { ChecklistDiagram } from "@/components/diagrams";

export const metadata: Metadata = { title: "Projects" };
export const dynamic = "force-dynamic";

interface Counts {
  searches: number;
  openTasks: number;
  lastCheck: string | null;
}

async function loadCounts(projectIds: string[]): Promise<Map<string, Counts>> {
  const out = new Map<string, Counts>(projectIds.map((id) => [id, { searches: 0, openTasks: 0, lastCheck: null }]));
  if (isDummySupabase() || projectIds.length === 0) return out;
  const supabase = await createClient();
  const [kw, tasks, results] = await Promise.all([
    supabase.from("tracked_keywords").select("client_id").in("client_id", projectIds).eq("is_active", true),
    supabase.from("tasks").select("client_id").in("client_id", projectIds).in("status", ["todo", "in_progress"]),
    supabase.from("search_results").select("client_id, created_at").in("client_id", projectIds).order("created_at", { ascending: false }).limit(2000),
  ]);
  for (const r of (kw.data ?? []) as { client_id: string }[]) out.get(r.client_id)!.searches++;
  for (const r of (tasks.data ?? []) as { client_id: string }[]) out.get(r.client_id)!.openTasks++;
  for (const r of (results.data ?? []) as { client_id: string; created_at: string }[]) {
    const c = out.get(r.client_id);
    if (c && !c.lastCheck) c.lastCheck = r.created_at;
  }
  return out;
}

export default async function ProjectsPage() {
  const session = await requireAgency();
  const { projects, active, error } = await getProjectContext(session);
  const counts = await loadCounts(projects.map((p) => p.id));

  return (
    <PageContainer>
      <PageHeader
        title="Projects"
        description="Each project is one website with its own searches, checks, tasks and reports."
        actions={
          <ButtonLink href="/dashboard/clients/new" variant="primary">
            <Plus size={15} strokeWidth={1.75} aria-hidden />
            Add project
          </ButtonLink>
        }
      />

      {error && <Notice tone="critical" title={error}>Refresh the page to try again.</Notice>}

      {!error && projects.length === 0 ? (
        <EmptyState diagram={<ChecklistDiagram />} title="No projects yet" action={<ButtonLink href="/dashboard/clients/new" variant="primary">Add project</ButtonLink>}>
          Add your website to start auditing it and checking how you appear in Google and AI answers.
        </EmptyState>
      ) : (
        <div className="rounded-panel border border-line bg-surface">
          <div className="hidden grid-cols-[minmax(0,1.6fr)_7rem_7rem_9rem] gap-4 border-b border-line px-4 py-2.5 text-caption font-medium text-ink-3 md:grid">
            <span>Project</span>
            <span>Searches</span>
            <span>Open tasks</span>
            <span>Last check</span>
          </div>
          <ul className="divide-y divide-line">
            {projects.map((p) => {
              const c = counts.get(p.id)!;
              return (
                <li key={p.id} className="grid gap-1 px-4 py-3 md:grid-cols-[minmax(0,1.6fr)_7rem_7rem_9rem] md:items-center md:gap-4">
                  <div className="min-w-0">
                    <Link href={`/dashboard/clients/${p.id}`} className="block truncate text-body font-medium text-ink hover:underline">
                      {p.name}
                      {p.id === active?.id && <span className="ml-2 text-caption font-normal text-brand-strong">Current</span>}
                    </Link>
                    <span className="block truncate text-support text-ink-3">
                      {displayDomain(p.website) ?? "No website"}
                      {p.agencyName ? ` · ${p.agencyName}` : ""}
                    </span>
                  </div>
                  <span className="text-support tabular text-ink-2">
                    <span className="text-ink-3 md:hidden">Searches: </span>
                    {c.searches}
                  </span>
                  <span className="text-support tabular text-ink-2">
                    <span className="text-ink-3 md:hidden">Open tasks: </span>
                    {c.openTasks}
                  </span>
                  <span className="text-support text-ink-3">{c.lastCheck ? formatDate(c.lastCheck) : "Not checked yet"}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </PageContainer>
  );
}
