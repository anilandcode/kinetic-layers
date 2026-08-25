import { NextResponse, type NextRequest } from "next/server";
import { searchAssets } from "@/lib/sanity/queries";

/** Backs the ⌘K palette. Public — it only returns catalogue metadata. */
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const q = new URL(request.url).searchParams.get("q") ?? "";
  const hits = await searchAssets(q.slice(0, 80));
  return NextResponse.json({ hits });
}
