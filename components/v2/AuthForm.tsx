"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  requestPasswordReset,
  signIn,
  signInWithMagicLink,
  signInWithProvider,
  signUp,
  type AuthState,
} from "@/app/auth/actions";
import { Button } from "./Button";
import f from "./Form.module.css";

/**
 * Sign up, sign in, magic link and password reset — all server actions
 * (app/auth/actions.ts), so the form works with scripting disabled and no
 * token ever reaches client JavaScript. The mode is the only client state.
 *
 * OAuth buttons appear only for providers Supabase reports as enabled, so the
 * form never offers a door that is bricked up.
 */

export type AuthMode = "signup" | "signin" | "magic" | "reset";

const HEADING: Record<AuthMode, string> = {
  signup: "Start with the free kits.",
  signin: "Welcome back.",
  magic: "We’ll email you a link.",
  reset: "Reset your password.",
};

const SUB: Record<AuthMode, string> = {
  signup: "No card needed. An account opens the free kits, their prompts and downloads straight away.",
  signin: "Sign in to reach your downloads, saved kits and API keys.",
  magic: "One link, one sign-in, no password to remember.",
  reset: "Tell us the address and we’ll send a link to set a new password.",
};

const ACTION: Record<AuthMode, typeof signIn> = {
  signup: signUp,
  signin: signIn,
  magic: signInWithMagicLink,
  reset: requestPasswordReset,
};

const SUBMIT: Record<AuthMode, string> = {
  signup: "Create free account",
  signin: "Sign in",
  magic: "Send the link",
  reset: "Send a reset link",
};

export default function AuthForm({
  next,
  initialError,
  initialMode = "signup",
  providers = [],
  titleId = "auth-title",
}: {
  next?: string;
  initialError?: string;
  initialMode?: AuthMode;
  /** Social logins this project actually has enabled. Empty is normal. */
  providers?: ReadonlyArray<"google" | "github">;
  titleId?: string;
}) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [state, action] = useActionState<AuthState, FormData>(ACTION[mode], {});
  const showPassword = mode === "signup" || mode === "signin";
  const error = state.error ?? initialError;

  return (
    <div className={f.auth}>
      <div className={f.segmented} role="group" aria-label="Account mode">
        {(["signup", "signin"] as const).map((m) => (
          <button key={m} type="button" aria-pressed={mode === m} onClick={() => setMode(m)}>
            {m === "signup" ? "Create account" : "Sign in"}
          </button>
        ))}
      </div>

      <div className={f.head}>
        <h1 id={titleId} className={f.title}>
          {HEADING[mode]}
        </h1>
        <p className={f.lede}>{SUB[mode]}</p>
      </div>

      {showPassword && providers.length > 0 ? (
        <>
          <div className={f.providers}>
            {providers.map((p) => (
              <form key={p} action={signInWithProvider}>
                <input type="hidden" name="provider" value={p} />
                <input type="hidden" name="next" value={next ?? "/account"} />
                <ProviderButton label={p === "google" ? "Google" : "GitHub"} />
              </form>
            ))}
          </div>
          <p className={f.or} aria-hidden="true">
            or
          </p>
        </>
      ) : null}

      <form key={mode} action={action} className={f.form}>
        <input type="hidden" name="next" value={next ?? "/account"} />
        <div className={f.field}>
          <label className={f.label} htmlFor="auth-email">
            Email address
          </label>
          <input
            id="auth-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@email.com"
            className={f.input}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "auth-message" : undefined}
          />
        </div>
        {showPassword ? (
          <div className={f.field}>
            <label className={f.label} htmlFor="auth-password">
              Password
            </label>
            <input
              id="auth-password"
              name="password"
              type="password"
              required
              minLength={mode === "signup" ? 8 : undefined}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
              className={f.input}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "auth-message" : undefined}
            />
          </div>
        ) : null}
        <Submit label={SUBMIT[mode]} />
      </form>

      {error ? (
        <p id="auth-message" role="alert" className={f.error}>
          {error}
        </p>
      ) : null}
      {state.notice ? (
        <p role="status" className={f.notice}>
          {state.notice}
        </p>
      ) : null}

      <div className={f.quiet}>
        {mode !== "magic" ? (
          <button type="button" onClick={() => setMode("magic")}>
            Email me a link instead
          </button>
        ) : null}
        {mode === "signin" ? (
          <button type="button" onClick={() => setMode("reset")}>
            Forgot your password?
          </button>
        ) : null}
        {mode === "magic" || mode === "reset" ? (
          <button type="button" onClick={() => setMode("signin")}>
            Back to sign in
          </button>
        ) : null}
      </div>

      <p className={f.hint}>
        {mode === "signup"
          ? "By creating an account you agree to the licence terms. No card, no charge."
          : "Sessions last until you sign out."}
      </p>
    </div>
  );
}

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className={f.submit} disabled={pending}>
      {pending ? "Working…" : label}
    </Button>
  );
}

function ProviderButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="secondary" size="lg" className={f.submit} disabled={pending}>
      {pending ? "Redirecting…" : `Continue with ${label}`}
    </Button>
  );
}
