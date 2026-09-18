import { describe, expect, it } from "vitest";
import { MAX_COMPETITORS, validateCompetitorDomain } from "./project-competitors";

describe("validateCompetitorDomain", () => {
  it("normalises a pasted address", () => {
    expect(validateCompetitorDomain("https://www.Rival.com/pricing", "example.com", [])).toEqual({ ok: true, domain: "rival.com" });
  });

  it("rejects your own website, including subdomains", () => {
    expect(validateCompetitorDomain("example.com", "https://www.example.com", []).ok).toBe(false);
    expect(validateCompetitorDomain("shop.example.com", "example.com", []).ok).toBe(false);
  });

  it("rejects duplicates and anything that isn't a website", () => {
    expect(validateCompetitorDomain("rival.com", "example.com", ["rival.com"]).ok).toBe(false);
    expect(validateCompetitorDomain("not a site", "example.com", []).ok).toBe(false);
    expect(validateCompetitorDomain("", "example.com", []).ok).toBe(false);
  });

  it("stops at the limit", () => {
    const existing = Array.from({ length: MAX_COMPETITORS }, (_, i) => `rival${i}.com`);
    expect(validateCompetitorDomain("another.com", "example.com", existing)).toMatchObject({ ok: false });
  });
});
