export interface SerpSearchResultItem {
  position: number;
  title: string;
  link: string;
  snippet?: string;
  source?: string;
}

export interface SerpSearchResponse {
  success: true;
  query: string;
  total_results: number;
  results: SerpSearchResultItem[];
  related_searches?: string[];
  related_questions?: string[];
  knowledge_graph?: {
    title?: string;
    type?: string;
    description?: string;
  };
}

export class SerpApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = "SerpApiError";
    this.statusCode = statusCode;
  }
}

export async function searchSerpApi(
  query: string,
  options: { engine?: string; gl?: string; hl?: string; num?: number } = {}
): Promise<SerpSearchResponse> {
  const apiKey = process.env.SERPAPI_KEY || process.env.SERPAPI_API_KEY || process.env.SERPER_API_KEY || process.env.SEARCHAPI_KEY;

  if (!apiKey || !apiKey.trim()) {
    throw new SerpApiError("SerpAPI key is missing or unconfigured.", 401);
  }

  const { engine = "google", gl = "us", hl = "en", num = 10 } = options;

  const searchUrl = new URL("https://serpapi.com/search.json");
  searchUrl.searchParams.set("engine", engine);
  searchUrl.searchParams.set("q", query);
  searchUrl.searchParams.set("gl", gl);
  searchUrl.searchParams.set("hl", hl);
  searchUrl.searchParams.set("num", num.toString());
  searchUrl.searchParams.set("api_key", apiKey);

  try {
    const response = await fetch(searchUrl.toString(), {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
      signal: AbortSignal.timeout(30000),
    });

    if (response.status === 401 || response.status === 403) {
      throw new SerpApiError("Invalid or unauthorized SerpAPI key.", 401);
    }

    if (response.status === 429) {
      throw new SerpApiError("SerpAPI rate limit exceeded. Please try again later.", 429);
    }

    if (!response.ok) {
      throw new SerpApiError(`SerpAPI returned HTTP status ${response.status}`, 502);
    }

    const data = await response.json();

    if (data.error) {
      if (typeof data.error === "string" && (data.error.includes("Invalid API key") || data.error.includes("api_key"))) {
        throw new SerpApiError("SerpAPI authentication error.", 401);
      }
      throw new SerpApiError(`SerpAPI error: ${data.error}`, 502);
    }

    const organicResults = (data.organic_results || []).map((item: { position?: number; title?: string; link?: string; snippet?: string; snippet_highlighted_words?: string[]; displayed_link?: string; source?: string }, index: number) => ({
      position: item.position ?? index + 1,
      title: item.title ?? "",
      link: item.link ?? "",
      snippet: item.snippet ?? item.snippet_highlighted_words?.join(" ") ?? "",
      source: item.displayed_link ?? item.source ?? "",
    }));

    const relatedSearches = (data.related_searches || [])
      .map((item: { query?: string }) => item.query ?? "")
      .filter((q: string) => q.trim().length > 0);

    const relatedQuestions = (data.related_questions || [])
      .map((item: { question?: string }) => item.question ?? "")
      .filter((q: string) => q.trim().length > 0);

    const knowledgeGraph = data.knowledge_graph
      ? {
          title: data.knowledge_graph.title,
          type: data.knowledge_graph.type,
          description: data.knowledge_graph.description,
        }
      : undefined;

    return {
      success: true,
      query,
      total_results: organicResults.length,
      results: organicResults,
      related_searches: relatedSearches,
      related_questions: relatedQuestions,
      knowledge_graph: knowledgeGraph,
    };
  } catch (error: unknown) {
    if (error instanceof SerpApiError) {
      throw error;
    }
    if (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")) {
      throw new SerpApiError("SerpAPI request timed out.", 504);
    }
    throw new SerpApiError("Failed to fetch search results from search service.", 500);
  }
}
