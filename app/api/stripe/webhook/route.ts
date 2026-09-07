import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { admin } from "@/lib/supabase/admin";
import { stripe, toEntitlementStatus } from "@/lib/kl/stripe";

/**
 * Stripe's half of the entitlement seam.
 *
 * Writes exactly the row /api/admin/grant writes, so everything downstream —
 * has_unlimited(), gate.ts, the quota tiers, every plan state in the UI — keeps
 * working without knowing payment exists. That is what made the seam worth
 * having.
 *
 * The grant route stays. It is still the only way to comp an account or fix one
 * by hand, and a support tool that only exists while Stripe is healthy is not a
 * support tool.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const client = stripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!client || !secret) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ ok: false }, { status: 400 });

  /* The raw body, never the parsed one. Signature verification is over the
     exact bytes Stripe sent, and JSON.parse followed by stringify is not
     byte-identical. */
  const raw = await request.text();

  let event: Stripe.Event;
  try {
    event = client.webhooks.constructEvent(raw, signature, secret);
  } catch (err) {
    /* An unverified body is not evidence of anything, so nothing is logged from
       it beyond the failure itself. */
    console.error("stripe webhook: signature verification failed:", err);
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        if (session.mode !== "subscription") break;

        const userId =
          session.client_reference_id ?? session.metadata?.user_id ?? null;
        const subscriptionId =
          typeof session.subscription === "string" ? session.subscription : null;
        if (!userId || !subscriptionId) {
          console.error("stripe webhook: completed session missing user or subscription");
          break;
        }

        /* Retrieved rather than trusted from the session: the subscription is
           where the real status and period end live. */
        const subscription = await client.subscriptions.retrieve(subscriptionId);
        await writeEntitlement(userId, subscription);
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const userId = await resolveUser(subscription);
        if (!userId) {
          console.error(`stripe webhook: no account for subscription ${subscription.id}`);
          break;
        }
        await writeEntitlement(userId, subscription);
        break;
      }

      default:
        /* Everything else is acknowledged and ignored, so Stripe stops retrying
           events this app has no opinion about. */
        break;
    }
  } catch (err) {
    /* A 500 asks Stripe to redeliver, which is what we want for a transient
       database failure. The unique index makes that replay safe. */
    console.error(`stripe webhook: handling ${event.type} failed:`, err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

/**
 * Which account this subscription belongs to.
 *
 * Metadata first, because checkout puts it there and it survives everything.
 * The customer id is the fallback for a subscription created outside this app —
 * in the Stripe dashboard, say — which has no metadata at all.
 */
async function resolveUser(subscription: Stripe.Subscription): Promise<string | null> {
  const fromMetadata = subscription.metadata?.user_id;
  if (fromMetadata) return fromMetadata;

  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id;
  if (!customerId) return null;

  const { data } = await admin()
    .from("entitlements")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  return data?.user_id ?? null;
}

/** One writer, one row shape — the same one /api/admin/grant produces. */
async function writeEntitlement(userId: string, subscription: Stripe.Subscription) {
  const status = toEntitlementStatus(subscription.status);

  /* Period end comes from Stripe, never from a computed +30 days: a coupon, a
     proration or a trial all move it, and a guessed date silently grants or
     revokes access on the wrong day. */
  const periodEnd = currentPeriodEnd(subscription);

  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : (subscription.customer?.id ?? null);

  const { error } = await admin()
    .from("entitlements")
    .upsert(
      {
        user_id: userId,
        /* Only an active subscription is unlimited. past_due and cancelled both
           fall back to free, which is what the gate already understands. */
        plan: status === "active" ? "unlimited" : "free",
        status,
        current_period_end: periodEnd,
        source: "stripe",
        stripe_customer_id: customerId,
        stripe_subscription_id: subscription.id,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  if (error) throw new Error(error.message);
}

/**
 * The end of the paid period, in ISO.
 *
 * Stripe moved this off the subscription and onto its items; older API versions
 * kept it at the top level. Both are read so a version change does not silently
 * start writing nulls, which would revoke access for everyone.
 */
function currentPeriodEnd(subscription: Stripe.Subscription): string | null {
  const fromItem = subscription.items?.data?.[0]?.current_period_end;
  const fromRoot = (subscription as unknown as { current_period_end?: number })
    .current_period_end;
  const seconds = fromItem ?? fromRoot;
  return typeof seconds === "number" ? new Date(seconds * 1000).toISOString() : null;
}
