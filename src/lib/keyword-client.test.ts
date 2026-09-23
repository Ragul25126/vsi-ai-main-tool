import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { addSearches, removeSearch } from "./keyword-client";

describe("keyword-client", () => {
  const origFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = origFetch;
  });

  it("addSearches successfully posts searches to API route", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, count: 2, searches: [{ id: "1" }, { id: "2" }] }),
    });

    const res = await addSearches("proj-123", [
      { keyword: "best e-commerce & online services in dubai", trackType: "both" },
      { keyword: "professional e-commerce & online services experts dubai", trackType: "both" },
    ]);

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/api/projects/proj-123/keywords",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          searches: [
            { keyword: "best e-commerce & online services in dubai", trackType: "both" },
            { keyword: "professional e-commerce & online services experts dubai", trackType: "both" },
          ],
        }),
      })
    );
    expect(res).toEqual({ ok: true, count: 2 });
  });

  it("addSearches handles API errors and returns error message", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: { code: "keyword_limit", message: "Keyword limit reached for this agency." } }),
    });

    const res = await addSearches("proj-123", ["search term"]);
    expect(res).toEqual({
      ok: false,
      code: "keyword_limit",
      message: "Keyword limit reached for this agency.",
    });
  });

  it("addSearches handles network errors gracefully", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Network offline"));

    const res = await addSearches("proj-123", ["search term"]);
    expect(res).toEqual({
      ok: false,
      code: "network",
      message: "We couldn't reach VSI. Check your connection and try again.",
    });
  });

  it("removeSearch sends DELETE to API route", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });

    const res = await removeSearch("proj-123", "kw-456");
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/api/projects/proj-123/keywords/kw-456",
      expect.objectContaining({ method: "DELETE" })
    );
    expect(res).toEqual({ ok: true });
  });

  it("removeSearch handles deletion failure", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: { code: "not_found", message: "That search isn't available." } }),
    });

    const res = await removeSearch("proj-123", "kw-456");
    expect(res).toEqual({
      ok: false,
      code: "not_found",
      message: "That search isn't available.",
    });
  });
});
