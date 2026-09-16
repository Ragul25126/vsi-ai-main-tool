import type { AuditItem } from "../components/SiteAuditView";

export type AuditPriority = "critical" | "important" | "opportunity" | "passed";
export type IllustrationKey = "broken_links" | "ai_search" | "directory" | "content" | "performance";

export interface FriendlyAuditItem {
  id: string;
  category: "technical" | "ai_readiness" | "on_page" | "citations";
  friendlyCategory: string;
  friendlyTitle: string;
  priority: AuditPriority;
  priorityLabel: string;
  shortExplanation: string;
  whyItMatters: string;
  whatToDoNext: string;
  affectedCountText: string;
  affectedPages: string[];
  ctaText: string;
  illustration: IllustrationKey;
  rawItem: AuditItem;
}

export const AUDIT_TRANSLATIONS: Record<string, {
  friendlyTitle: string;
  friendlyCategory: string;
  shortExplanation: string;
  whyItMatters: string;
  whatToDoNext: string;
  affectedCountText: string;
  affectedPages: string[];
  ctaText: string;
  illustration: IllustrationKey;
}> = {
  "tech-4": {
    friendlyTitle: "Some website links are broken",
    friendlyCategory: "Technical Health",
    shortExplanation: "3 pages contain links that don't lead visitors to an active page.",
    whyItMatters: "Broken links create frustrating dead ends for potential customers and make it harder for search engines to crawl your site.",
    whatToDoNext: "Update the 3 outdated website links in your navigation and footer to point directly to active URLs.",
    affectedCountText: "3 pages affected",
    affectedPages: ["/features/v1-deprecated", "/services/old-overview", "/docs/v1"],
    ctaText: "Fix this →",
    illustration: "broken_links",
  },
  "ai-2": {
    friendlyTitle: "Your pages could answer questions more clearly",
    friendlyCategory: "AI Search Readiness",
    shortExplanation: "Adding concise answers can help search engines and AI systems understand and cite your content.",
    whyItMatters: "Google AI Overviews and ChatGPT look for clear question-and-answer pairs when deciding which brand to feature as the authority.",
    whatToDoNext: "Add clean question-and-answer FAQ blocks to your top 5 commercial landing pages.",
    affectedCountText: "5 pages affected",
    affectedPages: ["/services/ai-seo", "/services/analytics", "/pricing", "/product", "/integrations"],
    ctaText: "Improve answers →",
    illustration: "ai_search",
  },
  "cite-2": {
    friendlyTitle: "Your business information isn't consistent",
    friendlyCategory: "Business Authority",
    shortExplanation: "We found differences in how your business is listed across online directories.",
    whyItMatters: "Search engines build confidence in your business when your official company name, domain, and address match identically everywhere.",
    whatToDoNext: "Standardize legal business name and official domain across Crunchbase, G2, and Capterra.",
    affectedCountText: "3 directory sources",
    affectedPages: ["G2 Profile", "Capterra Listing", "Crunchbase Profile"],
    ctaText: "Standardize info →",
    illustration: "directory",
  },
  "page-2": {
    friendlyTitle: "Some search descriptions need improvement",
    friendlyCategory: "Search Visibility",
    shortExplanation: "4 pages have descriptions that are too short to attract search clicks.",
    whyItMatters: "Compelling search descriptions act as free advertising in Google, directly influencing whether people click on your website.",
    whatToDoNext: "Expand the short page descriptions to 145–155 characters highlighting your unique benefits.",
    affectedCountText: "4 pages affected",
    affectedPages: ["/about", "/contact", "/blog/welcome", "/careers"],
    ctaText: "Optimize descriptions →",
    illustration: "content",
  },
  "page-1": {
    friendlyTitle: "Some pages could organize their content more clearly",
    friendlyCategory: "Content & Structure",
    shortExplanation: "Clean headings help Google and AI understand your pages.",
    whyItMatters: "Clear headings allow visitors to scan content quickly and make it simple for AI engines to extract accurate key takeaways.",
    whatToDoNext: "Ensure every page has a single clear main headline followed by organized section headings.",
    affectedCountText: "All published pages",
    affectedPages: ["/services", "/features", "/case-studies"],
    ctaText: "Review structure →",
    illustration: "content",
  },
  "tech-3": {
    friendlyTitle: "Page loading speed can be improved",
    friendlyCategory: "Technical Health",
    shortExplanation: "Fast loading pages keep visitors from leaving and rank higher in Google.",
    whyItMatters: "Slow page response times cause visitors to leave before reading and reduce conversion rates on mobile devices.",
    whatToDoNext: "Enable global edge caching and optimize large banner images so pages load in under 2 seconds.",
    affectedCountText: "3 pages affected",
    affectedPages: ["/ (Homepage)", "/pricing", "/features"],
    ctaText: "Speed up pages →",
    illustration: "performance",
  },
  "tech-1": {
    friendlyTitle: "AI Search assistants can read your website",
    friendlyCategory: "Technical Health",
    shortExplanation: "ChatGPT, Claude, and Google AI have permission to scan your content.",
    whyItMatters: "AI assistants are permitted to read your pages to answer customer questions.",
    whatToDoNext: "Maintain open crawling permissions for verified AI search engines in your site settings.",
    affectedCountText: "Entire domain",
    affectedPages: ["/robots.txt"],
    ctaText: "View settings →",
    illustration: "ai_search",
  },
  "tech-2": {
    friendlyTitle: "Website page directory is up to date",
    friendlyCategory: "Technical Health",
    shortExplanation: "Search engines have an automated roadmap of all your website pages.",
    whyItMatters: "Search engines know about your newest pages immediately without waiting.",
    whatToDoNext: "Ensure new blog articles and service pages continue to submit automatically.",
    affectedCountText: "All pages",
    affectedPages: ["/sitemap.xml"],
    ctaText: "View directory →",
    illustration: "broken_links",
  },
  "ai-1": {
    friendlyTitle: "Company identity is verified for AI & Google",
    friendlyCategory: "AI Search Readiness",
    shortExplanation: "Search engines accurately understand your brand name and official profiles.",
    whyItMatters: "Search engines connect your brand to your website, logo, and verified profiles.",
    whatToDoNext: "Add detailed company expertise tags so AI engines recognize your core industry specializations.",
    affectedCountText: "Homepage",
    affectedPages: ["/ (Homepage)"],
    ctaText: "View details →",
    illustration: "directory",
  },
  "ai-3": {
    friendlyTitle: "Answer blocks are formatted for AI quoting",
    friendlyCategory: "AI Search Readiness",
    shortExplanation: "Short, direct answer paragraphs help AI engines quote your website.",
    whyItMatters: "AI models love quoting concise 40–50 word definitions placed directly under section headings.",
    whatToDoNext: "Place a short summary definition paragraph at the start of each major topic section.",
    affectedCountText: "3 blog articles",
    affectedPages: ["/blog/ai-search-guide", "/blog/seo-trends", "/case-studies/enterprise"],
    ctaText: "View articles →",
    illustration: "content",
  },
  "ai-4": {
    friendlyTitle: "Author credentials and credibility are visible",
    friendlyCategory: "Content & Structure",
    shortExplanation: "Verified author credentials and editorial notices build trustworthiness.",
    whyItMatters: "Verified author profiles build trust with readers and search algorithms.",
    whatToDoNext: "Continue showcasing verified author bios with links to public professional profiles.",
    affectedCountText: "Author pages",
    affectedPages: ["/team/authors", "/blog/editorial-standards"],
    ctaText: "View authors →",
    illustration: "content",
  },
  "page-3": {
    friendlyTitle: "Image descriptions help search engines understand visuals",
    friendlyCategory: "Content & Structure",
    shortExplanation: "Descriptive labels explain your diagrams and charts to search engines.",
    whyItMatters: "Text labels help search engines, screen readers, and AI understand what your graphics show.",
    whatToDoNext: "Ensure newly added infographics and screenshots include descriptive captions.",
    affectedCountText: "Content images",
    affectedPages: ["/features", "/case-studies"],
    ctaText: "View images →",
    illustration: "content",
  },
  "cite-1": {
    friendlyTitle: "Social sharing preview cards are configured",
    friendlyCategory: "Business Authority",
    shortExplanation: "Links look polished with an image and summary when shared on social media.",
    whyItMatters: "Social links show a clean title, image, and description when shared on LinkedIn or X.",
    whatToDoNext: "Periodically verify preview images before launching major marketing campaigns.",
    affectedCountText: "All shareable URLs",
    affectedPages: ["All shareable URLs"],
    ctaText: "Preview cards →",
    illustration: "directory",
  },
};

export function getFriendlyAuditItem(item: AuditItem): FriendlyAuditItem {
  const trans = AUDIT_TRANSLATIONS[item.id] || {
    friendlyTitle: item.title,
    friendlyCategory: "Technical Health",
    shortExplanation: item.details,
    whyItMatters: item.details,
    whatToDoNext: item.recommendation,
    affectedCountText: "Multiple pages affected",
    affectedPages: ["Current domain"],
    ctaText: "Fix this →",
    illustration: "broken_links" as IllustrationKey,
  };

  let priority: AuditPriority = "opportunity";
  let priorityLabel = "Opportunity";

  if (item.status === "pass") {
    priority = "passed";
    priorityLabel = "Passed";
  } else if (item.status === "fail" || item.impact === "high") {
    priority = "critical";
    priorityLabel = "Critical";
  } else if (item.impact === "medium") {
    priority = "important";
    priorityLabel = "Important";
  }

  return {
    id: item.id,
    category: item.category,
    friendlyCategory: trans.friendlyCategory,
    friendlyTitle: trans.friendlyTitle,
    priority,
    priorityLabel,
    shortExplanation: trans.shortExplanation,
    whyItMatters: trans.whyItMatters,
    whatToDoNext: trans.whatToDoNext,
    affectedCountText: trans.affectedCountText,
    affectedPages: trans.affectedPages,
    ctaText: trans.ctaText,
    illustration: trans.illustration,
    rawItem: item,
  };
}
