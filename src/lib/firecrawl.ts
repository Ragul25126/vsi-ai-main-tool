export interface FirecrawlResult {
  markdown: string;
  title: string | null;
  description: string | null;
  url: string;
  wordCount: number;
  source: "firecrawl" | "fallback";
}

async function scrapeWithFirecrawl(url: string): Promise<FirecrawlResult> {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) throw new Error("No Firecrawl key");

  const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url,
      formats: ["markdown"],
      onlyMainContent: true,
      timeout: 30000,
      waitFor: 1000,
    }),
    signal: AbortSignal.timeout(35000),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error ?? `Firecrawl ${res.status}`);
  }

  const data = await res.json();
  if (!data.success) throw new Error(data.error ?? "Scrape failed");

  const markdown: string = data.data?.markdown ?? "";
  const metadata = data.data?.metadata ?? {};

  return {
    markdown,
    title: metadata.title ?? null,
    description: metadata.description ?? null,
    url: metadata.url ?? url,
    wordCount: markdown.split(/\s+/).filter(Boolean).length,
    source: "firecrawl",
  };
}

function htmlToMarkdown(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<aside[\s\S]*?<\/aside>/gi, "")
    .replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (_, l, t) => `${"#".repeat(Number(l))} ${t.replace(/<[^>]+>/g, "").trim()}\n`)
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, t) => `- ${t.replace(/<[^>]+>/g, "").trim()}\n`)
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, t) => `${t.replace(/<[^>]+>/g, "").trim()}\n\n`)
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function scrapeWithFallback(url: string): Promise<FirecrawlResult> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Cache-Control": "no-cache",
    },
    signal: AbortSignal.timeout(12000),
    redirect: "follow",
  });

  const html = await res.text().catch(() => "");
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
    ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i)
    ?? html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i);

  if (!res.ok && !titleMatch?.[1] && !html) {
    throw new Error(`HTTP ${res.status}`);
  }

  const markdown = htmlToMarkdown(html);

  return {
    markdown: markdown.slice(0, 8000),
    title: titleMatch?.[1]?.trim() ?? null,
    description: descMatch?.[1]?.trim() ?? null,
    url,
    wordCount: markdown.split(/\s+/).filter(Boolean).length,
    source: "fallback",
  };
}

export async function scrapeUrl(url: string): Promise<FirecrawlResult> {
  try {
    return await scrapeWithFirecrawl(url);
  } catch {
    // Firecrawl timed out or failed — use HTML fallback
    return await scrapeWithFallback(url);
  }
}

export interface CrawledPage {
  url: string;
  title: string | null;
  description: string | null;
  headings: string[];
  markdown: string;
}

export interface CrawledWebsiteResult {
  mainPage: FirecrawlResult;
  subPages: CrawledPage[];
  combinedMarkdown: string;
}

function extractInternalLinks(html: string, baseUrlStr: string): string[] {
  const links: string[] = [];
  try {
    const baseUrl = new URL(baseUrlStr);
    const regex = /<a[^>]+href=["']([^"']+)["']/gi;
    let match;
    const priorityPaths = [
      "about", "service", "product", "solution", "category", "course",
      "treatment", "program", "feature", "pricing", "team", "clinic",
      "department", "research", "portfolio", "project", "store", "shop"
    ];

    while ((match = regex.exec(html)) !== null) {
      const rawHref = match[1]?.trim();
      if (
        !rawHref ||
        rawHref.startsWith("#") ||
        rawHref.startsWith("javascript:") ||
        rawHref.startsWith("mailto:") ||
        rawHref.startsWith("tel:")
      ) {
        continue;
      }
      try {
        const resolved = new URL(rawHref, baseUrl.origin);
        if (resolved.hostname === baseUrl.hostname && resolved.pathname !== baseUrl.pathname && resolved.pathname !== "/") {
          const lowerPath = resolved.pathname.toLowerCase();
          const matchesPriority = priorityPaths.some((p) => lowerPath.includes(p));
          if (matchesPriority && !links.includes(resolved.href)) {
            links.push(resolved.href);
          }
        }
      } catch {
        // Invalid URL format snippet
      }
    }
  } catch {
    // Base URL parse error
  }
  return links.slice(0, 4);
}

export async function crawlWebsite(baseUrl: string): Promise<CrawledWebsiteResult> {
  const mainPage = await scrapeUrl(baseUrl);
  const subPages: CrawledPage[] = [];

  let rawHtml = "";
  try {
    const res = await fetch(baseUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html",
      },
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) rawHtml = await res.text();
  } catch {
    // Ignore fetch error for sub-link discovery
  }

  const discoveredLinks = extractInternalLinks(rawHtml, baseUrl);

  if (discoveredLinks.length > 0) {
    const fetchPromises = discoveredLinks.map(async (link) => {
      try {
        const subRes = await fetch(link, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html",
          },
          signal: AbortSignal.timeout(4000),
        });
        if (!subRes.ok) return null;
        const subHtml = await subRes.text();
        const titleMatch = subHtml.match(/<title[^>]*>([^<]+)<\/title>/i);
        const descMatch = subHtml.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
        const headings: string[] = [];
        const hRegex = /<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi;
        let hMatch;
        while ((hMatch = hRegex.exec(subHtml)) !== null) {
          const text = hMatch[1].replace(/<[^>]+>/g, "").trim();
          if (text.length >= 3 && text.length <= 60) headings.push(text);
        }
        const md = htmlToMarkdown(subHtml);
        return {
          url: link,
          title: titleMatch?.[1]?.trim() ?? null,
          description: descMatch?.[1]?.trim() ?? null,
          headings,
          markdown: md.slice(0, 3000),
        };
      } catch {
        return null;
      }
    });

    const results = await Promise.all(fetchPromises);
    for (const r of results) {
      if (r) subPages.push(r);
    }
  }

  let combinedMarkdown = mainPage.markdown;
  for (const page of subPages) {
    combinedMarkdown += `\n\n--- Subpage: ${page.url} (${page.title ?? "Section"}) ---\n`;
    if (page.description) combinedMarkdown += `Meta Description: ${page.description}\n`;
    if (page.headings.length > 0) combinedMarkdown += `Headings: ${page.headings.join(" | ")}\n`;
    combinedMarkdown += page.markdown;
  }

  return {
    mainPage,
    subPages,
    combinedMarkdown,
  };
}

/**
 * Scrape multiple URLs in parallel, returning one result per URL.
 * Failed scrapes are included as { markdown: "", source: "fallback", ... }
 * so the caller can decide how to handle partial data.
 */
export async function scrapeUrlsBatch(
  urls: string[],
  opts: { concurrency?: number } = {}
): Promise<FirecrawlResult[]> {
  const concurrency = Math.min(opts.concurrency ?? 3, 5);
  const results: FirecrawlResult[] = new Array(urls.length);
  let nextIndex = 0;

  async function worker() {
    while (true) {
      const i = nextIndex++;
      if (i >= urls.length) return;
      try {
        results[i] = await scrapeUrl(urls[i]);
      } catch (e) {
        results[i] = {
          markdown: "",
          title: null,
          description: e instanceof Error ? e.message : "scrape failed",
          url: urls[i],
          wordCount: 0,
          source: "fallback",
        };
      }
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);
  return results;
}

