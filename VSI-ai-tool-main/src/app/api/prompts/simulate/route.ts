import { NextRequest, NextResponse } from "next/server";
import { searchSerpApi, SerpApiError } from "@/lib/serpapi-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { engine, prompt, variables } = body as {
      engine?: string;
      prompt?: string;
      variables?: Record<string, string>;
    };

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { success: false, error: "Generated prompt cannot be empty." },
        { status: 400 }
      );
    }

    const keyword = variables?.keyword || "";
    const location = variables?.location || "UAE";

    const apiKey = process.env.SERPAPI_KEY || process.env.SERPAPI_API_KEY;

    if (!apiKey || !apiKey.trim()) {
      return NextResponse.json({
        success: true,
        apiConnected: false,
        engine: engine || "AI Engine",
        generatedPrompt: prompt,
        message: "Prompt generated & validated successfully. External API key (SERPAPI_KEY) is not configured in server environment.",
      });
    }

    try {
      const glMap: Record<string, string> = {
        "UAE": "ae",
        "United Arab Emirates": "ae",
        "India": "in",
        "United States": "us",
        "US": "us",
        "United Kingdom": "uk",
        "UK": "uk",
      };
      const gl = glMap[location] || "ae";

      const serpResult = await searchSerpApi(keyword || "test search", {
        engine: "google",
        gl,
        num: 5,
      });

      return NextResponse.json({
        success: true,
        apiConnected: true,
        engine: engine || "AI Engine",
        generatedPrompt: prompt,
        message: `Successfully executed live diagnostic call to search backend for query '${keyword}' in '${location}'.`,
        serpData: {
          total_results: serpResult.total_results,
          results: serpResult.results.map((r) => ({
            title: r.title,
            link: r.link,
            snippet: r.snippet,
          })),
        },
      });
    } catch (apiErr: unknown) {
      const errorMsg = apiErr instanceof SerpApiError
        ? apiErr.message
        : apiErr instanceof Error
        ? apiErr.message
        : "External API execution failed";

      return NextResponse.json({
        success: false,
        apiConnected: false,
        generatedPrompt: prompt,
        error: `Request failed: ${errorMsg}`,
      }, { status: 502 });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Request failed";
    return NextResponse.json(
      { success: false, error: `Backend error: ${message}` },
      { status: 500 }
    );
  }
}
