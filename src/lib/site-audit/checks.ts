import type { BrokenLink, CheckResult, CheckStatus, Impact, PageFacts, RobotsFacts, SeoSetupInput } from "./types";

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
  seoSetup?: SeoSetupInput;
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

export function evaluateChecks({ homepageUrl, pages, robots, sitemapFound, brokenLinks, linksChecked = 0, seoSetup }: EvaluateInput): CheckResult[] {

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

  // Target topic coverage (against user's tracked keywords)
  const trackedKeywords = (seoSetup?.trackedKeywords || []).map((k) => k.trim().toLowerCase()).filter(Boolean);
  if (trackedKeywords.length > 0) {
    const covered: string[] = [];
    const missing: string[] = [];

    for (const kw of trackedKeywords) {
      const kwWords = kw.split(/\s+/).filter(Boolean);
      const isCovered = loaded.some((p) => {
        const textToSearch = [
          p.title || "",
          p.metaDescription || "",
          ...(p.h1Texts || []),
          ...(p.headingTexts || []),
          p.bodyTextSample || "",
        ]
          .join(" ")
          .toLowerCase();

        return textToSearch.includes(kw) || (kwWords.length > 1 && kwWords.every((w) => textToSearch.includes(w)));
      });

      if (isCovered) {
        covered.push(kw);
      } else {
        missing.push(kw);
      }
    }

    const coveragePct = Math.round((covered.length / trackedKeywords.length) * 100);
    const status: CheckStatus = coveragePct >= 70 ? "pass" : coveragePct >= 40 ? "warning" : "fail";
    checks.push(
      result("topic_coverage", "medium", status, missing, trackedKeywords.length, {
        coveragePercent: `${coveragePct}%`,
        coveredCount: covered.length,
        missingCount: missing.length,
        coveredKeywords: covered,
        missingKeywords: missing,
      }),
    );
  } else {
    checks.push(
      result("topic_coverage", "low", "pass", [], 0, {
        note: "Add tracked keywords to evaluate content topic coverage.",
      }),
    );
  }

  // Regional and language compatibility
  const targetCountry = (seoSetup?.targetCountry || "").trim().toUpperCase();
  const targetLang = (seoSetup?.targetLanguage || "").trim().toLowerCase();
  const homeLang = (home?.htmlLang || "").trim().toLowerCase();
  const allHreflangs = loaded.flatMap((p) => p.hreflangs || []);

  if (targetLang || targetCountry) {
    const langMatches = !targetLang || (homeLang && (homeLang.startsWith(targetLang) || targetLang.startsWith(homeLang)));
    const hasTargetHreflang = !targetCountry && !targetLang
      ? true
      : allHreflangs.some((h) => {
          const l = h.lang.toLowerCase();
          return (targetLang && l.includes(targetLang)) || (targetCountry && l.includes(targetCountry.toLowerCase()));
        });

    let geoStatus: CheckStatus = "pass";
    const issues: string[] = [];

    if (!homeLang) {
      geoStatus = "warning";
      issues.push("Missing HTML lang declaration on homepage");
    } else if (targetLang && !langMatches && !hasTargetHreflang) {
      geoStatus = "warning";
      issues.push(`Homepage language (${homeLang}) does not match target language (${targetLang})`);
    }

    checks.push(
      result(
        "geo_compatibility",
        "medium",
        geoStatus,
        geoStatus === "pass" ? [] : [homepageUrl],
        1,
        {
          declaredLang: homeLang || "none",
          targetLanguage: targetLang || "any",
          targetCountry: targetCountry || "any",
          hreflangTagsFound: allHreflangs.length,
          issues: issues.length ? issues.join("; ") : "Matches target setup",
        },
      ),
    );
  } else {
    checks.push(
      result(
        "geo_compatibility",
        "low",
        "pass",
        [],
        1,
        {
          declaredLang: homeLang || "not specified",
          note: "No regional target configured in project settings.",
        },
      ),
    );
  }


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
