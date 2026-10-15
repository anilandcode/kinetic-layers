import { createServerClient } from "@supabase/ssr";
import type { Database } from "./database.types";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_KEY, SUPABASE_URL, authConfigured } from "./config";

/**
 * Refreshes the auth cookie on every request.
 *
 * Without this a session expires mid-browse and server components start
 * rendering the signed-out view while the client still believes it is signed
 * in. Must run before any page reads the session.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  /* Nothing to refresh if auth is not configured; the catalogue is public. */
  if (!authConfigured) return response;

  const supabase = createServerClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(list) {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  /* getClaims, not getSession: it verifies the JWT's signature, so a tampered
     cookie is still refused. Unlike getUser it does that locally against the
     project's published keys instead of a network round trip on every request
     and every link prefetch, and it still refreshes — and re-sets the cookies
     above — when the token has expired. */
  await supabase.auth.getClaims();

  return response;
}
