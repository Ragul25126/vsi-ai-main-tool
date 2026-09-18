import type { Metadata } from "next";
import { requireAgency } from "@/lib/auth";
import { getProjectContext } from "@/lib/project-context";
import { loadProjectOverview } from "@/lib/project-summary";
import { formatDate } from "@/lib/format";
import { PageContainer, PageHeader, Section } from "@/components/ui/Page";
import { StatusLabel } from "@/components/ui/Status";
import { EmptyState } from "@/components/ui/EmptyState";
import { ButtonLink } from "@/components/ui/Button";
import { AnswerDiagram } from "@/components/diagrams";
import ChatStarter from "@/features/assistant/components/ChatStarter";

export const metadata: Metadata = { title: "AI Chat" };
export const dynamic = "force-dynamic";

export default async function AIChatPage() {
  const session = await requireAgency();
  const { active } = await getProjectContext(session);

  const header = (
    <PageHeader
      title="AI Chat"
      description="Ask about your project in plain language. Answers use your latest site audit, AI checks, Google rankings and tasks."
    />
  );

  if (!active) {
    return (
      <PageContainer>
        {header}
        <EmptyState diagram={<AnswerDiagram />} title="Add a project to start chatting" action={<ButtonLink href="/dashboard/clients/new" variant="primary">Add project</ButtonLink>}>
          The chat answers questions about your own data, so it needs a project with at least one check.
        </EmptyState>
      </PageContainer>
    );
  }

  const o = await loadProjectOverview(active);
  const sources = [
    {
      label: "Site audit",
      ok: o.audit.state === "ok" && !!o.audit.completed,
      detail: o.audit.state === "ok" && o.audit.completed ? `From ${formatDate(o.audit.completed.completed_at ?? o.audit.completed.created_at)}` : "Not run yet",
    },
    {
      label: "AI answer checks",
      ok: o.geo.state === "ok" && o.geo.summary.searchesTracked > 0,
      detail: o.geo.state === "ok" && o.geo.summary.lastCheckedAt ? `From ${formatDate(o.geo.summary.lastCheckedAt)}` : "Not run yet",
    },
    {
      label: "Google rankings",
      ok: o.search.state === "ok" && o.search.summary.tracked > 0,
      detail: o.search.state === "ok" && o.search.summary.lastCheckedAt ? `From ${formatDate(o.search.summary.lastCheckedAt)}` : "Not checked yet",
    },
    {
      label: "Tasks",
      ok: !!o.tasks,
      detail: o.tasks ? `${o.tasks.todo + o.tasks.inProgress} open` : "None yet",
    },
  ];

  return (
    <PageContainer>
      {header}
      <Section title={`Ask about ${active.name}`} description="Pick a question or ask your own in the chat panel.">
        <ChatStarter />
      </Section>
      <Section title="What the chat knows" description="The chat only answers from this data. If something hasn't been checked, it will say so instead of guessing.">
        <ul className="grid gap-3 sm:grid-cols-2">
          {sources.map((s) => (
            <li key={s.label} className="flex items-center justify-between gap-3 border-t border-line pt-3">
              <StatusLabel tone={s.ok ? "positive" : "neutral"}>
                <span className="text-ink">{s.label}</span>
              </StatusLabel>
              <span className="text-support text-ink-3">{s.detail}</span>
            </li>
          ))}
        </ul>
      </Section>
    </PageContainer>
  );
}
