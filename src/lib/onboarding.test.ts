import { describe, expect, it } from "vitest";
import { nextGuideStep, type OnboardingState } from "./onboarding";

const base: OnboardingState = { hasProject: true, known: true, searches: 0, competitors: 0, auditDone: false, auditRunning: false };

describe("nextGuideStep", () => {
  it("starts with the website when there is no project", () => {
    expect(nextGuideStep({ ...base, hasProject: false, known: false })).toBe("website");
  });

  it("walks through searches, competitors, then the site audit", () => {
    expect(nextGuideStep(base)).toBe("searches");
    expect(nextGuideStep({ ...base, searches: 12 })).toBe("competitors");
    expect(nextGuideStep({ ...base, searches: 12, competitors: 3 })).toBe("audit");
  });

  it("disappears once the site audit is done or running", () => {
    expect(nextGuideStep({ ...base, searches: 12, competitors: 3, auditDone: true })).toBeNull();
    expect(nextGuideStep({ ...base, searches: 12, competitors: 3, auditRunning: true })).toBeNull();
  });

  it("only ever points at one step", () => {
    // Nothing set up: still just the first missing step.
    expect(nextGuideStep(base)).toBe("searches");
  });

  it("skips competitors when competitor storage isn't available", () => {
    expect(nextGuideStep({ ...base, searches: 3, competitors: null })).toBe("audit");
  });

  it("respects 'Not now' for optional steps but never for the website", () => {
    expect(nextGuideStep({ ...base, searches: 3 }, ["competitors"])).toBe("audit");
    expect(nextGuideStep(base, ["searches", "competitors", "audit"])).toBeNull();
    expect(nextGuideStep({ ...base, hasProject: false }, ["website"])).toBe("website");
  });

  it("shows nothing when the project's state couldn't be read", () => {
    expect(nextGuideStep({ ...base, known: false })).toBeNull();
  });
});
