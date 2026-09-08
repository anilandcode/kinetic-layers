"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updatePassword, type AuthState } from "@/app/auth/actions";

export default function PasswordForm() {
  const [state, action] = useActionState<AuthState, FormData>(updatePassword, {});

  return (
    <form action={action} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <label className="visually-hidden" htmlFor="new-password">New password</label>
      <input
        id="new-password"
        name="password"
        type="password"
        required
        minLength={8}
        autoComplete="new-password"
        placeholder="••••••••••"
        aria-invalid={state.error ? true : undefined}
        aria-describedby={state.error ? "password-message" : undefined}
        style={{
          border: "1px solid var(--ghost-line)",
          borderRadius: "99px",
          padding: "15px 22px",
          fontSize: 15,
          background: "transparent",
          color: "var(--ink)",
        }}
      />
      <Submit />
      {state.error && (
        <p id="password-message" role="alert" style={{ fontSize: 13, color: "var(--danger)" }}>{state.error}</p>
      )}
    </form>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn--primary" disabled={pending} style={{ fontSize: 15, padding: "16px 22px" }}>
      {pending ? "Saving…" : "Save and continue"}
    </button>
  );
}
