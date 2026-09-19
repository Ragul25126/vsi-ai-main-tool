import { recordAdminAction } from "@/lib/admin/audit";
import { adminApiSession, adminDbError, adminUnexpected } from "@/lib/admin/api";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const NOT_CHANGED = () =>
  NextResponse.json(
    { error: "Nothing was changed. The user may not exist, or the database update for admin user actions (migration 037) isn't applied yet." },
    { status: 404 },
  );

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
 try {
 const session = await adminApiSession();
 if (session instanceof NextResponse) return session;
 const { id } = await ctx.params;
 if (id === session.userId) {
 return NextResponse.json({ error: "You can't disable your own account." }, { status: 400 });
 }
 const body = (await req.json()) as { is_disabled?: boolean; disabled_reason?: string };
 if (typeof body.is_disabled !== "boolean") {
 return NextResponse.json({ error: "is_disabled is required (true / false)" }, { status: 400 });
 }
 const supabase = await createClient();
 const { data, error } = await supabase
 .from("profiles")
 .update({
 is_disabled: body.is_disabled,
 disabled_at: body.is_disabled ? new Date().toISOString() : null,
 disabled_reason: body.is_disabled ? (body.disabled_reason ?? null) : null,
 })
 .eq("id", id)
 .select("id, full_name, agency_id");
 if (error) return adminDbError("users/[id]", error);
 // RLS silently skips rows it won't let you change: report that, never a false success.
 if (!data || data.length === 0) return NOT_CHANGED();
 const who = (data[0] as { full_name: string | null }).full_name ?? "a user";
 await recordAdminAction(session, {
 action: body.is_disabled ? "user.disabled" : "user.enabled",
 targetType: "user",
 targetId: id,
 agencyId: (data[0] as { agency_id: string | null }).agency_id,
 summary: body.is_disabled ? `disabled ${who}${body.disabled_reason ? ` (${body.disabled_reason})` : ""}` : `re-enabled ${who}`,
 });
 return NextResponse.json({ ok: true });
 } catch (e) {
 return adminUnexpected("users/[id]", e);
 }
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
 try {
 const session = await adminApiSession();
 if (session instanceof NextResponse) return session;
 const { id } = await ctx.params;
 if (id === session.userId) {
 return NextResponse.json({ error: "You can't delete your own account." }, { status: 400 });
 }
 const supabase = await createClient();
 // Deleting the profile row severs the user from every agency-scoped
 // resource (RLS denies access). The auth.users row is orphaned but
 // harmless. Supabase service-role deletion would be needed to remove
 // it fully, which we leave to manual cleanup.
 const { data, error } = await supabase.from("profiles").delete().eq("id", id).select("id, full_name, agency_id");
 if (error) return adminDbError("users/[id]", error);
 if (!data || data.length === 0) return NOT_CHANGED();
 await recordAdminAction(session, {
 action: "user.removed",
 targetType: "user",
 targetId: id,
 agencyId: (data[0] as { agency_id: string | null }).agency_id,
 summary: `removed ${(data[0] as { full_name: string | null }).full_name ?? "a user"} from the platform`,
 });
 return NextResponse.json({ ok: true });
 } catch (e) {
 return adminUnexpected("users/[id]", e);
 }
}
