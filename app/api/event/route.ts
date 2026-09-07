import { NextResponse } from "next/server";
import { getDb, visitorHash } from "@/lib/supabase";
import { clean, EVENT_NAMES, oneOf, truthy, VARIANTS } from "@/lib/contracts";
import { throttle } from "@/lib/kl/quota";

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

/* Generous on purpose: a real session fires page views, reveals and copies, and
   a limit that a curious person can reach is a limit that loses data. This is
   sized to stop a loop, not to trim traffic. */
const EVENTS_PER_HOUR = 240;

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

  /* Dropped silently, like every other rejection here. A throttle that
     announced itself would tell a script exactly what it had hit. */
  if (!(await throttle(request, "event", EVENTS_PER_HOUR, 3600))) return noContent;

  try {
    const { error } = await getDb()
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
    /* Never shown to the visitor, but never swallowed either. A check
       constraint rejecting a new event name left this table holding nothing
       but page_views for a whole release, with no error anywhere to say so. */
    if (error) console.error("event insert rejected:", event, error.code, error.message);
  } catch (err) {
    console.error("event insert threw:", err instanceof Error ? err.message : err);
  }

  return noContent;
}
