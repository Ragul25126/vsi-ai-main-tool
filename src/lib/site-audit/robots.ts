import type { RobotsFacts } from "./types";

/** AI crawlers whose access decides whether AI assistants can read the site. */
export const AI_CRAWLERS = ["GPTBot", "OAI-SearchBot", "ClaudeBot", "PerplexityBot", "Google-Extended", "CCBot"] as const;

interface Group {
  agents: string[];
  disallowRoot: boolean;
  allowRoot: boolean;
}

function parseGroups(text: string): { groups: Group[]; sitemaps: string[] } {
  const groups: Group[] = [];
  const sitemaps: string[] = [];
  let current: Group | null = null;
  let lastWasAgent = false;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*/, "").trim();
    if (!line) continue;
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();

    if (key === "sitemap") {
      if (value) sitemaps.push(value);
      continue;
    }
    if (key === "user-agent") {
      if (!current || !lastWasAgent) {
        current = { agents: [], disallowRoot: false, allowRoot: false };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
      lastWasAgent = true;
      continue;
    }
    lastWasAgent = false;
    if (!current) continue;
    if (key === "disallow" && value === "/") current.disallowRoot = true;
    if (key === "allow" && value === "/") current.allowRoot = true;
  }
  return { groups, sitemaps };
}

/**
 * Which AI crawlers are shut out of the whole site. A crawler follows the
 * group naming it, or the `*` group when none does.
 */
export function analyzeRobots(text: string | null): RobotsFacts {
  if (text === null) return { found: false, blockedAgents: [], blocksEveryone: false, sitemaps: [] };
  const { groups, sitemaps } = parseGroups(text);
  const blocks = (g: Group | undefined) => !!g && g.disallowRoot && !g.allowRoot;
  const star = groups.find((g) => g.agents.includes("*"));

  const blockedAgents = AI_CRAWLERS.filter((agent) => {
    const own = groups.find((g) => g.agents.includes(agent.toLowerCase()));
    return own ? blocks(own) : blocks(star);
  });

  return { found: true, blockedAgents: [...blockedAgents], blocksEveryone: blocks(star), sitemaps };
}
