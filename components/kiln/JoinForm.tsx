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

/**
 * Sign up, sign in, magic link and password reset — all server actions, so the
 * whole thing works with scripting disabled and no token ever reaches client
 * JavaScript.
 *
 * The mode toggle is the only client state; everything else is form data.
 */

type Mode = "signup" | "signin" | "magic" | "reset";

const HEADING: Record<Mode, string> = {
  signup: "Start with the free assets.",
  signin: "Welcome back.",
  magic: "We’ll email you a link.",
  reset: "Reset your password.",
};

const SUB: Record<Mode, string> = {
  signup: "No card needed. Upgrade whenever you hit something behind the paywall.",
  signin: "Sign in to reach your downloads, saved collections and invoices.",
  magic: "One link, one sign-in, no password to remember.",
  reset: "Tell us the address and we’ll send a link to set a new password.",
};

const ACTION: Record<Mode, typeof signIn> = {
  signup: signUp,
  signin: signIn,
  magic: signInWithMagicLink,
  reset: requestPasswordReset,
};

export default function JoinForm({
  next,
  initialError,
  initialMode = "signup",
}: {
  next?: string;
  initialError?: string;
  initialMode?: Mode;
}) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [state, action] = useActionState<AuthState, FormData>(ACTION[mode], {});

  const showPassword = mode === "signup" || mode === "signin";
  const error = state.error ?? initialError;

  return (
    <div data-hero style={{ width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", gap: 18 }}>
      <div
        role="group"
        aria-label="Account mode"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          border: "1px solid var(--hairline-3)",
          borderRadius: "var(--r-pill)",
          padding: 5,
          alignSelf: "flex-start",
        }}
      >
        {(["signup", "signin"] as const).map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={mode === m}
            onClick={() => setMode(m)}
            style={{
              fontSize: 13,
              fontWeight: 500,
              borderRadius: "var(--r-pill)",
              padding: "9px 18px",
              cursor: "pointer",
              transition: "all var(--t-fast) var(--ease)",
              background: mode === m ? "var(--sage-fill)" : "transparent",
              border: `1px solid ${mode === m ? "rgba(185,206,149,0.42)" : "transparent"}`,
              color: mode === m ? "var(--sage-ink)" : "var(--muted)",
            }}
          >
            {m === "signup" ? "Create account" : "Sign in"}
          </button>
        ))}
      </div>

      <h1 style={{ fontSize: 38, lineHeight: 1.12, fontWeight: 500, letterSpacing: "-0.03em", marginTop: 6, textWrap: "pretty" }}>
        {HEADING[mode]}
      </h1>
      <p style={{ fontSize: 16, lineHeight: 1.6, color: "var(--muted)" }}>{SUB[mode]}</p>

      {/* OAuth — separate forms so each posts only its own provider. */}
      {showPassword && (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
            {(["google", "github"] as const).map((p) => (
              <form key={p} action={signInWithProvider}>
                <input type="hidden" name="provider" value={p} />
                <input type="hidden" name="next" value={next ?? "/account"} />
                <ProviderButton label={p === "google" ? "Google" : "GitHub"} />
              </form>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "6px 0" }}>
            <span style={{ flex: 1, height: 1, background: "var(--hairline)" }} />
            <span className="mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--faint)" }}>or</span>
            <span style={{ flex: 1, height: 1, background: "var(--hairline)" }} />
          </div>
        </>
      )}

      <form key={mode} action={action} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <input type="hidden" name="next" value={next ?? "/account"} />

        <label className="visually-hidden" htmlFor="join-email">Email address</label>
        <input
          id="join-email"
          name="email"
          /* An error was announced but floated free of the input. aria-invalid
             marks WHICH field is wrong; aria-describedby is what lets a screen
             reader read the reason while focus is still on the field. */
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "join-message" : undefined}
          type="email"
          required
          autoComplete="email"
          placeholder="you@email.com"
          style={field}
        />

        {showPassword && (
          <>
            <label className="visually-hidden" htmlFor="join-password">Password</label>
            <input
              id="join-password"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "join-message" : undefined}
              name="password"
              type="password"
              required
              minLength={mode === "signup" ? 8 : undefined}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              placeholder="••••••••••"
              style={field}
            />
          </>
        )}

        <Submit mode={mode} />
      </form>

      {error && (
        <p id="join-message" role="alert" style={{ fontSize: 13, lineHeight: 1.6, color: "var(--danger)", border: "1px solid var(--danger)", borderRadius: "var(--r-card)", padding: "12px 16px" }}>
          {error}
        </p>
      )}
      {state.notice && (
        <p role="status" style={{ fontSize: 13, lineHeight: 1.6, color: "var(--sage-ink)", border: "1px solid var(--sage-line-2)", borderRadius: "var(--r-card)", padding: "12px 16px" }}>
          {state.notice}
        </p>
      )}

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13 }}>
        {mode !== "magic" && (
          <button type="button" onClick={() => setMode("magic")} style={linkish}>
            Email me a link instead
          </button>
        )}
        {mode !== "reset" && mode !== "signup" && (
          <button type="button" onClick={() => setMode("reset")} style={linkish}>
            Forgot your password?
          </button>
        )}
        {(mode === "magic" || mode === "reset") && (
          <button type="button" onClick={() => setMode("signin")} style={linkish}>
            Back to sign in
          </button>
        )}
      </div>

      <span style={{ fontSize: 13, lineHeight: 1.6, color: "var(--faint)", marginTop: 4 }}>
        {mode === "signup"
          ? "By creating an account you agree to the license terms. One email a week, nothing else."
          : "Sessions last until you sign out."}
      </span>
    </div>
  );
}

function Submit({ mode }: { mode: Mode }) {
  const { pending } = useFormStatus();
  const label: Record<Mode, string> = {
    signup: "Create free account",
    signin: "Sign in",
    magic: "Send the link",
    reset: "Send a reset link",
  };
  return (
    <button type="submit" className="btn btn--primary" disabled={pending} style={{ fontSize: 15, padding: "16px 22px" }}>
      {pending ? "Working…" : label[mode]}
    </button>
  );
}

function ProviderButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn--ghost" disabled={pending} style={{ padding: "15px 22px", fontSize: 15, color: "var(--ink-3)", width: "100%" }}>
      {pending ? "Redirecting…" : `Continue with ${label}`}
    </button>
  );
}

const field: React.CSSProperties = {
  border: "1px solid var(--hairline-3)",
  borderRadius: "var(--r-pill)",
  padding: "15px 22px",
  fontSize: 15,
  background: "transparent",
  color: "var(--ink)",
};

const linkish: React.CSSProperties = {
  background: "transparent",
  border: 0,
  padding: 0,
  cursor: "pointer",
  color: "var(--muted)",
  font: "inherit",
  textDecoration: "underline",
  textUnderlineOffset: 4,
};
