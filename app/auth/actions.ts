"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { AUTH_UNAVAILABLE } from "@/lib/supabase/config";
import { CONTACT_EMAIL, SITE_URL } from "@/lib/kl/site";

/**
 * Auth as server actions.
 *
 * The form posts, the server sets the cookie, the page re-renders. No token
 * ever touches client JavaScript, and every action works with scripting off.
 *
 * Every link mailed from here is built from SITE_URL, never from the request.
 * This used to read `x-forwarded-host`, which the client controls: anyone who
 * could set that header could make a genuine Supabase password-reset email
 * arrive pointing at a domain they owned, with only Supabase's redirect
 * allowlist standing in the way. A constant cannot be steered.
 */

export type AuthState = { error?: string; notice?: string };

const safeNext = (v: FormDataEntryValue | null) => {
  const s = typeof v === "string" ? v : "";
  return s.startsWith("/") && !s.startsWith("//") ? s : "/account";
};

/** Absolute URL for a path the auth emails link back to. */
const authUrl = (path: string) => `${SITE_URL}${path}`;

export async function signIn(_: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));
  if (!email || !password) return { error: "Email and password, please." };

  const supabase = await createClient();
  if (!supabase) return { error: AUTH_UNAVAILABLE };
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  /* Supabase returns the same message for a wrong password and an unknown
     address, which is correct — telling an attacker which addresses exist is
     worse than a vague error. */
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect(next);
}

export async function signUp(_: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));
  if (!email || !password) return { error: "Email and password, please." };
  if (password.length < 8) return { error: "Use at least eight characters." };

  const supabase = await createClient();
  if (!supabase) return { error: AUTH_UNAVAILABLE };
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: authUrl(`/auth/confirm?next=${encodeURIComponent(next)}`) },
  });
  if (error) return { error: error.message };

  /* With confirmations on, Supabase returns a user but no session. Saying
     "check your email" when no email is coming would be a lie, so this
     branches on what actually happened. */
  if (data.session) {
    revalidatePath("/", "layout");
    redirect(next);
  }

  /* Supabase sends this one, not us, so there is no send result to check here.
     That makes the wording matter: tell people where else to look and how to
     get unstuck, rather than leaving them staring at an inbox. A stalled
     signup with no way forward is how you lose someone permanently. */
  return {
    notice:
      `Check ${email} for a confirmation link — it expires in an hour. ` +
      `If it has not arrived in a few minutes, look in spam, then try again or write to ${CONTACT_EMAIL}.`,
  };
}

export async function signInWithMagicLink(_: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const next = safeNext(formData.get("next"));
  if (!email) return { error: "Which email should it go to?" };

  const supabase = await createClient();
  if (!supabase) return { error: AUTH_UNAVAILABLE };
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: authUrl(`/auth/callback?next=${encodeURIComponent(next)}`) },
  });
  if (error) return { error: error.message };
  return { notice: `Link sent to ${email}. It signs you in once, then expires.` };
}

export async function requestPasswordReset(_: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Which email should it go to?" };

  const supabase = await createClient();
  if (!supabase) return { error: AUTH_UNAVAILABLE };
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: authUrl("/auth/confirm?type=recovery&next=/reset-password"),
  });
  if (error) return { error: error.message };
  return { notice: `If ${email} has an account, a reset link is on its way.` };
}

export async function updatePassword(_: AuthState, formData: FormData): Promise<AuthState> {
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) return { error: "Use at least eight characters." };

  const supabase = await createClient();
  if (!supabase) return { error: AUTH_UNAVAILABLE };
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect("/account");
}

export async function signInWithProvider(formData: FormData) {
  const provider = String(formData.get("provider") ?? "");
  const next = safeNext(formData.get("next"));
  if (provider !== "google" && provider !== "github") {
    redirect(`/join?error=${encodeURIComponent("Unknown provider.")}`);
  }

  const supabase = await createClient();
  if (!supabase) redirect(`/join?error=${encodeURIComponent(AUTH_UNAVAILABLE)}`);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: authUrl(`/auth/callback?next=${encodeURIComponent(next)}`) },
  });

  /* Until the OAuth app exists in Supabase, this errors rather than
     redirecting. Say which provider and what is missing, instead of dumping a
     provider error the visitor cannot act on. */
  if (error || !data.url) {
    const name = provider === "google" ? "Google" : "GitHub";
    redirect(
      `/join?error=${encodeURIComponent(`${name} sign-in is not configured on this project yet. Use email for now.`)}`
    );
  }
  redirect(data.url);
}
