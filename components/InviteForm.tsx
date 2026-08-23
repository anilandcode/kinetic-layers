"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { track } from "@/lib/track";
import { isQualified } from "@/lib/contracts";

type Status = { kind: "idle" | "sending" | "error"; message: string };

export default function InviteForm({ contactEmail }: { contactEmail: string }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const started = useRef(false);
  const [status, setStatus] = useState<Status>({ kind: "idle", message: "" });
  const busy = status.kind === "sending";

  function onFirstInput() {
    if (started.current) return;
    started.current = true;
    track("form_start");
  }

  async function onSubmit(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    const form = formRef.current;
    if (!form || !form.reportValidity()) return;

    const data = new FormData(form);
    const dk = window.DK ?? { variant: "unknown", source: "direct", qa: false };
    data.set("variant", dk.variant);
    data.set("source", dk.source);
    data.set("qa", dk.qa ? "1" : "0");

    const role = String(data.get("role") ?? "");
    const shipped = String(data.get("shipped") ?? "");
    track("form_submit", role || null);
    if (isQualified(role, shipped)) track("qualified_submit", shipped);

    setStatus({ kind: "sending", message: "Sending your request…" });

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`status ${res.status}`);
      router.push("/thanks");
    } catch {
      setStatus({
        kind: "error",
        message: `That did not go through. Please try again, or email ${contactEmail} and we will add you by hand.`,
      });
    }
  }

  return (
    <form
      ref={formRef}
      className="form"
      method="post"
      action="/api/subscribe"
      onSubmit={onSubmit}
      onInput={onFirstInput}
      noValidate
    >
      <div className="field">
        <label htmlFor="email">Email</label>
        <input
          className="input"
          type="email"
          id="email"
          name="email"
          autoComplete="email"
          required
          placeholder="you@studio.com"
        />
      </div>

      <fieldset className="fieldset">
        <legend>How do you work?</legend>
        <div className="choices">
          <label className="choice">
            <input type="radio" name="role" value="agency" required />
            <span>Agency</span>
          </label>
          <label className="choice">
            <input type="radio" name="role" value="freelancer" />
            <span>Freelancer</span>
          </label>
          <label className="choice">
            <input type="radio" name="role" value="neither" />
            <span>Neither</span>
          </label>
        </div>
      </fieldset>

      <fieldset className="fieldset">
        <legend>Client sites shipped in the last 12 months</legend>
        <div className="choices">
          <label className="choice">
            <input type="radio" name="shipped" value="0-1" required />
            <span>0&ndash;1</span>
          </label>
          <label className="choice">
            <input type="radio" name="shipped" value="2-5" />
            <span>2&ndash;5</span>
          </label>
          <label className="choice">
            <input type="radio" name="shipped" value="6plus" />
            <span>6+</span>
          </label>
        </div>
      </fieldset>

      <fieldset className="fieldset">
        <legend>Which direction would you open first?</legend>
        <div className="choices">
          <label className="choice">
            <input type="radio" name="concept" value="signal-arc" />
            <span>Signal Arc</span>
          </label>
          <label className="choice">
            <input type="radio" name="concept" value="proof-ledger" />
            <span>Proof Ledger</span>
          </label>
          <label className="choice">
            <input type="radio" name="concept" value="studio-current" />
            <span>Studio Current</span>
          </label>
        </div>
      </fieldset>

      <div className="field">
        <label htmlFor="blocker">What would stop you using this in client work?</label>
        <textarea
          className="textarea"
          id="blocker"
          name="blocker"
          placeholder="Licensing, source quality, brand fit, dependency risk…"
        />
        <p className="hint">Optional, and the most useful thing you can tell us.</p>
      </div>

      <label className="consent">
        <input type="checkbox" name="interview" value="yes" />
        <span>
          I&rsquo;m open to a 25-minute conversation about my last two client projects.
        </span>
      </label>

      <label className="consent">
        <input type="checkbox" name="consent" value="yes" />
        <span>
          Send me occasional email about the founding collection. Separate from any
          message about this request, and you can stop it at any time.
        </span>
      </label>

      {/* Spam trap: hidden from people, tempting to bots. */}
      <div className="visually-hidden" aria-hidden="true">
        <label htmlFor="company-website">Company website</label>
        <input
          type="text"
          id="company-website"
          name="company_website"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {status.kind !== "idle" && (
        <p
          className={
            "form__status" + (status.kind === "error" ? " form__status--error" : "")
          }
          role={status.kind === "error" ? "alert" : undefined}
        >
          {status.message}
        </p>
      )}

      <button
        className="btn btn--primary btn--block"
        type="submit"
        disabled={busy}
        data-busy={busy ? "" : undefined}
        data-track="cta_click"
        data-track-detail="form-submit-button"
      >
        <span data-offer="a">Request a Founding Prompt invitation</span>
        <span data-offer="b">Request a Founding Studio invitation</span>
        <span className="btn__busy">Sending&hellip;</span>
      </button>

      <p className="hint">
        We store your answers to decide whether to build this, and nothing else.{" "}
        <a href="/privacy">What we keep</a>.
      </p>
    </form>
  );
}
