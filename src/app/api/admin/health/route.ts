import { NextRequest, NextResponse } from "next/server";
import { adminApiSession, adminUnexpected } from "@/lib/admin/api";
import { testProviders } from "@/lib/admin/health";

export const dynamic = "force-dynamic";

/**
 * Tests AI or search providers now. Only free calls are made (listing
 * models or reading the account), never a search or a completion.
 */
export async function POST(req: NextRequest) {
  const session = await adminApiSession();
  if (session instanceof NextResponse) return session;
  let kind: unknown;
  try {
    ({ kind } = (await req.json()) as { kind?: unknown });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (kind !== "ai" && kind !== "search") return NextResponse.json({ error: "Choose ai or search." }, { status: 400 });
  try {
    return NextResponse.json(await testProviders(kind));
  } catch (e) {
    return adminUnexpected("health test", e);
  }
}
