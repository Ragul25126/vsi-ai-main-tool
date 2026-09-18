"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { PageContainer, PageHeader, Section } from "@/components/ui/Page";
import { Notice } from "@/components/ui/Status";
import { Skeleton } from "@/components/ui/Metrics";
import { ButtonLink } from "@/components/ui/Button";
import { displayDomain } from "@/lib/project-types";
import { useActiveProject } from "@/components/layout/ProjectProvider";
import KeywordLookup from "./KeywordLookup";

interface ResearchResponse {
  success: boolean;
  error?: string;
  keyword: string;
  location: string;
  liveResultsAvailable: boolean;
  liveResultsNote: string | null;
  intent: { primary: string; description: string };
  prompts: string[];
  topOrganicResults: { position?: number; title: string; link: string; snippet?: string }[];
}

type State = { kind: "loading" } | { kind: "error"; message: string } | { kind: "ok"; data: ResearchResponse };

export default function KeywordResearchView({ query, location }: { query: string; location: string }) {
  const project = useActiveProject();
  const [state, setState] = useState<State>({ kind: "loading" });
  const ownDomain = displayDomain(project?.website);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/research", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyword: query, location, language: "English" }),
    })
      .then(async (res) => {
        const data = (await res.json().catch(() => null)) as ResearchResponse | null;
        if (cancelled) return;
        if (!res.ok || !data?.success) setState({ kind: "error", message: data?.error ?? "We couldn't look up this search. Please try again." });
        else setState({ kind: "ok", data });
      })
      .catch(() => !cancelled && setState({ kind: "error", message: "We couldn't reach VSI. Check your connection and try again." }));
    return () => {
      cancelled = true;
    };
  }, [query, location]);

  return (
    <PageContainer>
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-support text-ink-3 hover:text-ink">
        <ArrowLeft size={14} strokeWidth={1.75} aria-hidden />
        Back to overview
      </Link>
      <PageHeader
        title={`“${query}”`}
        description={`Who Google shows for this search in ${location} right now.`}
        actions={
          <>
            <ButtonLink href={`/dashboard/check?tab=quick-check`} variant="secondary">
              Check it in AI answers
            </ButtonLink>
            {project && (
              <ButtonLink href={`/dashboard/clients/${project.id}/keywords/new`} variant="primary">
                Track this search
              </ButtonLink>
            )}
          </>
        }
      />

      <KeywordLookup initial={query} initialLocation={location} />

      {state.kind === "loading" && (
        <div className="space-y-3" aria-busy="true" aria-label="Loading results">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      )}

      {state.kind === "error" && <Notice tone="critical" title={state.message} />}

      {state.kind === "ok" && (
        <>
          <Section title="What people are likely looking for">
            <p className="max-w-[65ch] text-body text-ink-2">
              <span className="font-medium text-ink">{state.data.intent.primary}.</span> {state.data.intent.description}
            </p>
            <p className="text-caption text-ink-3">An estimate based on the words in the search.</p>
          </Section>

          <Section title="Who ranks on Google" description="The live top results for this search.">
            {!state.data.liveResultsAvailable ? (
              <Notice tone="attention" title="Live results aren't available">
                {state.data.liveResultsNote ?? "Try again in a moment."}
              </Notice>
            ) : state.data.topOrganicResults.length === 0 ? (
              <p className="text-body text-ink-2">Google returned no regular results for this search.</p>
            ) : (
              <ol className="divide-y divide-line rounded-panel border border-line bg-surface">
                {state.data.topOrganicResults.map((r, i) => {
                  const domain = displayDomain(r.link) ?? r.link;
                  const you = !!ownDomain && domain.split("/")[0].endsWith(ownDomain);
                  return (
                    <li key={i} className="flex gap-3 px-4 py-3">
                      <span className="w-6 shrink-0 text-support font-semibold tabular text-ink-3">{r.position ?? i + 1}</span>
                      <div className="min-w-0 flex-1">
                        <a href={r.link} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-full items-center gap-1 text-body font-medium text-ink hover:underline">
                          <span className="truncate">{r.title}</span>
                          <ExternalLink size={12} strokeWidth={1.75} className="shrink-0 text-ink-3" aria-hidden />
                        </a>
                        <p className="truncate text-caption text-ink-3">
                          {domain.split("/")[0]}
                          {you && <span className="ml-2 font-medium text-brand-strong">You</span>}
                        </p>
                        {r.snippet && <p className="mt-1 line-clamp-2 text-support text-ink-2">{r.snippet}</p>}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </Section>

          {state.data.prompts.length > 0 && (
            <Section title="Related questions to consider tracking" description="Ideas based on this search. Add the ones your customers really ask.">
              <ul className="space-y-2">
                {state.data.prompts.map((p, i) => (
                  <li key={i} className="text-body text-ink-2">
                    <Link href={`/dashboard?q=${encodeURIComponent(p)}&loc=${encodeURIComponent(location)}`} className="hover:text-ink hover:underline">
                      {p}
                    </Link>
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </>
      )}
    </PageContainer>
  );
}
