"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Search } from "lucide-react";
import { PageContainer, PageHeader, Section } from "@/components/ui/Page";
import { Notice, StatusIcon } from "@/components/ui/Status";
import { ButtonLink } from "@/components/ui/Button";
import { SearchScene } from "@/components/illustrations";
import { CapabilityList } from "@/components/intro/FeatureIntro";
import { SetupPanel } from "@/components/intro/SetupPanel";
import { INTROS } from "@/components/intro/intros";
import { FindingDrawer } from "@/features/actions/components/FindingDrawer";
import { RunChecksButton } from "@/features/geo/components/RunChecksButton";
import { searchConclusion, type SearchSummary, type RankedSearch } from "@/lib/search";
import type { Finding } from "@/lib/findings";
import { cn } from "@/lib/utils";
import { TrendLine, type TrendPoint } from "./TrajectoryChart";
import { GuideTarget } from "@/components/onboarding/GuideTarget";

export interface SearchViewData {
  project: { id: string; name: string; domain: string | null } | null;
  state: "ok" | "error" | "no_project";
  errorMessage?: string;
  summary?: SearchSummary;
  rankTrackingEnabled?: boolean;
  activeSearches?: number;
  lastChecked?: string | null;
  findings: Finding[];
  trend: TrendPoint[];
}

function changeLabel(s: RankedSearch): { text: string; tone: "up" | "down" | "flat" | "none" } {
  if (s.previous === null && s.position !== null && s.history.length <= 1) return { text: "First check", tone: "none" };
  if (s.change === null) return { text: "No change", tone: "flat" };
  if (s.change > 0) return { text: s.previous === null ? "Now ranking" : `Up ${s.change}`, tone: "up" };
  if (s.change < 0) return { text: s.position === null ? "Dropped out" : `Down ${Math.abs(s.change)}`, tone: "down" };
  return { text: "No change", tone: "flat" };
}

export default function SearchVisibilityView({ data }: { data: SearchViewData }) {
  const { project, summary: s } = data;
  const [open, setOpen] = useState<Finding | null>(null);
  const [created, setCreated] = useState<Set<string>>(new Set());

  const header = (
    <PageHeader
      title="Search Visibility"
      description="See where your website appears in search, and what is improving, dropping or worth your attention."
      meta={
        project && (
          <>
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
            {(s?.tracked ?? 0) > 0 && <RunChecksButton clientId={project.id} searches={data.activeSearches ?? 0} label="Check rankings now" />}
          </>
        ) : undefined
      }
    />
  );

  if (!project || data.state !== "ok" || !s) {
    return (
      <PageContainer>
        {header}
        <Notice tone="critical" title={data.errorMessage ?? "We couldn't load your rankings."}>Refresh the page to try again.</Notice>
      </PageContainer>
    );
  }

  if (!data.rankTrackingEnabled) {
    return (
      <PageContainer>
        {header}
        <Notice
          tone="attention"
          title="Google ranking checks are turned off for this project"
          action={<ButtonLink href={`/dashboard/clients/${project.id}/settings`} size="sm">Project settings</ButtonLink>}
        >
          Turn them on in project settings to see where you appear in Google.
        </Notice>
      </PageContainer>
    );
  }

  if (s.tracked === 0) {
    const searches = data.activeSearches ?? 0;
    return (
      <PageContainer>
        {header}
        <SetupPanel
          title={searches === 0 ? "Add the searches you want to track" : "Run your first ranking check"}
          description={
            searches === 0
              ? "Add the searches your customers type into Google. VSI then checks where your website appears for each one and keeps the history."
              : "Your searches are ready. One check looks up your Google position for each search and checks AI answers at the same time. It uses search credits, so it only runs when you start it."
          }
          items={[
            { state: "done", label: "Website added", detail: project.domain ?? undefined },
            searches === 0
              ? { state: "todo", label: "Searches to track", detail: "None yet" }
              : { state: "done", label: "Searches to track", detail: `${searches} ${searches === 1 ? "search" : "searches"}` },
            { state: "todo", label: "First ranking check", detail: "Not checked yet" },
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
          illustration={<SearchScene />}
        />
        {INTROS.search.capabilities && <CapabilityList {...INTROS.search.capabilities} />}
      </PageContainer>
    );
  }

  const buckets = [
    { label: "Top 3", count: s.top3 },
    { label: "Positions 4 to 10", count: s.top10 - s.top3 },
    { label: "Page two", count: s.page2 },
    { label: "Further back", count: s.ranked - s.top10 - s.page2 },
    { label: "Not found", count: s.notFound },
  ];

  return (
    <PageContainer>
      {header}

      <section aria-label="Your Google visibility" className="grid gap-8 md:grid-cols-[auto_1fr_minmax(0,260px)] md:items-center">
        <div>
          <p className="text-caption font-medium text-ink-3">On Google&apos;s first page</p>
          <p className="mt-1 flex items-baseline gap-1.5">
            <span className="text-metric font-semibold tabular text-ink">{s.top10}</span>
            <span className="text-body text-ink-3">of {s.tracked}</span>
          </p>
          {s.averagePosition !== null && <p className="mt-1 text-support text-ink-3">Average position {s.averagePosition}</p>}
        </div>
        <p className="max-w-[52ch] text-section font-medium text-ink">{searchConclusion(s)}</p>
        {data.trend.length >= 2 ? (
          <TrendLine points={data.trend} format={(v) => `${v}%`} ariaLabel="Share of searches on Google's first page over time" />
        ) : (
          <p className="text-support text-ink-3">A trend appears here after your next check.</p>
        )}
      </section>

      <dl className="grid grid-cols-2 gap-y-4 border-y border-line py-4 sm:grid-cols-5 sm:divide-x sm:divide-line">
        {buckets.map((b) => (
          <div key={b.label} className="sm:px-4 sm:first:pl-0">
            <dt className="text-caption text-ink-3">{b.label}</dt>
            <dd className="text-xl font-semibold tabular text-ink">{b.count}</dd>
          </div>
        ))}
      </dl>

      {data.findings.length > 0 && (
        <Section title="What you can improve">
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
        </Section>
      )}

      <Section title="Your searches" description="Best position first. Open a search to see who ranks around you.">
        <div className="rounded-panel border border-line bg-surface">
          <div className="hidden grid-cols-[minmax(0,1.6fr)_6rem_8rem_minmax(0,1.4fr)] gap-4 border-b border-line px-4 py-2.5 text-caption font-medium text-ink-3 md:grid">
            <span>Search</span>
            <span>Position</span>
            <span>Change</span>
            <span>Your page that ranks</span>
          </div>
          <ul className="divide-y divide-line">
            {s.searches.map((row) => {
              const change = changeLabel(row);
              return (
                <li key={row.keywordId ?? row.keyword} className="grid gap-1 px-4 py-3 md:grid-cols-[minmax(0,1.6fr)_6rem_8rem_minmax(0,1.4fr)] md:items-center md:gap-4">
                  <div className="min-w-0">
                    {row.keywordId ? (
                      <Link href={`/dashboard/clients/${project.id}/keywords/${row.keywordId}`} className="block truncate text-support font-medium text-ink hover:underline">
                        {row.keyword}
                      </Link>
                    ) : (
                      <span className="block truncate text-support font-medium text-ink">{row.keyword}</span>
                    )}
                    <span className="text-caption text-ink-3 md:hidden">Checked {row.checkedAt}</span>
                  </div>
                  <span className="text-support tabular text-ink">{row.position === null ? <span className="text-ink-3">Not found</span> : `#${row.position}`}</span>
                  <span
                    className={cn(
                      "text-support",
                      change.tone === "up" && "text-positive",
                      change.tone === "down" && "text-attention",
                      (change.tone === "flat" || change.tone === "none") && "text-ink-3",
                    )}
                  >
                    {change.text}
                  </span>
                  <span className="truncate text-support text-ink-3">{row.url ? row.url.replace(/^https?:\/\//, "") : "None"}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </Section>

      <FindingDrawer
        finding={open}
        onClose={() => setOpen(null)}
        alreadyCreated={open ? created.has(open.key) : false}
        onCreated={(key) => setCreated((prev) => new Set(prev).add(key))}
      />
    </PageContainer>
  );
}
