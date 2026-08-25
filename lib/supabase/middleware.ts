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

  /* getUser, not getSession: it revalidates against the auth server rather
     than trusting a cookie that could have been tampered with. */
  await supabase.auth.getUser();

  return response;
}
