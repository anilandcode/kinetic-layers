"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Footer, Nav } from "@/components/kiln/Chrome";
import { SHELVES, type Shelf } from "@/lib/kiln/data";

/** A collection is one brief solved end to end. */
const SETS = [
  {
    name: "Editorial Suite",
    shelf: "Build" as Shelf,
    items: 24,
    free: 3,
    blurb:
      "A full magazine-style landing system: type scale, section templates and the prompts that wrote the copy.",
    tags: ["templates", "prompts", "next.js"],
    h: 230,
    g: "linear-gradient(150deg,#242014,#0F0F0D 62%)",
  },
  {
    name: "Volumetric Set",
    shelf: "Motion" as Shelf,
    items: 18,
    free: 2,
    blurb: "Fog, light shafts and depth passes for hero sections that need to feel expensive.",
    tags: ["3d scenes", "webgl", "three.js"],
    h: 260,
    g: "linear-gradient(150deg,#1D2410,#0F0F0D 62%)",
  },
  {
    name: "Agent Bench",
    shelf: "Build" as Shelf,
    items: 15,
    free: 4,
    blurb: "Research, review and refactor chains that survived a real client deadline.",
    tags: ["agents", "mcp", "claude"],
    h: 200,
    g: "linear-gradient(150deg,#141C24,#0F0F0D 62%)",
  },
  {
    name: "Grain & Film",
    shelf: "Craft" as Shelf,
    items: 21,
    free: 1,
    blurb: "Paper, halide and dust LoRAs with the reference sheets they were trained on.",
    tags: ["loras", "flux", "image packs"],
    h: 250,
    g: "linear-gradient(150deg,#2A1C12,#0F0F0D 60%)",
  },
  {
    name: "Brutal Grid",
    shelf: "Build" as Shelf,
    items: 12,
    free: 2,
    blurb: "Hard-edged layout kits, oversized type and the rules that keep them readable.",
    tags: ["templates", "astro", "css"],
    h: 210,
    g: "linear-gradient(150deg,#26221A,#0F0F0D 60%)",
  },
  {
    name: "Slow Motion",
    shelf: "Motion" as Shelf,
    items: 16,
    free: 0,
    blurb: "Loops, pans and background fields that run under 4% CPU on a laptop.",
    tags: ["backgrounds", "video", "webgl"],
    h: 240,
    g: "linear-gradient(150deg,#161D18,#0F0F0D 60%)",
  },
  {
    name: "Studio Light",
    shelf: "Craft" as Shelf,
    items: 19,
    free: 2,
    blurb: "Product lighting setups as prompts, plus the retouch passes that finish them.",
    tags: ["image packs", "prompts", "midjourney"],
    h: 220,
    g: "linear-gradient(150deg,#2A2318,#0F0F0D 58%)",
  },
];

export default function Collections() {
  const [tab, setTab] = useState<"All" | Shelf>("All");
  const list = useMemo(() => SETS.filter((s) => tab === "All" || s.shelf === tab), [tab]);

  return (
    <>
      <a className="skip-link" href="#sets">
        Skip to the collections
      </a>
      <Nav />

      <main>
        <section className="shell" style={{ paddingBlock: "80px 44px" }}>
          <div data-hero style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 660 }}>
            <span className="mono" style={{ fontSize: 11, letterSpacing: "0.16em", color: "var(--sage)" }}>
              18 collections
            </span>
            <h1
              style={{
                fontSize: "clamp(34px, 4.4vw, 56px)",
                lineHeight: 1.06,
                fontWeight: 500,
                letterSpacing: "-0.035em",
                textWrap: "pretty",
              }}
            >
              Assets that were built to sit together.
            </h1>
            <p style={{ fontSize: 17, lineHeight: 1.65, color: "var(--muted)", maxWidth: 520 }}>
              A collection is one brief solved end to end — the prompts, the template, the scene and
              the source files that shipped with it.
            </p>
          </div>
        </section>

        <div
          data-morph
          data-bg="rgba(15,15,13,0.94)"
          data-bg-compact="rgba(13,13,11,0.97)"
          style={{
            position: "sticky",
            top: 66,
            zIndex: 15,
            background: "rgba(15,15,13,0.94)",
            backdropFilter: "blur(12px)",
            borderTop: "1px solid var(--hairline)",
            borderBottom: "1px solid var(--hairline)",
          }}
        >
          <div
            className="shell"
            style={{ paddingBlock: 14, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}
          >
            <div role="group" aria-label="Shelf" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {SHELVES.map((t) => (
                <button
                  key={t}
                  type="button"
                  className="pill pill--muted"
                  aria-pressed={tab === t}
                  onClick={() => setTab(t)}
                >
                  {t}
                </button>
              ))}
            </div>
            <div style={{ flex: 1 }} />
            <span className="mono" aria-live="polite" style={{ fontSize: 10, color: "var(--faint)" }}>
              {list.length} of {SETS.length}
            </span>
          </div>
        </div>

        <section
          id="sets"
          className="shell"
          style={{
            paddingBlock: "36px 90px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(min(400px,100%),1fr))",
            gap: 26,
          }}
        >
          {list.map((s) => (
            <Link
              data-nav
              data-card
              data-reveal
              key={s.name}
              href="/item/volumetric-drift"
              className="kiln-card"
              aria-label={`${s.name} — ${s.items} items`}
            >
              <div style={{ height: s.h, borderRadius: "var(--r-inner)", overflow: "hidden" }}>
                <div data-preview-inner style={{ width: "100%", height: "100%", background: s.g }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "16px 4px 0" }}>
                <span style={{ fontSize: 19, fontWeight: 500, letterSpacing: "-0.015em", color: "var(--ink)" }}>
                  {s.name}
                </span>
                <span className={s.free > 0 ? "chip chip--sage" : "chip"} style={{ padding: "5px 13px" }}>
                  {s.free > 0 ? `${s.free} free` : "Unlimited"}
                </span>
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--muted)", margin: "9px 4px 0", maxWidth: 420 }}>
                {s.blurb}
              </p>
              <div data-meta style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: "12px 4px 2px" }}>
                {s.tags.map((t) => (
                  <span className="chip" key={t}>
                    {t}
                  </span>
                ))}
              </div>
            </Link>
          ))}

          <div data-reveal className="kiln-promo kiln-promo--hire" style={{ minHeight: 280 }}>
            <span className="mono" style={{ fontSize: 11, letterSpacing: "0.16em", color: "var(--sage)" }}>
              Hire the studio
            </span>
            <h2
              style={{
                fontSize: 26,
                fontWeight: 500,
                letterSpacing: "-0.02em",
                lineHeight: 1.24,
                textWrap: "pretty",
              }}
            >
              Want a collection built only for you?
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--muted)" }}>
              Commissioned work never enters the vault.
            </p>
            <Link href="/join" style={{ fontSize: 16, color: "var(--sage-ink)", marginTop: 4 }}>
              Start a project →
            </Link>
          </div>
        </section>

        <section data-reveal style={{ borderTop: "1px solid var(--hairline)" }}>
          <div
            className="shell"
            style={{
              paddingBlock: 80,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 22,
              textAlign: "center",
            }}
          >
            <h2
              style={{
                fontSize: "clamp(30px, 3.5vw, 42px)",
                lineHeight: 1.12,
                fontWeight: 500,
                letterSpacing: "-0.03em",
                maxWidth: 620,
                textWrap: "pretty",
              }}
            >
              Every collection is included in unlimited.
            </h2>
            <div style={{ display: "flex", gap: 12, marginTop: 6, flexWrap: "wrap", justifyContent: "center" }}>
              <Link data-nav href="/pricing" className="btn btn--primary">
                Get unlimited
              </Link>
              <Link data-nav href="/" className="btn btn--ghost">
                Browse everything
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
