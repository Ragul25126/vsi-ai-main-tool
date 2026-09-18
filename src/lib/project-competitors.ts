/**
 * Competitors the user adds to a project. Shared by the setup flow, the
 * Competitors page and the API, so validation is identical everywhere.
 * No server imports here.
 */
import { normaliseDomain } from "@/lib/url-input";

export const MAX_COMPETITORS = 10;

export interface TrackedCompetitor {
  id: string;
  domain: string;
  name: string | null;
  createdAt: string;
}

export type CompetitorCheck = { ok: true; domain: string } | { ok: false; message: string };

function sameSite(a: string, b: string): boolean {
  return a === b || a.endsWith(`.${b}`) || b.endsWith(`.${a}`);
}

/** Validate one competitor website against the project's own site and the existing list. */
export function validateCompetitorDomain(input: string, ownWebsite: string | null, existing: string[]): CompetitorCheck {
  const parsed = normaliseDomain(input);
  if (!parsed) return { ok: false, message: "Enter a website like competitor.com" };
  const own = ownWebsite ? normaliseDomain(ownWebsite)?.domain : null;
  if (own && sameSite(parsed.domain, own)) return { ok: false, message: "That's your own website." };
  if (existing.some((d) => sameSite(d, parsed.domain))) return { ok: false, message: "That competitor is already on the list." };
  if (existing.length >= MAX_COMPETITORS) return { ok: false, message: `You can add up to ${MAX_COMPETITORS} competitors.` };
  return { ok: true, domain: parsed.domain };
}
