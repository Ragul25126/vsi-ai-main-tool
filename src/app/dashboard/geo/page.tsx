import type { Metadata } from "next";
import { requireAgency } from "@/lib/auth";
import { getProjectContext } from "@/lib/project-context";
import { displayDomain } from "@/lib/project-types";
import { loadGeo } from "@/lib/geo-load";
import { geoFindings, pageClarityFinding } from "@/lib/geo-findings";
import { loadPageComparisons } from "@/lib/site-audit/load";
import { loadProjectCompetitors } from "@/lib/project-competitors-load";
import { daysAgo, formatDate, formatDateTime, formatShortDate } from "@/lib/format";
import { Intro } from "@/components/intro/intros";
import GeoView, { type GeoViewData } from "@/features/geo/components/GeoView";

export const metadata: Metadata = { title: "AI Visibility" };
export const dynamic = "force-dynamic";

export default async function GeoPage() {
  const session = await requireAgency();
  const { active, error } = await getProjectContext(session);

  if (!active && !error) return <Intro name="ai" />;
  if (!active) {
    const data: GeoViewData = { project: null, state: error ? "error" : "no_project", errorMessage: error ?? undefined, findings: [], evidence: [], trend: [] };
    return <GeoView data={data} />;
  }

  const project = { id: active.id, name: active.name, domain: displayDomain(active.website) };
  const [load, comparisons, competitors] = await Promise.all([loadGeo(active), loadPageComparisons(active.id), loadProjectCompetitors(active.id)]);
  const tracked = competitors.competitors.map((c) => c.domain);

  if (load.state === "error") {
    return <GeoView data={{ project, state: "error", errorMessage: load.message, findings: [], evidence: [], trend: [] }} />;
  }

  const clarity = pageClarityFinding(comparisons, active.id);
  const findings = [...geoFindings(load.summary, active.id, tracked), ...(clarity ? [clarity] : [])].sort((a, b) => b.priority - a.priority);
  const age = daysAgo(load.summary.lastCheckedAt);

  const data: GeoViewData = {
    project,
    state: "ok",
    summary: load.summary,
    enabled: load.enabled,
    activeSearches: load.activeSearches,
    lastChecked: load.summary.lastCheckedAt ? formatDateTime(load.summary.lastCheckedAt) : null,
    staleDays: age !== null && age > 14 ? age : null,
    findings,
    trackedCompetitors: tracked,
    evidence: load.evidence.map((e) => ({ ...e, checkedAt: formatDate(e.checkedAt) })),
    trend: load.summary.trend.map((t) => ({ label: formatShortDate(t.date), value: t.value })),
  };
  return <GeoView data={data} />;
}
