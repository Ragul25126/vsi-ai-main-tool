import "server-only";
import { createClient } from "@/lib/supabase/server";
import { isDummySupabase } from "@/lib/auth";
import { isMissingTableError, type AuditLoad, type StoredAudit } from "./store";

const AUDIT_COLUMNS = "id, status, domain, score, pages_scanned, checks, error_message, created_at, completed_at";

export async function loadSiteAudits(clientId: string): Promise<AuditLoad> {
  if (isDummySupabase()) return { state: "error", message: "VSI isn't connected to its database in this environment." };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_audits")
    .select(AUDIT_COLUMNS)
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })
    .limit(12);

  if (error) {
    if (isMissingTableError(error)) return { state: "setup_required" };
    console.error("[site-audit] load failed", { code: error.code });
    return { state: "error", message: "We couldn't load your audit results right now." };
  }

  const rows = (data ?? []) as StoredAudit[];
  const running = rows.find((r) => r.status === "running") ?? null;
  const completed = rows.find((r) => r.status === "completed") ?? null;
  const newestFinished = rows.find((r) => r.status !== "running") ?? null;
  const lastFailed = newestFinished?.status === "failed" ? newestFinished : null;
  const history = rows
    .filter((r) => r.status === "completed" && r.score !== null)
    .map(({ id, score, created_at }) => ({ id, score, created_at }))
    .reverse();
  return { state: "ok", completed, running, lastFailed, history };
}

export interface PageComparison {
  keywordId: string | null;
  keyword: string;
  url: string;
  weaknesses: string[];
  pageChanges: string[];
  checkedAt: string;
}

/**
 * Pages VSI compared with the pages AI answers cite (citation strategy).
 * This is real per-page evidence from the AI checks, shown in Site Audit so
 * the two features describe the same pages.
 */
export async function loadPageComparisons(clientId: string): Promise<PageComparison[]> {
  if (isDummySupabase()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("search_results")
    .select("tracked_keyword_id, keyword, citation_strategy, citation_strategy_at")
    .eq("client_id", clientId)
    .not("citation_strategy", "is", null)
    .order("citation_strategy_at", { ascending: false })
    .limit(60);
  if (error || !data) return [];

  const seen = new Set<string>();
  const out: PageComparison[] = [];
  for (const row of data as Array<{
    tracked_keyword_id: string | null;
    keyword: string;
    citation_strategy: { clientPageAudit?: { url?: string; weaknesses?: string[]; pageChanges?: string[] } | null } | null;
    citation_strategy_at: string | null;
  }>) {
    const audit = row.citation_strategy?.clientPageAudit;
    if (!audit?.url || !audit.weaknesses?.length) continue;
    const key = `${audit.url}::${row.keyword}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      keywordId: row.tracked_keyword_id,
      keyword: row.keyword,
      url: audit.url,
      weaknesses: audit.weaknesses.slice(0, 3),
      pageChanges: (audit.pageChanges ?? []).slice(0, 5),
      checkedAt: row.citation_strategy_at ?? "",
    });
  }
  return out.slice(0, 8);
}
