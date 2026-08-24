"use client";

import Link from "next/link";
import { useState } from "react";
import { Mark } from "@/components/kiln/Chrome";

/**
 * Join / sign in.
 *
 * The form is the design's, faithfully. There is no auth behind it — no
 * provider is connected — so submitting says so plainly rather than
 * pretending to create an account. Wiring this up is a separate decision
 * about which identity provider to use.
 */

const PERKS = [
  "All 240 assets and every source file",
  "Nine new assets every Thursday",
  "All 18 collections",
  "Commercial use in unlimited client projects",
];

export default function Join() {
  const [signup, setSignup] = useState(true);
  const [notice, setNotice] = useState("");

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={{ borderBottom: "1px solid var(--hairline)" }}>
        <div className="shell" style={{ height: 66, display: "flex", alignItems: "center", gap: 20 }}>
          <Link data-nav href="/" style={{ display: "flex", alignItems: "center", gap: 9, color: "var(--ink)" }}>
            <Mark />
            <span style={{ fontSize: 16, fontWeight: 500, letterSpacing: "-0.01em" }}>Kiln</span>
          </Link>
          <div style={{ flex: 1 }} />
          <Link data-nav href="/pricing" style={{ fontSize: 14, color: "var(--muted)" }}>
            Pricing
          </Link>
          <Link data-nav href="/" style={{ fontSize: 14, color: "var(--muted)" }}>
            Browse free
          </Link>
        </div>
      </header>

      <main
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(min(440px,100%),1fr))",
          minHeight: 0,
        }}
      >
        {/* --- Auth --- */}
        <section
          style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "70px var(--gutter)" }}
        >
          <div
            data-hero
            style={{ width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", gap: 18 }}
          >
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
              {(["Create account", "Sign in"] as const).map((m) => {
                const on = (m === "Create account") === signup;
                return (
                  <button
                    key={m}
                    type="button"
                    aria-pressed={on}
                    onClick={() => {
                      setSignup(m === "Create account");
                      setNotice("");
                    }}
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      borderRadius: "var(--r-pill)",
                      padding: "9px 18px",
                      cursor: "pointer",
                      transition: "all var(--t-fast) var(--ease)",
                      background: on ? "var(--sage-fill)" : "transparent",
                      border: `1px solid ${on ? "rgba(185,206,149,0.42)" : "transparent"}`,
                      color: on ? "var(--sage-ink)" : "var(--muted)",
                    }}
                  >
                    {m}
                  </button>
                );
              })}
            </div>

            <h1
              style={{
                fontSize: 38,
                lineHeight: 1.12,
                fontWeight: 500,
                letterSpacing: "-0.03em",
                marginTop: 6,
                textWrap: "pretty",
              }}
            >
              {signup ? "Start with twelve free assets." : "Welcome back."}
            </h1>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: "var(--muted)" }}>
              {signup
                ? "No card needed. Upgrade whenever you hit something behind the paywall."
                : "Sign in to reach your downloads, saved collections and invoices."}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
              {["Google", "GitHub"].map((p) => (
                <button
                  key={p}
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => setNotice(`${p} sign-in is not connected yet.`)}
                  style={{ padding: "15px 22px", fontSize: 15, color: "var(--ink-3)" }}
                >
                  Continue with {p}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "6px 0" }}>
              <span style={{ flex: 1, height: 1, background: "var(--hairline)" }} />
              <span className="mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--faint)" }}>
                or
              </span>
              <span style={{ flex: 1, height: 1, background: "var(--hairline)" }} />
            </div>

            <form
              style={{ display: "flex", flexDirection: "column", gap: 10 }}
              onSubmit={(e) => {
                e.preventDefault();
                setNotice("Accounts are not connected yet — no identity provider is wired up.");
              }}
            >
              <label className="visually-hidden" htmlFor="join-email">
                Email address
              </label>
              <input
                id="join-email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@email.com"
                style={fieldStyle}
              />
              <label className="visually-hidden" htmlFor="join-password">
                Password
              </label>
              <input
                id="join-password"
                type="password"
                required
                autoComplete={signup ? "new-password" : "current-password"}
                placeholder="••••••••••"
                style={fieldStyle}
              />
              <button type="submit" className="btn btn--primary" style={{ fontSize: 15, padding: "16px 22px" }}>
                {signup ? "Create free account" : "Sign in"}
              </button>
            </form>

            {notice && (
              <p
                role="status"
                style={{
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: "var(--sage-ink)",
                  border: "1px solid var(--sage-line-2)",
                  borderRadius: "var(--r-card)",
                  padding: "12px 16px",
                }}
              >
                {notice}
              </p>
            )}

            <span style={{ fontSize: 13, lineHeight: 1.6, color: "var(--faint)", marginTop: 4 }}>
              {signup
                ? "By creating an account you agree to the license terms. One email a week, nothing else."
                : "Trouble signing in? Ask for a magic link instead."}
            </span>
          </div>
        </section>

        {/* --- What's behind the gate --- */}
        <section
          style={{
            borderLeft: "1px solid var(--hairline)",
            background:
              "radial-gradient(120% 80% at 80% 10%,rgba(185,206,149,0.12),rgba(15,15,13,0) 60%),#111110",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "70px var(--gutter)",
          }}
        >
          <div
            data-reveal
            style={{ width: "100%", maxWidth: 460, display: "flex", flexDirection: "column", gap: 20 }}
          >
            <div data-card style={{ borderRadius: "var(--r-card)", padding: 5 }}>
              <div style={{ height: 240, borderRadius: "var(--r-inner)", overflow: "hidden", position: "relative" }}>
                <div
                  data-preview-inner
                  style={{ width: "100%", height: "100%", background: "linear-gradient(150deg,#1D2410,#0F0F0D 62%)" }}
                />
                {signup && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(11,11,10,0.55)",
                      backdropFilter: "blur(3px)",
                    }}
                  >
                    <span
                      className="mono"
                      style={{
                        fontSize: 10,
                        letterSpacing: "0.16em",
                        color: "var(--sage-ink)",
                        border: "1px solid rgba(185,206,149,0.45)",
                        background: "var(--sage-fill)",
                        borderRadius: "var(--r-pill)",
                        padding: "9px 18px",
                      }}
                    >
                      Unlimited only
                    </span>
                  </div>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "16px 4px 0" }}>
                <span style={{ fontSize: 17, fontWeight: 500, letterSpacing: "-0.01em" }}>Volumetric Drift</span>
                <span className="chip" style={{ padding: "5px 13px" }}>
                  Unlimited
                </span>
              </div>
              <div style={{ display: "flex", gap: 8, padding: "11px 4px 2px" }}>
                <span className="chip">3d scene</span>
                <span className="chip">three.js</span>
              </div>
            </div>

            <div
              style={{
                borderRadius: "var(--r-card)",
                border: "1px solid var(--hairline-3)",
                background: "var(--surface)",
                padding: 24,
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <span className="mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--sage)" }}>
                What unlimited opens
              </span>
              <ul style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {PERKS.map((p) => (
                  <li key={p} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                    <span aria-hidden="true" style={{ fontSize: 12, color: "var(--sage)", paddingTop: 3 }}>
                      ✦
                    </span>
                    <span style={{ fontSize: 15, lineHeight: 1.5, color: "var(--ink-2)" }}>{p}</span>
                  </li>
                ))}
              </ul>
              <div style={{ height: 1, background: "#232219", marginTop: 4 }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                <span style={{ fontSize: 15, color: "var(--muted)" }}>$24 a month, cancel anytime</span>
                <Link data-nav href="/pricing" style={{ fontSize: 14, color: "var(--sage-ink)" }}>
                  See pricing →
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

const fieldStyle: React.CSSProperties = {
  border: "1px solid var(--hairline-3)",
  borderRadius: "var(--r-pill)",
  padding: "15px 22px",
  fontSize: 15,
  background: "transparent",
  color: "var(--ink)",
};
