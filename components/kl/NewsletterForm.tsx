"use client";

import { useState } from "react";
import GlassButton from "./GlassButton";

/**
 * The drop-list signup on the news card.
 *
 * Posts to the existing /api/subscribe, which stores the row either way and
 * only forwards to the mailing list when `consent` is set — so the checkbox is
 * not decoration, and this form sets it explicitly because subscribing is the
 * entire point of the card.
 *
 * The prototype drew a static input and a button that did nothing. A field
 * that looks live and silently discards an address is worse than no field, so
 * this one is real.
 */
export default function NewsletterForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    const form = evt.currentTarget;
    if (!form.reportValidity()) return;

    setStatus("sending");
    const data = new FormData(form);
    data.set("consent", "yes");
    data.set("source", "home-news-card");

    try {
      const res = await fetch("/api/subscribe", { method: "POST", body: data });
      const body = (await res.json()) as { ok?: boolean; message?: string };
      if (res.ok && body.ok) {
        setStatus("done");
        setMessage(body.message ?? "You are on the list.");
        form.reset();
        return;
      }
      setStatus("error");
      setMessage(body.message ?? "That did not go through.");
    } catch {
      setStatus("error");
      setMessage("Could not reach the network. Try again.");
    }
  }

  if (status === "done") {
    return (
      <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "var(--moss)", margin: 0 }} role="status">
        {message}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      <label className="kl-vh" htmlFor="kl-news-email">
        Email address
      </label>
      <input
        id="kl-news-email"
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="you@email.com"
        style={{
          border: "1px solid var(--line)",
          borderRadius: 99,
          padding: "13px 18px",
          fontSize: 14.5,
          color: "var(--ink)",
          background: "var(--inset)",
          font: "inherit",
        }}
      />
      <GlassButton type="submit" pull={4} disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Subscribe"}
      </GlassButton>
      {status === "error" ? (
        <span role="alert" style={{ fontSize: 12, lineHeight: 1.5, color: "var(--amber)" }}>
          {message}
        </span>
      ) : null}
    </form>
  );
}
