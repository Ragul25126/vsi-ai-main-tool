"use client";

import { useCallback, useRef, useState } from "react";
import type { Location, TrackType } from "@/types/search";
import type { GeneratedQueryItem } from "@/lib/ai-keyword-generator";

export const MAX_SEARCHES = 50;

export interface SearchItem {
  keyword: string;
  trackType: TrackType;
  /** Where it came from, so suggestions are never mistaken for the user's own list. */
  origin: "suggested" | "yours";
}

export type Suggestions = { kind: "idle" } | { kind: "loading" } | { kind: "ok"; items: SearchItem[] } | { kind: "failed" };

export interface SuggestionInput {
  domain: string;
  brandName: string;
  industry?: string;
  location: Location;
}

/**
 * Suggested searches from the suggestion service. "loading" is shown only
 * while the real request is in flight; a failure is reported as a failure,
 * never replaced with invented suggestions.
 */
export function useSearchSuggestions() {
  const [state, setState] = useState<Suggestions>({ kind: "idle" });
  const loadedFor = useRef<string | null>(null);

  const load = useCallback(async (input: SuggestionInput) => {
    const key = `${input.domain}|${input.industry ?? ""}|${input.location}`;
    if (loadedFor.current === key) return;
    loadedFor.current = key;
    setState({ kind: "loading" });
    try {
      const res = await fetch("/api/clients/ai-keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: input.domain, brandName: input.brandName, industry: input.industry || undefined, location: input.location }),
      });
      const json = (await res.json().catch(() => null)) as { success?: boolean; analysis?: { queries?: GeneratedQueryItem[] } } | null;
      const queries = res.ok && json?.success ? (json.analysis?.queries ?? []) : [];
      const seen = new Set<string>();
      const items: SearchItem[] = [];
      for (const q of queries) {
        const k = q.keyword.trim();
        if (!k || seen.has(k.toLowerCase())) continue;
        seen.add(k.toLowerCase());
        items.push({ keyword: k, trackType: q.trackType, origin: "suggested" });
      }
      setState(items.length > 0 ? { kind: "ok", items: items.slice(0, 24) } : { kind: "failed" });
    } catch {
      setState({ kind: "failed" });
    }
  }, []);

  return { suggestions: state, loadSuggestions: load };
}
