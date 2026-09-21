import type { Metadata } from "next";
import { requireProjectContext } from "@/lib/project-context";
import { loadProjectOverview } from "@/lib/project-summary";
import { formatDate } from "@/lib/format";
import { PageContainer, PageHeader, Section } from "@/components/ui/Page";
import { Notice } from "@/components/ui/Status";
import { SetupChecklist } from "@/components/intro/SetupPanel";
import { Intro } from "@/components/intro/intros";
import ChatStarter from "@/features/assistant/components/ChatStarter";

export const metadata: Metadata = { title: "AI Chat" };
export const dynamic = "force-dynamic";

export default async function AIChatPage() {
  const { active, error } = await requireProjectContext();
  if (!active && !error) return <Intro name="chat" />;

  const header = (
    <PageHeader
      title="AI Chat"
      description="Ask questions about your website and visibility. Answers use your latest site audit, AI checks, Google rankings and tasks."
    />
  );

  if (!active) {
    return (
      <PageContainer>
        {header}
        <Notice tone="critical" title={error ?? "We couldn't load your projects."}>Refresh the page to try again.</Notice>
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
        <SetupChecklist
          className="max-w-2xl"
          items={sources.map((s) => ({ state: s.ok ? ("done" as const) : ("todo" as const), label: s.label, detail: s.detail }))}
        />
      </Section>
    </PageContainer>
  );
}
