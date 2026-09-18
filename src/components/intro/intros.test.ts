import { describe, expect, it } from "vitest";
import { COMING_SOON_ENGINES, ENGINES } from "@/lib/geo";
import { NAV_GROUPS } from "@/components/layout/nav";
import { ENGINE_COVERAGE, INTROS } from "./intros";
import { CHAT_QUESTIONS, SETUP_HREF, STORY } from "./story";

function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

describe("first-use intros", () => {
  it("has an intro for every step of the product story", () => {
    for (const step of STORY) expect(INTROS[step.key], step.key).toBeDefined();
  });

  it("every main nav item (except Overview) is part of the story", () => {
    const hrefs = NAV_GROUPS.flatMap((g) => g.items).map((i) => i.href(null));
    const storyHrefs = STORY.map((s) => s.href);
    for (const href of hrefs.filter((h) => h !== "/dashboard")) expect(storyHrefs).toContain(href);
  });

  it("never uses em or en dashes in visible copy", () => {
    const all = [...strings(INTROS), ...CHAT_QUESTIONS, ...STORY.flatMap((s) => [s.label, s.question])];
    for (const s of all) expect(s, s).not.toMatch(/[–—]/);
  });

  it("keeps headlines short and descriptions under 25 words", () => {
    for (const [key, c] of Object.entries(INTROS)) {
      expect(c.headline.length, key).toBeLessThanOrEqual(60);
      expect(c.description.split(/\s+/).length, key).toBeLessThanOrEqual(25);
      expect(c.steps.length, key).toBeGreaterThanOrEqual(4);
      expect(c.steps.length, key).toBeLessThanOrEqual(5);
    }
  });

  it("uses AI Visibility as the name and GEO only as the category", () => {
    expect(INTROS.ai.page).toBe("AI Visibility");
    expect(INTROS.ai.category).toContain("GEO");
    const others = Object.entries(INTROS).filter(([k]) => k !== "ai");
    for (const [key, c] of others) expect(strings(c).join(" "), key).not.toMatch(/\bGEO\b/);
  });

  it("claims only the AI engines the product really checks", () => {
    expect(ENGINE_COVERAGE.live).toHaveLength(ENGINES.length);
    ENGINES.forEach((e, i) => expect(ENGINE_COVERAGE.live[i]).toContain(e.label));
    expect(ENGINE_COVERAGE.soon).toEqual(COMING_SOON_ENGINES);
  });

  it("marks next-action samples as examples", () => {
    expect(INTROS.actions.capabilities?.example).toBe(true);
  });

  it("sends every first-use CTA to project setup", () => {
    expect(SETUP_HREF).toBe("/dashboard/clients/new");
  });
});

describe("navigation", () => {
  const items = NAV_GROUPS.flatMap((g) => g.items);
  const reports = items.find((i) => i.label === "Reports")!;

  it("has Reports on its own route, active on the project reports page too", () => {
    expect(reports.href(null)).toBe("/dashboard/reports");
    expect(reports.href("abc")).toBe("/dashboard/reports");
    expect(reports.isActive("/dashboard/reports", null)).toBe(true);
    expect(reports.isActive("/dashboard/clients/abc/reports", null)).toBe(true);
  });

  it("puts AI Chat in its own AI group", () => {
    const ai = NAV_GROUPS.find((g) => g.title === "AI");
    expect(ai?.items.map((i) => i.label)).toEqual(["AI Chat"]);
  });
});
