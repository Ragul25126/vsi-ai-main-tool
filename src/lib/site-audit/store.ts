import type { CheckResult } from "./types";

/** Postgres "undefined table" or PostgREST "table not in schema cache". */
export function isMissingTableError(err: { code?: string; message?: string } | null | undefined): boolean {
  if (!err) return false;
  if (err.code === "42P01" || err.code === "PGRST205") return true;
  const msg = err.message ?? "";
  return /site_audits/.test(msg) && /does not exist|schema cache/i.test(msg);
}

export interface StoredAudit {
  id: string;
  status: "running" | "completed" | "failed";
  domain: string;
  score: number | null;
  pages_scanned: number;
  checks: CheckResult[];
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

export type AuditLoad =
  | {
      state: "ok";
      /** Most recent successful audit. */
      completed: StoredAudit | null;
      running: StoredAudit | null;
      /** Set only when the newest finished run failed (newer than `completed`). */
      lastFailed: StoredAudit | null;
      history: Pick<StoredAudit, "id" | "score" | "created_at">[];
    }
  | { state: "setup_required" }
  | { state: "error"; message: string };
