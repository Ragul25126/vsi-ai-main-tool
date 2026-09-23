import { describe, expect, it } from "vitest";
import { LOCATIONS } from "@/types/search";

const LOCATION_OPTIONS = Object.entries(LOCATIONS).map(([code, val]) => ({
  code,
  label: val.label,
  country: val.label.split("(")[0].trim(),
}));

function resolveLocation(newLoc: string | undefined, defaultLocation: string, defaultCode: string) {
  const trimmedLoc = (newLoc || "").trim();
  const locMatch = LOCATION_OPTIONS.find(
    (l) =>
      l.country.toLowerCase() === trimmedLoc.toLowerCase() ||
      l.label.toLowerCase() === trimmedLoc.toLowerCase() ||
      l.code.toLowerCase() === trimmedLoc.toLowerCase() ||
      (trimmedLoc.toLowerCase().includes("emirates") && l.code === "ae") ||
      (trimmedLoc.toLowerCase().includes("dubai") && l.code === "ae") ||
      (trimmedLoc.toLowerCase().includes("singapore") && l.code === "sg") ||
      (trimmedLoc.toLowerCase().includes("india") && l.code === "in") ||
      (trimmedLoc.toLowerCase().includes("united states") && l.code === "us") ||
      (trimmedLoc.toLowerCase().includes("kingdom") && l.code === "uk") ||
      (trimmedLoc.toLowerCase().includes("lanka") && l.code === "lk")
  );

  return {
    location: locMatch ? locMatch.country : (trimmedLoc || defaultLocation),
    locationCode: locMatch ? locMatch.code : defaultCode,
  };
}

describe("Location Resolution and Saving", () => {
  it("resolves Singapore correctly", () => {
    const res = resolveLocation("Singapore", "United States", "us");
    expect(res.location).toBe("Singapore");
    expect(res.locationCode).toBe("sg");
  });

  it("resolves sg code to Singapore", () => {
    const res = resolveLocation("sg", "United States", "us");
    expect(res.location).toBe("Singapore");
    expect(res.locationCode).toBe("sg");
  });

  it("resolves UAE aliases correctly", () => {
    const res1 = resolveLocation("UAE", "United States", "us");
    expect(res1.location).toBe("UAE");
    expect(res1.locationCode).toBe("ae");

    const res2 = resolveLocation("United Arab Emirates", "United States", "us");
    expect(res2.location).toBe("UAE");
    expect(res2.locationCode).toBe("ae");

    const res3 = resolveLocation("Dubai, United Arab Emirates", "United States", "us");
    expect(res3.location).toBe("UAE");
    expect(res3.locationCode).toBe("ae");
  });

  it("resolves United States correctly", () => {
    const res = resolveLocation("United States", "UAE", "ae");
    expect(res.location).toBe("United States");
    expect(res.locationCode).toBe("us");
  });

  it("preserves fallback when empty", () => {
    const res = resolveLocation("", "United States", "us");
    expect(res.location).toBe("United States");
    expect(res.locationCode).toBe("us");
  });
});
