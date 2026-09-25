"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updatePassword, type AuthState } from "@/app/auth/actions";
import { Button } from "./Button";
import f from "./Form.module.css";

/** A new password for the signed-in visitor — the recovery link's landing, and the profile tab. */
export default function PasswordForm({ submitLabel = "Save and continue" }: { submitLabel?: string }) {
  const [state, action] = useActionState<AuthState, FormData>(updatePassword, {});

  return (
    <form action={action} className={f.form}>
      <div className={f.field}>
        <label className={f.label} htmlFor="new-password">
          New password
        </label>
        <input
          id="new-password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="At least 8 characters"
          className={f.input}
          aria-invalid={state.error ? true : undefined}
          aria-describedby={state.error ? "password-message" : undefined}
        />
      </div>
      <Submit label={submitLabel} />
      {state.error ? (
        <p id="password-message" role="alert" className={f.error}>
          {state.error}
        </p>
      ) : null}
      {state.notice ? (
        <p role="status" className={f.notice}>
          {state.notice}
        </p>
      ) : null}
    </form>
  );
}

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className={f.submit} disabled={pending}>
      {pending ? "Saving…" : label}
    </Button>
  );
}
