"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { AUTH_UNAVAILABLE } from "@/lib/supabase/config";

/**
 * Auth as server actions.
 *
 * The form posts, the server sets the cookie, the page re-renders. No token
 * ever touches client JavaScript, and every action works with scripting off.
 */

export type AuthState = { error?: string; notice?: string };

const safeNext = (v: FormDataEntryValue | null) => {
  const s = typeof v === "string" ? v : "";
  return s.startsWith("/") && !s.startsWith("//") ? s : "/account";
};

async function origin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

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
    options: { emailRedirectTo: `${await origin()}/auth/confirm?next=${encodeURIComponent(next)}` },
  });
  if (error) return { error: error.message };

  /* With confirmations on, Supabase returns a user but no session. Saying
     "check your email" when no email is coming would be a lie, so this
     branches on what actually happened. */
  if (data.session) {
    revalidatePath("/", "layout");
    redirect(next);
  }
  return { notice: `Check ${email} for a confirmation link. It expires in an hour.` };
}

export async function signInWithMagicLink(_: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const next = safeNext(formData.get("next"));
  if (!email) return { error: "Which email should it go to?" };

  const supabase = await createClient();
  if (!supabase) return { error: AUTH_UNAVAILABLE };
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${await origin()}/auth/callback?next=${encodeURIComponent(next)}` },
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
    redirectTo: `${await origin()}/auth/confirm?type=recovery&next=/reset-password`,
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
    options: { redirectTo: `${await origin()}/auth/callback?next=${encodeURIComponent(next)}` },
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
