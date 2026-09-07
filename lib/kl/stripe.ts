import "server-only";
import Stripe from "stripe";

/**
 * One home for Stripe.
 *
 * Sits beside gate.ts and limits.ts for the same reason they exist: the answer
 * to "what does Premium cost" is asked from several places, and a second copy
 * of it is a promise waiting to stop being true.
 *
 * Nothing here throws at import time. Checkout is optional infrastructure — the
 * site must build and serve without keys, exactly as it does today.
 */

export type Interval = "monthly" | "annual";

let cached: Stripe | null = null;

/** Null when Stripe is not configured, so callers degrade instead of crashing. */
export function stripe(): Stripe | null {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  cached = new Stripe(key, {
    /* Pinned deliberately. An account-level API upgrade should not change what
       the webhook receives without someone choosing it here. */
    apiVersion: "2026-08-26.dahlia",
    typescript: true,
  });
  return cached;
}

export function priceIdFor(interval: Interval): string | null {
  const id =
    interval === "annual"
      ? process.env.STRIPE_PRICE_ANNUAL
      : process.env.STRIPE_PRICE_MONTHLY;
  return id?.trim() || null;
}

export const checkoutConfigured = () =>
  Boolean(stripe() && priceIdFor("monthly") && priceIdFor("annual"));

/**
 * What Stripe will actually charge, in whole currency units.
 *
 * The page prints Sanity's number; Stripe charges this one. They are two
 * systems holding one promise, which is the drift `LIMITS` was written to
 * prevent — so callers compare them and refuse rather than charge a number the
 * visitor was never shown. Returns null when the price is metered or has no
 * fixed unit amount, which is also a refusal, not a zero.
 */
export async function priceAmount(interval: Interval): Promise<number | null> {
  const client = stripe();
  const id = priceIdFor(interval);
  if (!client || !id) return null;

  const price = await client.prices.retrieve(id);
  if (!price.active || price.unit_amount == null) return null;

  /* Zero-decimal currencies (JPY and friends) are not divided by 100. */
  const zeroDecimal = new Set(["bif", "clp", "djf", "gnf", "jpy", "kmf", "krw",
    "mga", "pyg", "rwf", "ugx", "vnd", "vuv", "xaf", "xof", "xpf"]);
  return zeroDecimal.has(price.currency)
    ? price.unit_amount
    : price.unit_amount / 100;
}

/**
 * Stripe's subscription status mapped onto the three the database allows.
 *
 * `entitlements.status` is constrained to active | past_due | cancelled, and a
 * value outside that set fails the insert — so the mapping is total, and
 * anything unrecognised is treated as "not paying" rather than assumed good.
 */
export function toEntitlementStatus(
  status: Stripe.Subscription.Status
): "active" | "past_due" | "cancelled" {
  switch (status) {
    case "active":
    case "trialing":
      return "active";
    case "past_due":
    case "unpaid":
      return "past_due";
    default:
      /* canceled, incomplete, incomplete_expired, paused */
      return "cancelled";
  }
}
