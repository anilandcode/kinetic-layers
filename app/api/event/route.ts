import { NextResponse } from "next/server";
import { getDb, visitorHash } from "@/lib/supabase";
import { clean, EVENT_NAMES, oneOf, truthy, VARIANTS } from "@/lib/contracts";

/**
 * First-party event sink.
 *
 * Accepts the small payloads sent by the client runtime. No cookie is set
 * here, no identifier is issued, and nothing the visitor typed is ever
 * accepted — only an event name from a fixed list, plus coarse context.
 *
 * Always answers 204, including for payloads it drops. A tracking endpoint
 * that returns errors invites retries, and none of this is worth a retry.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY = 2048;

export async function POST(request: Request) {
  const noContent = new NextResponse(null, {
    status: 204,
    headers: { "Cache-Control": "no-store" },
  });

  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return noContent;
  }
  if (raw.length > MAX_BODY) return noContent;

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(raw);
  } catch {
    return noContent;
  }
  if (!payload || typeof payload !== "object") return noContent;

  const event = oneOf(payload.event, EVENT_NAMES);
  if (!event) return noContent; // unknown name: drop it quietly

  try {
    await getDb()
      .from("events")
      .insert({
        event,
        variant: oneOf(payload.variant, VARIANTS, "unknown" as never) ?? "unknown",
        source: clean(payload.source, 60) || "unknown",
        qa: truthy(payload.qa),
        path: clean(payload.path, 120) || null,
        viewport: clean(payload.viewport, 20) || null,
        detail: clean(payload.detail, 60) || null,
        visitor: await visitorHash(request),
      });
  } catch {
    // Tracking must never surface to the visitor.
  }

  return noContent;
}
