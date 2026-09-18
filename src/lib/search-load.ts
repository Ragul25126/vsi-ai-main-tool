import "server-only";
import { createClient } from "@/lib/supabase/server";
import { isDummySupabase } from "@/lib/auth";
import { computeSearch, type RankRow, type SearchSummary } from "@/lib/search";
import type { ProjectSummary } from "@/lib/project-types";

export type SearchLoad =
  | { state: "ok"; summary: SearchSummary; rankTrackingEnabled: boolean; activeSearches: number }
  | { state: "error"; message: string };

export async function loadSearch(project: ProjectSummary): Promise<SearchLoad> {
  if (isDummySupabase()) return { state: "error", message: "VSI isn't connected to its database in this environment." };
  const supabase = await createClient();
  const since = new Date(Date.now() - 120 * 86_400_000).toISOString();

  const [clientRes, keywordsRes, rowsRes] = await Promise.all([
    supabase.from("clients").select("rank_tracking_enabled").eq("id", project.id).maybeSingle(),
    supabase.from("tracked_keywords").select("id, is_active, track_type").eq("client_id", project.id),
    supabase
      .from("search_results")
      .select("tracked_keyword_id, keyword, created_at, rank_position, rank_url")
      .eq("client_id", project.id)
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(3000),
  ]);

  if (keywordsRes.error || rowsRes.error) {
    console.error("[search] load failed", { keywords: keywordsRes.error?.code, rows: rowsRes.error?.code });
    return { state: "error", message: "We couldn't load your Google rankings right now." };
  }

  const rankTrackingEnabled = (clientRes.data as { rank_tracking_enabled: boolean | null } | null)?.rank_tracking_enabled ?? true;
  const keywords = (keywordsRes.data ?? []) as { id: string; is_active: boolean; track_type: string }[];
  const tracked = new Set(
    rankTrackingEnabled ? keywords.filter((k) => k.is_active && (k.track_type === "seo" || k.track_type === "both")).map((k) => k.id) : [],
  );

  return {
    state: "ok",
    summary: computeSearch((rowsRes.data ?? []) as RankRow[], tracked),
    rankTrackingEnabled,
    activeSearches: keywords.filter((k) => k.is_active).length,
  };
}
