import { NextRequest, NextResponse } from "next/server";
import { normaliseDomain } from "@/lib/url-input";
import { scrapeUrl } from "@/lib/firecrawl";
import { callOpenRouter } from "@/lib/llm";
import { LOCATIONS, type Location } from "@/types/search";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export interface ExtractedWebsiteData {
  brandName: string;
  domain: string;
  businessType: string;
  websiteTitle: string;
  metaDescription: string;
  language: string;
  location: string;
  locationCode: Location;
  suggestedTopics: string[];
  suggestedKeywords: Array<{
    keyword: string;
    category: "primary" | "long_tail" | "geo" | "ai_search" | "branded";
    categoryLabel: string;
    selected: boolean;
  }>;
  sitemapUrl: string;
  competitiveAdvantage: string;
  aboutBusiness: string;
  targetCustomers: string[];
  suggestedCompetitors: Array<{
    domain: string;
    name: string;
    market: string;
    selected: boolean;
  }>;
  geoTopics: string[];
}

/** Helper to clean domain name for brand fallback */
function extractBrandFromDomain(domain: string): string {
  const parts = domain.split(".");
  if (parts.length >= 2) {
    const main = parts[parts.length - 2];
    return main.charAt(0).toUpperCase() + main.slice(1);
  }
  return domain;
}

/** Fallback extraction using domain and HTML heuristics */
function generateFallbackData(domain: string, title?: string, description?: string, h1s?: string[]): ExtractedWebsiteData {
  const brand = extractBrandFromDomain(domain);
  const cleanTitle = title?.trim() || `${brand} Official Website`;
  const cleanDesc = description?.trim() || `${brand} provides products and services online.`;

  return {
    brandName: brand,
    domain: domain,
    businessType: "E-commerce & Online Services",
    websiteTitle: cleanTitle,
    metaDescription: cleanDesc,
    language: "English",
    location: "United States",
    locationCode: "us",
    suggestedTopics: [
      `${brand} Products`,
      "Online Shopping",
      "Customer Services",
      "Deals & Offers",
      "Trending Collections",
    ],
    suggestedKeywords: [
      { keyword: `best ${brand.toLowerCase()} products`, category: "primary", categoryLabel: "Primary Search", selected: true },
      { keyword: `buy ${brand.toLowerCase()} online`, category: "long_tail", categoryLabel: "Transactional", selected: true },
      { keyword: `${brand.toLowerCase()} review`, category: "branded", categoryLabel: "Branded Search", selected: true },
      { keyword: `top deals on ${brand.toLowerCase()}`, category: "primary", categoryLabel: "Primary Search", selected: true },
      { keyword: `who is the leading ${brand.toLowerCase()} provider`, category: "ai_search", categoryLabel: "AI Overview", selected: true },
    ],
    sitemapUrl: `https://${domain}/sitemap.xml`,
    competitiveAdvantage: `${brand} offers high quality products with fast customer service and reliable shipping.`,
    aboutBusiness: cleanDesc,
    targetCustomers: ["Online shoppers", "Individual consumers", "Small businesses"],
    suggestedCompetitors: [
      { domain: `competitor-${domain}`, name: `Top Competitor 1`, market: "United States", selected: true },
      { domain: `leading-market-${domain}`, name: `Market Leader 2`, market: "United States", selected: true },
    ],
    geoTopics: [
      `What are the best products from ${brand}?`,
      `How does ${brand} compare to top competitors?`,
      `Where is ${brand} headquartered and available?`,
    ],
  };
}

export async function POST(req: NextRequest) {
  try {
    let body: { url?: unknown };
    try {
      body = (await req.json()) as { url?: unknown };
    } catch {
      return NextResponse.json({ success: false, error: "Please enter a valid website URL." }, { status: 400 });
    }

    const rawUrl = typeof body.url === "string" ? body.url.trim() : "";
    if (!rawUrl) {
      return NextResponse.json({ success: false, error: "Please enter a valid website URL." }, { status: 400 });
    }

    // Add protocol if missing for normalisation
    const urlWithProto = rawUrl.startsWith("http://") || rawUrl.startsWith("https://") ? rawUrl : `https://${rawUrl}`;
    const parsed = normaliseDomain(urlWithProto);

    if (!parsed?.domain) {
      return NextResponse.json({ success: false, error: "Please enter a valid website URL." }, { status: 400 });
    }

    const targetUrl = `https://${parsed.domain}`;

    // Scrape website using Firecrawl or fallback scraper
    let scrapedResult;
    try {
      scrapedResult = await scrapeUrl(targetUrl);
    } catch {
      return NextResponse.json(
        { success: false, error: "We couldn't access this website. Please check the URL and try again." },
        { status: 400 }
      );
    }

    const { markdown, title, description } = scrapedResult;

    if (!markdown && !title && !description) {
      return NextResponse.json(
        { success: false, error: "We couldn't access this website. Please check the URL and try again." },
        { status: 400 }
      );
    }

    // Use LLM to extract structured website business analysis if API Key is available
    const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;

    if (apiKey && process.env.OPENROUTER_API_KEY) {
      const systemPrompt = "You are an expert AI business and SEO analyst. Respond ONLY with valid JSON.";
      const userPrompt = `Analyze this website content and extract comprehensive business intelligence.

Website Domain: ${parsed.domain}
Website Title: ${title ?? "N/A"}
Meta Description: ${description ?? "N/A"}

Scraped Content Preview (Markdown):
"""
${markdown.slice(0, 3500)}
"""

Return JSON in this EXACT structure:
{
  "brandName": "Brand Name",
  "businessType": "Industry / Category",
  "language": "Primary Language e.g. English",
  "location": "Primary Country e.g. India or United States or United Arab Emirates",
  "locationCode": "ae" | "us" | "uk" | "in" | "lk" | "sg",
  "suggestedTopics": ["Topic 1", "Topic 2", "Topic 3", "Topic 4", "Topic 5"],
  "suggestedKeywords": [
    { "keyword": "search query 1", "category": "primary", "categoryLabel": "Primary Keyword", "selected": true },
    { "keyword": "search query 2", "category": "geo", "categoryLabel": "Location Search", "selected": true },
    { "keyword": "search query 3", "category": "ai_search", "categoryLabel": "AI Search Prompt", "selected": true }
  ],
  "sitemapUrl": "https://${parsed.domain}/sitemap.xml",
  "competitiveAdvantage": "One punchy sentence describing key edge or value proposition.",
  "aboutBusiness": "2-3 concise sentences summarizing what the business does and sells.",
  "targetCustomers": ["Group 1", "Group 2", "Group 3"],
  "suggestedCompetitors": [
    { "domain": "competitor1.com", "name": "Competitor One", "market": "Country / Global", "selected": true },
    { "domain": "competitor2.com", "name": "Competitor Two", "market": "Country / Global", "selected": true }
  ],
  "geoTopics": ["Topic / Query 1 for AI search", "Topic / Query 2 for AI search"]
}`;

      try {
        const { content } = await callOpenRouter(
          "meta-llama/llama-3.3-70b-instruct:free",
          systemPrompt,
          userPrompt,
          process.env.OPENROUTER_API_KEY
        );

        if (content) {
          const match = content.match(/\{[\s\S]*\}/);
          if (match) {
            const parsedData = JSON.parse(match[0]);
            const finalData: ExtractedWebsiteData = {
              brandName: parsedData.brandName || extractBrandFromDomain(parsed.domain),
              domain: parsed.domain,
              businessType: parsedData.businessType || "Online Retail / Services",
              websiteTitle: title || parsedData.brandName || parsed.domain,
              metaDescription: description || parsedData.aboutBusiness || "",
              language: parsedData.language || "English",
              location: parsedData.location || "United States",
              locationCode: (["ae", "us", "uk", "in", "lk", "sg"].includes(parsedData.locationCode) ? parsedData.locationCode : "us") as Location,
              suggestedTopics: Array.isArray(parsedData.suggestedTopics) && parsedData.suggestedTopics.length > 0
                ? parsedData.suggestedTopics
                : [`${parsedData.brandName || parsed.domain} Services`, "Online Solutions"],
              suggestedKeywords: Array.isArray(parsedData.suggestedKeywords) ? parsedData.suggestedKeywords : [],
              sitemapUrl: parsedData.sitemapUrl || `https://${parsed.domain}/sitemap.xml`,
              competitiveAdvantage: parsedData.competitiveAdvantage || "Leading provider with dedicated customer focus.",
              aboutBusiness: parsedData.aboutBusiness || description || "Comprehensive products and service provider.",
              targetCustomers: Array.isArray(parsedData.targetCustomers) ? parsedData.targetCustomers : ["Consumers", "Businesses"],
              suggestedCompetitors: Array.isArray(parsedData.suggestedCompetitors) ? parsedData.suggestedCompetitors.map((c: { domain?: string; name?: string; market?: string }) => ({
                domain: c.domain?.toLowerCase().replace(/^https?:\/\//i, '').replace(/\/.*$/, '') || `competitor-${parsed.domain}`,
                name: c.name || c.domain || "Market Competitor",
                market: c.market || parsedData.location || "Global",
                selected: true,
              })) : [],
              geoTopics: Array.isArray(parsedData.geoTopics) ? parsedData.geoTopics : [],
            };

            return NextResponse.json({ success: true, data: finalData });
          }
        }
      } catch {
        // Fall back to heuristic data below
      }
    }

    // Fallback heuristic extraction if LLM is offline or no API key
    const fallback = generateFallbackData(parsed.domain, title ?? undefined, description ?? undefined);
    return NextResponse.json({ success: true, data: fallback });
  } catch (err) {
    console.error("[analyze-website] error:", err);
    return NextResponse.json(
      { success: false, error: "Website analysis encountered an error. Please try again." },
      { status: 500 }
    );
  }
}
