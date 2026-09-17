import type { Metadata } from "next";
import PageShell from "@/components/kl/PageShell";
import GlassButton from "@/components/kl/GlassButton";
import { GROUNDS } from "@/lib/kl/ground";
import { LIMITS } from "@/lib/kl/limits";

/**
 * The design system, as a live page.
 *
 * Every swatch paints itself with `var(--token)` rather than a hex string.
 * The version this replaces listed the values by hand — "Surface, --surface,
 * #141412" — which meant the page could disagree with the stylesheet and look
 * authoritative while doing it. Nothing here can drift: change a token and
 * this page changes with it, in whichever theme you are viewing.
 *
 * The same reason the catalogue counts are counted rather than stored.
 */

export const metadata: Metadata = {
  title: "Design system",
  description: "The Kinetic Layers palette, type and components, rendered from the real tokens.",
  robots: { index: false, follow: false },
};

const PALETTE: Array<[string, string, string]> = [
  ["Ground", "--ground", "The page. Warm white in light, near-black in dark."],
  ["Card", "--card", "A raised surface."],
  ["Inset", "--inset", "A recessed one — fields, mock panels."],
  ["Line", "--line", "The standard hairline."],
  ["Line 2", "--line2", "Inside a card."],
  ["Line 3", "--line3", "The faintest, for chips."],
  ["Ink", "--ink", "Headings and anything that must be read first."],
  ["Body", "--body", "Running text."],
  ["Muted", "--muted", "Labels and secondary text."],
  ["Amber", "--amber", "The one lamp. Text-safe; the glow uses #737371 raw."],
  ["Amber bg", "--amber-bg", "Behind a Premium chip."],
  ["Amber line", "--amber-line", "The border that goes with it."],
  ["Moss", "--moss", "Status, never a call to action."],
  ["Moss bg", "--moss-bg", "Behind a status note."],
  ["Dot", "--dot", "The lattice in the closing panel."],
];

const TYPE: Array<[string, string, string]> = [
  ["Figtree 600", "var(--kl-sans)", "Headlines. -0.05em at display sizes."],
  ["Figtree 300", "var(--kl-sans)", "Body. The default weight for the whole page."],
  ["Cormorant italic", "var(--kl-serif)", "One pull line per screen, and no more than one."],
  ["Geist Mono", "var(--font-mono)", "Labels, counts, tags. Always uppercase, 0.12em tracked."],
];

/* Read from the motion layer's own vocabulary, so a hook that is renamed
   there stops being documented here. */
const MOTION: Array<[string, string]> = [
  ["data-reveal", "Section rises as it enters. gsap.from, so no CSS hides it first."],
  ["data-mask", "Headline rises word by word out of a clip. Plain text only — it rebuilds the node."],
  ["data-letters", "Label reveals letter by letter."],
  ["data-lamp", "The amber bloom. Breathes, and leans toward the pointer."],
  ["data-glass-btn", "Magnetic pull, cursor glow, shine sweep. The number is the pull in px."],
  ["data-premium", "Marks the one lit button; adds the idle sweep."],
  ["data-glow2", "Card bloom and conic rim, both tracking the pointer."],
  ["data-layer-deck", "The signature: layers fan apart on scroll."],
  ["data-parallax", "Backdrop drifts against the scroll."],
  ["data-marquee", "Rail scrolls, slowing under the cursor."],
  ["data-dotfield", "Dot lattice that bends around the pointer."],
];

function Swatch({ name, token, note }: { name: string; token: string; note: string }) {
  return (
    <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
      <span
        aria-hidden="true"
        style={{
          width: 52,
          height: 52,
          borderRadius: 12,
          flexShrink: 0,
          background: `var(${token})`,
          border: "1px solid var(--line)",
          boxShadow: "var(--shadow)",
        }}
      />
      <span style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
        <span style={{ fontSize: 15, color: "var(--ink)" }}>{name}</span>
        <code className="kl-code">{token}</code>
        <span style={{ fontSize: 13, lineHeight: 1.5, color: "var(--muted)" }}>{note}</span>
      </span>
    </div>
  );
}

export default function DesignSystem() {
  return (
    <PageShell>
      <div className="kl-pad" style={{ paddingBlock: "64px 30px" }}>
        <div className="kl-prose" data-hero>
          <span className="kl-kicker">DESIGN SYSTEM</span>
          <h1 className="kl-prose-h1">Every value on this page paints itself.</h1>
          <p className="kl-prose-lead">
            Nothing here is a hex string typed out beside a token name. Each swatch is filled with
            the token it names, so this page cannot claim a colour the stylesheet does not have —
            and it follows the theme toggle like everything else.
          </p>
        </div>
      </div>

      {/* ---------- Palette ---------- */}
      <section className="kl-pad" style={{ paddingBlock: "20px 40px" }}>
        <div className="kl-rule-row" style={{ marginTop: 0 }}>
          <span className="kl-rule-label">PALETTE — {PALETTE.length} TOKENS</span>
          <span className="kl-rule" data-rule aria-hidden="true" />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(min(300px,100%),1fr))",
            gap: 22,
            marginTop: 26,
          }}
        >
          {PALETTE.map(([name, token, note]) => (
            <Swatch key={token} name={name} token={token} note={note} />
          ))}
        </div>
      </section>

      {/* ---------- Thumbnail grounds ---------- */}
      <section className="kl-pad" style={{ paddingBlock: "20px 40px" }}>
        <div className="kl-rule-row" style={{ marginTop: 0 }}>
          <span className="kl-rule-label">THUMBNAIL GROUNDS</span>
          <span className="kl-rule" data-rule aria-hidden="true" />
        </div>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--muted)", maxWidth: "62ch", marginTop: 18 }}>
          Six gradients, chosen per asset by a hash of its slug. Position in a list would have been
          simpler and was wrong twice: it cost a catalogue fetch per page, and it changed with every
          filter, so a card and its item page disagreed.
        </p>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 20 }}>
          {GROUNDS.map((g) => (
            <span key={g} style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <span
                aria-hidden="true"
                style={{
                  width: 132,
                  height: 84,
                  borderRadius: 12,
                  background: `var(${g})`,
                  border: "1px solid var(--line)",
                }}
              />
              <code className="kl-code">{g}</code>
            </span>
          ))}
        </div>
      </section>

      {/* ---------- Type ---------- */}
      <section className="kl-pad" style={{ paddingBlock: "20px 40px" }}>
        <div className="kl-rule-row" style={{ marginTop: 0 }}>
          <span className="kl-rule-label">TYPE</span>
          <span className="kl-rule" data-rule aria-hidden="true" />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 26, marginTop: 26 }}>
          {TYPE.map(([name, family, note]) => (
            <div key={name} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span
                style={{
                  fontFamily: family,
                  fontSize: 30,
                  fontStyle: name.includes("italic") ? "italic" : "normal",
                  fontWeight: name.includes("600") ? 600 : 300,
                  letterSpacing: name.includes("600") ? "-0.04em" : "0",
                  color: "var(--ink)",
                }}
              >
                Two hundred and forty things worth stealing.
              </span>
              <span style={{ fontSize: 13, color: "var(--muted)" }}>
                <strong style={{ color: "var(--body)", fontWeight: 500 }}>{name}</strong> — {note}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Buttons ---------- */}
      <section className="kl-pad" style={{ paddingBlock: "20px 40px" }}>
        <div className="kl-rule-row" style={{ marginTop: 0 }}>
          <span className="kl-rule-label">BUTTONS</span>
          <span className="kl-rule" data-rule aria-hidden="true" />
        </div>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--muted)", maxWidth: "62ch", marginTop: 18 }}>
          Primary buttons are glass — translucent, blurred, with an inset highlight. Never solid
          amber. The Premium variant is the single lit control on a screen: it is the only one that
          sweeps its shine on a timer, and there should never be two on one page.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 22, alignItems: "center" }}>
          <GlassButton href="/design-system" premium pull={7}>
            Premium — the lit one
          </GlassButton>
          <GlassButton href="/design-system" pull={5}>
            Glass — the default
          </GlassButton>
          <GlassButton href="/design-system" ghost>
            Ghost — the quiet one
          </GlassButton>
        </div>
      </section>

      {/* ---------- Allowances ---------- */}
      <section className="kl-pad" style={{ paddingBlock: "20px 40px" }}>
        <div className="kl-rule-row" style={{ marginTop: 0 }}>
          <span className="kl-rule-label">ALLOWANCES</span>
          <span className="kl-rule" data-rule aria-hidden="true" />
        </div>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--muted)", maxWidth: "62ch", marginTop: 18 }}>
          Read from <code className="kl-code">LIMITS</code>, the same object the routes enforce and
          the pricing page promises. The number shown and the number hit are one variable.
        </p>
        <div className="kl-table" style={{ marginTop: 20, maxWidth: 620 }}>
          <div className="kl-tr kl-tr--head">
            <span>TIER</span>
            <span>PROMPTS / DAY</span>
            <span>DOWNLOADS / DAY</span>
          </div>
          {(Object.keys(LIMITS) as Array<keyof typeof LIMITS>).map((tier) => (
            <div key={tier} className="kl-tr kl-tr--body">
              <span>{tier}</span>
              <span>{LIMITS[tier].prompt}</span>
              <span>{LIMITS[tier].download}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Motion ---------- */}
      <section className="kl-pad" style={{ paddingBlock: "20px 90px" }}>
        <div className="kl-rule-row" style={{ marginTop: 0 }}>
          <span className="kl-rule-label">MOTION — {MOTION.length} HOOKS</span>
          <span className="kl-rule" data-rule aria-hidden="true" />
        </div>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--muted)", maxWidth: "62ch", marginTop: 18 }}>
          Attributes, not classes, so markup carries its own behaviour. Every entrance is a
          <code className="kl-code">gsap.from</code>, which means the start state is written by
          JavaScript and a page whose motion layer never runs is still complete. Nothing here may be
          paired with CSS that hides content — that pattern once made the sign-in form permanently
          invisible. The whole layer is skipped under <code className="kl-code">prefers-reduced-motion</code>.
        </p>
        <dl className="kl-terms" style={{ marginTop: 8, maxWidth: "72ch" }}>
          {MOTION.map(([hook, what]) => (
            <div key={hook}>
              <dt>
                <code className="kl-code">{hook}</code>
              </dt>
              <dd>{what}</dd>
            </div>
          ))}
        </dl>
      </section>
    </PageShell>
  );
}
