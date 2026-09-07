/**
 * Early access: the whole vault is free to anyone with an account.
 *
 * One flag, read by the server to decide entitlement and by the client to
 * decide copy. It is deliberately `NEXT_PUBLIC_`: the same value has to do both
 * jobs, and one variable with one meaning beats two that can disagree — a site
 * announcing "free while in early access" while the gate still refuses is a
 * worse failure than a leaked boolean. Nothing here is a secret; it describes
 * a state the whole site is shouting.
 *
 * It is an env var rather than a Sanity setting on purpose. Flipping it gives
 * away, or takes back, every paid asset — that should require a deploy, not a
 * mis-click in a CMS.
 *
 * Nothing about the paid product is deleted. Stripe, `entitlements` and
 * /api/admin/grant are untouched, so turning this off restores the paywall
 * exactly as it was.
 */
export const EARLY_ACCESS = process.env.NEXT_PUBLIC_EARLY_ACCESS === "1";

/** What the buy button says while everything is free. */
export const EARLY_ACCESS_CTA = "Free while in early access";
