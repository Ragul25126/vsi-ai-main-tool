import type { CheckId, CheckResult } from "./types";
import type { TaskGroup, TaskOwner } from "@/lib/tasks";

export type AuditArea = "health" | "search" | "ai" | "content";

export const AREA_LABEL: Record<AuditArea, string> = {
  health: "Website health",
  search: "Search readiness",
  ai: "AI readiness",
  content: "Content",
};

interface CheckCopy {
  area: AuditArea;
  /** Headline when there is a problem. Receives the check result for counts. */
  problem: (c: CheckResult) => string;
  /** Headline when the check passes. */
  healthy: string;
  why: string;
  todo: (c: CheckResult) => string;
  /** The term a specialist would use, shown only in technical details. */
  technical: string;
  taskGroup: TaskGroup;
  owner: TaskOwner;
}

const pages = (n: number) => `${n} ${n === 1 ? "page" : "pages"}`;
const pagesHave = (n: number) => `${pages(n)} ${n === 1 ? "has" : "have"}`;
const pagesAre = (n: number) => `${pages(n)} ${n === 1 ? "is" : "are"}`;

export const CHECK_COPY: Record<CheckId, CheckCopy> = {
  https: {
    area: "health",
    problem: () => "Your website isn't using a secure connection",
    healthy: "Your website uses a secure connection",
    why: "Browsers warn visitors about insecure sites, and search engines rank them lower.",
    todo: () => "Ask your web host or developer to turn on HTTPS (an SSL certificate) and send all visitors to the secure version.",
    technical: "HTTPS / TLS",
    taskGroup: "Technical",
    owner: "Developer",
  },
  ai_crawlers: {
    area: "ai",
    problem: (c) =>
      c.detail.blocksEveryone ? "Your website blocks search engines and AI assistants" : `Your website blocks ${c.count} AI ${c.count === 1 ? "assistant" : "assistants"} from reading it`,
    healthy: "AI assistants are allowed to read your website",
    why: "If an AI assistant can't read your pages, it can't mention or recommend your business in its answers.",
    todo: (c) =>
      `Update your robots.txt file so it no longer blocks ${c.affected.join(", ") || "these crawlers"}. Your developer can do this in a few minutes.`,
    technical: "robots.txt crawler rules (GPTBot, ClaudeBot, PerplexityBot, Google-Extended)",
    taskGroup: "Technical",
    owner: "Developer",
  },
  page_errors: {
    area: "health",
    problem: (c) => (c.impact === "high" ? "Your homepage isn't loading" : `${pages(c.count)} didn't load when we checked`),
    healthy: "All the pages we checked loaded correctly",
    why: "Visitors and search engines who reach a page that doesn't load usually leave and don't come back.",
    todo: () => "Open the pages listed below. Fix or remove any that show an error, and redirect old addresses to the right page.",
    technical: "HTTP 4xx / 5xx responses",
    taskGroup: "Technical",
    owner: "Developer",
  },
  indexable: {
    area: "search",
    problem: (c) => (c.impact === "high" ? "Your homepage is hidden from search engines" : `${pagesAre(c.count)} hidden from search engines`),
    healthy: "Your pages can appear in search results",
    why: "Hidden pages can't show up in Google or be used by AI assistants.",
    todo: () => "Remove the 'noindex' setting from these pages unless you deliberately want them hidden.",
    technical: "meta robots noindex",
    taskGroup: "Technical",
    owner: "Developer",
  },
  broken_links: {
    area: "health",
    problem: (c) => `${c.count} ${c.count === 1 ? "link leads" : "links lead"} to a page that doesn't exist`,
    healthy: "We didn't find any broken links",
    why: "Broken links send visitors to dead ends and make your site look neglected to search engines.",
    todo: () => "Update each broken link to point to the right page, or remove it.",
    technical: "Broken internal links (HTTP 404/410/5xx)",
    taskGroup: "Technical",
    owner: "Developer",
  },
  page_titles: {
    area: "search",
    problem: (c) =>
      Number(c.detail.missing) > 0 ? `${pagesHave(Number(c.detail.missing))} no title in search results` : `${pagesHave(c.count)} titles that are too long or too short`,
    healthy: "Your pages have clear titles in search results",
    why: "The title is the first thing people read in Google. A clear one gets more clicks.",
    todo: () => "Give each page a unique title of about 30 to 60 characters that says what the page offers.",
    technical: "<title> element length and presence",
    taskGroup: "Content",
    owner: "Writer",
  },
  meta_descriptions: {
    area: "search",
    problem: (c) =>
      Number(c.detail.missing) > 0 ? `${pagesHave(Number(c.detail.missing))} no description in search results` : `${pagesHave(c.count)} search descriptions that could be improved`,
    healthy: "Your pages have good search descriptions",
    why: "The short description under your title in Google works like free advertising. Without one, Google picks random text.",
    todo: () => "Write a one or two sentence description (about 120 to 160 characters) for each page listed.",
    technical: "meta description presence and length",
    taskGroup: "Content",
    owner: "Writer",
  },
  headings: {
    area: "content",
    problem: (c) => `${pages(c.count)} could organize their content more clearly`,
    healthy: "Your pages are clearly organized",
    why: "A single clear main heading tells visitors, search engines and AI what a page is about.",
    todo: () => "Give each page one main heading that names its topic, with smaller headings for each section.",
    technical: "Semantic heading hierarchy (exactly one H1)",
    taskGroup: "Content",
    owner: "Writer",
  },
  structured_data: {
    area: "ai",
    problem: (c) => (c.status === "fail" ? "Search engines can't read your business details" : "Your business details could be clearer to search engines"),
    healthy: "Search engines can read your business details",
    why: "When search engines understand who you are, where you are and what you do, they show and recommend you more confidently.",
    todo: () => "Ask your developer to add business information markup (name, logo, address, contact) to your homepage.",
    technical: "Schema.org structured data (JSON-LD Organization / LocalBusiness)",
    taskGroup: "Technical",
    owner: "Developer",
  },
  answer_content: {
    area: "ai",
    problem: () => "Your pages don't answer common customer questions directly",
    healthy: "Your pages answer customer questions directly",
    why: "AI assistants and Google's AI answers quote pages that answer questions clearly. This is one of the strongest ways to be mentioned.",
    todo: () => "Add a short questions-and-answers section to your key pages, answering what customers actually ask in 2 or 3 sentences each.",
    technical: "Question-led headings / FAQPage structured data",
    taskGroup: "Content",
    owner: "Writer",
  },
  image_alt: {
    area: "content",
    problem: (c) => `Images on ${pages(c.count)} have no text description`,
    healthy: "Your images have text descriptions",
    why: "Text descriptions help people using screen readers, and help search engines understand your images.",
    todo: () => "Add a short description (alt text) to each image that shows something meaningful.",
    technical: "img alt attributes",
    taskGroup: "Content",
    owner: "Writer",
  },
  sitemap: {
    area: "search",
    problem: () => "We couldn't find a list of your pages for search engines",
    healthy: "Search engines have a list of your pages",
    why: "A sitemap helps search engines find every page, including new ones, faster.",
    todo: () => "Ask your developer to publish a sitemap at /sitemap.xml and submit it in Google Search Console.",
    technical: "XML sitemap",
    taskGroup: "Technical",
    owner: "Developer",
  },
  mobile_viewport: {
    area: "health",
    problem: (c) => `${pages(c.count)} may not display well on phones`,
    healthy: "Your pages are set up for phones",
    why: "Most visitors use phones, and Google ranks mobile-friendly pages higher.",
    todo: () => "Ask your developer to add the mobile display setting (viewport) to these pages.",
    technical: "meta viewport",
    taskGroup: "Technical",
    owner: "Developer",
  },
};

export function checkHeadline(c: CheckResult): string {
  const copy = CHECK_COPY[c.id];
  return c.status === "pass" ? copy.healthy : copy.problem(c);
}

/** One-sentence conclusion for the audit as a whole. */
export function auditConclusion(score: number, problems: number, critical: number): string {
  if (problems === 0) return "Your website is in good shape. We didn't find anything that needs fixing.";
  if (critical > 0) {
    return `${critical === 1 ? "One problem needs" : `${critical} problems need`} fixing soon, and ${problems - critical > 0 ? `${problems - critical} more could be improved` : "nothing else is urgent"}.`;
  }
  if (score >= 85) return `Your website is in good shape, with ${problems === 1 ? "one thing" : `${problems} things`} you could improve.`;
  return `Your website works, but ${problems === 1 ? "one thing is" : `${problems} things are`} holding it back.`;
}

/** The measured evidence behind a check, in one sentence. Never repeats the headline. */
export function checkEvidence(c: CheckResult): string {
  const of = (unit: string) => (c.total ? `${c.count} of the ${c.total} ${unit} we checked.` : "");
  switch (c.id) {
    case "https":
      return c.status === "pass" ? "Your homepage loads over HTTPS." : `Your homepage opened at ${String(c.detail.homepage ?? "an http:// address")}.`;
    case "ai_crawlers":
      if (c.detail.blocksEveryone) return "Your robots.txt file tells every crawler to stay out of the whole site.";
      return c.count ? `Blocked in your robots.txt file: ${c.affected.join(", ")}.` : c.detail.robotsFound ? "Your robots.txt file allows AI crawlers." : "Your site has no robots.txt file, so nothing is blocked.";
    case "page_errors":
      return of("pages");
    case "indexable":
      return of("pages");
    case "broken_links":
      return of("internal links");
    case "page_titles":
    case "meta_descriptions":
    case "headings":
    case "mobile_viewport":
      return of("pages");
    case "image_alt":
      return `${c.detail.imagesWithoutDescription ?? 0} of ${c.detail.imagesChecked ?? 0} images have no description.`;
    case "structured_data": {
      const types = (c.detail.typesFound as string[] | undefined) ?? [];
      return types.length ? `We found only these kinds of business details: ${types.join(", ")}.` : "We found no business details marked up on the pages we checked.";
    }
    case "answer_content":
      return `${c.detail.pagesWithAnswers ?? 0} of the ${c.total} pages we checked have a questions-and-answers section.`;
    case "sitemap":
      return c.status === "pass" ? "We found your sitemap." : "We looked for /sitemap.xml and for a sitemap listed in robots.txt.";
  }
}
