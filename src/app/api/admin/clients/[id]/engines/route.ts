import { adminApiSession, adminDbError, adminUnexpected } from "@/lib/admin/api";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const ENGINE_KEYS = [
 "ai_mode_enabled",
 "ai_overview_enabled",
 "rank_tracking_enabled",
 "chatgpt_enabled",
 "llm_mentions_enabled",
] as const;

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
 try {
 const guard = await adminApiSession();
 if (guard instanceof NextResponse) return guard;
 const { id } = await ctx.params;
 const supabase = await createClient();
 const body = (await req.json()) as Record<string, unknown>;

 const update: Record<string, unknown> = {};
 for (const k of ENGINE_KEYS) {
 if (k in body) {
 const v = body[k];
 if (v === null || typeof v === "boolean") update[k] = v;
 }
 }
 if (Object.keys(update).length === 0) {
 return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
 }
 const { error } = await supabase.from("clients").update(update).eq("id", id);
 if (error) return adminDbError("clients/[id]/engines", error);
 return NextResponse.json({ ok: true });
 } catch (e) {
 return adminUnexpected("clients/[id]/engines", e);
 }
}
