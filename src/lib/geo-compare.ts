/**
 * You and competitors in AI answers, counted the same way for everyone.
 * Pure function over the AI Visibility summary; no I/O.
 */
import { cleanDomain, type GeoSummary, type SearchState } from "@/lib/geo";

export interface CompareColumn {
  key: string;
  name: string;
  domain: string | null;
  source: "you" | "tracked" | "found";
  /** AI answers that link to this website. */
  citations: number;
  /** Answered searches where at least one AI answer links to this website. */
  searchesLinked: number;
  /** searchesLinked as a share of answered searches, 0–100, or null with no answers. */
  coverage: number | null;
  /** ChatGPT answers that name this business, or null when ChatGPT hasn't been checked. */
  chatgptNamed: number | null;
}

const LINKED: SearchState[] = ["linked", "named_and_linked"];

const sameSite = (d: string, target: string) => d === target || d.endsWith(`.${target}`);
const squash = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/** "acme-books.co.uk" -> "acmebooks": the part of a domain that is usually the brand. */
function domainStem(domain: string): string {
  return squash(domain.split(".")[0] ?? "");
}

export function compareCompetitors(
  s: GeoSummary,
  { projectName, domain, tracked, limit = 3 }: { projectName: string; domain: string | null; tracked: { domain: string; name: string | null }[]; limit?: number },
): CompareColumn[] {
  const pct = (n: number) => (s.answered > 0 ? Math.round((n / s.answered) * 100) : null);
  const chatgpt = s.engines.find((e) => e.id === "chatgpt");
  const chatgptChecked = (chatgpt?.checked ?? 0) > 0;

  const youLinked = s.searches.filter((x) => x.answered && Object.values(x.states).some((st) => LINKED.includes(st))).length;
  const you: CompareColumn = {
    key: "you",
    name: projectName,
    domain,
    source: "you",
    citations: s.citations,
    searchesLinked: youLinked,
    coverage: pct(youLinked),
    chatgptNamed: chatgptChecked ? chatgpt!.named : null,
  };

  const column = (target: string, name: string | null, source: "tracked" | "found"): CompareColumn => {
    const clean = cleanDomain(target);
    const linked = s.searches.filter((x) => x.answered && x.competitorsLinked.some((d) => sameSite(d, clean))).length;
    const citations = s.competitors.filter((c) => sameSite(c.domain, clean)).reduce((sum, c) => sum + c.answers, 0);
    const keys = [name ? squash(name) : "", domainStem(clean)].filter((k) => k.length >= 3);
    const named = s.namedByChatGPT.filter((n) => keys.includes(squash(n.name))).reduce((sum, n) => sum + n.answers, 0);
    return {
      key: `${source}:${clean}`,
      name: name || clean,
      domain: clean,
      source,
      citations,
      searchesLinked: linked,
      coverage: pct(linked),
      chatgptNamed: chatgptChecked ? named : null,
    };
  };

  const yours = tracked.slice(0, limit).map((t) => column(t.domain, t.name, "tracked"));
  const taken = yours.map((c) => c.domain!);
  const found = s.competitors
    .filter((c) => !taken.some((t) => sameSite(c.domain, t)))
    .slice(0, Math.max(0, limit - yours.length))
    .map((c) => column(c.domain, null, "found"));

  return [you, ...yours, ...found];
}
