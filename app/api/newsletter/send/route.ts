import { NextResponse, type NextRequest } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { getDb } from "@/lib/supabase";
import { EMAIL_READY, sendMail, unsubscribePostUrl, unsubscribeUrl } from "@/lib/kl/email";
import { SITE_URL } from "@/lib/kl/site";

/**
 * Send one issue.
 *
 * Guarded by the same shared token as /api/admin/grant, compared the same way.
 * A second admin auth scheme is a second thing to get wrong, and this endpoint
 * can mail every subscriber you have.
 *
 * Sends one request per recipient so each carries its own unsubscribe token.
 * A single BCC would be one call and no way to unsubscribe anybody.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorised(request: NextRequest) {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) return false;
  const got = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const a = Buffer.from(got);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  if (!authorised(request)) return NextResponse.json({ ok: false }, { status: 404 });

  if (!EMAIL_READY) {
    /* Loudly, and with a status that says nothing was sent. The failure this
       whole feature replaces was a silent no-op reporting success. */
    return NextResponse.json(
      { ok: false, message: "RESEND_API_KEY and EMAIL_FROM are not set. Nothing was sent." },
      { status: 503 }
    );
  }

  let body: { subject?: string; text?: string; dryRun?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Malformed request." }, { status: 400 });
  }

  const subject = String(body.subject ?? "").trim();
  const text = String(body.text ?? "").trim();
  if (!subject || !text) {
    return NextResponse.json({ ok: false, message: "Both subject and text are required." }, { status: 400 });
  }

  const { data, error } = await getDb()
    .from("subscribers")
    .select("email, token")
    .not("confirmed_at", "is", null)
    .is("unsubscribed_at", null);

  if (error) {
    console.error("subscriber read failed:", error.message);
    return NextResponse.json({ ok: false, message: "Could not read the list." }, { status: 500 });
  }

  const list = (data ?? []) as Array<{ email: string; token: string }>;
  if (body.dryRun) {
    return NextResponse.json({ ok: true, dryRun: true, wouldSend: list.length });
  }

  let sent = 0;
  const failed: string[] = [];
  for (const row of list) {
    const res = await sendMail({
      to: row.email,
      subject,
      unsubscribeUrl: unsubscribePostUrl(row.token),
      /* The footer is not decoration. Every message has to carry a working way
         out, and it has to be the reader's own link. */
      text: `${text}\n\n—\nYou are getting this because you confirmed your address at ${SITE_URL}.\nUnsubscribe: ${unsubscribeUrl(row.token)}`,
    });
    if (res.ok) sent++;
    else failed.push(row.email);
  }

  return NextResponse.json({ ok: failed.length === 0, recipients: list.length, sent, failed: failed.length });
}
