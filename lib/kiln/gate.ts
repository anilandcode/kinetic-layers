import type { Asset, Viewer } from "./types";

/**
 * The gate, in one place.
 *
 * Free assets need an account — the free tier is a reason to sign up, not a
 * reason to skip signing up. Everything else needs an active unlimited
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
  return asset.free ? true : viewer.unlimited;
}

/** Why the gate is closed, for the copy on the item page. */
export function gateReason(
  viewer: Viewer | null,
  asset: Pick<Asset, "free">
): "open" | "needs-account" | "needs-unlimited" {
  if (canDownload(viewer, asset)) return "open";
  if (!viewer) return "needs-account";
  return "needs-unlimited";
}
