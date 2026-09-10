import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  /**
   * A one-time auth code that landed on the wrong path.
   *
   * Supabase honours `redirect_to` only when it matches the project's redirect
   * allowlist. When it does not, it silently falls back to the Site URL — so
   * the visitor finishes signing in and arrives at "/" holding
   * `?code=bd66d3d3-…` that nothing exchanges. They look signed out, with a
   * code sitting in the address bar, and no error anywhere to explain it.
   *
   * The allowlist is the real fix and lives in the dashboard. This is the
   * safety net, because the failure is invisible and costs the whole signup:
   * `code` is read by exactly one route in this app, so forwarding it there is
   * unambiguous. The code is single-use and bound to the PKCE verifier in the
   * visitor's own cookie, so moving it between paths grants nothing — an
   * intercepted code is useless without that cookie.
   *
   * `next` is re-validated as a same-origin path on the way through; every
   * other query parameter is dropped rather than carried into the exchange.
   */
  const { searchParams, pathname } = request.nextUrl;
  const code = searchParams.get("code");

  if (code && pathname !== "/auth/callback") {
    const url = request.nextUrl.clone();
    const next = searchParams.get("next");
    url.pathname = "/auth/callback";
    url.search = "";
    url.searchParams.set("code", code);
    if (next && next.startsWith("/") && !next.startsWith("//")) {
      url.searchParams.set("next", next);
    }
    return NextResponse.redirect(url);
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    /* Everything except static assets, images and the Studio — the Studio
       carries its own Sanity session and has no use for a Supabase cookie. */
    "/((?!_next/static|_next/image|favicon.ico|studio|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?)$).*)",
  ],
};
