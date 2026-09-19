import type { Metadata } from "next";
import { requireSuperAdmin } from "@/lib/auth";
import { loadJobs } from "@/lib/admin/jobs";
import { loadHealth } from "@/lib/admin/health";
import { formatDateTime } from "@/lib/format";
import { PageContainer, PageHeader, Section } from "@/components/ui/Page";
import { Disclosure } from "@/components/ui/Disclosure";
import { StatusLabel } from "@/components/ui/Status";
import { HealthBoard } from "@/components/admin/HealthBoard";
import TestSerpApiClient from "@/components/admin/TestSerpApiClient";

export const metadata: Metadata = { title: "System health" };
export const dynamic = "force-dynamic";

/** Server-side keys the platform uses. Only whether each is set is shown, never its value. */
const ENV_KEYS: { name: string; purpose: string }[] = [
  { name: "NEXT_PUBLIC_SUPABASE_URL", purpose: "Database and sign-in" },
  { name: "NEXT_PUBLIC_SUPABASE_ANON_KEY", purpose: "Database and sign-in" },
  { name: "CRON_SECRET", purpose: "Scheduled runs" },
  { name: "SERPAPI_KEY", purpose: "Google rankings and AI answers" },
  { name: "SERPAPI_API_KEY", purpose: "Google rankings and AI answers" },
  { name: "SERPER_API_KEY", purpose: "Live search lookups" },
  { name: "OPENAI_API_KEY", purpose: "ChatGPT checks and AI writing" },
  { name: "ANTHROPIC_API_KEY", purpose: "AI writing" },
  { name: "GEMINI_API_KEY", purpose: "AI writing" },
  { name: "OPENROUTER_API_KEY", purpose: "AI writing" },
  { name: "FIRECRAWL_API_KEY", purpose: "Page reading" },
];

export default async function HealthPage() {
  await requireSuperAdmin();
  const jobs = await loadJobs({ sinceDays: 7 });
  const health = await loadHealth(jobs.ok ? jobs.data.jobs : null);

  return (
    <PageContainer>
      <PageHeader
        title="System health"
        description="Checked now, when this page loaded. A service shows Healthy only after a real check passes."
        meta={<span>Checked {formatDateTime(new Date().toISOString())}</span>}
      />

      <HealthBoard initial={health} />

      <Section title="Monitoring history">
        <p className="text-body text-ink-2">Monitoring not configured. VSI doesn&apos;t record uptime over time, so only the current state is shown.</p>
      </Section>

      <Section title="Environment" description="Which server keys are set on this deployment. Values are never shown.">
        <ul className="divide-y divide-line rounded-panel border border-line bg-surface">
          {ENV_KEYS.map((k) => {
            const set = !!process.env[k.name]?.trim();
            return (
              <li key={k.name} className="grid gap-1 px-4 py-2.5 sm:grid-cols-[16rem_8rem_minmax(0,1fr)] sm:items-center sm:gap-4">
                <span className="break-all font-mono text-caption text-ink">{k.name}</span>
                <StatusLabel tone={set ? "positive" : "neutral"}>{set ? "Set" : "Not set"}</StatusLabel>
                <span className="text-support text-ink-3">{k.purpose}</span>
              </li>
            );
          })}
        </ul>
      </Section>

      <Section title="Search provider test">
        <Disclosure summary="Run a real test search (uses 1 SerpAPI search credit)">
          <div className="pt-3">
            <TestSerpApiClient />
          </div>
        </Disclosure>
      </Section>
    </PageContainer>
  );
}
