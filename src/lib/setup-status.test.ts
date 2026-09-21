import { beforeEach, describe, expect, it, vi } from "vitest";

type Reply = { count?: number; error?: { code: string } | null };
const state: { replies: Record<string, Reply>; queries: string[] } = { replies: {}, queries: [] };

vi.mock("react", async (orig) => {
  const r: Record<string, unknown> = await orig();
  const stores: Map<string, Promise<unknown>>[] = (globalThis as { __stores2?: Map<string, Promise<unknown>>[] }).__stores2 ?? [];
  (globalThis as { __stores2?: Map<string, Promise<unknown>>[] }).__stores2 = stores;
  const cache = (fn: (...a: unknown[]) => unknown) => {
    const store = new Map<string, Promise<unknown>>();
    stores.push(store);
    return (...args: unknown[]) => {
      const key = JSON.stringify(args);
      if (!store.has(key)) store.set(key, Promise.resolve(fn(...args)));
      return store.get(key);
    };
  };
  return { ...r, default: { ...(r.default as object), cache }, cache };
});
vi.mock("@/lib/auth", () => ({ isDummySupabase: () => false }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    from: (table: string) => {
      const filters: string[] = [];
      const b: Record<string, unknown> = {};
      b.select = () => b;
      b.eq = (col: string, val: unknown) => { filters.push(`${col}=${val}`); return b; };
      b.then = (res: (v: unknown) => unknown) => {
        const key = table === "site_audits" ? `site_audits:${filters.find((f) => f.startsWith("status="))}` : table;
        state.queries.push(key);
        const r = state.replies[key] ?? { count: 0, error: null };
        return Promise.resolve({ count: r.count ?? 0, error: r.error ?? null, data: null }).then(res);
      };
      return b;
    },
  }),
}));

async function fresh() {
  ((globalThis as { __stores2?: Map<string, Promise<unknown>>[] }).__stores2 ?? []).forEach((s) => s.clear());
  vi.resetModules();
  return import("./setup-status");
}

describe("setup status", () => {
  beforeEach(() => {
    state.queries = [];
    state.replies = {
      tracked_keywords: { count: 7 },
      "site_audits:status=completed": { count: 2 },
      "site_audits:status=running": { count: 1 },
      search_results: { count: 40 },
      tasks: { count: 5 },
    };
  });

  it("the layout's counts read only searches and audits, not stored results or tasks", async () => {
    const { loadOnboardingCounts } = await fresh();
    expect(await loadOnboardingCounts("p1")).toEqual({ searches: 7, audits: 2, auditRunning: true, known: true });
    expect(state.queries.sort()).toEqual(["site_audits:status=completed", "site_audits:status=running", "tracked_keywords"]);
  });

  it("the full status returns every field exactly as before", async () => {
    const { loadSetupStatus } = await fresh();
    expect(await loadSetupStatus("p1")).toEqual({ searches: 7, checks: 40, audits: 2, auditRunning: true, tasks: 5, known: true });
  });

  it("the full status reuses the layout's counts: five reads in total, not eight", async () => {
    const { loadOnboardingCounts, loadSetupStatus } = await fresh();
    await loadOnboardingCounts("p1");
    await loadSetupStatus("p1");
    expect(state.queries).toHaveLength(5);
    expect(state.queries.filter((q) => q === "tracked_keywords")).toHaveLength(1);
  });

  it("is unknown, with zeros, when the searches count fails (both loaders)", async () => {
    state.replies.tracked_keywords = { error: { code: "57014" } };
    const { loadOnboardingCounts, loadSetupStatus } = await fresh();
    expect(await loadOnboardingCounts("p1")).toMatchObject({ known: false, searches: 0, audits: 0, auditRunning: false });
    expect(await loadSetupStatus("p1")).toEqual({ searches: 0, checks: 0, audits: 0, auditRunning: false, tasks: 0, known: false });
  });

  it("the full status is unknown when the results or tasks count fails, as before", async () => {
    state.replies.search_results = { error: { code: "57014" } };
    let { loadSetupStatus } = await fresh();
    expect((await loadSetupStatus("p1")).known).toBe(false);
    state.replies.search_results = { count: 40 };
    state.replies.tasks = { error: { code: "57014" } };
    ({ loadSetupStatus } = await fresh());
    expect((await loadSetupStatus("p1")).known).toBe(false);
  });

  it("treats a missing audits table as no audits, as before", async () => {
    state.replies["site_audits:status=completed"] = { error: { code: "42P01" } };
    state.replies["site_audits:status=running"] = { error: { code: "42P01" } };
    const { loadSetupStatus } = await fresh();
    expect(await loadSetupStatus("p1")).toMatchObject({ known: true, audits: 0, auditRunning: false, searches: 7, checks: 40, tasks: 5 });
  });
});
