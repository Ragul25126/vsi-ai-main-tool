import type { Metadata } from "next";
import { requireAgency, isDummySupabase } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getProjectContext } from "@/lib/project-context";
import { displayDomain, type ProjectSummary } from "@/lib/project-types";
import { loadGeo } from "@/lib/geo-load";
import { loadSearch } from "@/lib/search-load";
import { geoFindings } from "@/lib/geo-findings";
import { computeGooglePresence, mergeCompetitors, type SerpSnapshot } from "@/lib/competitors";
import { loadProjectCompetitors } from "@/lib/project-competitors-load";
import { Intro } from "@/components/intro/intros";
import CompetitorsView, { type CompetitorsViewData } from "@/features/visibility/components/CompetitorsView";

export const metadata: Metadata = { title: "Competitors" };
export const dynamic = "force-dynamic";

async function loadSerpSnapshots(project: ProjectSummary): Promise<SerpSnapshot[]> {
  if (isDummySupabase()) return [];
  const supabase = await createClient();
  const since = new Date(Date.now() - 45 * 86_400_000).toISOString();
  const { data, error } = await supabase
    .from("search_results")
    .select("tracked_keyword_id, keyword, created_at, serp_results_json")
    .eq("client_id", project.id)
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(400);
  if (error || !data) return [];
  const seen = new Set<string>();
  const out: SerpSnapshot[] = [];
  for (const row of data as { tracked_keyword_id: string | null; keyword: string; serp_results_json: SerpSnapshot["results"] | null }[]) {
    const key = row.tracked_keyword_id ?? row.keyword;
    if (seen.has(key) || !row.serp_results_json?.length) continue;
    seen.add(key);
    out.push({ keywordId: row.tracked_keyword_id, keyword: row.keyword, results: row.serp_results_json });
  }
  return out;
}

export default async function CompetitorsPage() {
  const session = await requireAgency();
  const { active, error } = await getProjectContext(session);
  if (!active && !error) return <Intro name="competitors" />;
  if (!active) {
    return <CompetitorsView data={{ project: null, state: error ? "error" : "no_project", errorMessage: error ?? undefined, rows: [], gaps: [], platforms: [], namedByChatGPT: [], you: null, finding: null, setup: { searches: 0, checked: false }, tracked: [], trackedState: "ok", ownWebsite: null }} />;
  }

  const project = { id: active.id, name: active.name, domain: displayDomain(active.website) };
  const [geo, search, snapshots, tracked] = await Promise.all([
    loadGeo(active, { evidence: false }),
    loadSearch(active),
    loadSerpSnapshots(active),
    loadProjectCompetitors(active.id),
  ]);
  if (geo.state === "error") {
    return <CompetitorsView data={{ project, state: "error", errorMessage: geo.message, rows: [], gaps: [], platforms: [], namedByChatGPT: [], you: null, finding: null, setup: { searches: 0, checked: false }, tracked: [], trackedState: "ok", ownWebsite: null }} />;
  }

  const summary = geo.summary;
  const merged = mergeCompetitors(summary, computeGooglePresence(snapshots, active.website), tracked.competitors.map((c) => c.domain));
  // Every competitor you added, then the most visible discovered ones.
  const rows = [...merged.filter((r) => r.tracked), ...merged.filter((r) => !r.tracked).slice(0, 10)];
  const gaps = summary.searches
    .filter((s) => s.answered && !s.appears && s.competitorsLinked.length > 0)
    .map((s) => ({ keyword: s.keyword, keywordId: s.keywordId, competitors: s.competitorsLinked.filter((d) => rows.some((r) => r.domain === d)).slice(0, 4) }))
    .filter((g) => g.competitors.length > 0);

  const data: CompetitorsViewData = {
    project,
    state: "ok",
    rows,
    you: {
      aiAnswers: summary.citations,
      googleTop10: search.state === "ok" ? search.summary.top10 : 0,
      searchesChecked: summary.searchesTracked,
    },
    gaps,
    platforms: summary.platforms,
    namedByChatGPT: summary.namedByChatGPT.slice(0, 10),
    finding: geoFindings(summary, active.id).find((f) => f.key === "geo:competitors_linked") ?? null,
    setup: { searches: geo.activeSearches, checked: summary.searchesTracked > 0 || snapshots.length > 0 },
    tracked: tracked.competitors,
    trackedState: tracked.state,
    ownWebsite: active.website,
  };
  return <CompetitorsView data={data} />;
}
