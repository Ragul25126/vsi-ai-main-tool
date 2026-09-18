import type { BrokenLink, CheckResult, CheckStatus, Impact, PageFacts, RobotsFacts } from "./types";

const AFFECTED_CAP = 25;
const BUSINESS_TYPE = /(Organization|Corporation|Business|Store|Restaurant|ProfessionalService|LegalService|MedicalClinic|Agency)$/;

interface EvaluateInput {
  homepageUrl: string;
  pages: PageFacts[];
  robots: RobotsFacts;
  sitemapFound: boolean;
  brokenLinks: BrokenLink[];
  /** Internal links that were verified (for the broken-link check). */
  linksChecked?: number;
}

function result(
  id: CheckResult["id"],
  impact: Impact,
  status: CheckStatus,
  affected: string[],
  total: number,
  detail: CheckResult["detail"] = {},
): CheckResult {
  return { id, impact, status, count: affected.length, total, affected: affected.slice(0, AFFECTED_CAP), detail };
}

export function evaluateChecks({ homepageUrl, pages, robots, sitemapFound, brokenLinks, linksChecked = 0 }: EvaluateInput): CheckResult[] {
  const loaded = pages.filter((p) => p.isHtml && p.status < 400 && !p.fetchError);
  const n = loaded.length;
  const home = pages[0];
  const checks: CheckResult[] = [];

  // Secure connection
  checks.push(
    result("https", "high", homepageUrl.startsWith("https://") ? "pass" : "fail", homepageUrl.startsWith("https://") ? [] : [homepageUrl], 1, {
      homepage: homepageUrl,
    }),
  );

  // AI crawler access
  checks.push(
    result(
      "ai_crawlers",
      "high",
      robots.blocksEveryone ? "fail" : robots.blockedAgents.length > 0 ? "warning" : "pass",
      robots.blockedAgents,
      6,
      { robotsFound: robots.found, blocksEveryone: robots.blocksEveryone },
    ),
  );

  // Pages that can't load
  const errored = pages.filter((p) => p.fetchError || p.status >= 400);
  const homeFailed = !!home && (home.fetchError !== null || home.status >= 400);
  checks.push(
    result(
      "page_errors",
      homeFailed ? "high" : "medium",
      homeFailed ? "fail" : errored.length > 0 ? "warning" : "pass",
      errored.map((p) => p.url),
      pages.length,
      { statuses: errored.map((p) => `${p.status || "no response"} ${p.url}`) },
    ),
  );

  // Hidden from search
  const noindex = loaded.filter((p) => p.noindex);
  const homeNoindex = !!home && home.noindex;
  checks.push(
    result(
      "indexable",
      homeNoindex ? "high" : "medium",
      homeNoindex ? "fail" : noindex.length > 0 ? "warning" : "pass",
      noindex.map((p) => p.url),
      n,
    ),
  );

  // Broken internal links
  checks.push(
    result(
      "broken_links",
      "medium",
      brokenLinks.length > 0 ? "fail" : "pass",
      brokenLinks.map((b) => b.url),
      linksChecked,
      { links: brokenLinks.slice(0, AFFECTED_CAP).map((b) => `${b.status ?? "no response"} ${b.url} (linked from ${b.foundOn})`) },
    ),
  );

  // Page titles
  const noTitle = loaded.filter((p) => !p.title);
  const badTitleLength = loaded.filter((p) => p.title && (p.title.length < 10 || p.title.length > 65));
  checks.push(
    result(
      "page_titles",
      noTitle.length > 0 ? "medium" : "low",
      noTitle.length > 0 ? "fail" : badTitleLength.length > 0 ? "warning" : "pass",
      [...noTitle, ...badTitleLength].map((p) => p.url),
      n,
      { missing: noTitle.length, outsideRecommendedLength: badTitleLength.length },
    ),
  );

  // Search descriptions
  const noDescription = loaded.filter((p) => !p.metaDescription);
  const badDescription = loaded.filter(
    (p) => p.metaDescription && (p.metaDescription.length < 50 || p.metaDescription.length > 170),
  );
  checks.push(
    result(
      "meta_descriptions",
      noDescription.length > 0 ? "medium" : "low",
      noDescription.length + badDescription.length > 0 ? "warning" : "pass",
      [...noDescription, ...badDescription].map((p) => p.url),
      n,
      { missing: noDescription.length, outsideRecommendedLength: badDescription.length },
    ),
  );

  // Heading structure
  const badH1 = loaded.filter((p) => p.h1Count !== 1);
  checks.push(
    result("headings", "medium", badH1.length > 0 ? "warning" : "pass", badH1.map((p) => p.url), n, {
      pagesWithoutMainHeading: loaded.filter((p) => p.h1Count === 0).length,
      pagesWithSeveralMainHeadings: loaded.filter((p) => p.h1Count > 1).length,
    }),
  );

  // Business information for search engines (structured data)
  const allTypes = [...new Set(loaded.flatMap((p) => p.jsonLdTypes))];
  const homeHasJsonLd = !!home && home.jsonLdTypes.length > 0;
  const hasBusinessType = allTypes.some((t) => BUSINESS_TYPE.test(t));
  checks.push(
    result(
      "structured_data",
      "medium",
      !homeHasJsonLd && allTypes.length === 0 ? "fail" : hasBusinessType ? "pass" : "warning",
      hasBusinessType ? [] : [home?.url ?? homepageUrl],
      n,
      { typesFound: allTypes },
    ),
  );

  // Direct answers to customer questions
  const answerPages = loaded.filter((p) => p.jsonLdTypes.includes("FAQPage") || p.questionHeadings >= 2);
  checks.push(
    result(
      "answer_content",
      "medium",
      n === 0 ? "warning" : answerPages.length === 0 ? "warning" : "pass",
      answerPages.length === 0 ? loaded.map((p) => p.url) : [],
      n,
      { pagesWithAnswers: answerPages.length },
    ),
  );

  // Image descriptions
  const totalImages = loaded.reduce((s, p) => s + p.imagesTotal, 0);
  const missingAlt = loaded.reduce((s, p) => s + p.imagesMissingAlt, 0);
  const altPages = loaded.filter((p) => p.imagesMissingAlt > 0);
  checks.push(
    result(
      "image_alt",
      "low",
      totalImages > 0 && missingAlt / totalImages > 0.1 ? "warning" : "pass",
      altPages.map((p) => p.url),
      n,
      { imagesChecked: totalImages, imagesWithoutDescription: missingAlt },
    ),
  );

  // Sitemap
  checks.push(result("sitemap", "low", sitemapFound ? "pass" : "warning", [], 1, { found: sitemapFound }));

  // Mobile display
  const noViewport = loaded.filter((p) => !p.hasViewport);
  checks.push(
    result("mobile_viewport", "medium", noViewport.length > 0 ? "warning" : "pass", noViewport.map((p) => p.url), n),
  );

  return checks;
}

const PENALTY: Record<Exclude<CheckStatus, "pass">, Record<Impact, number>> = {
  fail: { high: 15, medium: 8, low: 4 },
  warning: { high: 6, medium: 3, low: 1 },
};

/** 100 minus a fixed penalty per failing or warning check, floored at 0. */
export function scoreChecks(checks: CheckResult[]): number {
  const penalty = checks.reduce((sum, c) => (c.status === "pass" ? sum : sum + PENALTY[c.status][c.impact]), 0);
  return Math.max(0, Math.min(100, 100 - penalty));
}
