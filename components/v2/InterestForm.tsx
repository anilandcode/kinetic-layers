"use client";

import { useState, type FormEvent } from "react";
import { Button } from "./Button";
import f from "./Form.module.css";

type State = "idle" | "sending" | "done" | "error";

/**
 * The Founding Membership interest list — deliberately separate from the
 * newsletter, and nothing more than a list: there is no checkout session,
 * payment field or entitlement change behind it. Posts to the existing
 * /api/membership-interest, which emails a confirmation first.
 */
export default function InterestForm() {
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;

    setState("sending");
    try {
      const response = await fetch("/api/membership-interest", { method: "POST", body: new FormData(form) });
      const body = (await response.json()) as { ok?: boolean; message?: string };
      if (response.ok && body.ok) {
        setState("done");
        setMessage(body.message ?? "Check your email to confirm your interest.");
        form.reset();
        return;
      }
      setState("error");
      setMessage(body.message ?? "That did not go through. Please try again.");
    } catch {
      setState("error");
      setMessage("Could not reach the network. Please try again.");
    }
  }

  if (state === "done") {
    return (
      <p role="status" className={f.notice}>
        {message}
      </p>
    );
  }

  return (
    <form onSubmit={submit} className={f.form}>
      <div className={f.field}>
        <label className="v-sr" htmlFor="membership-interest-email">
          Email address
        </label>
        <input
          id="membership-interest-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={f.input}
          placeholder="you@email.com"
          aria-invalid={state === "error" ? true : undefined}
          aria-describedby={state === "error" ? "interest-message" : "interest-hint"}
        />
      </div>
      {/* The honeypot: invisible to people, irresistible to form bots. */}
      <input className="v-sr" name="company_website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <Button type="submit" size="lg" className={f.submit} disabled={state === "sending"}>
        {state === "sending" ? "Saving…" : "Join the interest list"}
      </Button>
      <p id="interest-hint" className={f.hint}>
        We email a confirmation first. This is not a subscription and never asks for a card.
      </p>
      {state === "error" ? (
        <p id="interest-message" role="alert" className={f.error}>
          {message}
        </p>
      ) : null}
    </form>
  );
}
