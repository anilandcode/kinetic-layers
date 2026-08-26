import type { Viewer } from "./types";

/**
 * The allowances.
 *
 * One table, read by the routes that enforce it, the pricing page that promises
 * it, the account tile that reports it and the docs page that explains it. The
 * number a visitor is shown and the number they hit cannot drift apart, because
 * there is only one number.
 *
 * This file is deliberately free of server imports so the client can read it
 * too — the same reason gate.ts is split from viewer.ts.
 *
 * The ceilings are anti-abuse, not a second paywall. Fifty prompts a day is
 * more than anyone reads and far less than a script needs to drain the
 * catalogue, which is the only thing they are here to stop.
 */

export type Tier = "anon" | "free" | "unlimited";
export type UsageKind = "prompt" | "download";

export const LIMITS: Record<Tier, Record<UsageKind, number>> = {
  /* A stranger gets enough to see that the prompts are real. Files stay behind
     an account: the anonymous key is a hashed IP, which is too weak to hang
     anything expensive on. */
  anon: { prompt: 1, download: 0 },
  free: { prompt: 5, download: 3 },
  unlimited: { prompt: 50, download: 30 },
};

/** Rolling, not calendar: midnight is not a way to get a second allowance. */
export const WINDOW_HOURS = 24;
export const WINDOW_MS = WINDOW_HOURS * 60 * 60 * 1000;

export function tierOf(viewer: Viewer | null): Tier {
  if (!viewer) return "anon";
  return viewer.unlimited ? "unlimited" : "free";
}

export const limitFor = (tier: Tier, kind: UsageKind) => LIMITS[tier][kind];

/** "3 prompts and 2 downloads a day" — used in pricing copy and docs. */
export function describeAllowance(tier: Tier): string {
  const { prompt, download } = LIMITS[tier];
  const parts = [`${prompt} prompt${prompt === 1 ? "" : "s"}`];
  if (download > 0) parts.push(`${download} download${download === 1 ? "" : "s"}`);
  return `${parts.join(" and ")} a day`;
}

/**
 * How long until the oldest use in the window falls out of it.
 *
 * A rolling window means the reset is not a fixed hour, so a refusal that just
 * said "try tomorrow" would be wrong most of the time.
 */
export function describeReset(resetsAt: string | null): string {
  if (!resetsAt) return "";
  const ms = new Date(resetsAt).getTime() - Date.now();
  if (ms <= 0) return "now";
  /* Round to minutes FIRST, then split. Rounding the remainder separately
     produced "23h 60m", which is a real duration written as a wrong one. */
  const totalMinutes = Math.max(1, Math.round(ms / 60_000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours >= 1) return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
  return `${minutes}m`;
}
