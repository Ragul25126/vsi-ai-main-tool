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

/** Merge AI and Google presence into one list, most visible first. Platforms are excluded. */
export function mergeCompetitors(geo: GeoSummary | null, google: Map<string, { top10: number; best: number }>): CompetitorRow[] {
  const rows = new Map<string, CompetitorRow>();
  for (const c of geo?.competitors ?? []) {
    rows.set(c.domain, { domain: c.domain, aiAnswers: c.answers, aiGapSearches: c.gapSearches, googleTop10: 0, bestPosition: null });
  }
  for (const [domain, g] of google) {
    if (isPlatformDomain(domain)) continue;
    const row = rows.get(domain) ?? { domain, aiAnswers: 0, aiGapSearches: 0, googleTop10: 0, bestPosition: null };
    row.googleTop10 = g.top10;
    row.bestPosition = g.best;
    rows.set(domain, row);
  }
  return [...rows.values()].sort((a, b) => b.aiAnswers + b.googleTop10 - (a.aiAnswers + a.googleTop10) || a.domain.localeCompare(b.domain));
}
