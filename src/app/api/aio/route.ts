import { NextRequest, NextResponse } from "next/server";
import { fetchAIO } from "@/lib/serpapi";
import type { Location } from "@/types/search";

export async function POST(req: NextRequest) {
 try {
 const body = await req.json();
 const { keyword, domain, brand, location } = body as {
 keyword: string;
 domain: string;
 brand: string;
 location: Location;
 };

 if (!keyword?.trim() || !domain?.trim() || !location) {
 return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
 }

 const result = await fetchAIO(
 keyword.trim(),
 domain.trim(),
 (brand ?? "").trim(),
 location
 );
 return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch AI Mode data";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
