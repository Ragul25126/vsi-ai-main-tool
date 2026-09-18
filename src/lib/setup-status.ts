import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isDummySupabase } from "@/lib/auth";

/**
 * What has really been set up for a project. Used to decide between the
 * "project but no data" state and the data state, and to fill the setup
 * checklist. Every number is a count of stored rows; nothing is estimated.
 */
export interface SetupStatus {
  /** Active tracked searches. */
  searches: number;
  /** Stored search / AI check results. */
  checks: number;
  /** Completed site audits (0 when the site_audits table isn't set up). */
  audits: number;
  auditRunning: boolean;
  tasks: number;
  /** False when counts couldn't be read (dummy mode or a database error). */
  known: boolean;
}

const EMPTY: SetupStatus = { searches: 0, checks: 0, audits: 0, auditRunning: false, tasks: 0, known: false };

export const loadSetupStatus = cache(async (projectId: string): Promise<SetupStatus> => {
  if (isDummySupabase()) return EMPTY;
  const supabase = await createClient();
  const head = { count: "exact" as const, head: true };
  const [searches, checks, audits, running, tasks] = await Promise.all([
    supabase.from("tracked_keywords").select("id", head).eq("client_id", projectId).eq("is_active", true),
    supabase.from("search_results").select("id", head).eq("client_id", projectId),
    supabase.from("site_audits").select("id", head).eq("client_id", projectId).eq("status", "completed"),
    supabase.from("site_audits").select("id", head).eq("client_id", projectId).eq("status", "running"),
    supabase.from("tasks").select("id", head).eq("client_id", projectId),
  ]);
  if (searches.error || checks.error || tasks.error) {
    console.error("[setup-status] count failed", { s: searches.error?.code, c: checks.error?.code, t: tasks.error?.code });
    return EMPTY;
  }
  return {
    searches: searches.count ?? 0,
    checks: checks.count ?? 0,
    // The audit table may not be migrated yet; treat that as "no audits".
    audits: audits.error ? 0 : audits.count ?? 0,
    auditRunning: running.error ? false : (running.count ?? 0) > 0,
    tasks: tasks.count ?? 0,
    known: true,
  };
});
