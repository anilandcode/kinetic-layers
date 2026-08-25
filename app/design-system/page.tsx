import type { Metadata } from "next";
import AssetCard from "@/components/kiln/AssetCard";
import { getAssets } from "@/lib/sanity/queries";

/**
 * The design system, as a live page.
 *
 * The source sheet is a static document; this renders the same content from
 * the real tokens and the real components, so it goes out of date the moment
 * the system does rather than quietly drifting from it.
 */

export const metadata: Metadata = {
  title: "Design system v1",
  robots: { index: false, follow: false },
};

const DARK_SWATCHES = [
  ["Void", "--void", "#0F0F0D"],
  ["Surface", "--surface", "#141412"],
  ["Hairline / raised", "--line", "#2C2A24"],
  ["Muted ink", "--muted", "#94918A"],
  ["Ink — ivory", "--ink", "#F6F4EE"],
  ["Sage — accent", "--sage", "#B9CE95"],
  ["Olive — support", "--olive", "#5D6F2D"],
];

const LIGHT_SWATCHES = [
  ["Ivory — page", "#F6F4EE"],
  ["Card", "#EAE5D9"],
  ["Cream — highlight", "#F5FFDD"],
  ["Beige — divider fill", "#EDE7DF"],
  ["Muted ink", "#6A6A5F"],
  ["Ink", "#16180F"],
  ["Forest — accent", "#46602C"],
];

const RULES = [
  {
    k: "Grid",
    v: "12 columns, 1360 max, 24px gutters. Library is a 3-up masonry so tall scenes and wide pages both sit right. 8px spacing scale.",
  },
  {
    k: "Form",
    v: "14px radius on cards, 10px on buttons, 99px on pills. 1px hairlines only — no shadows on dark, one soft shadow allowed on light.",
  },
  {
    k: "Motion",
    v: "Previews loop muted and staggered so the grid never pulses in unison. 160ms border and colour transitions. No parallax, no scroll-jacking.",
  },
  {
    k: "Never",
    v: "Gradient backgrounds, glass blur panels, purple, emoji, stock 3D blobs. Those are the four tells of an AI template and they cost you the price premium.",
  },
];

function SectionHead({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 18,
        borderBottom: "1px solid var(--line)",
        paddingBottom: 14,
      }}
    >
      <span className="mono" style={{ fontSize: 12, color: "var(--sage)" }}>
        {n}
      </span>
      <h2 style={{ fontSize: 28, fontWeight: 400, letterSpacing: "-0.02em" }}>{children}</h2>
    </div>
  );
}

export default async function DesignSystem() {
  const assets = (await getAssets()).slice(0, 3);
  return (
    <main>
      <section className="shell" style={{ paddingBlock: "88px 40px", display: "flex", flexDirection: "column", gap: 26 }}>
        <p className="mono" style={{ fontSize: 12, letterSpacing: "0.18em", color: "var(--sage)" }}>
          Design system v1 — dual mode
        </p>
        <h1
          className="serif"
          style={{
            fontSize: "clamp(38px, 5vw, 66px)",
            lineHeight: 1.02,
            fontWeight: 400,
            letterSpacing: "-0.025em",
            maxWidth: 900,
            textWrap: "pretty",
          }}
        >
          Cinematic dark as the product. Warm light as the story.
        </h1>
        <p style={{ fontSize: 19, lineHeight: 1.65, color: "var(--muted)", maxWidth: 660 }}>
          A dark grid where previews do the talking. One family, two temperatures, so the library
          can be dark and the marketing pages can breathe.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
          <span className="pill" style={{ cursor: "default" }}>
            Dark = library, item pages, checkout
          </span>
          <span className="pill" style={{ cursor: "default" }}>
            Light = pricing, docs, onboarding
          </span>
        </div>
      </section>

      {/* --- Palette --- */}
      <section className="shell" style={{ paddingBlock: 56, display: "flex", flexDirection: "column", gap: 24 }}>
        <SectionHead n="01">Palette</SectionHead>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(420px,100%),1fr))", gap: 24 }}>
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--line)",
              borderRadius: "var(--r-lg)",
              padding: 28,
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span className="mono" style={{ fontSize: 11, letterSpacing: "0.16em", color: "var(--sage)" }}>
                Dark — default
              </span>
              <span className="mono" style={{ fontSize: 11, color: "var(--faint)", textTransform: "none" }}>
                the vault
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {DARK_SWATCHES.map(([name, token, hex]) => (
                <div
                  key={name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    background: "var(--raised)",
                    border: "1px solid var(--line)",
                    borderRadius: 10,
                    padding: 16,
                  }}
                >
                  <span
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 8,
                      background: `var(${token})`,
                      border: "1px solid var(--line-bright)",
                    }}
                  />
                  <span style={{ fontSize: 14, flex: 1 }}>{name}</span>
                  <span className="mono" style={{ fontSize: 11, color: "var(--faint)", textTransform: "none" }}>
                    {hex}
                  </span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--muted)" }}>
              Sage is the only saturated colour on screen. It marks unlocks, the primary action, and
              the active filter. Olive fills badges and progress. Everything else is warm neutral.
            </p>
          </div>

          <div
            className="kiln-light"
            style={{
              border: "1px solid #DCD6C7",
              borderRadius: "var(--r-lg)",
              padding: 28,
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span className="mono" style={{ fontSize: 11, letterSpacing: "0.16em", color: "var(--sage)" }}>
                Light — marketing
              </span>
              <span className="mono" style={{ fontSize: 11, color: "var(--faint)", textTransform: "none" }}>
                the storefront
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {LIGHT_SWATCHES.map(([name, hex]) => (
                <div
                  key={name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    background: "#FFFFFF",
                    border: "1px solid #DCD6C7",
                    borderRadius: 10,
                    padding: 16,
                  }}
                >
                  <span style={{ width: 34, height: 34, borderRadius: 8, background: hex, border: "1px solid #D3CCBB" }} />
                  <span style={{ fontSize: 14, flex: 1 }}>{name}</span>
                  <span className="mono" style={{ fontSize: 11, color: "var(--faint)", textTransform: "none" }}>
                    {hex}
                  </span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--muted)" }}>
              Light mode flips the hierarchy: forest green carries the accent because sage
              disappears on ivory.
            </p>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 16,
            alignItems: "flex-start",
            padding: "22px 24px",
            border: "1px solid rgba(185,206,149,0.30)",
            borderRadius: 14,
            background: "#14160D",
          }}
        >
          <span className="mono" style={{ fontSize: 11, letterSpacing: "0.14em", color: "var(--sage)", whiteSpace: "nowrap" }}>
            Rule
          </span>
          <span style={{ fontSize: 16, lineHeight: 1.6, color: "var(--ink-3)" }}>
            The two modes share the same hue family, so an asset preview shot on dark still sits
            correctly on a light page. Never mix them on one screen — no light card floating in the
            dark grid.
          </span>
        </div>
      </section>

      {/* --- Type --- */}
      <section className="shell" style={{ paddingBlock: 56, display: "flex", flexDirection: "column", gap: 24 }}>
        <SectionHead n="02">Type</SectionHead>
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: "var(--r-lg)",
            padding: 32,
            display: "flex",
            flexDirection: "column",
            gap: 28,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div className="serif" style={{ fontSize: 46, lineHeight: 1.05, letterSpacing: "-0.02em" }}>
              Real work.
              <br />
              Not slop.
            </div>
            <p className="mono" style={{ fontSize: 11, color: "var(--faint)", textTransform: "none" }}>
              Source Serif 4 · 400 · editorial display · 40–72px
            </p>
          </div>
          <div style={{ height: 1, background: "var(--line)" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 26, fontWeight: 400, letterSpacing: "-0.02em" }}>Sora — interface</div>
            <p style={{ fontSize: 16, lineHeight: 1.65, color: "var(--ink-3)" }}>
              Every label, card title, paragraph and button. 300 for body at 1.65 line height; 400
              for titles; 500 only on buttons.
            </p>
          </div>
          <div style={{ height: 1, background: "var(--line)" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div className="mono" style={{ fontSize: 13, letterSpacing: "0.16em", color: "var(--sage)" }}>
              Geist Mono — metadata
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--muted)" }}>
              Mono is the tell that this is a technical product. Keep it small and uppercase; never
              set a sentence in it.
            </p>
          </div>
        </div>
      </section>

      {/* --- Components --- */}
      <section className="shell" style={{ paddingBlock: 56, display: "flex", flexDirection: "column", gap: 24 }}>
        <SectionHead n="03">Components</SectionHead>

        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: "var(--r-lg)",
            padding: 32,
            display: "flex",
            flexDirection: "column",
            gap: 26,
          }}
        >
          <span className="mono" style={{ fontSize: 11, letterSpacing: "0.16em", color: "var(--sage)" }}>
            Asset card — the atom of the whole product
          </span>
          <div className="kiln-grid">
            {assets.map((a) => (
              <AssetCard key={a.slug} asset={a} height={170} />
            ))}
          </div>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--muted)", maxWidth: 720 }}>
            Preview edge to edge, access badge beside the title, type and stack in chips at the
            foot. Hover lifts the border and scales the preview in 160ms. No descriptions, no
            avatars, no buttons on the card.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(330px,100%),1fr))", gap: 24 }}>
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--line)",
              borderRadius: "var(--r-lg)",
              padding: 32,
              display: "flex",
              flexDirection: "column",
              gap: 22,
            }}
          >
            <span className="mono" style={{ fontSize: 11, letterSpacing: "0.16em", color: "var(--sage)" }}>
              Dark controls
            </span>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <span className="btn btn--primary">Unlock everything</span>
              <span className="btn btn--ghost">Preview</span>
              <span style={{ color: "var(--sage)", fontSize: 14, fontWeight: 500 }}>Copy prompt →</span>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span className="pill is-on">All</span>
              <span className="pill">Build</span>
              <span className="pill">Motion</span>
              <span className="pill">Craft</span>
            </div>
          </div>

          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--line)",
              borderRadius: "var(--r-lg)",
              padding: 32,
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            <span className="mono" style={{ fontSize: 11, letterSpacing: "0.16em", color: "var(--sage)" }}>
              The gate
            </span>
            <div
              className="mono"
              style={{
                border: "1px solid var(--line)",
                borderRadius: 12,
                padding: 20,
                background: "var(--void)",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                fontSize: 12,
                lineHeight: 1.7,
                color: "var(--ink-3)",
                textTransform: "none",
                letterSpacing: 0,
              }}
            >
              <span>Create a cinematic hero section with a slow</span>
              <span>volumetric fog pass, camera easing on scroll,</span>
              <span style={{ filter: "blur(4px)", color: "var(--faint)" }}>
                and a grain overlay at 6% opacity layered
              </span>
              <span style={{ filter: "blur(5px)", color: "var(--faint)" }}>
                beneath the type. Use a single warm key light
              </span>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 8,
                  paddingTop: 14,
                  borderTop: "1px solid var(--line)",
                }}
              >
                <span style={{ color: "var(--faint)", fontSize: 10, letterSpacing: "0.1em" }}>
                  847 characters hidden
                </span>
                <span className="btn btn--primary" style={{ padding: "8px 14px", fontSize: 13 }}>
                  Unlock
                </span>
              </div>
            </div>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--muted)" }}>
              Two real lines, then progressive blur — never a flat overlay. The character count
              proves there&rsquo;s something worth paying for.
            </p>
          </div>
        </div>
      </section>

      {/* --- Rules --- */}
      <section className="shell" style={{ paddingBlock: "56px 120px", display: "flex", flexDirection: "column", gap: 24 }}>
        <SectionHead n="04">Rules</SectionHead>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(250px,100%),1fr))", gap: 16 }}>
          {RULES.map((r) => (
            <div
              key={r.k}
              style={{
                border: "1px solid var(--line)",
                borderRadius: 14,
                padding: 24,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <span className="mono" style={{ fontSize: 11, letterSpacing: "0.14em", color: "var(--faint)" }}>
                {r.k}
              </span>
              <span style={{ fontSize: 15, lineHeight: 1.6, color: "var(--ink-3)" }}>{r.v}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
