import type { SearchQueryResult, AIResponseResult, VisibilityMetricsResult } from "./types";

export function calculateVisibilityMetrics(
  searchResults: SearchQueryResult[],
  aiResults: AIResponseResult[],
  trackedCompetitors: string[] = []
): VisibilityMetricsResult {
  // ─────────────────────────────────────────
  // SEARCH VISIBILITY METRICS
  // ─────────────────────────────────────────
  const searchQueriesAnalyzed = searchResults.length;
  const visibleSearchResults = searchResults.filter((r) => r.is_visible && r.rankingPosition !== null);
  const searchQueriesVisible = visibleSearchResults.length;

  let searchVisibilityRate: number | null = null;
  let searchTop3Rate: number | null = null;
  let searchTop10Rate: number | null = null;
  let searchAvgPosition: number | null = null;

  if (searchQueriesAnalyzed > 0) {
    searchVisibilityRate = searchQueriesVisible / searchQueriesAnalyzed;
    
    const top3Count = searchResults.filter((r) => r.rankingPosition !== null && r.rankingPosition <= 3).length;
    searchTop3Rate = top3Count / searchQueriesAnalyzed;

    const top10Count = searchResults.filter((r) => r.rankingPosition !== null && r.rankingPosition <= 10).length;
    searchTop10Rate = top10Count / searchQueriesAnalyzed;
  }

  if (searchQueriesVisible > 0) {
    const totalPos = visibleSearchResults.reduce((sum, r) => sum + (r.rankingPosition ?? 0), 0);
    searchAvgPosition = Math.round((totalPos / searchQueriesVisible) * 10) / 10;
  }

  // ─────────────────────────────────────────
  // AI VISIBILITY METRICS
  // ─────────────────────────────────────────
  const aiPromptsAnalyzed = aiResults.length;
  const mentionedAiResults = aiResults.filter((r) => r.brandMentioned);
  const aiBrandMentions = mentionedAiResults.length;
  
  const citedAiResults = aiResults.filter((r) => r.isTargetCited);
  const aiCitationsCount = aiResults.reduce((sum, r) => sum + r.citations.length, 0);

  let aiMentionRate: number | null = null;
  let aiCitationRate: number | null = null;

  if (aiPromptsAnalyzed > 0) {
    aiMentionRate = aiBrandMentions / aiPromptsAnalyzed;
    aiCitationRate = citedAiResults.length / aiPromptsAnalyzed;
  }

  // ─────────────────────────────────────────
  // COMPETITOR APPEARANCES METRICS
  // ─────────────────────────────────────────
  let competitorAppearances = 0;
  for (const r of aiResults) {
    competitorAppearances += r.competitorsMentioned.length;
  }

  return {
    searchVisibilityRate,
    searchTop3Rate,
    searchTop10Rate,
    searchAvgPosition,
    searchQueriesAnalyzed,
    searchQueriesVisible,

    aiMentionRate,
    aiCitationRate,
    aiPromptsAnalyzed,
    aiBrandMentions,
    aiCitationsCount,

    competitorsTracked: trackedCompetitors.length,
    competitorAppearances,
  };
}
