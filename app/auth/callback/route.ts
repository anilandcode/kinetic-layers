import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * OAuth and magic-link landing.
 *
 * Exchanges the one-time code for a session, then sends the visitor where they
 * were going. `next` is validated as a same-origin path so the parameter
 * cannot be used to bounce someone off-site after signing in.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const raw = searchParams.get("next") ?? "/account";
  const next = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/account";

  if (!code) {
    return NextResponse.redirect(`${origin}/join?error=${encodeURIComponent("That link is missing its code.")}`);
  }

  const supabase = await createClient();
  if (!supabase) return NextResponse.redirect(`${origin}/join`);
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/join?error=${encodeURIComponent(error.message)}`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
