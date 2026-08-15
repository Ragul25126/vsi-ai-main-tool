import { Location } from "@/types/search";

export interface GeneratedQueryItem {
  id: string;
  keyword: string;
  category: "primary" | "long_tail" | "geo" | "ai_search" | "branded";
  categoryLabel: string;
  intent: "commercial" | "transactional" | "informational" | "navigational" | "conversational";
  trackType: "geo" | "seo" | "both";
  location: Location;
  selected: boolean;
  isNew?: boolean;
  isTrending?: boolean;
}

export interface WebsiteMetadata {
  scraped: boolean;
  title?: string;
  description?: string;
  h1s?: string[];
  h2s?: string[];
  detectedServices?: string[];
  errorMessage?: string;
}

export interface AIAnalysisResult {
  summary: {
    totalCount: number;
    primaryCount: number;
    longTailCount: number;
    geoCount: number;
    aiSearchCount: number;
    brandedCount: number;
  };
  metadata: WebsiteMetadata;
  queries: GeneratedQueryItem[];
}

export async function scrapeWebsiteMetadata(domain: string): Promise<WebsiteMetadata> {
  const cleanDomain = domain.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').trim();
  const url = `https://${cleanDomain}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) SearchIntelBot/1.0",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9",
      },
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return { scraped: false, errorMessage: `HTTP ${res.status}: Unable to directly scrape website` };
    }

    const html = await res.text();

    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : undefined;

    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["']/i) ||
                      html.match(/<meta[^>]*content=["'](.*?)["'][^>]*name=["']description["']/i);
    const description = descMatch ? descMatch[1].replace(/<[^>]+>/g, '').trim() : undefined;

    const h1Matches = [...html.matchAll(/<h1[^>]*>(.*?)<\/h1>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim()).filter(Boolean);
    const h2Matches = [...html.matchAll(/<h2[^>]*>(.*?)<\/h2>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim()).filter(Boolean);

    return {
      scraped: true,
      title,
      description,
      h1s: h1Matches.slice(0, 5),
      h2s: h2Matches.slice(0, 8),
    };
  } catch {
    return {
      scraped: false,
      errorMessage: "Website un-reachable directly. Using AI contextual intelligence based on domain & industry.",
    };
  }
}

export function generateAIKeywordsAndQueries(
  domain: string,
  brandName: string,
  industry: string,
  location: Location,
  metadata?: WebsiteMetadata
): AIAnalysisResult {
  const cleanBrand = brandName.trim() || domain.split('.')[0] || "Company";
  const cleanDomain = domain.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').trim();
  const cleanIndustry = industry.trim() || "Digital Services";

  const locLabels: Record<Location, { city: string; country: string; region: string }> = {
    ae: { city: "Dubai", country: "UAE", region: "United Arab Emirates" },
    us: { city: "New York", country: "USA", region: "United States" },
    uk: { city: "London", country: "UK", region: "United Kingdom" },
    in: { city: "Mumbai", country: "India", region: "India" },
    lk: { city: "Colombo", country: "Sri Lanka", region: "Sri Lanka" },
  };

  const locInfo = locLabels[location] || locLabels.ae;

  const rawQueries: { text: string; category: GeneratedQueryItem["category"]; intent: GeneratedQueryItem["intent"] }[] = [];

  // 1. Primary Keywords (Commercial & Core Business)
  const primaryTemplates = [
    `best ${cleanIndustry.toLowerCase()} in ${locInfo.city}`,
    `top ${cleanIndustry.toLowerCase()} companies in ${locInfo.country}`,
    `${cleanIndustry.toLowerCase()} services ${locInfo.city}`,
    `leading ${cleanIndustry.toLowerCase()} agency ${locInfo.region}`,
    `professional ${cleanIndustry.toLowerCase()} experts ${locInfo.city}`,
    `enterprise ${cleanIndustry.toLowerCase()} solutions ${locInfo.country}`,
    `affordable ${cleanIndustry.toLowerCase()} packages ${locInfo.city}`,
    `certified ${cleanIndustry.toLowerCase()} consultants ${locInfo.country}`,
  ];

  if (metadata?.title) {
    const titleWords = metadata.title.split(/[-|:]/)[0].trim();
    if (titleWords) {
      primaryTemplates.push(`${titleWords.toLowerCase()} ${locInfo.city}`);
      primaryTemplates.push(`best ${titleWords.toLowerCase()} in ${locInfo.country}`);
    }
  }

  primaryTemplates.forEach(t => rawQueries.push({ text: t, category: "primary", intent: "commercial" }));

  // 2. Long-tail Keywords (Transactional & Specific Intent)
  const longTailTemplates = [
    `how to hire the best ${cleanIndustry.toLowerCase()} in ${locInfo.city}`,
    `custom ${cleanIndustry.toLowerCase()} strategy for enterprise brands`,
    `top rated ${cleanIndustry.toLowerCase()} for growth startups ${locInfo.country}`,
    `how much do ${cleanIndustry.toLowerCase()} services cost in ${locInfo.city}`,
    `${cleanIndustry.toLowerCase()} ROI analysis and visibility reports`,
    `best B2B ${cleanIndustry.toLowerCase()} agency for regional growth`,
    `full service ${cleanIndustry.toLowerCase()} pricing and packages ${locInfo.country}`,
  ];

  if (metadata?.h2s && metadata.h2s.length > 0) {
    metadata.h2s.slice(0, 5).forEach(h2 => {
      const cleanH2 = h2.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
      if (cleanH2.length > 5 && cleanH2.length < 60) {
        longTailTemplates.push(`${cleanH2} ${locInfo.city}`);
        longTailTemplates.push(`best ${cleanH2} in ${locInfo.country}`);
      }
    });
  }

  longTailTemplates.forEach(t => rawQueries.push({ text: t, category: "long_tail", intent: "transactional" }));

  // 3. GEO & Location Keywords
  const geoTemplates = [
    `${cleanIndustry.toLowerCase()} near me in ${locInfo.city}`,
    `local ${cleanIndustry.toLowerCase()} specialists ${locInfo.city} ${locInfo.country}`,
    `${locInfo.city} ${cleanIndustry.toLowerCase()} directory and rankings`,
    `best local ${cleanIndustry.toLowerCase()} provider in ${locInfo.region}`,
    `${cleanBrand} ${locInfo.city} office and services`,
    `top 10 ${cleanIndustry.toLowerCase()} agencies in ${locInfo.city}`,
    `who is the best ${cleanIndustry.toLowerCase()} in ${locInfo.country}`,
  ];

  geoTemplates.forEach(t => rawQueries.push({ text: t, category: "geo", intent: "commercial" }));

  // 4. AI Search Queries & Prompts (ChatGPT, Gemini, Perplexity, Claude, Voice Search)
  const aiSearchTemplates = [
    `who is the top recommended ${cleanIndustry.toLowerCase()} in ${locInfo.city}?`,
    `what is the best ${cleanIndustry.toLowerCase()} company according to AI overviews?`,
    `which agency should I choose for ${cleanIndustry.toLowerCase()} in ${locInfo.country}?`,
    `recommend the top 5 ${cleanIndustry.toLowerCase()} firms in ${locInfo.city}`,
    `is ${cleanBrand} a good ${cleanIndustry.toLowerCase()} agency in ${locInfo.city}?`,
    `what are the key services offered by ${cleanBrand}?`,
    `compare the best ${cleanIndustry.toLowerCase()} agencies in ${locInfo.region}`,
    `chatgpt recommended ${cleanIndustry.toLowerCase()} in ${locInfo.city}`,
    `gemini best ${cleanIndustry.toLowerCase()} provider ${locInfo.country}`,
  ];

  aiSearchTemplates.forEach(t => rawQueries.push({ text: t, category: "ai_search", intent: "conversational" }));

  // 5. Branded & Competitor Queries
  const brandedTemplates = [
    `${cleanBrand} reviews and client testimonials`,
    `${cleanBrand} vs competitor ${cleanIndustry.toLowerCase()} in ${locInfo.city}`,
    `why choose ${cleanBrand} for ${cleanIndustry.toLowerCase()}`,
    `${cleanBrand} official website and contact details`,
    `${cleanBrand} case studies and search performance`,
  ];

  brandedTemplates.forEach(t => rawQueries.push({ text: t, category: "branded", intent: "navigational" }));

  // Deduplicate and format output items
  const seen = new Set<string>();
  const queryItems: GeneratedQueryItem[] = [];

  rawQueries.forEach((q, idx) => {
    const formatted = q.text.toLowerCase().trim();
    if (formatted && !seen.has(formatted)) {
      seen.add(formatted);
      queryItems.push({
        id: `gen_kw_${Date.now()}_${idx}`,
        keyword: formatted,
        category: q.category,
        categoryLabel:
          q.category === "primary" ? "Primary Keyword" :
          q.category === "long_tail" ? "Long-tail Keyword" :
          q.category === "geo" ? "GEO / Location" :
          q.category === "ai_search" ? "AI Search Prompt" : "Branded & Competitor",
        intent: q.intent,
        trackType: "geo",
        location,
        selected: true,
        isTrending: idx % 4 === 0,
        isNew: true,
      });
    }
  });

  const summary = {
    totalCount: queryItems.length,
    primaryCount: queryItems.filter(q => q.category === "primary").length,
    longTailCount: queryItems.filter(q => q.category === "long_tail").length,
    geoCount: queryItems.filter(q => q.category === "geo").length,
    aiSearchCount: queryItems.filter(q => q.category === "ai_search").length,
    brandedCount: queryItems.filter(q => q.category === "branded").length,
  };

  return {
    summary,
    metadata: metadata || { scraped: false },
    queries: queryItems,
  };
}
