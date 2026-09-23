export interface SearchQueryResult {
  query: string;
  engine: string;
  location: string;
  language?: string;
  device?: string;
  timestamp: string;
  serpFeatures: string[];
  organicResults: Array<{
    position: number;
    title: string;
    url: string;
    domain: string;
    snippet?: string | null;
    isClient: boolean;
    isCompetitor?: boolean;
  }>;
  rankingPosition: number | null;
  rankingUrl: string | null;
  rankingTitle: string | null;
  is_visible: boolean;
  rawResponse?: unknown;
}

export interface SearchProvider {
  name: string;
  isConfigured(): boolean;
  search(query: string, location: string, domain: string, brand: string): Promise<SearchQueryResult>;
  searchBulkCompetitors?(query: string, competitorDomains: string[], location: string): Promise<Record<string, { position: number | null; url: string | null }>>;
}

export interface AIResponseResult {
  providerName: string;
  modelName: string;
  prompt: string;
  timestamp: string;
  rawResponse: string;
  responseId?: string;
  latencyMs?: number;
  brandMentioned: boolean;
  mentionCount: number;
  competitorsMentioned: string[];
  citations: string[];
  isTargetCited: boolean;
  error?: string | null;
}

export interface AIProviderAdapter {
  name: string;
  isConfigured(): boolean;
  generateResponse(prompt: string, brand: string, domain: string, competitors: string[]): Promise<AIResponseResult>;
}

export interface TechnicalSeoIssue {
  checkId: string;
  title: string;
  severity: "critical" | "warning" | "info";
  description: string;
  affectedCount: number;
  affectedUrls: string[];
  recommendation: string;
}

export interface VisibilityMetricsResult {
  searchVisibilityRate: number | null; // e.g. 0.68 (68%)
  searchTop3Rate: number | null;
  searchTop10Rate: number | null;
  searchAvgPosition: number | null;
  searchQueriesAnalyzed: number;
  searchQueriesVisible: number;
  
  aiMentionRate: number | null; // e.g. 0.625 (62.5%)
  aiCitationRate: number | null;
  aiPromptsAnalyzed: number;
  aiBrandMentions: number;
  aiCitationsCount: number;

  competitorsTracked: number;
  competitorAppearances: number;
}
