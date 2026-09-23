import type { SearchQueryResult, AIResponseResult, TechnicalSeoIssue } from "./types";

export interface DataDrivenRecommendation {
  id: string;
  title: string;
  category: "seo" | "geo" | "competitor" | "technical";
  priority: "critical" | "high" | "medium";
  reason: string;
  evidence: string;
  affectedItems: string[];
  recommendedAction: string;
}

export function generateDataDrivenRecommendations(opts: {
  technicalIssues: TechnicalSeoIssue[];
  searchResults: SearchQueryResult[];
  aiResults: AIResponseResult[];
  competitorDomains: string[];
}): DataDrivenRecommendation[] {
  const recommendations: DataDrivenRecommendation[] = [];

  // 1. Technical SEO Recommendations from observed site crawl
  for (const issue of opts.technicalIssues) {
    if (issue.affectedCount > 0) {
      recommendations.push({
        id: `tech_${issue.checkId}`,
        title: issue.title,
        category: "technical",
        priority: issue.severity === "critical" ? "critical" : "high",
        reason: `${issue.description} (${issue.affectedCount} page${issue.affectedCount !== 1 ? "s" : ""} affected)`,
        evidence: `Affected URLs: ${issue.affectedUrls.slice(0, 3).join(", ")}${issue.affectedCount > 3 ? ` and ${issue.affectedCount - 3} more` : ""}`,
        affectedItems: issue.affectedUrls,
        recommendedAction: issue.recommendation,
      });
    }
  }

  // 2. Search Ranking Recommendations from observed SERP results
  const unrankedQueries = opts.searchResults.filter((r) => r.rankingPosition === null || r.rankingPosition > 10);
  if (unrankedQueries.length > 0) {
    const unrankedQueryList = unrankedQueries.map((q) => `"${q.query}"`);
    recommendations.push({
      id: "search_unranked_queries",
      title: "Improve Search Visibility for Unranked Topics",
      category: "seo",
      priority: "high",
      reason: `Your domain is absent from the top 10 Google search results for ${unrankedQueries.length} of ${opts.searchResults.length} tracked queries.`,
      evidence: `Queries lacking top-10 visibility: ${unrankedQueryList.slice(0, 4).join(", ")}${unrankedQueryList.length > 4 ? ` and ${unrankedQueryList.length - 4} more` : ""}`,
      affectedItems: unrankedQueries.map((q) => q.query),
      recommendedAction: "Optimize existing page content or publish dedicated authoritative guides targeting these exact search topics.",
    });
  }

  // 3. GEO / AI Visibility Recommendations from observed AI engine answers
  const unmentionedPrompts = opts.aiResults.filter((r) => !r.brandMentioned);
  if (unmentionedPrompts.length > 0) {
    const unmentionedPromptList = unmentionedPrompts.map((p) => `"${p.prompt}"`);
    recommendations.push({
      id: "geo_unmentioned_prompts",
      title: "Boost Brand Mentions in AI Engine Responses",
      category: "geo",
      priority: "critical",
      reason: `Your brand was absent from AI recommendations in ${unmentionedPrompts.length} of ${opts.aiResults.length} analyzed prompts.`,
      evidence: `Prompts missing brand mention: ${unmentionedPromptList.slice(0, 3).join(", ")}${unmentionedPromptList.length > 3 ? ` and ${unmentionedPromptList.length - 3} more` : ""}`,
      affectedItems: unmentionedPrompts.map((p) => p.prompt),
      recommendedAction: "Build high-authority digital PR, citation sources, and structured entity data so AI engines reference your business as a primary recommendation.",
    });
  }

  // 4. Competitor Dominance Recommendations
  const competitorMentions = opts.aiResults.filter((r) => r.competitorsMentioned.length > 0);
  if (competitorMentions.length > 0) {
    const competitorsList = Array.from(new Set(opts.aiResults.flatMap((r) => r.competitorsMentioned)));
    recommendations.push({
      id: "competitor_ai_dominance",
      title: "Counter Competitor Presence in AI Comparisons",
      category: "competitor",
      priority: "high",
      reason: `Competitor brands (${competitorsList.join(", ")}) were cited in ${competitorMentions.length} AI responses.`,
      evidence: `Competitors cited across analyzed prompts: ${competitorsList.join(", ")}`,
      affectedItems: competitorsList,
      recommendedAction: "Create direct comparison landing pages and feature matrix content comparing your capabilities against key competitors.",
    });
  }

  return recommendations;
}
