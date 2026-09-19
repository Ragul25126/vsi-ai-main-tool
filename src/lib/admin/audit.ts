import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { SessionContext } from "@/lib/auth";

export type AdminAction =
  | "organization.updated"
  | "organization.disabled"
  | "organization.enabled"
  | "organization.deleted"
  | "user.disabled"
  | "user.enabled"
  | "user.removed"
  | "invite.created"
  | "settings.updated"
  | "prompt.updated"
  | "prompt.reset"
  | "project.engines_updated"
  | "project.identity_updated"
  | "feedback.updated";

/**
 * Record a platform admin action in audit_log. Never blocks the action it
 * describes: if the table isn't there yet (migration 037), it logs and moves on.
 */
export async function recordAdminAction(
  session: SessionContext,
  entry: { action: AdminAction; targetType: string; targetId?: string | null; agencyId?: string | null; summary: string; meta?: Record<string, unknown> },
): Promise<void> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("audit_log").insert({
      actor_id: session.userId,
      actor_email: session.email,
      agency_id: entry.agencyId ?? null,
      action: entry.action,
      target_type: entry.targetType,
      target_id: entry.targetId ?? null,
      summary: entry.summary,
      meta: entry.meta ?? {},
    });
    if (error) console.error("[audit] could not record", { action: entry.action, code: error.code });
  } catch (e) {
    console.error("[audit] could not record", entry.action, e instanceof Error ? e.message : e);
  }
}
