import { fetchRank } from "@/lib/serper";
import { searchSerpApi } from "@/lib/serpapi-service";
import type { Location } from "@/types/search";
import type { SearchProvider, SearchQueryResult } from "./types";

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export class SerperSearchProvider implements SearchProvider {
  name = "Serper.dev";

  isConfigured(): boolean {
    return !!process.env.SERPER_API_KEY;
  }

  async search(query: string, location: string, domain: string, brand: string): Promise<SearchQueryResult> {
    const loc = (location || "us") as Location;
    const res = await fetchRank(query, domain, loc, brand);
    const cleanDomain = domain.toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];

    const isVisible = res.position !== null;

    return {
      query,
      engine: "Google",
      location: loc,
      timestamp: new Date().toISOString(),
      serpFeatures: res.serpFeatures || [],
      organicResults: (res.organicResults || []).map((r) => ({
        position: r.position,
        title: r.title,
        url: r.url,
        domain: r.domain,
        snippet: r.snippet,
        isClient: r.isClient,
        isCompetitor: false,
      })),
      rankingPosition: res.position,
      rankingUrl: res.rankingUrl,
      rankingTitle: res.rankingTitle,
      is_visible: isVisible,
      rawResponse: res,
    };
  }
}

export class SerpApiSearchProvider implements SearchProvider {
  name = "SerpAPI";

  isConfigured(): boolean {
    return !!(process.env.SERPAPI_KEY || process.env.SERPAPI_API_KEY);
  }

  async search(query: string, location: string, domain: string, _brand: string): Promise<SearchQueryResult> {
    const cleanDomain = domain.toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
    const serpRes = await searchSerpApi(query, { gl: location || "us" });

    const organic = serpRes.results || [];
    const clientMatch = organic.find((r) => extractDomain(r.link).includes(cleanDomain) || cleanDomain.includes(extractDomain(r.link)));

    return {
      query,
      engine: "Google (SerpAPI)",
      location: location || "us",
      timestamp: new Date().toISOString(),
      serpFeatures: serpRes.knowledge_graph ? ["knowledge_graph"] : [],
      organicResults: organic.map((r) => {
        const rDom = extractDomain(r.link);
        return {
          position: r.position,
          title: r.title,
          url: r.link,
          domain: rDom,
          snippet: r.snippet,
          isClient: rDom.includes(cleanDomain) || cleanDomain.includes(rDom),
        };
      }),
      rankingPosition: clientMatch?.position ?? null,
      rankingUrl: clientMatch?.link ?? null,
      rankingTitle: clientMatch?.title ?? null,
      is_visible: !!clientMatch,
      rawResponse: serpRes,
    };
  }
}

export class UnconfiguredSearchProvider implements SearchProvider {
  name = "Unconfigured Provider";

  isConfigured(): boolean {
    return false;
  }

  async search(query: string, location: string, _domain: string, _brand: string): Promise<SearchQueryResult> {
    return {
      query,
      engine: "Unconfigured",
      location: location || "us",
      timestamp: new Date().toISOString(),
      serpFeatures: [],
      organicResults: [],
      rankingPosition: null,
      rankingUrl: null,
      rankingTitle: null,
      is_visible: false,
      rawResponse: { error: "Search provider credentials (SERPER_API_KEY / SERPAPI_KEY) not configured." },
    };
  }
}

export function getSearchProvider(): SearchProvider {
  if (process.env.SERPER_API_KEY) {
    return new SerperSearchProvider();
  }
  if (process.env.SERPAPI_KEY || process.env.SERPAPI_API_KEY) {
    return new SerpApiSearchProvider();
  }
  return new UnconfiguredSearchProvider();
}
