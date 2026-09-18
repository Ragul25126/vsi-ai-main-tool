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

export const SETUP_HREF = "/dashboard/clients/new";

/** Example questions for AI Chat. Shown as examples before a project exists, as starters after. */
export const CHAT_QUESTIONS = [
  "What should I fix first?",
  "Why did my visibility change?",
  "Which pages need attention?",
  "How visible is my business in AI answers?",
];
