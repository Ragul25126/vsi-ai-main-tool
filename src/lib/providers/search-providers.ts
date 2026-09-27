import { fetchRank } from "@/lib/serper";
import { searchSerpApi } from "@/lib/serpapi-service";
import { extractCleanDomain, isDomainMatch } from "@/lib/url-input";
import { isGenuineCompetitor } from "@/lib/competitor-filter";
import type { Location } from "@/types/search";
import type { SearchProvider, SearchQueryResult } from "./types";

export class SerperSearchProvider implements SearchProvider {
  name = "Serper.dev";

  isConfigured(): boolean {
    return !!(process.env.SERPER_API_KEY && process.env.SERPER_API_KEY.trim());
  }

  async search(query: string, location: string, domain: string, brand: string): Promise<SearchQueryResult> {
    const loc = (location || "us") as Location;
    const res = await fetchRank(query, domain, loc, brand);
    const cleanDomain = extractCleanDomain(domain);

    const isVisible = res.position !== null;

    return {
      query,
      engine: "Google",
      location: loc,
      timestamp: new Date().toISOString(),
      serpFeatures: res.serpFeatures || [],
      organicResults: (res.organicResults || []).map((r) => {
        const rDom = extractCleanDomain(r.url || r.domain);
        const isClient = isDomainMatch(cleanDomain, rDom);
        const isCompetitor = isGenuineCompetitor(rDom, cleanDomain, { title: r.title, snippet: r.snippet, url: r.url });
        return {
          position: r.position,
          title: r.title,
          url: r.url,
          domain: rDom,
          snippet: r.snippet,
          isClient,
          isCompetitor,
        };
      }),
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
    return !!(
      (process.env.SERPAPI_KEY && process.env.SERPAPI_KEY.trim()) ||
      (process.env.SERPAPI_API_KEY && process.env.SERPAPI_API_KEY.trim())
    );
  }

  async search(query: string, location: string, domain: string, _brand: string): Promise<SearchQueryResult> {
    const cleanDomain = extractCleanDomain(domain);
    const serpRes = await searchSerpApi(query, { gl: location || "us" });

    const organic = serpRes.results || [];
    const clientMatch = organic.find((r) => isDomainMatch(cleanDomain, r.link || r.source || ""));

    return {
      query,
      engine: "Google (SerpAPI)",
      location: location || "us",
      timestamp: new Date().toISOString(),
      serpFeatures: serpRes.knowledge_graph ? ["knowledge_graph"] : [],
      organicResults: organic.map((r) => {
        const rDom = extractCleanDomain(r.link || r.source || "");
        const isClient = isDomainMatch(cleanDomain, rDom);
        const isCompetitor = isGenuineCompetitor(rDom, cleanDomain, { title: r.title, snippet: r.snippet, url: r.link });

        return {
          position: r.position,
          title: r.title,
          url: r.link,
          domain: rDom,
          snippet: r.snippet,
          isClient,
          isCompetitor,
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
  if (process.env.SERPAPI_KEY?.trim() || process.env.SERPAPI_API_KEY?.trim()) {
    return new SerpApiSearchProvider();
  }
  if (process.env.SERPER_API_KEY?.trim()) {
    return new SerperSearchProvider();
  }
  return new UnconfiguredSearchProvider();
}

