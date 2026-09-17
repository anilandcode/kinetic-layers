"use client";

import { useState, type FormEvent } from "react";
import GlassButton from "./GlassButton";

type State = "idle" | "sending" | "done" | "error";

/**
 * This is deliberately separate from the newsletter form. A person can want
 * to hear about Founding Membership without opting into the regular digest,
 * and vice versa. It records interest only: there is no checkout session,
 * payment field, or entitlement change behind this control.
 */
export default function MembershipInterestForm() {
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;

    setState("sending");
    try {
      const response = await fetch("/api/membership-interest", {
        method: "POST",
        body: new FormData(form),
      });
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
      <p role="status" style={{ margin: 0, color: "var(--moss)", fontSize: 13, lineHeight: 1.5 }}>
        {message}
      </p>
    );
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
      <label className="kl-vh" htmlFor="membership-interest-email">
        Email address
      </label>
      <input
        id="membership-interest-email"
        name="email"
        type="email"
        autoComplete="email"
        required
        className="kl-input"
        placeholder="you@email.com"
      />
      <input
        className="kl-vh"
        name="company_website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />
      <GlassButton type="submit" premium pull={5} disabled={state === "sending"}>
        {state === "sending" ? "Saving…" : "Join the interest list"}
      </GlassButton>
      <p style={{ margin: 0, color: "var(--ink-3)", fontSize: 12, lineHeight: 1.45 }}>
        We will email you a confirmation first. This is not a subscription and does not collect a card.
      </p>
      {state === "error" ? (
        <p role="alert" style={{ margin: 0, color: "var(--amber)", fontSize: 12, lineHeight: 1.45 }}>
          {message}
        </p>
      ) : null}
    </form>
  );
}
