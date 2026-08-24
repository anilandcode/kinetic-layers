"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Footer, Mark } from "@/components/kiln/Chrome";

/**
 * Account.
 *
 * Signed-in state, rendered from placeholder data. Nothing here is wired to
 * an identity provider or a billing system yet — the buttons are the design's
 * and they do not move money.
 */

type Kind = "Templates" | "Scenes" | "Prompts";

const DOWNLOADS: Array<{ name: string; meta: string; date: string; kind: Kind; g: string }> = [
  { name: "Volumetric Drift", meta: "3D SCENE · THREE.JS · 84 MB", date: "22 AUG", kind: "Scenes", g: "linear-gradient(150deg,#1D2410,#0F0F0D)" },
  { name: "Editorial Landing 04", meta: "TEMPLATE · NEXT · TW · 12 MB", date: "22 AUG", kind: "Templates", g: "linear-gradient(150deg,#242014,#0F0F0D)" },
  { name: "Cold Open", meta: "PROMPT · CLAUDE · 4 KB", date: "20 AUG", kind: "Prompts", g: "linear-gradient(150deg,#10241A,#0F0F0D)" },
  { name: "Paper Grain LoRA", meta: "LORA · FLUX · 148 MB", date: "18 AUG", kind: "Scenes", g: "linear-gradient(150deg,#241F16,#0F0F0D)" },
  { name: "Research Swarm", meta: "MCP / AGENT · 22 KB", date: "15 AUG", kind: "Prompts", g: "linear-gradient(150deg,#141C24,#0F0F0D)" },
  { name: "Brutal Grid Pack", meta: "TEMPLATE · ASTRO · 9 MB", date: "13 AUG", kind: "Templates", g: "linear-gradient(150deg,#26221A,#0F0F0D)" },
  { name: "Chrome Liquid", meta: "3D SCENE · R3F · 61 MB", date: "11 AUG", kind: "Scenes", g: "linear-gradient(150deg,#1E1E24,#0F0F0D)" },
];

const STATS = [
  { label: "Downloaded", value: "63", note: "of 240 assets", big: true },
  { label: "This month", value: "14", note: "9 from Drop 019", big: true },
  { label: "Saved", value: "5", note: "collections", big: true },
  { label: "Member since", value: "Mar 2026", note: "6 months unlimited", big: false },
];

const SAVED = [
  { name: "Editorial Suite", meta: "24 ITEMS · UPDATED 22 AUG", g: "linear-gradient(150deg,#242014,#0F0F0D)" },
  { name: "Volumetric Set", meta: "18 ITEMS · UPDATED 20 AUG", g: "linear-gradient(150deg,#1D2410,#0F0F0D)" },
  { name: "Agent Bench", meta: "15 ITEMS · UPDATED 6 AUG", g: "linear-gradient(150deg,#141C24,#0F0F0D)" },
];

const INVOICES = [
  { date: "12 AUG 2026", amount: "$24.00" },
  { date: "12 JUL 2026", amount: "$24.00" },
  { date: "12 JUN 2026", amount: "$24.00" },
];

const thumb = (g: string): React.CSSProperties => ({
  width: 44,
  height: 34,
  borderRadius: 7,
  flexShrink: 0,
  border: "1px solid var(--hairline-2)",
  background: g,
});

export default function Account() {
  const [filter, setFilter] = useState<"All" | Kind>("All");
  const list = useMemo(
    () => DOWNLOADS.filter((d) => filter === "All" || d.kind === filter),
    [filter]
  );

  return (
    <>
      <a className="skip-link" href="#downloads">
        Skip to downloads
      </a>

      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: "rgba(15,15,13,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--hairline)",
        }}
      >
        <nav className="shell" style={{ height: 66, display: "flex", alignItems: "center", gap: 36 }}>
          <Link data-nav href="/" style={{ display: "flex", alignItems: "center", gap: 9, color: "var(--ink)" }}>
            <Mark />
            <span style={{ fontSize: 16, fontWeight: 500, letterSpacing: "-0.01em" }}>Kiln</span>
          </Link>
          <div data-hide-narrow style={{ display: "flex", gap: 26, fontSize: 14, whiteSpace: "nowrap" }}>
            <Link data-nav href="/" style={{ color: "var(--muted)" }}>
              Library
            </Link>
            <Link data-nav href="/collections" style={{ color: "var(--muted)" }}>
              Collections
            </Link>
            <span aria-current="page" style={{ color: "var(--ink)" }}>
              Account
            </span>
            <Link data-nav href="/pricing" style={{ color: "var(--muted)" }}>
              Pricing
            </Link>
          </div>
          <div style={{ flex: 1 }} />
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              border: "1px solid var(--hairline-3)",
              borderRadius: "var(--r-pill)",
              padding: "5px 14px 5px 5px",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 26,
                height: 26,
                borderRadius: "var(--r-pill)",
                /* Solid, not a gradient: the initial has to clear contrast against the
                   darkest part of the fill, and the system bans gradient surfaces anyway. */
                background: "var(--sage)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                color: "var(--sage-deep)",
                fontWeight: 500,
              }}
            >
              A
            </span>
            <span style={{ fontSize: 13, color: "var(--ink-3)" }}>alex@studio.co</span>
          </span>
        </nav>
      </header>

      <main>
        <section className="shell" style={{ paddingBlock: "64px 34px" }}>
          <div data-hero style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <span className="mono" style={{ fontSize: 11, letterSpacing: "0.16em", color: "var(--sage)" }}>
              Unlimited · renews 12 Sep 2026
            </span>
            <h1
              style={{
                fontSize: "clamp(30px, 3.8vw, 46px)",
                lineHeight: 1.08,
                fontWeight: 500,
                letterSpacing: "-0.035em",
              }}
            >
              Everything you&rsquo;ve pulled out of the kiln.
            </h1>
          </div>
        </section>

        <section
          className="shell"
          style={{
            paddingBottom: 20,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
            gap: 20,
          }}
        >
          {STATS.map((s) => (
            <div
              data-reveal
              key={s.label}
              style={{
                borderRadius: "var(--r-card)",
                border: "1px solid var(--hairline)",
                background: "#121210",
                padding: 22,
                display: "flex",
                flexDirection: "column",
                gap: 9,
              }}
            >
              <span className="mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--faint)" }}>
                {s.label}
              </span>
              <span style={{ fontWeight: 500, letterSpacing: "-0.03em", fontSize: s.big ? 34 : 26 }}>
                {s.value}
              </span>
              <span style={{ fontSize: 13, color: "var(--muted)" }}>{s.note}</span>
            </div>
          ))}
        </section>

        <div
          className="shell"
          style={{
            paddingBlock: 20,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(min(420px,100%),1fr))",
            gap: 24,
            alignItems: "start",
          }}
        >
          {/* --- Downloads --- */}
          <section
            data-reveal
            id="downloads"
            style={{ borderRadius: "var(--r-card)", border: "1px solid var(--hairline)", overflow: "hidden" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "18px 22px",
                background: "#121210",
                borderBottom: "1px solid #1A1917",
                flexWrap: "wrap",
              }}
            >
              <h2 style={{ fontSize: 17, fontWeight: 500 }}>Downloads</h2>
              <div style={{ flex: 1 }} />
              <div role="group" aria-label="Filter downloads" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {(["All", "Templates", "Scenes", "Prompts"] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    className="pill pill--muted"
                    aria-pressed={filter === f}
                    onClick={() => setFilter(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <ul>
              {list.map((d) => (
                <li
                  key={d.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "14px 22px",
                    borderBottom: "1px solid #171614",
                    flexWrap: "wrap",
                  }}
                >
                  <span aria-hidden="true" style={thumb(d.g)} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0, flex: 1 }}>
                    <span
                      style={{
                        fontSize: 15,
                        color: "var(--ink)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {d.name}
                    </span>
                    <span className="mono" style={{ fontSize: 10, letterSpacing: "0.1em", color: "var(--faint)" }}>
                      {d.meta}
                    </span>
                  </div>
                  <span className="mono" style={{ fontSize: 10, letterSpacing: "0.1em", color: "var(--faint)" }}>
                    {d.date}
                  </span>
                  <button
                    type="button"
                    className="btn btn--ghost"
                    style={{ fontSize: 13, padding: "7px 15px", color: "var(--ink-3)" }}
                  >
                    Download again
                  </button>
                </li>
              ))}
            </ul>

            <div style={{ padding: "16px 22px", display: "flex", justifyContent: "center" }}>
              <button
                type="button"
                className="mono"
                style={{
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  color: "var(--faint)",
                  background: "transparent",
                  border: 0,
                  cursor: "pointer",
                }}
              >
                Load older
              </button>
            </div>
          </section>

          {/* --- Rail --- */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <section
              data-reveal
              style={{
                borderRadius: "var(--r-card)",
                border: "1px solid var(--sage-line-2)",
                background:
                  "radial-gradient(120% 90% at 85% 0%,rgba(185,206,149,0.15),rgba(20,20,17,0) 62%),var(--surface)",
                padding: 26,
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <span className="mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--sage)" }}>
                Subscription
              </span>
              <div style={{ display: "flex", alignItems: "baseline", gap: 9 }}>
                <span style={{ fontSize: 34, fontWeight: 500, letterSpacing: "-0.03em" }}>Unlimited</span>
                <span style={{ fontSize: 15, color: "var(--muted)" }}>$24/mo</span>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--muted)" }}>
                Renews 12 Sep 2026 on Visa ···· 4417. Switch to annual and the next twelve months cost
                $240.
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 4 }}>
                <button type="button" className="btn btn--primary" style={{ fontSize: 13, padding: "11px 20px" }}>
                  Switch to annual
                </button>
                <button
                  type="button"
                  className="btn btn--ghost"
                  style={{ fontSize: 13, padding: "11px 20px", color: "var(--ink-3)" }}
                >
                  Manage billing
                </button>
              </div>
            </section>

            <section
              data-reveal
              style={{
                borderRadius: "var(--r-card)",
                border: "1px solid var(--hairline)",
                background: "#121210",
                padding: 24,
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <h2 style={{ fontSize: 16, fontWeight: 500 }}>Saved collections</h2>
              {SAVED.map((s) => (
                <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 13 }}>
                  <span aria-hidden="true" style={thumb(s.g)} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 14, color: "var(--ink)" }}>{s.name}</span>
                    <span className="mono" style={{ fontSize: 10, letterSpacing: "0.1em", color: "var(--faint)" }}>
                      {s.meta}
                    </span>
                  </div>
                  <Link data-nav href="/collections" style={{ fontSize: 13, color: "var(--muted)" }}>
                    Open
                  </Link>
                </div>
              ))}
            </section>

            <section
              data-reveal
              style={{
                borderRadius: "var(--r-card)",
                border: "1px solid var(--hairline)",
                background: "#121210",
                padding: 24,
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <h2 style={{ fontSize: 16, fontWeight: 500 }}>Invoices</h2>
              {INVOICES.map((i) => (
                <div
                  key={i.date}
                  className="mono"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 14,
                    fontSize: 11,
                    letterSpacing: "0.08em",
                    color: "var(--muted)",
                  }}
                >
                  <span>{i.date}</span>
                  <span style={{ color: "var(--ink-3)" }}>{i.amount}</span>
                  <button
                    type="button"
                    style={{
                      color: "var(--faint)",
                      background: "transparent",
                      border: 0,
                      cursor: "pointer",
                      font: "inherit",
                    }}
                  >
                    PDF
                  </button>
                </div>
              ))}
            </section>
          </div>
        </div>

        <section data-reveal className="shell" style={{ paddingBlock: "44px 80px" }}>
          <div
            style={{
              borderRadius: "var(--r-card)",
              border: "1px solid var(--hairline-3)",
              background: "linear-gradient(200deg,#1B1B18,#111110 60%)",
              padding: 30,
              display: "flex",
              alignItems: "center",
              gap: 30,
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, minWidth: 280 }}>
              <span style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em" }}>
                Drop 020 lands Thursday.
              </span>
              <span style={{ fontSize: 15, color: "var(--muted)" }}>
                Grain &amp; film — nine assets, three of them free.
              </span>
            </div>
            <label className="visually-hidden" htmlFor="notify-email">
              Email address
            </label>
            <input
              id="notify-email"
              type="email"
              placeholder="you@email.com"
              style={{
                border: "1px solid var(--line)",
                borderRadius: "var(--r-pill)",
                padding: "14px 20px",
                fontSize: 15,
                minWidth: 240,
                background: "transparent",
                color: "var(--ink)",
              }}
            />
            <button
              type="button"
              className="btn"
              style={{ borderColor: "#35332B", color: "var(--ink)", padding: "14px 26px", fontSize: 15 }}
            >
              Notify me
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
