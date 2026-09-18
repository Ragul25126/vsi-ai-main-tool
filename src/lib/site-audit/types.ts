export type CheckStatus = "pass" | "warning" | "fail";
export type Impact = "high" | "medium" | "low";

export type CheckId =
  | "https"
  | "ai_crawlers"
  | "indexable"
  | "page_errors"
  | "broken_links"
  | "page_titles"
  | "meta_descriptions"
  | "headings"
  | "structured_data"
  | "answer_content"
  | "image_alt"
  | "sitemap"
  | "mobile_viewport";

/** Facts extracted from one fetched page. */
export interface PageFacts {
  url: string;
  status: number;
  /** Set when the page couldn't be fetched at all (timeout, DNS, blocked). */
  fetchError: string | null;
  isHtml: boolean;
  title: string | null;
  metaDescription: string | null;
  h1Count: number;
  headingCount: number;
  questionHeadings: number;
  hasViewport: boolean;
  noindex: boolean;
  jsonLdTypes: string[];
  imagesTotal: number;
  imagesMissingAlt: number;
  internalLinks: string[];
  wordCount: number;
}

export interface RobotsFacts {
  found: boolean;
  /** AI crawlers that are disallowed from the whole site. */
  blockedAgents: string[];
  /** `User-agent: *` disallows the whole site. */
  blocksEveryone: boolean;
  sitemaps: string[];
}

export interface BrokenLink {
  url: string;
  status: number | null;
  foundOn: string;
}

export interface CheckResult {
  id: CheckId;
  status: CheckStatus;
  impact: Impact;
  /** Number of affected items (pages, links, crawlers). */
  count: number;
  /** Items checked, when meaningful (e.g. pages scanned). */
  total: number;
  /** Affected URLs or names, capped. */
  affected: string[];
  /** Measured values for technical details. */
  detail: Record<string, string | number | boolean | string[] | null>;
}

export interface AuditOutcome {
  domain: string;
  homepageUrl: string;
  score: number;
  pages: PageFacts[];
  robots: RobotsFacts;
  sitemapFound: boolean;
  brokenLinks: BrokenLink[];
  checks: CheckResult[];
}
