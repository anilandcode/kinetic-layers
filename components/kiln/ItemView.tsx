"use client";

import Link from "next/link";
import { useState } from "react";
import { Footer, Nav } from "./Chrome";
import AssetCard from "./AssetCard";
import { ASSETS, VAULT, type Asset } from "@/lib/kiln/data";

/**
 * Item page.
 *
 * A gallery of shots on the left with a sticky buy rail on the right.
 * `owned` is local state standing in for entitlement — the design toggles it
 * to show both faces of the CTA, and there is no auth behind it yet.
 */

const SHOTS = [
  { label: "Hero — default palette", g: "linear-gradient(150deg,#1D2410,#0F0F0D 66%)" },
  { label: "Cold palette", g: "linear-gradient(150deg,#141C24,#0F0F0D 64%)" },
  { label: "Depth pass", g: "linear-gradient(150deg,#1E1E24,#0F0F0D 62%)" },
  { label: "Dust layer only", g: "linear-gradient(150deg,#241F16,#0F0F0D 62%)" },
];

const FILES = [
  { name: "drift-scene.js", meta: "THREE.JS MODULE · 42 KB", tag: "Code" },
  { name: "DriftScene.tsx", meta: "R3F COMPONENT · 11 KB", tag: "Code" },
  { name: "drift.blend", meta: "SOURCE FILE · 61 MB", tag: "Source" },
  { name: "dust-maps/ (6)", meta: "EXR · 18 MB", tag: "Assets" },
  { name: "palette.config.json", meta: "4 PARAMETERS · 2 KB", tag: "Config" },
  { name: "dust-prompts.md", meta: "2 PROMPTS · FLUX", tag: "Prompts" },
];

export default function ItemView({ asset }: { asset: Asset }) {
  const [shot, setShot] = useState(0);
  const [owned, setOwned] = useState(false);

  const specs = [
    { k: "Type", v: asset.type },
    { k: "Shelf", v: asset.shelf },
    { k: "Stack", v: asset.stack },
    { k: "Drop", v: `${VAULT.drop} — 20 Aug 2026` },
    { k: "Size", v: "84 MB total" },
    { k: "Performance", v: "60fps · 4% CPU idle" },
    { k: "Shipped on", v: "1 client landing page" },
  ];

  const related = ASSETS.filter((a) => a.slug !== asset.slug).slice(0, 4);

  return (
    <>
      <a className="skip-link" href="#shot">
        Skip to the preview
      </a>
      <Nav />

      <main>
        <nav
          className="shell mono"
          aria-label="Breadcrumb"
          style={{
            paddingBlock: "26px 0",
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 10,
            color: "var(--faint)",
          }}
        >
          <Link data-nav href="/" style={{ color: "var(--faint)" }}>
            Library
          </Link>
          <span aria-hidden="true">/</span>
          <span>{asset.shelf}</span>
          <span aria-hidden="true">/</span>
          <span style={{ color: "var(--muted)" }}>{asset.name}</span>
        </nav>

        <div
          className="shell"
          style={{
            paddingBlock: "24px 20px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(min(420px,100%),1fr))",
            gap: 34,
            alignItems: "start",
          }}
        >
          {/* --- Gallery + prose --- */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
            <div data-hero style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div
                id="shot"
                style={{
                  height: 520,
                  borderRadius: "var(--r-card)",
                  overflow: "hidden",
                  background: SHOTS[shot].g,
                  position: "relative",
                }}
              >
                <span
                  className="mono"
                  style={{
                    position: "absolute",
                    left: 16,
                    top: 16,
                    fontSize: 10,
                    letterSpacing: "0.14em",
                    color: "var(--sage-ink)",
                    background: "rgba(11,11,10,0.5)",
                    backdropFilter: "blur(6px)",
                    border: "1px solid rgba(232,240,216,0.18)",
                    borderRadius: "var(--r-pill)",
                    padding: "7px 14px",
                  }}
                >
                  {SHOTS[shot].label}
                </span>
              </div>

              <div role="group" aria-label="Preview shots" style={{ display: "flex", gap: 10 }}>
                {SHOTS.map((s, i) => (
                  <button
                    key={s.label}
                    type="button"
                    aria-label={s.label}
                    aria-pressed={i === shot}
                    onClick={() => setShot(i)}
                    style={{
                      flex: 1,
                      height: 74,
                      borderRadius: "var(--r-inner)",
                      cursor: "pointer",
                      background: s.g,
                      border: 0,
                      outline: `1px solid ${i === shot ? "rgba(185,206,149,0.55)" : "transparent"}`,
                      outlineOffset: 2,
                      transition: "outline-color var(--t-mid) var(--ease)",
                    }}
                  />
                ))}
              </div>
            </div>

            <section data-reveal style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 22 }}>
              <h2 style={{ fontSize: 26, fontWeight: 500, letterSpacing: "-0.02em" }}>What this is</h2>
              <p style={{ fontSize: 16, lineHeight: 1.7, color: "var(--muted)", maxWidth: 640 }}>
                A volumetric fog scene for hero sections: three light shafts, a depth pass and a dust
                layer, all driven by four parameters you can tune from a single config. Built for a
                fintech landing page in July, then simplified until it ran at 60fps on a four-year-old
                laptop.
              </p>
              <p style={{ fontSize: 16, lineHeight: 1.7, color: "var(--muted)", maxWidth: 640 }}>
                The scene ships as a Three.js module and an R3F component, plus the source blend file
                and the two prompts used to generate the dust maps. Swap the palette in one place and
                it reads warm, cold or neutral without re-baking anything.
              </p>
            </section>

            <section
              data-reveal
              aria-label="Files included"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
                gap: 12,
                paddingTop: 14,
              }}
            >
              {FILES.map((f) => (
                <div
                  key={f.name}
                  style={{
                    borderRadius: "var(--r-card)",
                    border: "1px solid var(--hairline)",
                    background: "#121210",
                    padding: "18px 20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 5, minWidth: 0 }}>
                    <span
                      style={{
                        fontSize: 15,
                        color: "var(--ink)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {f.name}
                    </span>
                    <span className="mono" style={{ fontSize: 10, letterSpacing: "0.1em", color: "var(--faint)" }}>
                      {f.meta}
                    </span>
                  </div>
                  <span
                    className="mono"
                    style={{
                      fontSize: 10,
                      letterSpacing: "0.1em",
                      color: "var(--muted)",
                      border: "1px solid var(--hairline-3)",
                      borderRadius: "var(--r-pill)",
                      padding: "5px 11px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {f.tag}
                  </span>
                </div>
              ))}
            </section>
          </div>

          {/* --- Buy rail --- */}
          <div style={{ position: "sticky", top: 96, display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 11, flexWrap: "wrap" }}>
                <h1 style={{ fontSize: 38, fontWeight: 500, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
                  {asset.name}
                </h1>
                <span className={asset.free ? "chip chip--sage" : "chip"} style={{ padding: "5px 13px" }}>
                  {asset.free ? "Free" : "Unlimited"}
                </span>
              </div>
              <p style={{ fontSize: 16, lineHeight: 1.65, color: "var(--muted)" }}>
                Fog, light shafts and depth for hero sections that need to feel expensive. Runs at
                60fps, tunes from one config.
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[asset.type, asset.stack, asset.shelf, asset.mood].map((t) => (
                  <span className="chip" key={t}>
                    {t.toLowerCase()}
                  </span>
                ))}
              </div>
            </div>

            <div
              style={{
                borderRadius: "var(--r-card)",
                border: "1px solid var(--sage-line-2)",
                background:
                  "radial-gradient(120% 90% at 85% 0%,rgba(185,206,149,0.15),rgba(20,20,17,0) 62%),var(--surface)",
                padding: 24,
                display: "flex",
                flexDirection: "column",
                gap: 13,
              }}
            >
              <span className="mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--sage)" }}>
                Included with unlimited
              </span>
              <span style={{ fontSize: 15, lineHeight: 1.6, color: "var(--ink-2)" }}>
                Download the scene, both integrations and every source file. ${VAULT.monthly} a month
                for all {VAULT.total} assets.
              </span>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => setOwned(!owned)}
                style={{ fontSize: 15, padding: "15px 22px" }}
              >
                {owned ? "Download — 84 MB" : "Get unlimited"}
              </button>
              <button type="button" className="btn btn--quiet" onClick={() => setOwned(!owned)}>
                {owned ? "Open the changelog" : "Save for later"}
              </button>
              <span
                className="mono"
                style={{ fontSize: 10, letterSpacing: "0.1em", color: "var(--faint)", textAlign: "center" }}
              >
                {owned ? "Last pulled 22 Aug 2026" : "Cancel anytime · keep your downloads"}
              </span>
            </div>

            <dl
              style={{
                borderRadius: "var(--r-card)",
                border: "1px solid var(--hairline)",
                background: "#121210",
                overflow: "hidden",
              }}
            >
              {specs.map((s) => (
                <div
                  key={s.k}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                    padding: "14px 20px",
                    borderBottom: "1px solid #1A1917",
                  }}
                >
                  <dt className="mono" style={{ fontSize: 10, letterSpacing: "0.12em", color: "var(--faint)" }}>
                    {s.k}
                  </dt>
                  <dd style={{ fontSize: 14, color: "var(--ink-3)", textAlign: "right" }}>{s.v}</dd>
                </div>
              ))}
            </dl>

            <div
              style={{
                borderRadius: "var(--r-card)",
                border: "1px solid var(--hairline)",
                background: "#121210",
                padding: 22,
                display: "flex",
                flexDirection: "column",
                gap: 11,
              }}
            >
              <span className="mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: "var(--faint)" }}>
                License
              </span>
              <span style={{ fontSize: 14, lineHeight: 1.6, color: "var(--muted)" }}>
                Use it in unlimited personal and client projects. Don&rsquo;t resell the file or
                republish it to another marketplace.
              </span>
              <Link href="/pricing" style={{ fontSize: 14, color: "var(--sage-ink)" }}>
                Read the full license →
              </Link>
            </div>
          </div>
        </div>

        {/* --- Related --- */}
        <section data-reveal className="shell" style={{ paddingBlock: "64px 90px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              paddingBottom: 20,
              gap: 20,
            }}
          >
            <h2 style={{ fontSize: 26, fontWeight: 500, letterSpacing: "-0.02em" }}>
              From the same drop
            </h2>
            <Link data-nav href="/collections" className="mono" style={{ fontSize: 10 }}>
              See the collection
            </Link>
          </div>
          <div className="kiln-grid">
            {related.map((r) => (
              <AssetCard key={r.slug} asset={r} height={190} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
