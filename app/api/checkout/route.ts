import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { admin } from "@/lib/supabase/admin";
import { getSettings } from "@/lib/sanity/queries";
import { priceAmount, priceIdFor, stripe, type Interval } from "@/lib/kl/stripe";
import { SITE_URL } from "@/lib/kl/site";

/**
 * Starts a subscription checkout.
 *
 * Returns a URL for the client to visit rather than redirecting, so the caller
 * stays a button. Trap 4: KilnMotion intercepts `a[data-nav]` in the capture
 * phase and stops propagation, so an anchor here would never fire its handler.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const json = (status: number, body: Record<string, unknown>) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: NextRequest) {
  const client = stripe();
  if (!client) {
    return json(503, { ok: false, message: "Checkout is not connected yet." });
  }

  let body: { interval?: string };
  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false, message: "Malformed request." });
  }

  const interval: Interval = body.interval === "annual" ? "annual" : "monthly";
  const priceId = priceIdFor(interval);
  if (!priceId) {
    return json(503, { ok: false, message: "Checkout is not connected yet." });
  }

  const supabase = await createClient();
  if (!supabase) {
    return json(503, { ok: false, message: "Accounts are not connected yet." });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return json(401, { ok: false, message: "Sign in first." });

  /* Already paying: sending them through checkout again would open a second
     subscription against the same account. */
  const { data: existing } = await supabase
    .from("entitlements")
    .select("plan, status, stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing?.plan === "premium" && existing.status === "active") {
    return json(409, { ok: false, message: "You already have Premium." });
  }

  /* The page prints Sanity's number; Stripe charges its own. Nobody is billed
     an amount they were not shown — a mismatch is a configuration error, and
     refusing is the only honest response to it. */
  const [charged, settings] = await Promise.all([priceAmount(interval), getSettings()]);
  const shown = interval === "annual" ? settings.annualPrice : settings.monthlyPrice;

  if (charged == null) {
    console.error(`checkout: no fixed unit amount on the ${interval} price`);
    return json(503, { ok: false, message: "Checkout is not connected yet." });
  }
  if (charged !== shown) {
    console.error(
      `checkout: ${interval} price disagrees — Stripe ${charged}, Sanity ${shown}. Refusing.`
    );
    return json(409, {
      ok: false,
      message: "The price is being updated. Try again shortly.",
    });
  }

  try {
    const session = await client.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      /* How the webhook finds the account. Stripe echoes it back on the
         completed session, so no email matching is needed. */
      client_reference_id: user.id,
      ...(existing?.stripe_customer_id
        ? { customer: existing.stripe_customer_id }
        : { customer_email: user.email ?? undefined }),
      /* Carried onto the subscription itself, so later subscription.* events —
         which never carry client_reference_id — still identify the user. */
      subscription_data: { metadata: { user_id: user.id } },
      metadata: { user_id: user.id },
      allow_promotion_codes: true,
      success_url: `${SITE_URL}/account?checkout=done`,
      cancel_url: `${SITE_URL}/pricing?checkout=cancelled`,
    });

    if (!session.url) throw new Error("Stripe returned a session with no URL");

    /* Remember the customer before they pay. If the webhook is delayed or lost,
       support can still see who started a checkout. */
    if (typeof session.customer === "string") {
      await admin()
        .from("entitlements")
        .upsert(
          {
            user_id: user.id,
            plan: existing?.plan === "premium" ? "premium" : "free",
            status: "active",
            source: "stripe-pending",
            stripe_customer_id: session.customer,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );
    }

    return json(200, { ok: true, url: session.url });
  } catch (err) {
    console.error("checkout: session create failed:", err);
    return json(502, { ok: false, message: "Could not reach the payment provider." });
  }
}
