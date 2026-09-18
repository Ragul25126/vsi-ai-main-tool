/**
 * Competitor presence across Google results and AI answers, computed from the
 * same stored checks as Search Visibility and AI Visibility.
 */
import { cleanDomain, type GeoSummary } from "@/lib/geo";
import { detectPlatform } from "@/types/search";

export interface SerpSnapshot {
  keywordId: string | null;
  keyword: string;
  results: { position: number; domain?: string; url?: string }[];
}

export interface CompetitorRow {
  domain: string;
  aiAnswers: number;
  aiGapSearches: number;
  googleTop10: number;
  bestPosition: number | null;
  /** Added by the user for this project (as opposed to discovered in checks). */
  tracked: boolean;
  /** False when the site hasn't appeared in any stored check yet. */
  seen: boolean;
}

export function isPlatformDomain(domain: string): boolean {
  const p = detectPlatform(domain);
  return p !== "other" && p !== "news" && p !== "brand";
}

export function computeGooglePresence(snapshots: SerpSnapshot[], ownDomain: string | null) {
  const own = ownDomain ? cleanDomain(ownDomain) : "";
  const map = new Map<string, { top10: number; best: number }>();
  for (const snap of snapshots) {
    const seen = new Set<string>();
    for (const r of snap.results) {
      if (!r.position || r.position > 10) continue;
      const d = cleanDomain(r.domain || r.url || "");
      if (!d || (own && (d === own || d.endsWith(`.${own}`))) || seen.has(d)) continue;
      seen.add(d);
      const cur = map.get(d) ?? { top10: 0, best: 99 };
      cur.top10++;
      cur.best = Math.min(cur.best, r.position);
      map.set(d, cur);
    }
  }
  return map;
}

function sameSite(a: string, b: string): boolean {
  return a === b || a.endsWith(`.${b}`) || b.endsWith(`.${a}`);
}

/**
 * Merge AI and Google presence into one list. Competitors the user added
 * come first and are always listed, with zeros marked as "not seen yet"
 * rather than guessed. Discovered sites follow, most visible first.
 * Platforms (Reddit, G2...) are excluded.
 */
export function mergeCompetitors(
  geo: GeoSummary | null,
  google: Map<string, { top10: number; best: number }>,
  tracked: string[] = [],
): CompetitorRow[] {
  const rows = new Map<string, CompetitorRow>();
  const blank = (domain: string): CompetitorRow => ({ domain, aiAnswers: 0, aiGapSearches: 0, googleTop10: 0, bestPosition: null, tracked: false, seen: false });
  for (const c of geo?.competitors ?? []) {
    rows.set(c.domain, { ...blank(c.domain), aiAnswers: c.answers, aiGapSearches: c.gapSearches, seen: true });
  }
  for (const [domain, g] of google) {
    if (isPlatformDomain(domain)) continue;
    const row = rows.get(domain) ?? blank(domain);
    row.googleTop10 = g.top10;
    row.bestPosition = g.best;
    row.seen = true;
    rows.set(domain, row);
  }
  // A tracked competitor matches its own domain and any subdomain seen in checks.
  for (const raw of tracked) {
    const domain = cleanDomain(raw);
    if (!domain) continue;
    const matches = [...rows.values()].filter((r) => sameSite(r.domain, domain));
    if (matches.length === 0) {
      rows.set(domain, { ...blank(domain), tracked: true });
      continue;
    }
    const merged = matches.reduce<CompetitorRow>(
      (acc, r) => ({
        ...acc,
        // Max, not sum: one answer citing two subdomains must not count twice.
        aiAnswers: Math.max(acc.aiAnswers, r.aiAnswers),
        aiGapSearches: Math.max(acc.aiGapSearches, r.aiGapSearches),
        googleTop10: Math.max(acc.googleTop10, r.googleTop10),
        bestPosition: r.bestPosition === null ? acc.bestPosition : acc.bestPosition === null ? r.bestPosition : Math.min(acc.bestPosition, r.bestPosition),
        seen: acc.seen || r.seen,
      }),
      { ...blank(domain), tracked: true },
    );
    for (const m of matches) rows.delete(m.domain);
    rows.set(domain, merged);
  }
  const score = (r: CompetitorRow) => r.aiAnswers + r.googleTop10;
  return [...rows.values()].sort(
    (a, b) => Number(b.tracked) - Number(a.tracked) || score(b) - score(a) || a.domain.localeCompare(b.domain),
  );
}
