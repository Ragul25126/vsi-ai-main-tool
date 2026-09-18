import type { Metadata } from "next";
import { requireAgency } from "@/lib/auth";
import { getProjectContext } from "@/lib/project-context";
import { displayDomain } from "@/lib/project-types";
import { findingTaskKey, loadProjectOverview } from "@/lib/project-summary";
import NextActionsView, { type NextActionsData } from "@/features/actions/components/NextActionsView";

export const metadata: Metadata = { title: "Next Actions" };
export const dynamic = "force-dynamic";

export default async function NextActionsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { open } = await searchParams;
  const session = await requireAgency();
  const { active, error } = await getProjectContext(session);

  if (!active) {
    return <NextActionsView data={{ project: null, loadError: error, findings: [], withTasks: [], hasAnyData: false, moduleErrors: [], openKey: null }} />;
  }

  const o = await loadProjectOverview(active);
  const moduleErrors = [
    o.audit.state === "error" ? `Site Audit: ${o.audit.message}` : null,
    o.geo.state === "error" ? `AI Visibility: ${o.geo.message}` : null,
    o.search.state === "error" ? `Search Visibility: ${o.search.message}` : null,
  ].filter((m): m is string => !!m);

  const withTaskKeys = new Set(o.findingsWithTasks);
  const data: NextActionsData = {
    project: { id: active.id, name: active.name, domain: displayDomain(active.website) },
    loadError: null,
    findings: o.findings,
    withTasks: o.findings.filter((f) => withTaskKeys.has(findingTaskKey(f) ?? "")).map((f) => f.key),
    hasAnyData:
      (o.audit.state === "ok" && !!o.audit.completed) ||
      (o.geo.state === "ok" && o.geo.summary.searchesTracked > 0) ||
      (o.search.state === "ok" && o.search.summary.tracked > 0),
    moduleErrors,
    openKey: typeof open === "string" ? open : null,
  };
  return <NextActionsView data={data} />;
}
