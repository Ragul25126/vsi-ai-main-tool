import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

// The Supabase user the middleware sees.
const state: { user: { id: string; email: string } | null } = { user: null };

vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({ auth: { getUser: async () => ({ data: { user: state.user } }) } }),
}));

async function run(path: string, cookies: Record<string, string> = {}) {
  vi.resetModules();
  const { middleware } = await import("./middleware");
  const cookie = Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join("; ");
  const req = new NextRequest(`http://localhost:3000${path}`, { headers: cookie ? { cookie } : {} });
  return middleware(req);
}

const redirectsTo = (res: Response, path: string) =>
  res.status >= 300 && res.status < 400 && new URL(res.headers.get("location") ?? "", "http://localhost:3000").pathname === path;

describe("middleware sign-in rules", () => {
  beforeEach(() => {
    state.user = null;
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://abcd1234.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("lets any signed-in Supabase user into the dashboard, whatever their email", async () => {
    state.user = { id: "u2", email: "new.person@example.org" };
    const res = await run("/dashboard");
    expect(res.status).toBe(200);
    expect(res.headers.get("location")).toBeNull();
  });

  it("does not sign a user out or send them to /login because of their email", async () => {
    state.user = { id: "u9", email: "someone.else@example.com" };
    const res = await run("/dashboard/tasks");
    expect(redirectsTo(res, "/login")).toBe(false);
    expect(res.headers.get("set-cookie") ?? "").not.toContain("vsi_session=;");
  });

  it("sends a visitor who is not signed in to /login", async () => {
    const res = await run("/dashboard");
    expect(redirectsTo(res, "/login")).toBe(true);
  });

  it("does not trust forged cookies when a real Supabase project is configured", async () => {
    const res = await run("/dashboard", { vsi_session: "authenticated", vsi_user_email: encodeURIComponent("new.person@example.org") });
    expect(redirectsTo(res, "/login")).toBe(true);
  });

  it("opens the auth page in sign-up mode from the legacy register link", async () => {
    const res = await run("/auth/register");
    const location = new URL(res.headers.get("location") ?? "", "http://localhost:3000");
    expect(location.pathname).toBe("/login");
    expect(location.searchParams.get("mode")).toBe("signup");
  });

  it("keeps the login page public", async () => {
    const res = await run("/login");
    expect(redirectsTo(res, "/login")).toBe(false);
    expect(res.status).toBe(200);
  });
});
