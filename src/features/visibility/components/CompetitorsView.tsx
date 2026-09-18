"use client";

import { useState } from "react";
import Link from "next/link";
import { PageContainer, PageHeader, Section } from "@/components/ui/Page";
import { Notice } from "@/components/ui/Status";
import { Button } from "@/components/ui/Button";
import { Disclosure } from "@/components/ui/Disclosure";
import { CompareScene } from "@/components/illustrations";
import { CapabilityList } from "@/components/intro/FeatureIntro";
import { SetupPanel } from "@/components/intro/SetupPanel";
import { INTROS } from "@/components/intro/intros";
import { RunChecksButton } from "@/features/geo/components/RunChecksButton";
import { FindingDrawer } from "@/features/actions/components/FindingDrawer";
import type { CompetitorRow } from "@/lib/competitors";
import type { Finding } from "@/lib/findings";
import { cn } from "@/lib/utils";

export interface CompetitorsViewData {
  project: { id: string; name: string; domain: string | null } | null;
  state: "ok" | "error" | "no_project";
  errorMessage?: string;
  rows: CompetitorRow[];
  you: { aiAnswers: number; googleTop10: number; searchesChecked: number } | null;
  gaps: { keyword: string; keywordId: string | null; competitors: string[] }[];
  platforms: { name: string; answers: number }[];
  namedByChatGPT: { name: string; answers: number }[];
  finding: Finding | null;
  /** Real setup state, used when there is nothing to compare yet. */
  setup: { searches: number; checked: boolean };
}

export default function CompetitorsView({ data }: { data: CompetitorsViewData }) {
  const { project } = data;
  const [open, setOpen] = useState<Finding | null>(null);
  const [created, setCreated] = useState(false);

  const header = (
    <PageHeader
      title="Competitors"
      description="See where competitors appear in Google and AI answers, and where you can win."
      meta={project?.domain && <span>{project.domain}</span>}
    />
  );

  if (!project || data.state === "error") {
    return (
      <PageContainer>
        {header}
        <Notice tone="critical" title={data.errorMessage ?? "We couldn't load competitor data."}>Refresh the page to try again.</Notice>
      </PageContainer>
    );
  }

  if (data.rows.length === 0) {
    return (
      <PageContainer>
        {header}
        <SetupPanel
          title={data.setup.checked ? "No competitors found in your checks yet" : "Compare yourself with your competitors"}
          description={
            data.setup.checked
              ? "Your latest checks didn't show other businesses for your searches. Competitors appear here as soon as Google or an AI answer shows one."
              : "VSI compares you with the businesses that appear for your searches in Google and AI answers. That needs your searches and a first check."
          }
          items={[
            { state: "done", label: "Website added", detail: project.domain ?? undefined },
            data.setup.searches > 0
              ? { state: "done", label: "Searches to compare on", detail: `${data.setup.searches} ${data.setup.searches === 1 ? "search" : "searches"}` }
              : { state: "todo", label: "Searches to compare on", detail: "None yet", href: `/dashboard/clients/${project.id}/keywords/new`, hrefLabel: "Add searches" },
            data.setup.checked
              ? { state: "done", label: "First search and AI check", detail: "Done" }
              : { state: "todo", label: "First search and AI check", detail: "Not checked yet" },
          ]}
          action={
            !data.setup.checked && data.setup.searches > 0 ? (
              <RunChecksButton clientId={project.id} searches={data.setup.searches} label="Run first check" align="start" />
            ) : undefined
          }
          illustration={<CompareScene />}
        />
        {INTROS.competitors.capabilities && <CapabilityList {...INTROS.competitors.capabilities} />}
      </PageContainer>
    );
  }

  const top = data.rows[0];
  const max = Math.max(data.you?.aiAnswers ?? 0, ...data.rows.map((r) => r.aiAnswers), 1);

  return (
    <PageContainer>
      {header}

      <p className="max-w-[60ch] text-title font-medium text-ink">
        {top.domain} shows up most often: linked in {top.aiAnswers} AI {top.aiAnswers === 1 ? "answer" : "answers"}
        {top.googleTop10 > 0 ? ` and on Google's first page for ${top.googleTop10} of your searches` : ""}.
      </p>

      <Section title="Who shows up for your searches" description="Counted the same way for you and every competitor.">
        <div className="rounded-panel border border-line bg-surface">
          <div className="hidden grid-cols-[minmax(0,1.3fr)_minmax(0,1.6fr)_9rem_9rem] gap-4 border-b border-line px-4 py-2.5 text-caption font-medium text-ink-3 md:grid">
            <span>Website</span>
            <span>AI answers linking to them</span>
            <span>Google first page</span>
            <span>Where you&apos;re missing</span>
          </div>
          <ul className="divide-y divide-line">
            {data.you && (
              <Row name={`${project.name} (you)`} you ai={data.you.aiAnswers} max={max} google={data.you.googleTop10} gap={null} />
            )}
            {data.rows.map((r) => (
              <Row key={r.domain} name={r.domain} ai={r.aiAnswers} max={max} google={r.googleTop10} gap={r.aiGapSearches} />
            ))}
          </ul>
        </div>
      </Section>

      <Section
        title="Where competitors appear and you don't"
        description="AI answers for these searches link to competitors but not to your website."
        aside={
          data.finding ? (
            <Button size="sm" variant="secondary" onClick={() => setOpen(data.finding)}>
              What to do about it
            </Button>
          ) : undefined
        }
      >
        {data.gaps.length === 0 ? (
          <p className="text-body text-ink-2">No gaps right now: in every AI answer that links to a competitor, your website is linked too.</p>
        ) : (
          <ul className="divide-y divide-line border-y border-line">
            {data.gaps.map((g) => (
              <li key={g.keywordId ?? g.keyword} className="grid gap-1 py-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] md:gap-6">
                {g.keywordId ? (
                  <Link href={`/dashboard/clients/${project.id}/keywords/${g.keywordId}`} className="text-support font-medium text-ink hover:underline">
                    {g.keyword}
                  </Link>
                ) : (
                  <span className="text-support font-medium text-ink">{g.keyword}</span>
                )}
                <span className="text-support text-ink-2">AI links to {g.competitors.join(", ")}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {(data.platforms.length > 0 || data.namedByChatGPT.length > 0) && (
        <section className="grid gap-10 md:grid-cols-2">
          {data.platforms.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-section font-semibold text-ink">Sites AI trusts for your topic</h2>
              <p className="text-support text-ink-3">Not competitors, but places where being mentioned helps AI recommend you.</p>
              <ul className="space-y-1.5">
                {data.platforms.map((p) => (
                  <li key={p.name} className="flex justify-between text-support">
                    <span className="text-ink">{p.name}</span>
                    <span className="tabular text-ink-3">
                      {p.answers} {p.answers === 1 ? "answer" : "answers"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {data.namedByChatGPT.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-section font-semibold text-ink">Businesses ChatGPT names</h2>
              <p className="text-support text-ink-3">Names ChatGPT mentions when answering your searches.</p>
              <ul className="space-y-1.5">
                {data.namedByChatGPT.map((n) => (
                  <li key={n.name} className="flex justify-between text-support">
                    <span className="text-ink">{n.name}</span>
                    <span className="tabular text-ink-3">
                      {n.answers} {n.answers === 1 ? "answer" : "answers"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      <Disclosure summary="How VSI finds competitors">
        <p className="max-w-[70ch] text-support text-ink-2">
          VSI doesn&apos;t need a competitor list. It reads the websites that Google&apos;s first page and AI answers show for the searches you
          track. &ldquo;AI answers linking to them&rdquo; counts each AI answer once per website, exactly as your own number is counted.
          Community and review sites such as Reddit or G2 are listed separately.
        </p>
      </Disclosure>

      <FindingDrawer finding={open} onClose={() => setOpen(null)} alreadyCreated={created} onCreated={() => setCreated(true)} />
    </PageContainer>
  );
}

function Row({ name, you, ai, max, google, gap }: { name: string; you?: boolean; ai: number; max: number; google: number; gap: number | null }) {
  return (
    <li className={cn("grid gap-2 px-4 py-3 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1.6fr)_9rem_9rem] md:items-center md:gap-4", you && "bg-brand-soft/40")}>
      <span className={cn("truncate text-support", you ? "font-medium text-ink" : "text-ink-2")}>{name}</span>
      <span className="flex items-center gap-3">
        <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
          <span className={cn("block h-full rounded-full", you ? "bg-brand" : "bg-ink-3")} style={{ width: `${(ai / max) * 100}%` }} />
        </span>
        <span className="w-8 text-right text-support tabular text-ink-2">{ai}</span>
      </span>
      <span className="text-support tabular text-ink-2">
        <span className="text-caption text-ink-3 md:hidden">Google first page: </span>
        {google} {google === 1 ? "search" : "searches"}
      </span>
      <span className="text-support tabular text-ink-2">
        {gap === null ? (
          <span className="text-ink-3">n/a</span>
        ) : (
          <>
            <span className="text-caption text-ink-3 md:hidden">Where you&apos;re missing: </span>
            {gap} {gap === 1 ? "search" : "searches"}
          </>
        )}
      </span>
    </li>
  );
}
