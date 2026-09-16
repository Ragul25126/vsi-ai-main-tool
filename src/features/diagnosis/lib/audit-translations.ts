import type { AuditItem } from "../components/SiteAuditView";

export type AuditPriority = "critical" | "important" | "opportunity" | "passed";

export interface FriendlyAuditItem {
  id: string;
  category: "technical" | "ai_readiness" | "on_page" | "citations";
  friendlyCategory: string;
  friendlyTitle: string;
  priority: AuditPriority;
  whyItMatters: string;
  whatToDoNext: string;
  affectedPages: string[];
  rawItem: AuditItem;
}

export const AUDIT_TRANSLATIONS: Record<string, {
  friendlyTitle: string;
  friendlyCategory: string;
  whyItMatters: string;
  whatToDoNext: string;
  affectedPages: string[];
}> = {
  "tech-1": {
    friendlyTitle: "AI Search Access Permitted",
    friendlyCategory: "Technical Health",
    whyItMatters: "AI assistants like Google AI, ChatGPT, and Claude are allowed to scan your pages to answer customer questions.",
    whatToDoNext: "Maintain open crawling permissions for verified AI search engines in your site settings.",
    affectedPages: ["/robots.txt", "Entire domain"],
  },
  "tech-2": {
    friendlyTitle: "Website Page Directory Active",
    friendlyCategory: "Technical Health",
    whyItMatters: "Search engines have an automated, up-to-date roadmap of all your published website pages.",
    whatToDoNext: "Ensure new blog articles and service pages are automatically submitted to search directories.",
    affectedPages: ["/sitemap.xml"],
  },
  "tech-3": {
    friendlyTitle: "Page Loading Speed & Responsiveness",
    friendlyCategory: "Technical Health",
    whyItMatters: "Fast loading pages keep potential customers from bouncing and help your site rank higher in Google.",
    whatToDoNext: "Enable global edge caching and optimize large banner images so pages load in under 2 seconds.",
    affectedPages: ["/ (Homepage)", "/pricing", "/features"],
  },
  "tech-4": {
    friendlyTitle: "Dead Ends & Broken Internal Links",
    friendlyCategory: "Technical Health",
    whyItMatters: "Visitors and search crawlers hit frustrating dead ends when navigation links point to outdated URLs.",
    whatToDoNext: "Update 3 outdated internal links in your menu and footer to point directly to active pages.",
    affectedPages: ["/features/v1-deprecated", "/services/old-overview", "/docs/v1"],
  },
  "ai-1": {
    friendlyTitle: "Company Identity for AI & Google",
    friendlyCategory: "AI Search Readiness",
    whyItMatters: "Search engines and AI models accurately understand who you are, your logo, and your official profiles.",
    whatToDoNext: "Add detailed company expertise tags so AI engines recognize your core industry specializations.",
    affectedPages: ["/ (Homepage)"],
  },
  "ai-2": {
    friendlyTitle: "Direct Answers for AI Search Overviews",
    friendlyCategory: "AI Search Readiness",
    whyItMatters: "Google AI Overviews and search summaries feature websites that provide clear question-and-answer pairs.",
    whatToDoNext: "Add clear, concise FAQ answer blocks to your 5 primary commercial landing pages.",
    affectedPages: ["/services/ai-seo", "/services/analytics", "/pricing", "/product", "/integrations"],
  },
  "ai-3": {
    friendlyTitle: "Clear Answer Summaries for AI Quoting",
    friendlyCategory: "AI Search Readiness",
    whyItMatters: "AI models love quoting concise 40–50 word definitions placed directly under section headings.",
    whatToDoNext: "Place a short summary definition paragraph at the start of each major topic section.",
    affectedPages: ["/blog/ai-search-guide", "/blog/seo-trends", "/case-studies/enterprise"],
  },
  "ai-4": {
    friendlyTitle: "Author Credibility & Industry Expertise",
    friendlyCategory: "Content & Structure",
    whyItMatters: "Verified author credentials and editorial notices build trustworthiness with both readers and search engines.",
    whatToDoNext: "Continue showcasing verified author bios with links to public professional profiles.",
    affectedPages: ["/team/authors", "/blog/editorial-standards"],
  },
  "page-1": {
    friendlyTitle: "Page Content Structure & Headings",
    friendlyCategory: "Content & Structure",
    whyItMatters: "Logical headings make it effortless for readers and AI engines to quickly scan and understand each page.",
    whatToDoNext: "Ensure every page has one primary topic headline followed by clean section sub-headings.",
    affectedPages: ["All published pages"],
  },
  "page-2": {
    friendlyTitle: "Search Result Preview Descriptions",
    friendlyCategory: "Search Visibility",
    whyItMatters: "Compelling descriptions directly influence whether people click on your website in Google search results.",
    whatToDoNext: "Expand 4 short page descriptions to 145–155 characters to capture more organic clicks.",
    affectedPages: ["/about", "/contact", "/blog/welcome", "/careers"],
  },
  "page-3": {
    friendlyTitle: "Descriptive Image Labels",
    friendlyCategory: "Content & Structure",
    whyItMatters: "Text labels help search engines, screen readers, and AI understand what your graphics and charts show.",
    whatToDoNext: "Ensure newly added infographics and product screenshots include descriptive captions.",
    affectedPages: ["/features (Hero illustration)", "/case-studies (Growth charts)"],
  },
  "cite-1": {
    friendlyTitle: "Social Media Sharing Previews",
    friendlyCategory: "Web Authority",
    whyItMatters: "Links look polished with an image, title, and summary when shared on LinkedIn, X, and WhatsApp.",
    whatToDoNext: "Periodically verify preview images before launching major marketing or social campaigns.",
    affectedPages: ["All shareable URLs"],
  },
  "cite-2": {
    friendlyTitle: "Business Directory Profile Consistency",
    friendlyCategory: "Web Authority",
    whyItMatters: "Search engines trust brands whose company name, address, and domain match identically across directory listings.",
    whatToDoNext: "Standardize legal business name and official domain across Crunchbase, G2, and Capterra.",
    affectedPages: ["G2 Profile", "Capterra Listing", "Crunchbase Profile"],
  },
};

export function getFriendlyAuditItem(item: AuditItem): FriendlyAuditItem {
  const trans = AUDIT_TRANSLATIONS[item.id] || {
    friendlyTitle: item.title,
    friendlyCategory: "Technical Health",
    whyItMatters: item.details,
    whatToDoNext: item.recommendation,
    affectedPages: ["Current domain"],
  };

  let priority: AuditPriority = "opportunity";
  if (item.status === "pass") {
    priority = "passed";
  } else if (item.status === "fail" || item.impact === "high") {
    priority = "critical";
  } else if (item.impact === "medium") {
    priority = "important";
  }

  return {
    id: item.id,
    category: item.category,
    friendlyCategory: trans.friendlyCategory,
    friendlyTitle: trans.friendlyTitle,
    priority,
    whyItMatters: trans.whyItMatters,
    whatToDoNext: trans.whatToDoNext,
    affectedPages: trans.affectedPages,
    rawItem: item,
  };
}
