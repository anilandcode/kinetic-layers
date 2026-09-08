"use client";

import Link from "next/link";
import { useState } from "react";
import type { Settings, Viewer } from "@/lib/kl/types";
import { LIMITS, describeAllowance } from "@/lib/kl/limits";
import { EARLY_ACCESS } from "@/lib/kl/access";

/* These read the live counts rather than repeating them. A hardcoded "All 240
   assets" beside a price pulled from settings is a promise that silently stops
   being true the moment the catalogue differs — which it did. */
const freeFeatures = (s: Settings) => [
  `${s.freeThisMonth} assets, free to any account`,
  /* From LIMITS, not typed out here. The number promised and the number
     enforced are the same variable, so they cannot drift. */
  `Fair use: ${describeAllowance("free")}`,
  "Full output files, partial source",
  "Personal projects only",
  "No card required",
];

const paidFeatures = (s: Settings) => [
  `All ${s.totalAssets} assets across the shelves`,
  `Fair use: ${describeAllowance("premium")}`,
  "Every source file: prompts, scenes, weights, configs",
  "New assets every Thursday",
  `All ${s.collectionCount} collections`,
  "Commercial use in unlimited client projects",
  "One asset request a month",
];

const rows = (s: Settings) => [
  { label: "Assets available", free: String(s.freeThisMonth), paid: String(s.totalAssets) },
  {
    label: "Prompt reads a day",
    free: String(LIMITS.free.prompt),
    paid: String(LIMITS.premium.prompt),
  },
  {
    label: "Downloads a day",
    free: String(LIMITS.free.download),
    paid: String(LIMITS.premium.download),
  },
  { label: "New drops every Thursday", free: "—", paid: "Included" },
  { label: "Source files & prompt text", free: "Partial", paid: "Everything" },
  { label: "Commercial use in client work", free: "—", paid: "Unlimited" },
  { label: "Collections", free: "—", paid: `All ${s.collectionCount}` },
  { label: "Keep downloads after cancelling", free: "Yes", paid: "Yes" },
  { label: "Request an asset", free: "—", paid: "One per month" },
];

const FAQ = [
  {
    q: "Who makes the assets?",
    a: "One studio. Everything in the vault was built here for a real brief, shipped, then cleaned up and filed. Nothing is resold from elsewhere.",
  },
  {
    q: "What happens if I cancel?",
    a: "Your access to new drops stops, and everything you downloaded stays yours under the same license. Re-subscribe any time and the vault opens again.",
  },
  {
    q: "Can I use these in client work?",
    a: "Yes. Premium covers commercial use in unlimited client projects. You can't resell an asset as-is or republish it to another marketplace.",
  },
  {
    q: "Do I get the source files?",
    a: "Yes — prompt text, project files, scene files, LoRA weights and workflow configs, not just the rendered output.",
  },
  {
    q: "How often is it updated?",
    a: "New assets every Thursday, plus fixes to anything already in the vault.",
  },
];

export default function PricingBody({
  settings,
  viewer,
  checkoutReady,
}: {
  settings: Settings;
  viewer: Viewer | null;
  /* Whether Stripe has keys. Decided on the server — the client cannot read
     STRIPE_* and must not be told to try. */
  checkoutReady: boolean;
}) {
  const [annual, setAnnual] = useState(false);
  const [open, setOpen] = useState<number>(0);
  const [busy, setBusy] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  async function startCheckout() {
    setBusy(true);
    setCheckoutError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval: annual ? "annual" : "monthly" }),
      });
      const data = (await res.json()) as { ok?: boolean; url?: string; message?: string };

      if (data.ok && data.url) {
        /* A full navigation, not the router: Stripe is another origin. */
        window.location.href = data.url;
        return;
      }
      setCheckoutError(data.message ?? "Could not start checkout.");
    } catch {
      setCheckoutError("Could not reach the network. Try again.");
    }
    /* Only reached on failure — on success the page is already leaving. */
    setBusy(false);
  }

  return (
    <>
        <section
          className="kl-pad"
          style={{
            paddingBlock: "84px 40px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 22,
            textAlign: "center",
          }}
        >
          <div
            data-hero
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}
          >
            <span className="kl-mono" style={{ fontSize: 11, letterSpacing: "0.16em", color: "var(--amber)" }}>
              {EARLY_ACCESS ? "Not charging yet" : "One studio, one price"}
            </span>
            <h1
              style={{
                fontSize: "clamp(34px, 4.6vw, 58px)",
                lineHeight: 1.06,
                fontWeight: 500,
                letterSpacing: "-0.035em",
                maxWidth: 720,
                textWrap: "pretty",
              }}
            >
              {EARLY_ACCESS
                ? "Everything is free right now."
                : `${settings.freeThisMonth} free forever. The other ${Math.max(0, settings.totalAssets - settings.freeThisMonth)} for the price of one stock scene.`}
            </h1>
            <p style={{ fontSize: 17, lineHeight: 1.65, color: "var(--muted)", maxWidth: 500 }}>
              {EARLY_ACCESS
                ? `Kinetic Layers is new, so all ${settings.totalAssets} assets and every source file are free while it is in early access — an account is the only requirement. This page is what it will cost when that ends, published early so it is never a surprise. Anything you download stays yours.`
                : "Cancel any time and keep every file you already downloaded. No seats, no credits, no per-asset fees."}
            </p>

            <div
              role="group"
              aria-label="Billing cycle"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                border: "1px solid var(--line2)",
                borderRadius: "99px",
                padding: 5,
                marginTop: 6,
              }}
            >
              {(["Monthly", "Annual"] as const).map((c) => {
                const on = (c === "Annual") === annual;
                return (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setAnnual(c === "Annual")}
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      borderRadius: "99px",
                      padding: "9px 20px",
                      cursor: "pointer",
                      transition: "all 0.18s cubic-bezier(0.22, 1, 0.36, 1)",
                      background: on ? "var(--amber-bg)" : "transparent",
                      border: `1px solid ${on ? "rgba(185,206,149,0.42)" : "transparent"}`,
                      color: on ? "var(--amber)" : "var(--muted)",
                    }}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============ Plans ============ */}
        <section
          id="plans"
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "26px 32px 20px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(min(320px,100%),1fr))",
            gap: 24,
            alignItems: "start",
          }}
        >
          <div
            data-reveal
            style={{
              borderRadius: "18px",
              border: "1px solid var(--line2)",
              background: "#121210",
              padding: 30,
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span className="kl-mono" style={{ fontSize: 11, letterSpacing: "0.14em", color: "var(--muted)" }}>
                Free
              </span>
              <span style={{ fontSize: 44, fontWeight: 500, letterSpacing: "-0.03em" }}>$0</span>
              <span style={{ fontSize: 14, color: "var(--muted)" }}>
                {settings.freeThisMonth} assets, free to any account.
              </span>
            </div>
            <div style={{ height: 1, background: "var(--line)" }} />
            <ul style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {freeFeatures(settings).map((f) => (
                <li key={f} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                  <span
                    className="kl-mono"
                    aria-hidden="true"
                    style={{ fontSize: 11, color: "var(--muted)", paddingTop: 2 }}
                  >
                    —
                  </span>
                  <span style={{ fontSize: 15, lineHeight: 1.5, color: "var(--muted)" }}>{f}</span>
                </li>
              ))}
            </ul>
            <div style={{ flex: 1 }} />
            <Link data-nav href="/library" className="btn btn--ghost" style={{ marginTop: 8 }}>
              Browse the free {settings.freeThisMonth}
            </Link>
          </div>

          <div
            data-reveal
            style={{
              borderRadius: "18px",
              border: "1px solid rgba(185,206,149,0.34)",
              background:
                "radial-gradient(120% 90% at 85% 0%,rgba(185,206,149,0.16),rgba(20,20,17,0) 62%),var(--card)",
              padding: 30,
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span className="kl-mono" style={{ fontSize: 11, letterSpacing: "0.14em", color: "var(--amber)" }}>
                  Unlimited
                </span>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontSize: 52, fontWeight: 500, letterSpacing: "-0.035em" }}>
                    {annual ? `$${settings.annualPrice}` : `$${settings.monthlyPrice}`}
                  </span>
                  <span style={{ fontSize: 15, color: "var(--muted)" }}>
                    {annual ? "/year" : "/month"}
                  </span>
                </div>
                <span style={{ fontSize: 14, color: "var(--muted)" }}>
                  {annual ? "Billed once — two months free." : "Billed monthly, cancel any time."}
                </span>
              </div>
              <span
                className="kl-mono"
                style={{
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  color: "var(--amber)",
                  border: "1px solid rgba(185,206,149,0.34)",
                  borderRadius: "99px",
                  padding: "6px 12px",
                  whiteSpace: "nowrap",
                }}
              >
                {annual ? `Save $${settings.monthlyPrice * 12 - settings.annualPrice}` : `${settings.totalAssets} assets`}
              </span>
            </div>

            <div style={{ height: 1, background: "#232219" }} />

            <ul style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {paidFeatures(settings).map((f) => (
                <li key={f} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                  <span aria-hidden="true" style={{ fontSize: 12, color: "var(--amber)", paddingTop: 3 }}>
                    ✦
                  </span>
                  <span style={{ fontSize: 15, lineHeight: 1.5, color: "var(--body)" }}>{f}</span>
                </li>
              ))}
            </ul>

            {/* Nothing is for sale during early access, so the primary action
                is the one that actually works: make an account and take it.
                Leaving a live "Go Premium" here would start a checkout that
                answers 503. */}
            {EARLY_ACCESS ? (
              <Link
                data-nav
                href={viewer ? "/library" : "/join"}
                className="btn btn--primary"
                style={{ fontSize: 15, padding: "15px 24px", marginTop: 10 }}
              >
                {viewer ? "You already have all of it — open the library" : "Get it free while it lasts"}
              </Link>
            ) : viewer?.premium ? (
              <Link data-nav href="/account" className="btn btn--primary" style={{ fontSize: 15, padding: "15px 24px", marginTop: 10 }}>
                You already have this — open your vault
              </Link>
            ) : !viewer ? (
              /* Sign in first, then come back here rather than to the account
                 page — the visitor asked for a plan, not for settings. */
              <Link
                data-nav
                href="/join?next=/pricing"
                className="btn btn--primary"
                style={{ fontSize: 15, padding: "15px 24px", marginTop: 10 }}
              >
                {annual ? "Get a year of Premium" : "Go Premium"}
              </Link>
            ) : checkoutReady ? (
              /* A button, not an anchor: KilnMotion intercepts a[data-nav] in
                 the capture phase and stops propagation, so a link's handler
                 would never run. */
              <button
                type="button"
                className="btn btn--primary"
                onClick={startCheckout}
                disabled={busy}
                style={{ fontSize: 15, padding: "15px 24px", marginTop: 10 }}
              >
                {busy
                  ? "Taking you to checkout…"
                  : annual
                    ? "Get a year of Premium"
                    : "Go Premium"}
              </button>
            ) : (
              <span
                className="btn btn--primary"
                aria-disabled="true"
                style={{ fontSize: 15, padding: "15px 24px", marginTop: 10, opacity: 0.6 }}
              >
                Checkout is not connected yet
              </span>
            )}

            {checkoutError ? (
              <span role="alert" style={{ fontSize: 13, color: "var(--body)", textAlign: "center" }}>
                {checkoutError}
              </span>
            ) : null}
            <span
              className="kl-mono"
              style={{ fontSize: 10, letterSpacing: "0.1em", color: "var(--muted)", textAlign: "center" }}
            >
              Cancel anytime · keep your downloads
            </span>
          </div>
        </section>

        {/* ============ Comparison ============ */}
        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "44px 32px 20px" }}>
          <div
            data-reveal
            style={{ borderRadius: "18px", border: "1px solid var(--line)", overflow: "hidden" }}
          >
            {/* Three columns of copy do not fit a phone. The table used to push
                the page 20px wider than a 375px screen, so the whole document
                scrolled sideways to read one comparison. Wide content scrolls
                inside its own box instead — the table keeps a sensible minimum
                and the page stays put. */}
            <div style={{ overflowX: "auto", overscrollBehavior: "contain" }}>
            <table style={{ width: "100%", minWidth: 460, borderCollapse: "collapse", textAlign: "left" }}>
              <caption className="visually-hidden">What each plan includes</caption>
              <thead>
                <tr className="kl-mono" style={{ background: "#121210", fontSize: 10, letterSpacing: "0.14em", color: "var(--muted)" }}>
                  <th scope="col" style={{ padding: "16px 24px", fontWeight: 400 }}>
                    What you get
                  </th>
                  <th scope="col" style={{ padding: "16px 24px", fontWeight: 400, textAlign: "center" }}>
                    Free
                  </th>
                  <th scope="col" style={{ padding: "16px 24px", fontWeight: 400, textAlign: "center" }}>
                    Unlimited
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows(settings).map((r) => (
                  <tr key={r.label} style={{ borderTop: "1px solid #1A1917" }}>
                    <th
                      scope="row"
                      style={{ padding: "17px 24px", fontSize: 15, fontWeight: 300, color: "var(--muted)" }}
                    >
                      {r.label}
                    </th>
                    <td
                      style={{
                        padding: "17px 24px",
                        fontSize: 14,
                        textAlign: "center",
                        /* The design greys the em-dash to #4E4C46, which measures
                           2.24:1. A "not included" marker still has to be legible. */
                        color: "var(--muted)",
                      }}
                    >
                      {r.free === "—" ? (
                        <>
                          <span aria-hidden="true">—</span>
                          <span className="visually-hidden">Not included</span>
                        </>
                      ) : (
                        r.free
                      )}
                    </td>
                    <td style={{ padding: "17px 24px", fontSize: 14, textAlign: "center", color: "var(--amber)" }}>
                      {r.paid}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </section>

        {/* ============ FAQ ============ */}
        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "52px 32px 90px" }}>
          <h2
            data-reveal
            style={{ fontSize: 32, fontWeight: 500, letterSpacing: "-0.025em", marginBottom: 22 }}
          >
            Questions worth answering
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {FAQ.map((f, i) => {
              const isOpen = open === i;
              return (
                <div
                  data-reveal
                  key={f.q}
                  style={{
                    borderRadius: "18px",
                    border: `1px solid ${isOpen ? "var(--line)" : "var(--line)"}`,
                    background: isOpen ? "var(--card)" : "#111110",
                    transition: "all 0.32s cubic-bezier(0.22, 1, 0.36, 1)",
                  }}
                >
                  <h3 style={{ margin: 0 }}>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`faq-${i}`}
                      onClick={() => setOpen(isOpen ? -1 : i)}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 20,
                        padding: "22px 24px",
                        background: "transparent",
                        border: 0,
                        cursor: "pointer",
                        textAlign: "left",
                        fontSize: 17,
                        fontWeight: 400,
                        color: "var(--ink)",
                      }}
                    >
                      {f.q}
                      <span
                        aria-hidden="true"
                        style={{
                          fontSize: 20,
                          color: "var(--amber)",
                          transition: "transform 220ms cubic-bezier(0.22, 1, 0.36, 1)",
                          transform: `rotate(${isOpen ? 135 : 0}deg)`,
                        }}
                      >
                        +
                      </span>
                    </button>
                  </h3>
                  {isOpen && (
                    <p
                      id={`faq-${i}`}
                      style={{
                        fontSize: 15,
                        lineHeight: 1.65,
                        color: "var(--muted)",
                        padding: "0 24px 22px",
                        maxWidth: 640,
                      }}
                    >
                      {f.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
    </>
  );
}
