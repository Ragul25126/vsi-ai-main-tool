import { describe, expect, it } from "vitest";
import { parsePage, parseSitemap, toInternalUrl, failedPage } from "./parse";
import { analyzeRobots } from "./robots";
import { evaluateChecks, scoreChecks } from "./checks";
import type { PageFacts } from "./types";

const SITE = "example.com";

const goodHtml = `<!doctype html><html><head>
<title>Example Plumbing | Emergency plumbers in Dubai</title>
<meta name="description" content="Licensed emergency plumbers in Dubai. Same-day repairs, fixed prices and a 12-month guarantee on all work.">
<meta name="viewport" content="width=device-width">
<script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"LocalBusiness","name":"Example"},{"@type":"FAQPage"}]}</script>
</head><body>
<h1>Emergency plumbers in Dubai</h1>
<h2>How fast can you arrive?</h2><p>Within 60 minutes.</p>
<h2>What does a call-out cost?</h2>
<img src="a.jpg" alt="Van"><img src="b.jpg">
<a href="/services">Services</a><a href="https://www.example.com/about#team">About</a>
<a href="https://other.com/">Other</a><a href="mailto:x@example.com">Mail</a><a href="/brochure.pdf">PDF</a>
</body></html>`;

describe("parsePage", () => {
  const page = parsePage(goodHtml, "https://example.com/", 200, SITE);

  it("reads title, description and viewport", () => {
    expect(page.title).toBe("Example Plumbing | Emergency plumbers in Dubai");
    expect(page.metaDescription).toContain("Licensed emergency plumbers");
    expect(page.hasViewport).toBe(true);
  });

  it("counts headings and question headings", () => {
    expect(page.h1Count).toBe(1);
    expect(page.questionHeadings).toBe(2);
  });

  it("collects JSON-LD types including @graph", () => {
    expect(page.jsonLdTypes).toEqual(expect.arrayContaining(["LocalBusiness", "FAQPage"]));
  });

  it("counts images without alt text", () => {
    expect(page.imagesTotal).toBe(2);
    expect(page.imagesMissingAlt).toBe(1);
  });

  it("keeps only internal, crawlable links without fragments", () => {
    expect(page.internalLinks.sort()).toEqual(["https://example.com/services", "https://www.example.com/about"]);
  });

  it("detects noindex", () => {
    const p = parsePage('<html><head><meta name="robots" content="NOINDEX, follow"></head><body></body></html>', "https://example.com/x", 200, SITE);
    expect(p.noindex).toBe(true);
  });
});

describe("toInternalUrl", () => {
  it("rejects other hosts and non-web schemes", () => {
    expect(toInternalUrl("https://evil.com/", "https://example.com/", SITE)).toBeNull();
    expect(toInternalUrl("javascript:alert(1)", "https://example.com/", SITE)).toBeNull();
    expect(toInternalUrl("#top", "https://example.com/", SITE)).toBeNull();
  });
});

describe("parseSitemap", () => {
  it("reads urls and sitemap indexes", () => {
    expect(parseSitemap("<urlset><url><loc>https://example.com/a</loc></url></urlset>").urls).toEqual(["https://example.com/a"]);
    expect(parseSitemap("<sitemapindex><sitemap><loc>https://example.com/s1.xml</loc></sitemap></sitemapindex>").childSitemaps).toEqual([
      "https://example.com/s1.xml",
    ]);
  });
});

describe("analyzeRobots", () => {
  it("treats a missing robots.txt as allowing everyone", () => {
    expect(analyzeRobots(null)).toMatchObject({ found: false, blockedAgents: [], blocksEveryone: false });
  });

  it("finds AI crawlers blocked by name", () => {
    const r = analyzeRobots("User-agent: GPTBot\nDisallow: /\n\nUser-agent: *\nAllow: /\nSitemap: https://example.com/sitemap.xml");
    expect(r.blockedAgents).toEqual(["GPTBot"]);
    expect(r.blocksEveryone).toBe(false);
    expect(r.sitemaps).toEqual(["https://example.com/sitemap.xml"]);
  });

  it("applies a blanket block to every crawler without its own group", () => {
    const r = analyzeRobots("User-agent: *\nDisallow: /\n\nUser-agent: ClaudeBot\nAllow: /");
    expect(r.blocksEveryone).toBe(true);
    expect(r.blockedAgents).not.toContain("ClaudeBot");
    expect(r.blockedAgents).toContain("GPTBot");
  });

  it("ignores partial disallows", () => {
    expect(analyzeRobots("User-agent: *\nDisallow: /admin").blockedAgents).toEqual([]);
  });

  it("groups consecutive user-agent lines", () => {
    const r = analyzeRobots("User-agent: GPTBot\nUser-agent: CCBot\nDisallow: /");
    expect(r.blockedAgents).toEqual(["GPTBot", "CCBot"]);
  });
});

function page(overrides: Partial<PageFacts>): PageFacts {
  return { ...parsePage(goodHtml, "https://example.com/", 200, SITE), ...overrides };
}

describe("evaluateChecks", () => {
  const cleanRobots = analyzeRobots("User-agent: *\nAllow: /");

  it("passes a healthy site", () => {
    const checks = evaluateChecks({
      homepageUrl: "https://example.com/",
      pages: [page({})],
      robots: cleanRobots,
      sitemapFound: true,
      brokenLinks: [],
    });
    expect(checks.filter((c) => c.status !== "pass").map((c) => c.id)).toEqual(["image_alt"]);
    expect(scoreChecks(checks)).toBe(99);
  });

  it("flags broken links, missing titles and blocked AI crawlers", () => {
    const checks = evaluateChecks({
      homepageUrl: "http://example.com/",
      pages: [page({}), page({ url: "https://example.com/b", title: null, h1Count: 0 })],
      robots: analyzeRobots("User-agent: GPTBot\nDisallow: /"),
      sitemapFound: false,
      brokenLinks: [{ url: "https://example.com/old", status: 404, foundOn: "https://example.com/" }],
    });
    const byId = Object.fromEntries(checks.map((c) => [c.id, c]));
    expect(byId.https.status).toBe("fail");
    expect(byId.broken_links).toMatchObject({ status: "fail", count: 1 });
    expect(byId.page_titles).toMatchObject({ status: "fail", count: 1 });
    expect(byId.headings).toMatchObject({ status: "warning", affected: ["https://example.com/b"] });
    expect(byId.ai_crawlers).toMatchObject({ status: "warning", affected: ["GPTBot"] });
    expect(byId.sitemap.status).toBe("warning");
  });

  it("fails page errors when the homepage can't load", () => {
    const checks = evaluateChecks({
      homepageUrl: "https://example.com/",
      pages: [failedPage("https://example.com/", 500, null)],
      robots: cleanRobots,
      sitemapFound: true,
      brokenLinks: [],
    });
    expect(checks.find((c) => c.id === "page_errors")).toMatchObject({ status: "fail", impact: "high" });
  });

  it("never scores below zero", () => {
    const checks = evaluateChecks({
      homepageUrl: "http://example.com/",
      pages: [failedPage("http://example.com/", 0, "timeout")],
      robots: analyzeRobots("User-agent: *\nDisallow: /"),
      sitemapFound: false,
      brokenLinks: [{ url: "x", status: 404, foundOn: "y" }],
    });
    expect(scoreChecks(checks)).toBeGreaterThanOrEqual(0);
  });
});
