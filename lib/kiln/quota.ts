import "server-only";
import { admin } from "@/lib/supabase/admin";
import { visitorHash } from "@/lib/supabase";
import { LIMITS, WINDOW_MS, tierOf, type Tier, type UsageKind } from "./limits";
import type { Viewer } from "./types";

/**
 * The meter.
 *
 * Four doors lead to metered content — the item page reveal, the one-click copy
 * on a library card, the file download, and the MCP tool. They all call this,
 * and they all count against one budget per subject, because a per-route
 * counter is four allowances wearing a trenchcoat.
 *
 * Counting happens with the service key. RLS on `usage` allows a user to read
 * their own rows and permits no inserts at all, so the count cannot be
 * influenced by the person being counted.
 */

export type Subject = { key: string; userId: string | null; tier: Tier };

export type QuotaVerdict = {
  allowed: boolean;
  used: number;
  limit: number;
  remaining: number;
  /** When the oldest use in the window expires. Null when nothing is spent. */
  resetsAt: string | null;
};

/**
 * Who is being metered.
 *
 * A signed-in visitor is metered by user id, so it follows them across devices
 * and browsers. Everyone else is metered by a salted hash of their address —
 * weak, and known to be weak: see the note on the `usage` table.
 */
export async function subjectFor(viewer: Viewer | null, request: Request): Promise<Subject> {
  if (viewer) return { key: `user:${viewer.id}`, userId: viewer.id, tier: tierOf(viewer) };
  return { key: `anon:${await visitorHash(request)}`, userId: null, tier: "anon" };
}

export async function checkQuota(subject: Subject, kind: UsageKind): Promise<QuotaVerdict> {
  const limit = LIMITS[subject.tier][kind];
  const since = new Date(Date.now() - WINDOW_MS).toISOString();

  /* A zero allowance needs no query — anonymous downloads never reach the
     database, and neither does a misconfigured tier. */
  if (limit <= 0) {
    return { allowed: false, used: 0, limit, remaining: 0, resetsAt: null };
  }

  const db = admin();
  const { data, error } = await db
    .from("usage")
    .select("created_at")
    .eq("subject", subject.key)
    .eq("kind", kind)
    .gte("created_at", since)
    .order("created_at", { ascending: true });

  /* Fail open, and say so in the log. A meter that cannot read its own count
     should not stand between a paying customer and what they bought; the gate
     has already decided they are entitled, and this only decides how often. */
  if (error) {
    console.error("quota read failed, allowing:", error.message);
    return { allowed: true, used: 0, limit, remaining: limit, resetsAt: null };
  }

  const used = data?.length ?? 0;
  /* The window frees up one unit at a time, when the OLDEST use inside it
     ages out — not all at once at some fixed hour. */
  const oldest = data?.[0]?.created_at ?? null;
  const resetsAt = oldest ? new Date(new Date(oldest).getTime() + WINDOW_MS).toISOString() : null;

  return {
    allowed: used < limit,
    used,
    limit,
    remaining: Math.max(0, limit - used),
    resetsAt,
  };
}

/** Called only after the content has actually been released. */
export async function recordUse(subject: Subject, kind: UsageKind, assetSlug: string): Promise<void> {
  const { error } = await admin()
    .from("usage")
    .insert({ subject: subject.key, user_id: subject.userId, kind, asset_slug: assetSlug });

  /* Never surfaced to the visitor: they have the content, and refusing to
     acknowledge that would be worse than undercounting once. */
  if (error) console.error("usage insert failed:", kind, error.message);
}

/** The 429 body, shared by every door so clients can handle one shape. */
export function quotaRefusal(kind: UsageKind, v: QuotaVerdict) {
  const noun = kind === "prompt" ? "prompt" : "download";
  return {
    body: {
      ok: false as const,
      reason: "quota" as const,
      kind,
      used: v.used,
      limit: v.limit,
      resetsAt: v.resetsAt,
      message:
        v.limit === 0
          ? `${noun === "prompt" ? "Reading prompts" : "Downloads"} need an account.`
          : `That is your ${v.limit} ${noun}${v.limit === 1 ? "" : "s"} for today.`,
    },
    /* Seconds until one unit frees up. Clients and crawlers both understand
       this header; without it a 429 is just a wall with no clock on it. */
    retryAfter: v.resetsAt
      ? Math.max(1, Math.ceil((new Date(v.resetsAt).getTime() - Date.now()) / 1000))
      : undefined,
  };
}
