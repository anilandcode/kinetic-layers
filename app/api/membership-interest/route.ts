import { NextResponse } from "next/server";
import { getDb } from "@/lib/supabase";
import { throttle } from "@/lib/kl/quota";
import { EMAIL_READY, membershipInterestConfirmationMail, sendMail } from "@/lib/kl/email";
import { clean, LOOKS_LIKE_EMAIL } from "@/lib/contracts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const json = (status: number, body: Record<string, unknown>) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

/**
 * Captures non-binding interest in Founding Membership. It never creates an
 * entitlement or calls Stripe; it only stores a pending address and sends the
 * person a confirmation link when email delivery is available.
 */
export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json(400, { ok: false, message: "Send this form as form data." });
  }

  if (clean(form.get("company_website"), 200) !== "") {
    return json(200, { ok: true, message: "Thanks." });
  }

  const email = clean(form.get("email"), 190);
  if (!email || !LOOKS_LIKE_EMAIL.test(email)) {
    return json(422, { ok: false, message: "That email address does not look right." });
  }

  // Reuse the proven anonymous write limiter; this endpoint has the same
  // abuse profile as the newsletter, but remains a separate database record.
  if (!(await throttle(request, "subscribe", 5, 3600))) {
    return json(429, { ok: false, message: "That is a lot of requests. Give it an hour and try again." });
  }

  const db = getDb();
  const { data: existing, error: lookupError } = await db
    .from("membership_interest")
    .select("id, token, confirmed_at")
    .eq("email", email)
    .maybeSingle();
  if (lookupError) {
    console.error("membership interest lookup failed:", lookupError.message);
    return json(500, { ok: false, message: "We could not save that. Please try again shortly." });
  }

  if (existing?.confirmed_at) {
    return json(200, { ok: true, message: "You have already confirmed your interest. We will email you when membership opens." });
  }

  let token = existing?.token as string | undefined;
  if (!existing) {
    const { data, error } = await db
      .from("membership_interest")
      .insert({ email, source: "pricing-founding-membership" })
      .select("token")
      .single();
    if (error) {
      console.error("membership interest insert failed:", error.message);
      return json(500, { ok: false, message: "We could not save that. Please try again shortly." });
    }
    token = data.token;
  }

  if (!EMAIL_READY) {
    console.error("membership interest stored but not confirmed — email is not configured");
    return json(200, {
      ok: true,
      message: "We saved your interest. Email confirmation is not available yet, so you have not been added to launch updates.",
    });
  }

  const sent = await sendMail(membershipInterestConfirmationMail(email, token!));
  if (!sent.ok) {
    return json(200, {
      ok: true,
      message: "We saved your interest, but the confirmation email did not go out. Please try again shortly.",
    });
  }

  return json(200, {
    ok: true,
    message: "Check your email to confirm your interest. This does not subscribe or bill you.",
  });
}
