import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isDummySupabase } from "@/lib/auth";
import { isMissingTableError } from "@/lib/site-audit/store";
import type { TrackedCompetitor } from "@/lib/project-competitors";

export type CompetitorsLoad =
  | { state: "ok"; competitors: TrackedCompetitor[] }
  /** Migration 036 hasn't been applied to this database yet. */
  | { state: "setup_required"; competitors: [] }
  | { state: "error"; competitors: []; message: string };

/** The competitors the user added to a project. RLS limits rows to the caller's organization. */
export const loadProjectCompetitors = cache(async (projectId: string): Promise<CompetitorsLoad> => {
  if (isDummySupabase()) return { state: "ok", competitors: [] };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("project_competitors")
    .select("id, domain, name, created_at")
    .eq("client_id", projectId)
    .order("created_at", { ascending: true });
  if (error) {
    if (isMissingTableError(error, "project_competitors")) return { state: "setup_required", competitors: [] };
    console.error("[competitors] load failed", { code: error.code });
    return { state: "error", competitors: [], message: "We couldn't load your competitors right now." };
  }
  return {
    state: "ok",
    competitors: ((data ?? []) as { id: string; domain: string; name: string | null; created_at: string }[]).map((r) => ({
      id: r.id,
      domain: r.domain,
      name: r.name,
      createdAt: r.created_at,
    })),
  };
});
