import "server-only";
import { createClient } from "@/lib/supabase/server";
import { isDummySupabase } from "@/lib/auth";
import { getSetting } from "@/lib/settings";
import { buildBrandTokens } from "@/lib/brand-match";
import { computeGeo, highlightBrand, type EngineId, type EvidenceSegment, type GeoRow, type GeoSummary } from "@/lib/geo";
import type { ProjectSummary } from "@/lib/project-types";
import type { AIOCitation } from "@/types/search";

const ROW_COLUMNS =
  "id, tracked_keyword_id, keyword, created_at, gap_label, aio_present, mentioned_in_text, client_cited, cited_domains, " +
  "ai_overview_present, ai_overview_client_cited, ai_overview_cited_domains, chatgpt_checked, chatgpt_brand_mentioned, " +
  "chatgpt_brand_cited, chatgpt_competitors, chatgpt_cited_urls";

export interface AnswerEvidence {
  keyword: string;
  keywordId: string | null;
  engineLabel: string;
  checkedAt: string;
  appears: boolean;
  segments: EvidenceSegment[];
  sources: { position: number; name: string; domain: string; url: string; you: boolean }[];
}

export type GeoLoad =
  | { state: "ok"; summary: GeoSummary; enabled: Record<EngineId, boolean>; evidence: AnswerEvidence[]; activeSearches: number }
  | { state: "error"; message: string };

function trimAnswer(text: string, max = 900): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

export async function loadGeo(project: ProjectSummary, opts: { evidence?: boolean } = {}): Promise<GeoLoad> {
  if (isDummySupabase()) return { state: "error", message: "VSI isn't connected to its database in this environment." };
  const supabase = await createClient();

  const since = new Date(Date.now() - 120 * 86_400_000).toISOString();
  const [clientRes, keywordsRes, rowsRes, chatgptSystem] = await Promise.all([
    supabase.from("clients").select("ai_mode_enabled, ai_overview_enabled, chatgpt_enabled").eq("id", project.id).maybeSingle(),
    supabase.from("tracked_keywords").select("id, is_active, track_type").eq("client_id", project.id),
    supabase.from("search_results").select(ROW_COLUMNS).eq("client_id", project.id).gte("created_at", since).order("created_at", { ascending: false }).limit(3000),
    getSetting<boolean>("chatgpt_api_enabled").catch(() => true),
  ]);

  if (rowsRes.error || keywordsRes.error) {
    console.error("[geo] load failed", { rows: rowsRes.error?.code, keywords: keywordsRes.error?.code });
    return { state: "error", message: "We couldn't load your AI visibility data right now." };
  }

  const client = clientRes.data as { ai_mode_enabled: boolean | null; ai_overview_enabled: boolean | null; chatgpt_enabled: boolean | null } | null;
  const enabled: Record<EngineId, boolean> = {
    google_ai_mode: client?.ai_mode_enabled ?? true,
    ai_overviews: client?.ai_overview_enabled ?? false,
    chatgpt: client?.chatgpt_enabled ?? chatgptSystem ?? true,
  };

  const active = new Set(
    ((keywordsRes.data ?? []) as { id: string; is_active: boolean; track_type: string }[])
      .filter((k) => k.is_active && (k.track_type === "geo" || k.track_type === "both"))
      .map((k) => k.id),
  );
  const rows = ((rowsRes.data ?? []) as unknown as GeoRow[]).filter((r) => !r.tracked_keyword_id || active.has(r.tracked_keyword_id));
  const summary = computeGeo(rows, { domain: project.website, enabled });

  const evidence = opts.evidence === false ? [] : await loadEvidence(project, summary);
  return { state: "ok", summary, enabled, evidence, activeSearches: active.size };
}

/**
 * Up to two real answers to show as evidence: one where you appear and one
 * where you don't (the opportunity). Texts come straight from stored checks.
 */
async function loadEvidence(project: ProjectSummary, summary: GeoSummary): Promise<AnswerEvidence[]> {
  const withAiMode = summary.searches.filter((s) => s.states.google_ai_mode !== "not_checked" && s.states.google_ai_mode !== "no_answer");
  const picks = [withAiMode.find((s) => s.appears), withAiMode.find((s) => !s.appears)].filter((p): p is NonNullable<typeof p> => !!p);
  if (picks.length === 0) return [];

  const supabase = await createClient();
  const tokens = buildBrandTokens({ brand: project.brandName || project.name, domain: project.website ?? "" });
  const out: AnswerEvidence[] = [];

  for (const pick of picks) {
    let q = supabase
      .from("search_results")
      .select("keyword, tracked_keyword_id, created_at, aio_full_text, aio_snippet, citations_json, mentioned_in_text, client_cited")
      .eq("client_id", project.id)
      .eq("aio_present", true)
      .order("created_at", { ascending: false })
      .limit(1);
    q = pick.keywordId ? q.eq("tracked_keyword_id", pick.keywordId) : q.eq("keyword", pick.keyword);
    const { data } = await q.maybeSingle();
    if (!data) continue;
    const text = (data.aio_full_text as string | null) || (data.aio_snippet as string | null) || "";
    if (!text) continue;
    const citations = ((data.citations_json as AIOCitation[] | null) ?? []).slice(0, 6);
    out.push({
      keyword: data.keyword as string,
      keywordId: (data.tracked_keyword_id as string | null) ?? null,
      engineLabel: "Google AI Mode",
      checkedAt: data.created_at as string,
      appears: pick.appears,
      segments: highlightBrand(trimAnswer(text), tokens),
      sources: citations.map((c, i) => ({
        position: c.position ?? i + 1,
        name: c.sourceName || c.domain,
        domain: c.domain,
        url: c.url,
        you: !!c.isClient,
      })),
    });
  }
  return out;
}
