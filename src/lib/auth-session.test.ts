import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Cookies the "browser" sends, and the Supabase user/profile the server sees.
const state: {
  cookies: Record<string, string>;
  user: { id: string; email: string } | null;
  profile: Record<string, unknown> | null;
} = { cookies: {}, user: null, profile: null };

vi.mock("next/headers", () => ({
  cookies: async () => ({
    has: (n: string) => n in state.cookies,
    get: (n: string) => (n in state.cookies ? { name: n, value: state.cookies[n] } : undefined),
    getAll: () => Object.entries(state.cookies).map(([name, value]) => ({ name, value })),
  }),
}));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT ${url}`);
  },
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: state.user } }) },
    from: () => ({
      select: () => ({ eq: () => ({ single: async () => ({ data: state.profile }) }) }),
    }),
  }),
}));

const ADMIN_EMAIL = "valgrowlabs444@gmail.com";
const forged = { vsi_session: "authenticated", vsi_user_email: encodeURIComponent(ADMIN_EMAIL) };

async function freshSession() {
  vi.resetModules();
  const mod = await import("./auth");
  return mod;
}

describe("getSession", () => {
  beforeEach(() => {
    state.cookies = {};
    state.user = null;
    state.profile = null;
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("ignores forged cookies when a real Supabase project is configured", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://abcd1234.supabase.co");
    vi.stubEnv("NODE_ENV", "production");
    state.cookies = forged;
    const { getSession } = await freshSession();
    expect(await getSession()).toBeNull();
  });

  it("ignores forged cookies in production even with placeholder credentials", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://your-project.supabase.co");
    vi.stubEnv("NODE_ENV", "production");
    state.cookies = forged;
    const { getSession } = await freshSession();
    expect(await getSession()).toBeNull();
  });

  it("still allows the local development session without a database", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://your-project.supabase.co");
    vi.stubEnv("NODE_ENV", "development");
    state.cookies = forged;
    const { getSession } = await freshSession();
    expect((await getSession())?.email).toBe(ADMIN_EMAIL);
  });

  it("uses the Supabase user and profile role", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://abcd1234.supabase.co");
    state.cookies = { "sb-abcd1234-auth-token": "x" };
    state.user = { id: "u1", email: ADMIN_EMAIL };
    state.profile = { agency_id: "a1", role: "pilot", full_name: "Pat", is_disabled: false, agencies: { name: "Acme", is_disabled: false } };
    const { getSession } = await freshSession();
    const s = await getSession();
    expect(s?.userId).toBe("u1");
    expect(s?.role).toBe("pilot");
  });

  it("signs out a disabled user and members of a disabled organization", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://abcd1234.supabase.co");
    state.cookies = { "sb-abcd1234-auth-token": "x" };
    state.user = { id: "u1", email: ADMIN_EMAIL };
    state.profile = { agency_id: "a1", role: "pilot", is_disabled: true, agencies: { name: "Acme", is_disabled: false } };
    let mod = await freshSession();
    expect(await mod.getSession()).toBeNull();

    state.profile = { agency_id: "a1", role: "pilot", is_disabled: false, agencies: { name: "Acme", is_disabled: true } };
    mod = await freshSession();
    expect(await mod.getSession()).toBeNull();
  });

  it("requireSuperAdmin sends a member away", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://abcd1234.supabase.co");
    state.cookies = { "sb-abcd1234-auth-token": "x" };
    state.user = { id: "u1", email: ADMIN_EMAIL };
    state.profile = { agency_id: "a1", role: "pilot", is_disabled: false, agencies: { name: "Acme", is_disabled: false } };
    const { requireSuperAdmin } = await freshSession();
    await expect(requireSuperAdmin()).rejects.toThrow("REDIRECT /dashboard");
  });

  it("admin APIs answer 401/403 in JSON instead of redirecting", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://abcd1234.supabase.co");
    vi.resetModules();
    let { adminApiSession } = await import("./admin/api");
    const anon = await adminApiSession();
    expect(anon instanceof Response && anon.status).toBe(401);

    state.cookies = { "sb-abcd1234-auth-token": "x" };
    state.user = { id: "u1", email: ADMIN_EMAIL };
    state.profile = { agency_id: "a1", role: "pilot", is_disabled: false, agencies: { name: "Acme", is_disabled: false } };
    vi.resetModules();
    ({ adminApiSession } = await import("./admin/api"));
    const member = await adminApiSession();
    expect(member instanceof Response && member.status).toBe(403);

    state.profile = { ...state.profile, role: "super_admin" };
    vi.resetModules();
    ({ adminApiSession } = await import("./admin/api"));
    const admin = await adminApiSession();
    expect(admin instanceof Response).toBe(false);
  });
});
