import { NextResponse, type NextRequest } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { admin } from "@/lib/supabase/admin";

/**
 * Grants or revokes Premium.
 *
 * This is the seam Stripe's webhook will replace: when checkout exists, the
 * webhook writes the same row and this route can go. Until then it is how a
 * plan changes at all.
 *
 * Guarded by a shared token compared in constant time. It is not a user-facing
 * endpoint and deliberately reveals nothing about whether an email exists.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorised(request: NextRequest) {
  const expected = process.env.KILN_ADMIN_TOKEN;
  if (!expected) return false;
  const got = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const a = Buffer.from(got);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  if (!authorised(request)) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  let body: { email?: string; plan?: string; months?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Malformed request." }, { status: 400 });
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  const plan = body.plan === "premium" ? "premium" : "free";
  const months = Number.isFinite(body.months) ? Number(body.months) : 1;
  if (!email) return NextResponse.json({ ok: false, message: "Which account?" }, { status: 400 });

  const db = admin();

  /* listUsers is paginated; this walks it rather than assuming page one. */
  let userId: string | null = null;
  for (let page = 1; page <= 20 && !userId; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 });
    if (error) break;
    userId = data.users.find((u) => u.email?.toLowerCase() === email)?.id ?? null;
    if (data.users.length < 200) break;
  }
  if (!userId) return NextResponse.json({ ok: false, message: "No such account." }, { status: 404 });

  const periodEnd =
    plan === "premium"
      ? new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000).toISOString()
      : null;

  const { error } = await db.from("entitlements").upsert(
    {
      user_id: userId,
      plan,
      status: "active",
      current_period_end: periodEnd,
      source: "admin-grant",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );
  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, email, plan, current_period_end: periodEnd });
}
