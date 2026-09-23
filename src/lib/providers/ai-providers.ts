import { callOpenRouter } from "@/lib/llm";
import type { AIProviderAdapter, AIResponseResult } from "./types";

function extractCitationsAndMentions(
  text: string,
  brand: string,
  domain: string,
  competitors: string[]
): {
  brandMentioned: boolean;
  mentionCount: number;
  competitorsMentioned: string[];
  citations: string[];
  isTargetCited: boolean;
} {
  if (!text) {
    return { brandMentioned: false, mentionCount: 0, competitorsMentioned: [], citations: [], isTargetCited: false };
  }

  const cleanBrand = (brand || "").trim().toLowerCase();
  const cleanDomain = (domain || "").trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
  const lowerText = text.toLowerCase();

  let mentionCount = 0;
  let brandMentioned = false;

  if (cleanBrand && cleanBrand.length > 1) {
    const escaped = cleanBrand.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "gi");
    const matches = lowerText.match(regex);
    mentionCount = matches ? matches.length : 0;
    brandMentioned = mentionCount > 0;
  }

  if (!brandMentioned && cleanDomain) {
    const domainPart = cleanDomain.split(".")[0];
    if (domainPart && domainPart.length > 2 && lowerText.includes(domainPart)) {
      brandMentioned = true;
      mentionCount = 1;
    }
  }

  // Extract URLs / Citations from text
  const urlRegex = /https?:\/\/[^\s()<>]+\.[^\s()<>]*/gi;
  const rawUrls = text.match(urlRegex) || [];
  const citations = Array.from(new Set(rawUrls.map((u) => u.replace(/[.,;)]$/, ""))));

  const isTargetCited = citations.some((c) => c.toLowerCase().includes(cleanDomain));

  // Competitor mentions
  const competitorsMentioned: string[] = [];
  for (const comp of competitors) {
    const cleanComp = comp.toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").split(".")[0];
    if (cleanComp && cleanComp.length > 2 && lowerText.includes(cleanComp)) {
      competitorsMentioned.push(comp);
    }
  }

  return {
    brandMentioned,
    mentionCount,
    competitorsMentioned,
    citations,
    isTargetCited,
  };
}

export class OpenRouterAIProvider implements AIProviderAdapter {
  name = "OpenRouter (Llama / Claude / DeepSeek)";

  isConfigured(): boolean {
    return !!process.env.OPENROUTER_API_KEY;
  }

  async generateResponse(
    prompt: string,
    brand: string,
    domain: string,
    competitors: string[]
  ): Promise<AIResponseResult> {
    const apiKey = process.env.OPENROUTER_API_KEY || "";
    const startTime = Date.now();

    const systemPrompt = `You are a neutral search and AI recommendations assistant. Answer the user prompt directly and concisely.`;
    const res = await callOpenRouter("meta-llama/llama-3.3-70b-instruct", systemPrompt, prompt, apiKey);
    const latencyMs = Date.now() - startTime;

    if (!res.content) {
      return {
        providerName: this.name,
        modelName: "llama-3.3-70b",
        prompt,
        timestamp: new Date().toISOString(),
        rawResponse: "",
        latencyMs,
        brandMentioned: false,
        mentionCount: 0,
        competitorsMentioned: [],
        citations: [],
        isTargetCited: false,
        error: res.rateLimited ? "OpenRouter rate limited" : "No content returned from OpenRouter",
      };
    }

    const analysis = extractCitationsAndMentions(res.content, brand, domain, competitors);

    return {
      providerName: this.name,
      modelName: "llama-3.3-70b",
      prompt,
      timestamp: new Date().toISOString(),
      rawResponse: res.content,
      latencyMs,
      ...analysis,
    };
  }
}

export class OpenAIProvider implements AIProviderAdapter {
  name = "OpenAI (GPT-4o)";

  isConfigured(): boolean {
    return !!process.env.OPENAI_API_KEY;
  }

  async generateResponse(
    prompt: string,
    brand: string,
    domain: string,
    competitors: string[]
  ): Promise<AIResponseResult> {
    const apiKey = process.env.OPENAI_API_KEY || "";
    const startTime = Date.now();

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "Provide clear, accurate recommendations." },
            { role: "user", content: prompt },
          ],
          temperature: 0.1,
          max_tokens: 600,
        }),
        signal: AbortSignal.timeout(20000),
      });

      const latencyMs = Date.now() - startTime;
      const data = await res.json();

      if (data.error) {
        throw new Error(data.error.message || "OpenAI API error");
      }

      const content = data.choices?.[0]?.message?.content ?? "";
      const analysis = extractCitationsAndMentions(content, brand, domain, competitors);

      return {
        providerName: this.name,
        modelName: "gpt-4o-mini",
        prompt,
        timestamp: new Date().toISOString(),
        rawResponse: content,
        responseId: data.id,
        latencyMs,
        ...analysis,
      };
    } catch (err) {
      return {
        providerName: this.name,
        modelName: "gpt-4o-mini",
        prompt,
        timestamp: new Date().toISOString(),
        rawResponse: "",
        latencyMs: Date.now() - startTime,
        brandMentioned: false,
        mentionCount: 0,
        competitorsMentioned: [],
        citations: [],
        isTargetCited: false,
        error: err instanceof Error ? err.message : "OpenAI call failed",
      };
    }
  }
}

export class UnconfiguredAIProvider implements AIProviderAdapter {
  name = "Unconfigured AI Provider";

  isConfigured(): boolean {
    return false;
  }

  async generateResponse(
    prompt: string,
    _brand: string,
    _domain: string,
    _competitors: string[]
  ): Promise<AIResponseResult> {
    return {
      providerName: this.name,
      modelName: "none",
      prompt,
      timestamp: new Date().toISOString(),
      rawResponse: "",
      latencyMs: 0,
      brandMentioned: false,
      mentionCount: 0,
      competitorsMentioned: [],
      citations: [],
      isTargetCited: false,
      error: "AI provider API key (OPENROUTER_API_KEY / OPENAI_API_KEY) not configured.",
    };
  }
}

export function getAIProvider(): AIProviderAdapter {
  if (process.env.OPENROUTER_API_KEY) {
    return new OpenRouterAIProvider();
  }
  if (process.env.OPENAI_API_KEY) {
    return new OpenAIProvider();
  }
  return new UnconfiguredAIProvider();
}
