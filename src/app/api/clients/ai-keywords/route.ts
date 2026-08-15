import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { scrapeWebsiteMetadata, generateAIKeywordsAndQueries } from "@/lib/ai-keyword-generator";
import { Location } from "@/types/search";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { domain, brandName, industry, location = "ae", clientId } = body;

    if (!domain || !domain.trim()) {
      return NextResponse.json({ success: false, error: "Domain name is required" }, { status: 400 });
    }

    // 1. Scrape website metadata if accessible
    const metadata = await scrapeWebsiteMetadata(domain);

    // 2. Generate multi-intent AI queries & keywords
    const analysisResult = generateAIKeywordsAndQueries(
      domain,
      brandName || domain,
      industry || "Digital Services",
      location as Location,
      metadata
    );

    // 3. Try to save snapshot in Supabase DB
    try {
      const supabase = await createClient();
      await supabase.from("client_keyword_analyses").insert({
        client_id: clientId || null,
        domain: domain.trim(),
        brand_name: (brandName || domain).trim(),
        industry: industry || null,
        location,
        summary: analysisResult.summary,
        queries: analysisResult.queries,
        website_metadata: analysisResult.metadata,
      });
    } catch {}

    return NextResponse.json({
      success: true,
      analysis: analysisResult,
    });
  } catch (e) {
    return NextResponse.json({
      success: false,
      error: e instanceof Error ? e.message : "Failed to run AI website analysis",
    }, { status: 500 });
  }
}
