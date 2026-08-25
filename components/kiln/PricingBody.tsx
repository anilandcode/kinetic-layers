"use client";

import Link from "next/link";
import { useState } from "react";
import type { Settings, Viewer } from "@/lib/kiln/types";

const FREE_FEATURES = [
  "12 assets, rotating on the first of each month",
  "Full output files, partial source",
  "Personal projects only",
  "No card required",
];

const PAID_FEATURES = [
  "All 240 assets across the eight shelves",
  "Every source file: prompts, scenes, weights, configs",
  "Nine new assets every Thursday",
  "All 18 collections",
  "Commercial use in unlimited client projects",
  "One asset request a month",
];

const ROWS = [
  { label: "Assets available", free: "12", paid: "240" },
  { label: "New drops every Thursday", free: "—", paid: "Included" },
  { label: "Source files & prompt text", free: "Partial", paid: "Everything" },
  { label: "Commercial use in client work", free: "—", paid: "Unlimited" },
  { label: "Collections", free: "—", paid: "All 18" },
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
    a: "Yes. Unlimited covers commercial use in unlimited client projects. You can't resell an asset as-is or republish it to another marketplace.",
  },
  {
    q: "Do I get the source files?",
    a: "Yes — prompt text, project files, scene files, LoRA weights and workflow configs, not just the rendered output.",
  },
  {
    q: "How often is it updated?",
    a: "Nine new assets every Thursday, plus fixes to anything already in the vault.",
  },
];

export default function PricingBody({ settings, viewer }: { settings: Settings; viewer: Viewer | null }) {
  const [annual, setAnnual] = useState(false);
  const [open, setOpen] = useState<number>(0);

  return (
    <>
        <section
          className="shell"
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
            <span className="mono" style={{ fontSize: 11, letterSpacing: "0.16em", color: "var(--sage)" }}>
              One studio, one price
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
              Twelve free forever. The other 228 for the price of one stock scene.
            </h1>
            <p style={{ fontSize: 17, lineHeight: 1.65, color: "var(--muted)", maxWidth: 500 }}>
              Cancel any time and keep every file you already downloaded. No seats, no credits, no
              per-asset fees.
            </p>

            <div
              role="group"
              aria-label="Billing cycle"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                border: "1px solid var(--hairline-3)",
                borderRadius: "var(--r-pill)",
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
                      borderRadius: "var(--r-pill)",
                      padding: "9px 20px",
                      cursor: "pointer",
                      transition: "all var(--t-fast) var(--ease)",
                      background: on ? "var(--sage-fill)" : "transparent",
                      border: `1px solid ${on ? "rgba(185,206,149,0.42)" : "transparent"}`,
                      color: on ? "var(--sage-ink)" : "var(--muted)",
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
            padding: "26px var(--gutter) 20px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
            gap: 24,
            alignItems: "start",
          }}
        >
          <div
            data-reveal
            style={{
              borderRadius: "var(--r-card)",
              border: "1px solid var(--hairline-3)",
              background: "#121210",
              padding: 30,
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span className="mono" style={{ fontSize: 11, letterSpacing: "0.14em", color: "var(--faint)" }}>
                Free
              </span>
              <span style={{ fontSize: 44, fontWeight: 500, letterSpacing: "-0.03em" }}>$0</span>
              <span style={{ fontSize: 14, color: "var(--muted)" }}>
                12 rotating assets, refreshed monthly.
              </span>
            </div>
            <div style={{ height: 1, background: "var(--hairline)" }} />
            <ul style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {FREE_FEATURES.map((f) => (
                <li key={f} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                  <span
                    className="mono"
                    aria-hidden="true"
                    style={{ fontSize: 11, color: "var(--faint)", paddingTop: 2 }}
                  >
                    —
                  </span>
                  <span style={{ fontSize: 15, lineHeight: 1.5, color: "var(--ink-3)" }}>{f}</span>
                </li>
              ))}
            </ul>
            <div style={{ flex: 1 }} />
            <Link data-nav href="/" className="btn btn--ghost" style={{ marginTop: 8 }}>
              Browse the free twelve
            </Link>
          </div>

          <div
            data-reveal
            style={{
              borderRadius: "var(--r-card)",
              border: "1px solid rgba(185,206,149,0.34)",
              background:
                "radial-gradient(120% 90% at 85% 0%,rgba(185,206,149,0.16),rgba(20,20,17,0) 62%),var(--surface)",
              padding: 30,
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span className="mono" style={{ fontSize: 11, letterSpacing: "0.14em", color: "var(--sage)" }}>
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
                className="mono"
                style={{
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  color: "var(--sage)",
                  border: "1px solid rgba(185,206,149,0.34)",
                  borderRadius: "var(--r-pill)",
                  padding: "6px 12px",
                  whiteSpace: "nowrap",
                }}
              >
                {annual ? `Save $${settings.monthlyPrice * 12 - settings.annualPrice}` : `${settings.totalAssets} assets`}
              </span>
            </div>

            <div style={{ height: 1, background: "#232219" }} />

            <ul style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {PAID_FEATURES.map((f) => (
                <li key={f} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                  <span aria-hidden="true" style={{ fontSize: 12, color: "var(--sage)", paddingTop: 3 }}>
                    ✦
                  </span>
                  <span style={{ fontSize: 15, lineHeight: 1.5, color: "var(--ink-2)" }}>{f}</span>
                </li>
              ))}
            </ul>

            {viewer?.unlimited ? (
              <Link data-nav href="/account" className="btn btn--primary" style={{ fontSize: 15, padding: "15px 24px", marginTop: 10 }}>
                You already have this — open your vault
              </Link>
            ) : (
              <Link
                data-nav
                href={viewer ? "/account" : "/join?next=/pricing"}
                className="btn btn--primary"
                style={{ fontSize: 15, padding: "15px 24px", marginTop: 10 }}
              >
                {viewer
                  ? "Checkout is not connected yet"
                  : annual
                    ? "Get a year of unlimited"
                    : "Get unlimited"}
              </Link>
            )}
            <span
              className="mono"
              style={{ fontSize: 10, letterSpacing: "0.1em", color: "var(--faint)", textAlign: "center" }}
            >
              Cancel anytime · keep your downloads
            </span>
          </div>
        </section>

        {/* ============ Comparison ============ */}
        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "44px var(--gutter) 20px" }}>
          <div
            data-reveal
            style={{ borderRadius: "var(--r-card)", border: "1px solid var(--hairline)", overflow: "hidden" }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <caption className="visually-hidden">What each plan includes</caption>
              <thead>
                <tr className="mono" style={{ background: "#121210", fontSize: 10, letterSpacing: "0.14em", color: "var(--faint)" }}>
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
                {ROWS.map((r) => (
                  <tr key={r.label} style={{ borderTop: "1px solid #1A1917" }}>
                    <th
                      scope="row"
                      style={{ padding: "17px 24px", fontSize: 15, fontWeight: 300, color: "var(--ink-3)" }}
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
                        color: "var(--faint)",
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
                    <td style={{ padding: "17px 24px", fontSize: 14, textAlign: "center", color: "var(--sage)" }}>
                      {r.paid}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ============ FAQ ============ */}
        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "52px var(--gutter) 90px" }}>
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
                    borderRadius: "var(--r-card)",
                    border: `1px solid ${isOpen ? "var(--line)" : "var(--hairline)"}`,
                    background: isOpen ? "var(--surface)" : "#111110",
                    transition: "all var(--t-mid) var(--ease)",
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
                          color: "var(--sage)",
                          transition: "transform 220ms var(--ease)",
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
