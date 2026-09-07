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
  /** The row that was written, so it can be refunded if delivery then fails. */
  usageId: number | null;
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

/**
 * Spend one unit, atomically.
 *
 * This replaces a `checkQuota` that counted and a `recordUse` that inserted.
 * Those were two statements with a gap, and a burst of concurrent requests all
 * read the same count and all passed — ten parallel reads against production
 * were granted three times an allowance of one. The count and the insert now
 * happen inside one Postgres function behind a per-subject advisory lock, so
 * concurrency cannot manufacture extra allowance.
 *
 * Consumed BEFORE the content is fetched, because the whole point is that a
 * request cannot get the content without first taking a unit. If the fetch then
 * fails, `refund` puts it back — a caller that never received anything should
 * not be charged.
 */
export async function consumeQuota(
  subject: Subject,
  kind: UsageKind,
  assetSlug: string
): Promise<QuotaVerdict> {
  const limit = LIMITS[subject.tier][kind];

  /* A zero allowance never reaches the database — anonymous downloads, and any
     misconfigured tier. */
  if (limit <= 0) {
    return { allowed: false, used: 0, limit, remaining: 0, resetsAt: null, usageId: null };
  }

  const { data, error } = await admin().rpc("consume_quota", {
    p_subject: subject.key,
    p_user: subject.userId,
    p_kind: kind,
    p_slug: assetSlug,
    p_limit: limit,
    p_window_seconds: Math.round(WINDOW_MS / 1000),
  });

  /* Fail CLOSED. The old code failed open on a read error, reasoning that a
     broken meter should not stand between a paying customer and what they
     bought. That reasoning is wrong for a limit whose job is to stop a script:
     "the database is struggling" is exactly when an attacker wants the door
     open, and inducing errors would become the bypass. Entitlement is decided
     elsewhere and is unaffected; this only refuses the extra request. */
  if (error) {
    console.error("quota consume failed, refusing:", error.message);
    return { allowed: false, used: limit, limit, remaining: 0, resetsAt: null, usageId: null };
  }

  const row = Array.isArray(data) ? data[0] : data;
  const used = row?.used ?? limit;
  return {
    allowed: Boolean(row?.allowed),
    used,
    limit,
    remaining: Math.max(0, limit - used),
    resetsAt: row?.resets_at ?? null,
    usageId: row?.usage_id ?? null,
  };
}

/**
 * A frequency cap for endpoints that have no account behind them.
 *
 * /api/subscribe and /api/event accept writes from anyone. A honeypot and a
 * body-size cap stop a careless bot, not a determined one, and both insert
 * rows — so both are a free way to fill a table.
 *
 * This is the same Postgres function the allowances use rather than a second
 * limiter, because that one is already proven atomic under concurrency and a
 * new one would have to prove it again. Always keyed on the visitor hash and
 * always written with a null user, so these rows never appear in the usage
 * tile on /account — that reads through RLS, which shows a user only rows that
 * are theirs.
 *
 * Returns true when the caller may proceed.
 */
export async function throttle(
  request: Request,
  kind: "subscribe" | "event",
  limit: number,
  windowSeconds: number
): Promise<boolean> {
  const key = `visitor:${await visitorHash(request)}`;
  const { data, error } = await admin().rpc("consume_quota", {
    p_subject: key,
    p_user: null,
    p_kind: kind,
    p_slug: kind,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });
  if (error) {
    console.error("throttle failed, refusing:", error.message);
    return false;
  }
  const row = Array.isArray(data) ? data[0] : data;
  return Boolean(row?.allowed);
}

/** Put a unit back when the caller never received what they paid for. */
export async function refund(usageId: number | null): Promise<void> {
  if (usageId == null) return;
  const { error } = await admin().from("usage").delete().eq("id", usageId);
  if (error) console.error("quota refund failed:", error.message);
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
