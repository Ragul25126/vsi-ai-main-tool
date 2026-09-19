import "server-only";
import { createClient } from "@/lib/supabase/server";
import { isDummySupabase, requireSuperAdmin } from "@/lib/auth";
import { combineProviders, jobsHealth, type HealthState, type ServiceHealth } from "./health-model";
import type { AdminJob } from "./jobs-model";

type Provider = { name: string; envs: string[]; test?: (key: string) => Promise<{ ok: boolean; detail: string }> };

async function timedFetch(url: string, init: RequestInit): Promise<Response> {
  return fetch(url, { ...init, signal: AbortSignal.timeout(8000), cache: "no-store" });
}

/** Free calls only: they list models or read the account, never run a search or a completion. */
const AI_PROVIDERS: Provider[] = [
  {
    name: "OpenAI",
    envs: ["OPENAI_API_KEY"],
    test: async (key) => {
      const r = await timedFetch("https://api.openai.com/v1/models", { headers: { Authorization: `Bearer ${key}` } });
      return { ok: r.ok, detail: r.ok ? "Key accepted" : `Answered ${r.status}` };
    },
  },
  {
    name: "Anthropic",
    envs: ["ANTHROPIC_API_KEY"],
    test: async (key) => {
      const r = await timedFetch("https://api.anthropic.com/v1/models", { headers: { "x-api-key": key, "anthropic-version": "2023-06-01" } });
      return { ok: r.ok, detail: r.ok ? "Key accepted" : `Answered ${r.status}` };
    },
  },
  {
    name: "Google Gemini",
    envs: ["GEMINI_API_KEY", "GOOGLE_API_KEY"],
    test: async (key) => {
      const r = await timedFetch(`https://generativelanguage.googleapis.com/v1beta/models?pageSize=1&key=${encodeURIComponent(key)}`, {});
      return { ok: r.ok, detail: r.ok ? "Key accepted" : `Answered ${r.status}` };
    },
  },
  {
    name: "OpenRouter",
    envs: ["OPENROUTER_API_KEY"],
    test: async (key) => {
      const r = await timedFetch("https://openrouter.ai/api/v1/auth/key", { headers: { Authorization: `Bearer ${key}` } });
      return { ok: r.ok, detail: r.ok ? "Key accepted" : `Answered ${r.status}` };
    },
  },
];

const SEARCH_PROVIDERS: Provider[] = [
  {
    name: "SerpAPI",
    envs: ["SERPAPI_KEY", "SERPAPI_API_KEY"],
    test: async (key) => {
      const r = await timedFetch(`https://serpapi.com/account.json?api_key=${encodeURIComponent(key)}`, {});
      if (!r.ok) return { ok: false, detail: `Answered ${r.status}` };
      const a = (await r.json().catch(() => ({}))) as { plan_searches_left?: number; searches_per_month?: number; error?: string };
      if (a.error) return { ok: false, detail: "Key rejected" };
      return {
        ok: true,
        detail: typeof a.plan_searches_left === "number" ? `${a.plan_searches_left} of ${a.searches_per_month ?? "?"} monthly searches left` : "Key accepted",
      };
    },
  },
  // Serper has no free status call, so it can only ever show as configured.
  { name: "Serper", envs: ["SERPER_API_KEY"] },
];

function keyFor(p: Provider): string | null {
  for (const e of p.envs) {
    const v = process.env[e];
    if (v && v.trim()) return v.trim();
  }
  return null;
}

async function providerRows(list: Provider[], runTests: boolean) {
  return Promise.all(
    list.map(async (p) => {
      const key = keyFor(p);
      if (!key) return { name: p.name, state: "not_configured" as HealthState, detail: "No key set" };
      if (!runTests || !p.test) return { name: p.name, state: "configured" as HealthState, detail: p.test ? "Key set, not tested" : "Key set (no free test available)" };
      try {
        const t = await p.test(key);
        return { name: p.name, state: (t.ok ? "healthy" : "unavailable") as HealthState, detail: t.detail };
      } catch {
        return { name: p.name, state: "unavailable" as HealthState, detail: "Couldn't be reached" };
      }
    }),
  );
}

/** Tests the AI or search providers now (free calls). Admin only. */
export async function testProviders(kind: "ai" | "search"): Promise<ServiceHealth> {
  await requireSuperAdmin();
  const providers = await providerRows(kind === "ai" ? AI_PROVIDERS : SEARCH_PROVIDERS, true);
  const state = combineProviders(providers);
  return {
    key: kind,
    name: kind === "ai" ? "AI services" : "Search services",
    state,
    detail: summary(providers),
    testable: true,
    providers,
  };
}

function summary(providers: { name: string; state: HealthState }[]): string {
  const set = providers.filter((p) => p.state !== "not_configured");
  if (set.length === 0) return "No provider keys are set.";
  return `${set.map((p) => p.name).join(", ")} ${set.length === 1 ? "is" : "are"} set up.`;
}

/**
 * Checks that run on page load. Provider tests are only run when asked
 * (they call outside services), so those rows start as "configured".
 */
export async function loadHealth(jobs: AdminJob[] | null): Promise<ServiceHealth[]> {
  await requireSuperAdmin();
  const rows: ServiceHealth[] = [];

  // Database: a real, timed query.
  if (isDummySupabase()) {
    rows.push({ key: "database", name: "Database", state: "not_configured", detail: "No Supabase project is configured in this environment." });
  } else {
    const supabase = await createClient();
    const t0 = Date.now();
    const { error } = await supabase.from("system_settings").select("key", { count: "exact", head: true });
    const ms = Date.now() - t0;
    rows.push(error ? { key: "database", name: "Database", state: "unavailable", detail: "The database didn't answer a simple query." } : { key: "database", name: "Database", state: ms > 1500 ? "attention" : "healthy", detail: `Answered in ${ms} ms` });
  }

  // API: this page was rendered by the app server, which is the check.
  rows.push({ key: "api", name: "API", state: "healthy", detail: "The app server is responding (it rendered this page)." });

  // Background jobs.
  if (isDummySupabase() || !jobs) {
    rows.push({ key: "jobs", name: "Background jobs", state: isDummySupabase() ? "not_configured" : "unavailable", detail: isDummySupabase() ? "No database to read job history from." : "Job history couldn't be read." });
  } else {
    const supabase = await createClient();
    const { data: last } = await supabase.from("cron_runs").select("started_at, finished_at").order("started_at", { ascending: false }).limit(1).maybeSingle();
    const dayAgo = Date.now() - 86_400_000;
    const recent = jobs.filter((j) => j.startedAt && new Date(j.startedAt).getTime() >= dayAgo);
    const h = jobsHealth({
      cronSecretSet: !!process.env.CRON_SECRET,
      lastRunStartedAt: (last?.started_at as string | undefined) ?? null,
      lastRunFinishedAt: (last?.finished_at as string | undefined) ?? null,
      failedLast24h: recent.filter((j) => j.status === "failed").length,
      stuck: jobs.filter((j) => j.stuck).length,
      now: Date.now(),
    });
    rows.push({ key: "jobs", name: "Background jobs", ...h });
  }

  // AI and search providers: key presence only until tested.
  const [ai, search] = await Promise.all([providerRows(AI_PROVIDERS, false), providerRows(SEARCH_PROVIDERS, false)]);
  rows.push({ key: "ai", name: "AI services", state: combineProviders(ai), detail: summary(ai), testable: ai.some((p) => p.state !== "not_configured"), providers: ai });
  rows.push({ key: "search", name: "Search services", state: combineProviders(search), detail: summary(search), testable: search.some((p) => p.state !== "not_configured"), providers: search });

  // Storage: list the one bucket the app uses.
  if (isDummySupabase()) {
    rows.push({ key: "storage", name: "Storage", state: "not_configured", detail: "No Supabase project is configured in this environment." });
  } else {
    const supabase = await createClient();
    const { error } = await supabase.storage.from("agency-logos").list("", { limit: 1 });
    rows.push(
      !error
        ? { key: "storage", name: "Storage", state: "healthy", detail: "The logo bucket can be read." }
        : /not found/i.test(error.message)
          ? { key: "storage", name: "Storage", state: "not_configured", detail: "The agency-logos bucket doesn't exist." }
          : { key: "storage", name: "Storage", state: "unavailable", detail: "The logo bucket couldn't be read." },
    );
  }

  return rows;
}
