"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * The display name, which had nowhere to be set until now.
 *
 * `profiles.display_name` has existed since the first migration and was read in
 * exactly one place (lib/kl/apikey.ts) and shown on no page.
 *
 * UPDATE, not upsert. RLS on profiles grants select and update for your own row
 * and no insert at all (20260825120000_kiln_accounts.sql:127-133), so an upsert
 * would fail for anyone missing a row rather than creating one. The row is made
 * by the handle_new_user trigger at signup, so its absence is a real fault worth
 * reporting rather than papering over.
 */
export async function updateDisplayName(formData: FormData) {
  const raw = String(formData.get("display_name") ?? "").trim();
  /* Empty clears it, which is a legitimate choice — back to the email. */
  const display_name = raw.slice(0, 60) || null;

  const supabase = await createClient();
  if (!supabase) redirect("/join?next=/account/profile");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/join?next=/account/profile");

  const { data, error } = await supabase
    .from("profiles")
    .update({ display_name })
    .eq("id", user.id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    const why = error?.message ?? "no profile row for this account";
    redirect(`/account/profile?error=${encodeURIComponent(why)}`);
  }

  /* layout scope: the header greets people by name, and it is on every page. */
  revalidatePath("/", "layout");
  redirect("/account/profile?saved=1");
}
