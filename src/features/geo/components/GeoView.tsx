"use client";

import { useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import { ChevronRight, Search } from "lucide-react";
import { PageContainer, PageHeader, Section, TextLink } from "@/components/ui/Page";
import { Notice, StatusIcon, StatusLabel, type Tone } from "@/components/ui/Status";
import { ButtonLink } from "@/components/ui/Button";
import { Disclosure } from "@/components/ui/Disclosure";
import { MetricHero } from "@/components/ui/MetricHero";
import { Fraction } from "@/components/ui/Metrics";
import { AnswerScene } from "@/components/illustrations";
import { CapabilityList } from "@/components/intro/FeatureIntro";
import { SetupPanel } from "@/components/intro/SetupPanel";
import { ENGINE_COVERAGE, INTROS } from "@/components/intro/intros";
import { TrendLine, type TrendPoint } from "@/features/visibility/components/TrajectoryChart";
import { FindingDrawer } from "@/features/actions/components/FindingDrawer";
import { COMING_SOON_ENGINES, geoConclusion, SEARCH_STATE_LABEL, type EngineId, type GeoSummary, type SearchState } from "@/lib/geo";
import type { AnswerEvidence } from "@/lib/geo-load";
import type { Finding } from "@/lib/findings";
import { cn } from "@/lib/utils";
import { RunChecksButton } from "./RunChecksButton";
import { GuideTarget } from "@/components/onboarding/GuideTarget";

export interface GeoViewData {
  project: { id: string; name: string; domain: string | null } | null;
  state: "ok" | "error" | "no_project";
  errorMessage?: string;
  summary?: GeoSummary;
  enabled?: Record<EngineId, boolean>;
  activeSearches?: number;
  lastChecked?: string | null;
  staleDays?: number | null;
  findings: Finding[];
  /** Competitor domains the user added to the project. */
  trackedCompetitors?: string[];
  evidence: AnswerEvidence[];
  trend: TrendPoint[];
}

const STATE_TONE: Record<SearchState, Tone> = {
  named_and_linked: "positive",
  named: "positive",
  linked: "info",
  not_mentioned: "attention",
  no_answer: "neutral",
  not_checked: "neutral",
};

export default function GeoView({ data }: { data: GeoViewData }) {
  const { project, summary } = data;
  const [open, setOpen] = useState<Finding | null>(null);
  const [created, setCreated] = useState<Set<string>>(new Set());

  const header = (
    <PageHeader
      category="Generative Engine Optimization (GEO)"
      title="AI Visibility"
      description="See whether AI systems mention your business, and what you can do to appear more often."
      meta={
        project && (
          <>
            <span>{project.name}</span>
            {project.domain && <span>{project.domain}</span>}
            {data.lastChecked && <span>Last checked {data.lastChecked}</span>}
          </>
        )
      }
      actions={
        project && data.state === "ok" ? (
          <>
            <ButtonLink href="/dashboard/check?tab=quick-check" variant="secondary">
              <Search size={15} strokeWidth={1.75} aria-hidden />
              Check a search
            </ButtonLink>
            {(summary?.searchesTracked ?? 0) > 0 && <RunChecksButton clientId={project.id} searches={data.activeSearches ?? 0} />}
          </>
        ) : undefined
      }
    />
  );

  if (!project) {
    return (
      <PageContainer>
        {header}
        <Notice tone="critical" title={data.errorMessage ?? "We couldn't load your projects."}>Refresh the page to try again.</Notice>
      </PageContainer>
    );
  }

  if (data.state === "error" || !summary || !data.enabled) {
    return (
      <PageContainer>
        {header}
        <Notice tone="critical" title={data.errorMessage ?? "We couldn't load your AI visibility data."}>
          Refresh the page to try again. Nothing has been lost.
        </Notice>
      </PageContainer>
    );
  }

  if (summary.searchesTracked === 0) {
    const searches = data.activeSearches ?? 0;
    return (
      <PageContainer>
        {header}
        <SetupPanel
          title={searches === 0 ? "Choose the searches to check in AI answers" : "Run your first AI check"}
          description={
            searches === 0
              ? "Add the searches and questions your customers ask, like “best accountant in Dubai”. VSI asks AI systems each one and shows whether they mention you."
              : "Your searches are ready. One check asks AI systems each search and looks up your Google position at the same time. It uses search credits, so it only runs when you start it."
          }
          items={[
            { state: "done", label: "Website added", detail: project.domain ?? undefined },
            searches === 0
              ? { state: "todo", label: "Searches to check", detail: "None yet" }
              : { state: "done", label: "Searches to check", detail: `${searches} ${searches === 1 ? "search" : "searches"}` },
            { state: "todo", label: "First AI check", detail: "Not checked yet" },
          ]}
          action={
            searches === 0 ? (
              <GuideTarget step="searches">
                <ButtonLink href={`/dashboard/clients/${project.id}/keywords/new`} variant="primary">
                  Add searches
                </ButtonLink>
              </GuideTarget>
            ) : (
              <RunChecksButton clientId={project.id} searches={searches} label="Run first check" align="start" />
            )
          }
          illustration={<AnswerScene />}
        />
        {INTROS.ai.capabilities && (
          <CapabilityList
            {...INTROS.ai.capabilities}
            note={
              <p>
                Checked today in {ENGINE_COVERAGE.live.join(", ")}. Coming soon: {ENGINE_COVERAGE.soon.join(" and ")}.
              </p>
            }
          />
        )}
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {header}

      {data.staleDays && (
        <Notice tone="attention" title={`These results are ${data.staleDays} days old`}>
          AI answers change often. Run a new check to see where you stand today.
        </Notice>
      )}

      {/* Conclusion */}
      <MetricHero
        ariaLabel="Your AI visibility"
        label="AI visibility"
        value={summary.visibility === null ? "Not yet" : `${summary.visibility}%`}
        meter={summary.visibility}
        note={summary.early ? `Early read: based on ${summary.answered} answers` : undefined}
        conclusion={geoConclusion(summary)}
        chart={data.trend.length >= 2 ? <TrendLine points={data.trend} format={(v) => `${v}%`} ariaLabel="AI visibility over time" /> : null}
        chartEmpty="A trend appears here after your next check."
      >
        {summary.answered > 0 && <Fraction value={summary.appears} total={summary.answered} tone="you" label="AI answers mention you" className="max-w-sm" />}
      </MetricHero>

      {/* What you can improve */}
      <Section title="What you can improve" description="Ranked by how much each one is costing you. Open one to see the searches involved.">
        {data.findings.length === 0 ? (
          <Notice tone="positive" title="Nothing urgent">
            AI answers mention your business in every search we checked. Keep your pages up to date to stay there.
          </Notice>
        ) : (
          <ul className="divide-y divide-line rounded-panel border border-line bg-surface">
            {data.findings.map((f) => (
              <li key={f.key}>
                <button type="button" onClick={() => setOpen(f)} className="flex w-full items-start gap-3 px-4 py-4 text-left hover:bg-surface-2">
                  <span className="mt-0.5">
                    <StatusIcon tone={f.tone} size={18} />
                  </span>
                  <span className="min-w-0 flex-1 space-y-0.5">
                    <span className="block text-body font-medium text-ink">{f.title}</span>
                    <span className="block text-support text-ink-2">{f.whatWeFound}</span>
                  </span>
                  {created.has(f.key) && <span className="hidden text-caption text-positive sm:inline">Task created</span>}
                  <ChevronRight size={16} strokeWidth={1.75} className="mt-1 shrink-0 text-ink-3" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Where you appear */}
      <Section title="Where you appear" description="Each AI service answers differently, so VSI checks them separately.">
        <ul className="divide-y divide-line border-y border-line">
          {summary.engines.map((e) => (
            <li key={e.id} className="grid gap-2 py-3.5 sm:grid-cols-[minmax(0,14rem)_1fr] sm:items-center sm:gap-6">
              <div>
                <p className="text-body font-medium text-ink">{e.label}</p>
                <p className="text-support text-ink-3">{e.description}</p>
              </div>
              {!e.enabled && e.checked === 0 ? (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-support text-ink-3">
                  Not turned on for this project.
                  <Link href={`/dashboard/clients/${project.id}/settings`} className="font-medium text-ink-2 underline-offset-4 hover:text-ink hover:underline">
                    Project settings
                  </Link>
                </div>
              ) : e.checked === 0 ? (
                <p className="text-support text-ink-3">Not checked yet. It will be included in your next check.</p>
              ) : e.answered === 0 ? (
                <p className="text-support text-ink-3">None of your searches produced an answer here.</p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-[minmax(0,16rem)_1fr] sm:items-center sm:gap-6">
                  <Fraction value={e.appears} total={e.answered} tone="you" label="answers mention you" />
                  <p className="text-support text-ink-3">
                    {e.tracksNames ? `Named in ${e.named}, linked in ${e.linked}` : `Linked in ${e.linked}. This service only shows links.`}
                  </p>
                </div>
              )}
            </li>
          ))}
          {COMING_SOON_ENGINES.map((name) => (
            <li key={name} className="grid gap-2 py-3.5 sm:grid-cols-[minmax(0,14rem)_1fr] sm:items-center sm:gap-6">
              <p className="text-body font-medium text-ink-3">{name}</p>
              <p className="text-support text-ink-3">Coming soon. VSI doesn&apos;t check {name} yet.</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* What AI answers say + evidence */}
      <section className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="space-y-4">
          <h2 className="text-section font-semibold text-ink">What AI answers say about you</h2>
          <Checklist summary={summary} />
        </div>
        <Evidence items={data.evidence} projectId={project.id} />
      </section>

      {/* You and competitors */}
      <CompetitorComparison summary={summary} projectName={project.name} tracked={data.trackedCompetitors ?? []} />

      {/* Searches */}
      <TrackedSearches summary={summary} projectId={project.id} showOverviews={data.enabled.ai_overviews || summary.engines.some((e) => e.id === "ai_overviews" && e.checked > 0)} />

      <Disclosure summary="How VSI measures AI visibility">
        <div className="max-w-[70ch] space-y-2 text-support text-ink-2">
          <p>
            For each search you track, VSI uses the most recent check. A search counts as <em>answered</em> when at least one AI service
            gave an answer, and you <em>appear</em> when that answer names your business or links to your website.
          </p>
          <p>AI visibility is the share of answered searches where you appear. Searches with no AI answer are left out, not counted against you.</p>
          <p>
            Competitors are counted the same way as you: the number of AI answers that link to their website. Well-known sites like Reddit or
            G2 are shown separately as places AI trusts. Services VSI doesn&apos;t check yet are marked &ldquo;Coming soon&rdquo; and never
            given numbers.
          </p>
        </div>
      </Disclosure>

      <FindingDrawer
        finding={open}
        onClose={() => setOpen(null)}
        alreadyCreated={open ? created.has(open.key) : false}
        onCreated={(key) => setCreated((prev) => new Set(prev).add(key))}
      />
    </PageContainer>
  );
}

function Checklist({ summary: s }: { summary: GeoSummary }) {
  const top = s.competitors[0];
  const missing = s.searches.filter((x) => x.answered && !x.appears).length;
  const items: { tone: Tone; text: string }[] = [
    s.mentions > 0
      ? { tone: "positive", text: `Your business is named in ${s.mentions} AI ${s.mentions === 1 ? "answer" : "answers"}` }
      : { tone: "attention", text: "AI answers don't name your business yet" },
    s.citations > 0
      ? { tone: "positive", text: `Your website is used as a source in ${s.citations} ${s.citations === 1 ? "answer" : "answers"}` }
      : { tone: "attention", text: "AI answers don't link to your website yet" },
  ];
  if (s.entity) {
    items.push(
      s.entity.recognised === s.entity.checked
        ? { tone: "positive", text: "ChatGPT recognises your business correctly" }
        : { tone: "attention", text: "ChatGPT sometimes confuses you with another business" },
    );
  }
  if (top) {
    items.push(
      top.answers > s.citations
        ? { tone: "attention", text: `${top.domain} is linked more often than you (${top.answers} vs ${s.citations})` }
        : { tone: "positive", text: "You're linked at least as often as any competitor" },
    );
  }
  if (s.answered > 0) {
    items.push(
      missing > 0
        ? { tone: "attention", text: `${missing} important ${missing === 1 ? "search doesn't" : "searches don't"} mention you` }
        : { tone: "positive", text: "Every AI answer we checked mentions you" },
    );
  }
  return (
    <ul className="space-y-3">
      {items.map((it, i) => (
        <li key={i}>
          <StatusLabel tone={it.tone} className="text-body font-normal">
            <span className="text-ink">{it.text}</span>
          </StatusLabel>
        </li>
      ))}
    </ul>
  );
}

function Evidence({ items, projectId }: { items: AnswerEvidence[]; projectId: string }) {
  const [index, setIndex] = useState(0);
  if (items.length === 0) {
    return (
      <div className="rounded-panel border border-dashed border-line-strong p-5 text-support text-ink-3">
        An example AI answer appears here once a check finds one for your searches.
      </div>
    );
  }
  const item = items[Math.min(index, items.length - 1)];
  return (
    <figure className="rounded-panel border border-line bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
        <figcaption className="min-w-0">
          <span className="block text-caption text-ink-3">
            {item.engineLabel} answer · {item.checkedAt}
          </span>
          <span className="block truncate text-support font-medium text-ink">&ldquo;{item.keyword}&rdquo;</span>
        </figcaption>
        {items.length > 1 && (
          <div role="tablist" aria-label="Example answers" className="flex rounded-control border border-line p-0.5 text-caption">
            {items.map((it, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === index}
                onClick={() => setIndex(i)}
                className={cn("rounded-control px-2 py-1", i === index ? "bg-surface-2 font-medium text-ink" : "text-ink-3 hover:text-ink")}
              >
                {it.appears ? "Mentions you" : "Leaves you out"}
              </button>
            ))}
          </div>
        )}
      </div>
      <blockquote className="px-4 py-4 text-support leading-relaxed text-ink-2">
        {item.segments.map((seg, i) =>
          seg.you ? (
            <mark key={i} className="rounded-control bg-brand-soft px-0.5 font-medium text-ink">
              {seg.text}
            </mark>
          ) : (
            <span key={i}>{seg.text}</span>
          ),
        )}
      </blockquote>
      {item.sources.length > 0 && (
        <div className="border-t border-line px-4 py-3">
          <p className="mb-2 text-caption font-medium text-ink-3">Sources the answer links to</p>
          <ol className="space-y-1.5">
            {item.sources.map((s) => (
              <li key={s.position} className="flex items-center gap-2.5 text-support">
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-caption tabular",
                    s.you ? "bg-brand text-white" : "bg-surface-2 text-ink-3",
                  )}
                >
                  {s.position}
                </span>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className={cn("truncate hover:underline", s.you ? "font-medium text-ink" : "text-ink-2")}>
                  {s.name}
                </a>
                {s.you && <span className="shrink-0 text-caption text-brand-strong">You</span>}
              </li>
            ))}
          </ol>
        </div>
      )}
      {item.keywordId && (
        <div className="border-t border-line px-4 py-2.5">
          <TextLink href={`/dashboard/clients/${projectId}/keywords/${item.keywordId}`}>See this search in detail</TextLink>
        </div>
      )}
    </figure>
  );
}

function CompetitorComparison({ summary: s, projectName, tracked }: { summary: GeoSummary; projectName: string; tracked: string[] }) {
  const rows = useMemo(() => {
    const same = (a: string, b: string) => a === b || a.endsWith(`.${b}`);
    // Competitors you added: their real count in the answers checked (0 means checked and not linked).
    const yours = tracked.map((t) => ({
      name: t,
      answers: Math.max(0, ...s.competitors.filter((c) => same(c.domain, t)).map((c) => c.answers)),
      you: false,
      tracked: true,
    }));
    const discovered = s.competitors
      .filter((c) => !tracked.some((t) => same(c.domain, t)))
      .slice(0, Math.max(0, 5 - yours.length))
      .map((c) => ({ name: c.domain, answers: c.answers, you: false, tracked: false }));
    return [{ name: `${projectName} (you)`, answers: s.citations, you: true, tracked: false }, ...yours, ...discovered];
  }, [s, projectName, tracked]);
  if (rows.length === 1) return null;
  const max = Math.max(...rows.map((r) => r.answers), 1);
  return (
    <Section
      title="You and competitors"
      description="How many of the AI answers VSI checked link to each website, counted the same way for everyone."
      action={{ label: "Where competitors appear and you don't", href: "/dashboard/competitors" }}
    >
      <ul className="space-y-3">
        {rows.map((r) => (
          <li key={r.name} className="grid grid-cols-[minmax(0,11rem)_1fr_auto] items-center gap-3 sm:grid-cols-[minmax(0,16rem)_1fr_auto]">
            <span className={cn("truncate text-support", r.you ? "font-medium text-ink" : "text-ink-2")}>
              {r.name}
              {r.tracked && <span className="ml-2 text-caption text-ink-3">Added by you</span>}
            </span>
            <span className="h-2 overflow-hidden rounded-full bg-surface-2">
              <span className={cn("block h-full rounded-full", r.you ? "bg-brand" : "bg-ink-3")} style={{ width: `${(r.answers / max) * 100}%` }} />
            </span>
            <span className="w-24 text-right text-support tabular text-ink-2">
              {r.answers} {r.answers === 1 ? "answer" : "answers"}
            </span>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function TrackedSearches({ summary: s, projectId, showOverviews }: { summary: GeoSummary; projectId: string; showOverviews: boolean }) {
  const [showAll, setShowAll] = useState(false);
  const engines = s.engines.filter((e) => e.id !== "ai_overviews" || showOverviews);
  const sorted = [...s.searches].sort((a, b) => Number(a.appears) - Number(b.appears) || Number(b.answered) - Number(a.answered));
  const shown = showAll ? sorted : sorted.slice(0, 8);
  const cols = `minmax(0,1.4fr) ${engines.map(() => "minmax(0,1fr)").join(" ")}`;

  return (
    <Section title="Searches we check" description="Searches where you don't appear are listed first.">
      <div className="rounded-panel border border-line bg-surface">
        <div className="hidden gap-4 rounded-t-panel border-b border-line bg-surface-2 px-4 py-2.5 text-caption font-medium text-ink-3 md:grid md:[grid-template-columns:var(--cols)]" style={{ "--cols": cols } as CSSProperties}>
          <span>Search</span>
          {engines.map((e) => (
            <span key={e.id}>{e.label}</span>
          ))}
        </div>
        <ul className="divide-y divide-line">
          {shown.map((row) => (
            <li
              key={row.keywordId ?? row.keyword}
              className="grid gap-2 px-4 py-3 md:items-center md:gap-4 md:[grid-template-columns:var(--cols)]"
              style={{ "--cols": cols } as CSSProperties}
            >
              <div className="min-w-0">
                {row.keywordId ? (
                  <Link href={`/dashboard/clients/${projectId}/keywords/${row.keywordId}`} className="block truncate text-support font-medium text-ink hover:underline">
                    {row.keyword}
                  </Link>
                ) : (
                  <span className="block truncate text-support font-medium text-ink">{row.keyword}</span>
                )}
              </div>
              {engines.map((e) => (
                <div key={e.id} className="flex items-center gap-2 text-support">
                  <span className="text-caption text-ink-3 md:hidden">{e.label}:</span>
                  <StatusLabel tone={STATE_TONE[row.states[e.id]]} className="font-normal">
                    <span className={row.states[e.id] === "not_checked" || row.states[e.id] === "no_answer" ? "text-ink-3" : "text-ink-2"}>
                      {SEARCH_STATE_LABEL[row.states[e.id]]}
                    </span>
                  </StatusLabel>
                </div>
              ))}
            </li>
          ))}
        </ul>
        {sorted.length > 8 && (
          <div className="border-t border-line px-4 py-2.5">
            <button type="button" onClick={() => setShowAll((v) => !v)} className="text-support font-medium text-ink-2 hover:text-ink">
              {showAll ? "Show fewer" : `Show all ${sorted.length} searches`}
            </button>
          </div>
        )}
      </div>
    </Section>
  );
}
