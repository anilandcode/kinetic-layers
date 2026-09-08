import type { Asset, Viewer } from "./types";

/**
 * The gate, in one place.
 *
 * Free assets need an account — the free tier is a reason to sign up, not a
 * reason to skip signing up. Everything else needs an active Premium
 * entitlement.
 *
 * This lives apart from viewer.ts because that file is `server-only` (it reads
 * cookies), while the rule itself is pure and the client needs it too — the
 * library grid decides per card whether to offer "Copy prompt". Splitting it
 * means the client shares the *same function* rather than a second copy that
 * can drift. Nothing here is a security boundary: /api/prompt and
 * /api/download re-ask it server-side before releasing anything.
 */
export function canDownload(viewer: Viewer | null, asset: Pick<Asset, "free">): boolean {
  if (!viewer) return false;
  return asset.free ? true : viewer.premium;
}

/**
 * Reading a prompt is a looser rule than taking a file.
 *
 * A stranger may read a free asset's prompt — enough to see the prompts are
 * real, which is the free tier's whole job — while files still require an
 * account. The two shared `canDownload` until anonymous gained a prompt
 * allowance, and could not keep sharing it: they are different resources with
 * different costs, so they get different predicates rather than one with a flag.
 *
 * Eligibility only. How OFTEN is lib/kl/quota.ts, and both are re-asked
 * server-side before anything is released.
 */
export function canReadPrompt(viewer: Viewer | null, asset: Pick<Asset, "free">): boolean {
  if (!viewer) return asset.free;
  return asset.free ? true : viewer.premium;
}

/** Why the gate is closed, for the copy on the item page. */
export function gateReason(
  viewer: Viewer | null,
  asset: Pick<Asset, "free">
): "open" | "needs-account" | "needs-premium" {
  if (canDownload(viewer, asset)) return "open";
  if (!viewer) return "needs-account";
  return "needs-premium";
}

/** The same question for prompts, which an anonymous visitor can now pass. */
export function promptGateReason(
  viewer: Viewer | null,
  asset: Pick<Asset, "free">
): "open" | "needs-account" | "needs-premium" {
  if (canReadPrompt(viewer, asset)) return "open";
  if (!viewer) return "needs-account";
  return "needs-premium";
}
