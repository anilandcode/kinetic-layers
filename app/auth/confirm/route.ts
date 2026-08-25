import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/** Email confirmation and recovery links land here. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const raw = searchParams.get("next") ?? "/account";
  const next = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/account";

  if (!token_hash || !type) {
    return NextResponse.redirect(`${origin}/join?error=${encodeURIComponent("That link is incomplete.")}`);
  }

  const supabase = await createClient();
  if (!supabase) return NextResponse.redirect(`${origin}/join`);
  const { error } = await supabase.auth.verifyOtp({ type, token_hash });
  if (error) {
    return NextResponse.redirect(
      `${origin}/join?error=${encodeURIComponent(`${error.message} Links expire — ask for a new one.`)}`
    );
  }

  /* A recovery link should land on the form that sets a new password, not on
     the account page it happens to unlock. */
  return NextResponse.redirect(`${origin}${type === "recovery" ? "/reset-password" : next}`);
}
