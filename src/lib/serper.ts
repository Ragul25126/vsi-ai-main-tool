import type { SerpResult, OrganicResult, Location } from "@/types/search";
import { LOCATIONS, detectPlatform } from "@/types/search";
import { extractCleanDomain, isDomainMatch } from "@/lib/url-input";

interface SerperOrganicResult {
  position: number;
  title: string;
  link: string;
  snippet?: string;
}

interface SerperResponse {
  organic?: SerperOrganicResult[];
  knowledgeGraph?: object;
  answerBox?: object;
  peopleAlsoAsk?: object[];
  topStories?: object[];
  images?: object[];
  videos?: object[];
}

function detectSerpFeatures(raw: SerperResponse): string[] {
  const features: string[] = [];
  if (raw.knowledgeGraph) features.push("knowledge_graph");
  if (raw.answerBox) features.push("answer_box");
  if (raw.peopleAlsoAsk?.length) features.push("people_also_ask");
  if (raw.topStories?.length) features.push("top_stories");
  if (raw.images?.length) features.push("images");
  if (raw.videos?.length) features.push("videos");
  return features;
}

export interface DomainRank {
  domain: string;
  position: number | null;
  url: string | null;
  title: string | null;
}

async function fetchOrganicResults(keyword: string, loc: typeof LOCATIONS[Location], key: string): Promise<SerperResponse> {
  // First try Serper endpoint if a dedicated SERPER_API_KEY is configured
  if (process.env.SERPER_API_KEY && process.env.SERPER_API_KEY.trim() && process.env.SERPER_API_KEY !== process.env.SERPAPI_KEY && process.env.SERPER_API_KEY !== process.env.SERPAPI_API_KEY) {
    try {
      const res = await fetch("https://google.serper.dev/search", {
        method: "POST",
        headers: { "X-API-KEY": process.env.SERPER_API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({
          q: keyword,
          gl: loc.gl,
          hl: loc.hl,
          location: loc.location,
          num: 100,
        }),
        signal: AbortSignal.timeout(15000),
      });

      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fall back to SerpAPI if Serper fails
    }
  }

  // Primary / Fallback to SerpAPI
  const serpApiKey = process.env.SERPAPI_KEY || process.env.SERPAPI_API_KEY || process.env.SEARCHAPI_KEY || key;
  if (!serpApiKey || !serpApiKey.trim()) {
    throw new Error("SerpAPI key is missing or unconfigured. Real SerpAPI key is required for SEO analysis.");
  }

  const searchParams = new URLSearchParams({
    engine: "google",
    q: keyword,
    gl: loc.gl,
    hl: loc.hl,
    num: "100",
    api_key: serpApiKey,
  });

  if (loc.location) {
    searchParams.set("location", loc.location);
  }

  const url = `https://serpapi.com/search.json?${searchParams.toString()}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(20000) });

  if (res.status === 401 || res.status === 403) {
    throw new Error("SerpAPI authentication error (Invalid or unauthorized API key)");
  }
  if (res.status === 429) {
    throw new Error("SerpAPI rate limit exceeded");
  }
  if (!res.ok) {
    throw new Error(`SerpApi HTTP status ${res.status}`);
  }

  const data = await res.json();
  if (data.error) throw new Error(`SerpApi error: ${data.error}`);

  const organic: SerperOrganicResult[] = (data.organic_results || []).map((r: { position?: number; title?: string; link?: string; snippet?: string }, idx: number) => ({
    position: r.position ?? idx + 1,
    title: r.title ?? "",
    link: r.link ?? "",
    snippet: r.snippet ?? "",
  }));

  return {
    organic,
    knowledgeGraph: data.knowledge_graph,
    answerBox: data.answer_box,
    peopleAlsoAsk: data.related_questions,
  };
}

export async function fetchBulkRanks(
  keyword: string,
  domains: string[],
  location: Location
): Promise<DomainRank[]> {
  const key = process.env.SERPAPI_KEY || process.env.SERPAPI_API_KEY || process.env.SERPER_API_KEY || process.env.SEARCHAPI_KEY || "";
  const loc = LOCATIONS[location];
  const raw = await fetchOrganicResults(keyword, loc, key);
  const organic = raw.organic ?? [];

  return domains.map((domain) => {
    const clean = extractCleanDomain(domain);
    const match = organic.find((r) => isDomainMatch(clean, r.link));
    return {
      domain,
      position: match?.position ?? null,
      url: match?.link ?? null,
      title: match?.title ?? null,
    };
  });
}

export async function fetchRank(
  keyword: string,
  domain: string,
  location: Location,
  _brand: string = ""
): Promise<SerpResult> {
  const key = process.env.SERPAPI_KEY || process.env.SERPAPI_API_KEY || process.env.SERPER_API_KEY || process.env.SEARCHAPI_KEY || "";
  const loc = LOCATIONS[location];
  const raw = await fetchOrganicResults(keyword, loc, key);

  const cleanDomain = extractCleanDomain(domain);
  const match = raw.organic?.find((r) => isDomainMatch(cleanDomain, r.link));

  const organicResults: OrganicResult[] = (raw.organic ?? [])
    .slice(0, 10)
    .map((r) => {
      const rDomain = extractCleanDomain(r.link);
      const isClient = isDomainMatch(cleanDomain, rDomain);
      return {
        position: r.position,
        title: r.title,
        url: r.link,
        domain: rDomain,
        snippet: r.snippet ?? null,
        isClient,
        platform: detectPlatform(rDomain, cleanDomain),
      };
    });

  return {
    keyword,
    domain,
    location,
    position: match?.position ?? null,
    rankingUrl: match?.link ?? null,
    rankingTitle: match?.title ?? null,
    serpFeatures: detectSerpFeatures(raw),
    organicResults,
  };
}


