/**
 * The VSI product story: how each part of the app answers one question
 * about your website. Shared by every first-use page so the order and the
 * wording never drift apart.
 */

export type StoryKey = "audit" | "search" | "ai" | "competitors" | "actions" | "tasks" | "reports" | "chat";

export interface StoryStep {
  key: StoryKey;
  label: string;
  href: string;
  question: string;
}

export const STORY: StoryStep[] = [
  { key: "audit", label: "Site Audit", href: "/dashboard/check", question: "Is my website healthy?" },
  { key: "search", label: "Search Visibility", href: "/dashboard/services/seo", question: "Can people find me?" },
  { key: "ai", label: "AI Visibility", href: "/dashboard/geo", question: "Do AI systems mention me?" },
  { key: "competitors", label: "Competitors", href: "/dashboard/competitors", question: "Where are competitors appearing?" },
  { key: "actions", label: "Next Actions", href: "/dashboard/next-actions", question: "What should I improve?" },
  { key: "tasks", label: "Tasks", href: "/dashboard/tasks", question: "What am I working on?" },
  { key: "reports", label: "Reports", href: "/dashboard/reports", question: "Am I improving?" },
  { key: "chat", label: "AI Chat", href: "/dashboard/chat", question: "Help me understand all of this." },
];

/** One link in a page's "Where this fits" chain. */
export interface ChainNode {
  key: string;
  label: string;
  /** null for "Website", which isn't a page of its own. */
  href: string | null;
  /** Shown quietly under the chain for the current or hovered part. */
  question: string;
}

const WEBSITE: ChainNode = { key: "website", label: "Website", href: null, question: "Everything starts with your website. You add it once." };
const CHECKS: ChainNode = {
  key: "checks",
  label: "Your checks",
  href: "/dashboard",
  question: "Site Audit, Search Visibility, AI Visibility and Competitors, together on the Overview.",
};
const node = (key: StoryKey): ChainNode => {
  const s = STORY.find((x) => x.key === key)!;
  return { key: s.key, label: s.label, href: s.href, question: s.question };
};
const CHECK_PAGES = [node("audit"), node("search"), node("ai"), node("competitors")];

const CORE = [WEBSITE, ...CHECK_PAGES, node("actions")];

/**
 * Each page's own chain. The four check pages and Next Actions share one
 * chain, from the website to what to do about it; later pages group the
 * checks into one step so the chain stays short and readable.
 */
export const STORY_CHAINS: Record<StoryKey, ChainNode[]> = {
  audit: CORE,
  search: CORE,
  ai: CORE,
  competitors: CORE,
  actions: CORE,
  tasks: [WEBSITE, CHECKS, node("actions"), node("tasks"), node("reports")],
  reports: [WEBSITE, CHECKS, node("actions"), node("tasks"), node("reports")],
  chat: [WEBSITE, CHECKS, node("actions"), node("reports"), node("chat")],
};

export const SETUP_HREF = "/dashboard/clients/new";

/** Example questions for AI Chat. Shown as examples before a project exists, as starters after. */
export const CHAT_QUESTIONS = [
  "What should I fix first?",
  "Why did my visibility change?",
  "Which pages need attention?",
  "How visible is my business in AI answers?",
];
