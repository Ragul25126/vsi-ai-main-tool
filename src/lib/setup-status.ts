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

const head = { count: "exact" as const, head: true };

/** The counts the dashboard layout's first-use guidance needs: active searches and audits. */
export interface OnboardingCounts {
  searches: number;
  audits: number;
  auditRunning: boolean;
  /** False when the searches count couldn't be read (dummy mode or a database error). */
  known: boolean;
}

const UNKNOWN_ONBOARDING: OnboardingCounts = { searches: 0, audits: 0, auditRunning: false, known: false };

/**
 * Only what the layout's onboarding state reads (searches, completed audits, a running audit). The layout renders
 * on every dashboard page, so it no longer also counts stored results and tasks: only the Reports and Tasks pages
 * use those, and they ask for them through loadSetupStatus.
 */
export const loadOnboardingCounts = cache(async (projectId: string): Promise<OnboardingCounts> => {
  if (isDummySupabase()) return UNKNOWN_ONBOARDING;
  const supabase = await createClient();
  const [searches, audits, running] = await Promise.all([
    supabase.from("tracked_keywords").select("id", head).eq("client_id", projectId).eq("is_active", true),
    supabase.from("site_audits").select("id", head).eq("client_id", projectId).eq("status", "completed"),
    supabase.from("site_audits").select("id", head).eq("client_id", projectId).eq("status", "running"),
  ]);
  if (searches.error) {
    console.error("[setup-status] count failed", { s: searches.error.code });
    return UNKNOWN_ONBOARDING;
  }
  return {
    searches: searches.count ?? 0,
    // The audit table may not be migrated yet; treat that as "no audits".
    audits: audits.error ? 0 : audits.count ?? 0,
    auditRunning: running.error ? false : (running.count ?? 0) > 0,
    known: true,
  };
});

/**
 * The full set of counts. It shares the searches and audit counts with loadOnboardingCounts (the layout has usually
 * read them already) and adds the stored-results and task counts, all in one round trip.
 */
export const loadSetupStatus = cache(async (projectId: string): Promise<SetupStatus> => {
  if (isDummySupabase()) return EMPTY;
  const supabase = await createClient();
  const [base, checks, tasks] = await Promise.all([
    loadOnboardingCounts(projectId),
    supabase.from("search_results").select("id", head).eq("client_id", projectId),
    supabase.from("tasks").select("id", head).eq("client_id", projectId),
  ]);
  if (!base.known || checks.error || tasks.error) {
    console.error("[setup-status] count failed", { c: checks.error?.code, t: tasks.error?.code });
    return EMPTY;
  }
  return {
    searches: base.searches,
    checks: checks.count ?? 0,
    audits: base.audits,
    auditRunning: base.auditRunning,
    tasks: tasks.count ?? 0,
    known: true,
  };
});
