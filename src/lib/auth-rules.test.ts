import { describe, expect, it } from "vitest";
import { cookieSessionAllowed, isAccountBlocked, isDummySupabaseUrl } from "./auth-rules";

describe("cookieSessionAllowed", () => {
  it("allows cookie-only sessions only for local dev without a database", () => {
    expect(cookieSessionAllowed({ supabaseUrl: "https://your-project.supabase.co", nodeEnv: "development" })).toBe(true);
    expect(cookieSessionAllowed({ supabaseUrl: "", nodeEnv: "development" })).toBe(true);
  });

  it("never allows them in production, even with placeholder credentials", () => {
    expect(cookieSessionAllowed({ supabaseUrl: "https://your-project.supabase.co", nodeEnv: "production" })).toBe(false);
  });

  it("never allows them when a real Supabase project is configured", () => {
    expect(cookieSessionAllowed({ supabaseUrl: "https://abcd1234.supabase.co", nodeEnv: "development" })).toBe(false);
  });

  it("recognises placeholder URLs", () => {
    expect(isDummySupabaseUrl("https://dummy.supabase.co")).toBe(true);
    expect(isDummySupabaseUrl("https://abcd1234.supabase.co")).toBe(false);
  });
});

describe("isAccountBlocked", () => {
  it("signs out disabled users, including admins", () => {
    expect(isAccountBlocked({ role: "pilot", userDisabled: true, orgDisabled: false })).toBe(true);
    expect(isAccountBlocked({ role: "super_admin", userDisabled: true, orgDisabled: false })).toBe(true);
  });

  it("signs out members of a disabled organization but not platform admins", () => {
    expect(isAccountBlocked({ role: "pilot", userDisabled: false, orgDisabled: true })).toBe(true);
    expect(isAccountBlocked({ role: "super_admin", userDisabled: false, orgDisabled: true })).toBe(false);
  });

  it("lets active accounts through", () => {
    expect(isAccountBlocked({ role: "pilot", userDisabled: false, orgDisabled: false })).toBe(false);
    expect(isAccountBlocked({ role: "pilot", userDisabled: null, orgDisabled: undefined })).toBe(false);
  });
});
