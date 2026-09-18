import type { Metadata } from "next";
import { requireAgency } from "@/lib/auth";
import { getProjectContext } from "@/lib/project-context";
import { displayDomain } from "@/lib/project-types";
import { loadSearch } from "@/lib/search-load";
import { searchFindings } from "@/lib/search";
import { formatDateTime, formatShortDate } from "@/lib/format";
import SearchVisibilityView, { type SearchViewData } from "@/features/visibility/components/SearchVisibilityView";

export const metadata: Metadata = { title: "Search Visibility" };
export const dynamic = "force-dynamic";

export default async function SearchVisibilityPage() {
  const session = await requireAgency();
  const { active, error } = await getProjectContext(session);

  if (!active) {
    return <SearchVisibilityView data={{ project: null, state: error ? "error" : "no_project", errorMessage: error ?? undefined, findings: [], trend: [] }} />;
  }
  const project = { id: active.id, name: active.name, domain: displayDomain(active.website) };
  const load = await loadSearch(active);
  if (load.state === "error") {
    return <SearchVisibilityView data={{ project, state: "error", errorMessage: load.message, findings: [], trend: [] }} />;
  }

  const data: SearchViewData = {
    project,
    state: "ok",
    summary: {
      ...load.summary,
      searches: load.summary.searches.map((s) => ({ ...s, checkedAt: formatShortDate(s.checkedAt) })),
    },
    rankTrackingEnabled: load.rankTrackingEnabled,
    activeSearches: load.activeSearches,
    lastChecked: load.summary.lastCheckedAt ? formatDateTime(load.summary.lastCheckedAt) : null,
    findings: searchFindings(load.summary, active.id),
    trend: load.summary.trend.map((t) => ({ label: formatShortDate(t.date), value: t.value })),
  };
  return <SearchVisibilityView data={data} />;
}
