import { describe, expect, it } from "vitest";
import { parseTaskSource, toTaskPayload } from "./task-payload";

const VALID_GROUPS = ["Content", "Technical", "Off-page"];
const VALID_EFFORT = ["S", "M", "L", null];

describe("toTaskPayload", () => {
  const payload = toTaskPayload({
    clientId: "c1",
    source: "site_audit",
    findingKey: "broken_links",
    title: "2 links lead to a page that doesn't exist",
    whatWeFound: "2 broken links.",
    whyItMatters: "Dead ends.",
    whatToDo: "Fix them.",
    group: "Technical",
    owner: "Developer",
    impact: "medium",
    effort: "S",
    affected: ["https://example.com/a", "https://example.com/b"],
    acceptance: ["No broken links on the next audit"],
  });

  it("only uses values the tasks table accepts", () => {
    expect(VALID_GROUPS).toContain(payload.group_name);
    expect(VALID_EFFORT).toContain(payload.effort);
    expect(["low", "medium", "high"]).toContain(payload.impact);
  });

  it("builds a readable description with the source line", () => {
    expect(payload.description).toContain("What we found:\n2 broken links.");
    expect(payload.description).toContain("- https://example.com/a");
    expect(payload.acceptance).toEqual([{ text: "No broken links on the next audit", done: false }]);
  });

  it("round-trips the source", () => {
    expect(parseTaskSource(payload.description)).toEqual({ label: "Site Audit", findingKey: "broken_links" });
    expect(parseTaskSource("free text")).toBeNull();
  });
});
