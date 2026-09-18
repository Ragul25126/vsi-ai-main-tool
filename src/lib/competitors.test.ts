import { describe, expect, it } from "vitest";
import { computeGooglePresence, mergeCompetitors } from "./competitors";
import { computeGeo } from "./geo";

describe("competitors", () => {
  const google = computeGooglePresence(
    [
      { keywordId: "a", keyword: "a", results: [{ position: 1, domain: "rival.com" }, { position: 2, domain: "example.com" }, { position: 12, domain: "far.com" }] },
      { keywordId: "b", keyword: "b", results: [{ position: 4, url: "https://www.rival.com/x" }, { position: 5, domain: "reddit.com" }] },
    ],
    "example.com",
  );

  it("counts top-10 appearances per search, excluding you and positions past 10", () => {
    expect(google.get("rival.com")).toEqual({ top10: 2, best: 1 });
    expect(google.has("example.com")).toBe(false);
    expect(google.has("far.com")).toBe(false);
  });

  it("merges with AI presence and leaves platforms out", () => {
    const geo = computeGeo(
      [
        {
          id: "1", tracked_keyword_id: "a", keyword: "a", created_at: "2026-09-10", gap_label: null,
          aio_present: true, mentioned_in_text: false, client_cited: false, cited_domains: ["other.com"],
          ai_overview_present: null, ai_overview_client_cited: null, ai_overview_cited_domains: null,
          chatgpt_checked: false, chatgpt_brand_mentioned: null, chatgpt_brand_cited: null, chatgpt_competitors: null, chatgpt_cited_urls: null,
        },
      ],
      { domain: "example.com", enabled: { google_ai_mode: true, chatgpt: true, ai_overviews: false } },
    );
    const merged = mergeCompetitors(geo, google);
    expect(merged.map((m) => m.domain)).toEqual(["rival.com", "other.com"]);
    expect(merged.find((m) => m.domain === "other.com")).toMatchObject({ aiAnswers: 1, aiGapSearches: 1, googleTop10: 0 });
  });
});
