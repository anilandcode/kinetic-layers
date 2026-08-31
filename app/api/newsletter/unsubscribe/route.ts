import { NextResponse, type NextRequest } from "next/server";
import { unsubscribeByToken } from "@/lib/kiln/newsletter";

/**
 * The address in `List-Unsubscribe`.
 *
 * Gmail and Outlook show their own unsubscribe control above a message and
 * POST to this when it is used — far more people use that than the link in the
 * footer, and a mail with no working one-click is a spam report waiting to
 * happen. A page cannot answer a POST, which is why this exists alongside
 * /newsletter/unsubscribe rather than inside it; both call the same function.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? "";
  const outcome = await unsubscribeByToken(token);
  /* 200 whatever happened. A one-click client shows the reader an error on
     anything else, and "that token was already used" is not their problem. */
  if (outcome === "error") console.error("one-click unsubscribe failed for a valid-looking token");
  return new NextResponse(null, { status: 200 });
}

/* Some clients follow the header with a GET. Send those to the page, which
   performs it and says so, rather than silently returning an empty 200.
   Redirect to whatever host the request arrived on rather than to SITE_URL: a
   preview deployment must not bounce someone onto production, where their
   token means nothing. */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? "";
  const to = new URL(`/newsletter/unsubscribe?token=${encodeURIComponent(token)}`, request.nextUrl.origin);
  return NextResponse.redirect(to, { status: 303 });
}
