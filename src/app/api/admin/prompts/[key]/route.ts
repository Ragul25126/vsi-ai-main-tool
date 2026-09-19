import { recordAdminAction } from "@/lib/admin/audit";
import { adminApiSession, adminDbError, adminUnexpected } from "@/lib/admin/api";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_PROMPTS, type PromptKey } from "@/lib/prompts";

function isPromptKey(s: string): s is PromptKey {
 return s in DEFAULT_PROMPTS;
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ key: string }> }) {
 try {
 const session = await adminApiSession();
 if (session instanceof NextResponse) return session;
 const { key } = await ctx.params;
 if (!isPromptKey(key)) {
 return NextResponse.json({ error: "Unknown prompt key" }, { status: 400 });
 }

 const body = (await req.json()) as { template?: string };
 const template = (body.template ?? "").trim();
 if (template.length < 100) {
 return NextResponse.json({ error: "Template is too short" }, { status: 400 });
 }
 if (template.length > 50000) {
 return NextResponse.json({ error: "Template is too long (>50k chars)" }, { status: 400 });
 }

 const supabase = await createClient();
 const { error } = await supabase
 .from("prompts")
 .upsert(
 {
 key,
 template,
 description: DEFAULT_PROMPTS[key].description,
 template_vars: DEFAULT_PROMPTS[key].variables,
 updated_by: session.userId,
 updated_at: new Date().toISOString(),
 },
 { onConflict: "key" }
 );
 if (error) return adminDbError("prompts/[key]", error);
 await recordAdminAction(session, { action: "prompt.updated", targetType: "prompt", targetId: key, summary: `edited the "${DEFAULT_PROMPTS[key].title}" prompt` });
 return NextResponse.json({ ok: true });
 } catch (err) {
 return adminUnexpected("prompts/[key]", err);
 }
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ key: string }> }) {
 try {
 const session = await adminApiSession();
 if (session instanceof NextResponse) return session;
 const { key } = await ctx.params;
 if (!isPromptKey(key)) {
 return NextResponse.json({ error: "Unknown prompt key" }, { status: 400 });
 }
 const supabase = await createClient();
 const { error } = await supabase.from("prompts").delete().eq("key", key);
 if (error) return adminDbError("prompts/[key]", error);
 await recordAdminAction(session, { action: "prompt.reset", targetType: "prompt", targetId: key, summary: `reset the "${DEFAULT_PROMPTS[key as keyof typeof DEFAULT_PROMPTS]?.title ?? key}" prompt to built-in` });
 return NextResponse.json({ ok: true });
 } catch (err) {
 return adminUnexpected("prompts/[key]", err);
 }
}
