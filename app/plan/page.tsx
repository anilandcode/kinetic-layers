import type { Metadata } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import styles from "./plan.module.css";

/**
 * The plan.
 *
 * This is the strategy document that produced the rest of the site, not a
 * product page — so it keeps its own palette and its own type pairing
 * (Instrument Serif over Inter) rather than the Kiln tokens.
 *
 * It is left as written, including the four open decisions at the foot. Those
 * are questions for the owner, not answered requirements.
 */

const display = Instrument_Serif({ subsets: ["latin"], weight: "400", variable: "--plan-display" });
const body = Inter({ subsets: ["latin"], weight: ["300", "400", "500"], variable: "--plan-body" });

export const metadata: Metadata = {
  title: "Plan v1",
  robots: { index: false, follow: false },
};

const POSITIONING = [
  {
    k: "The competition",
    v: "Grid of a thousand GIFs. Volume as the pitch. You can't tell one item from the next, and nothing proves it works.",
  },
  {
    k: "Your edge",
    v: "Fewer items, each with a live demo, the exact output, and the source. Curation stated out loud: a number, a date, a name behind it.",
  },
  {
    k: "Proof of quality",
    v: "Every item shows what it was built with, what it renders to, and one real site shipped from it. Receipts, not adjectives.",
  },
];

const NAMES = [
  { name: "Atelier", domain: "atelier.ai", note: "Workshop, craft, one maker. Directly answers “not slop”." },
  { name: "Vaultwork", domain: "vaultwork.io", note: "Locked, valuable, membership-shaped. Fits the paywall model." },
  { name: "Sublayer", domain: "sublayer.co", note: "Technical, dev-native. Reads as infrastructure, not a store." },
  { name: "Ferrous", domain: "ferrous.studio", note: "Material, heavy, memorable. No AI cliché in the word at all." },
  { name: "Kiln", domain: "kiln.design", note: "One syllable. Heat, making, finishing. Pairs with the lime accent." },
  { name: "Nightshift", domain: "nightshift.ai", note: "Dark by nature, and it hints at the thing shipping while you sleep." },
];

const SHELVES = [
  {
    name: "Build",
    n: "SHELF 01",
    v: "Prompts, full site templates and code, agent + MCP workflows. The revenue core — this is what the vibe-coding buyer wakes up wanting.",
    tags: ["prompt", "template", "mcp / agent"],
  },
  {
    name: "Motion",
    n: "SHELF 02",
    v: "3D scenes, animated backgrounds, AI video clips. Highest visual impact, so this shelf feeds the homepage hero and the social loop.",
    tags: ["3d scene", "background", "video"],
  },
  {
    name: "Craft",
    n: "SHELF 03",
    v: "AI images and LoRAs / model files. Serves the marketer and the image-first buyer. Different licensing story, so it gets its own detail-page variant.",
    tags: ["image pack", "lora"],
  },
];

const GATES = [
  {
    k: "Prompts + templates",
    v: "Full preview, prompt redacted. You see the whole result and the first two lines of the prompt; the rest is blurred with a real character count showing.",
  },
  {
    k: "3D + backgrounds",
    v: "Live demo, unlocked and clickable. Interaction is the sell. Download and source are what you pay for.",
  },
  {
    k: "Images + video",
    v: "Watermarked at low res. Clean file on unlock. Never blur these — buyers judge them visually.",
  },
  {
    k: "Free tier",
    v: "A genuinely good handful, fully unlocked, refreshed monthly. The free items must be good enough to embarrass the competition's paid ones.",
  },
];

const SCREENS = [
  { n: "01", name: "Homepage / library grid", v: "Hero, shelf tabs, filter rail, the card grid. This screen is 80% of the product.", variants: "3 variations" },
  { n: "02", name: "Item detail", v: "Big preview, redacted prompt block, stack badges, what-it-renders-to, related items.", variants: "2 variations" },
  { n: "03", name: "Paywall moment", v: "The unlock overlay. Designed as a moment, not a modal accident.", variants: "2 variations" },
  { n: "04", name: "Pricing", v: "Three tiers, one obvious winner, and the honest list of what free actually gets.", variants: "2 variations" },
  { n: "05", name: "Search & filters, collections", v: "Command-K search over the whole vault; collections as curated bundles with their own covers.", variants: "single direction" },
  { n: "06", name: "Checkout & onboarding", v: "One-screen checkout; onboarding that asks stack + mood and seeds the first collection.", variants: "single direction" },
  { n: "07", name: "Dashboard + studio admin", v: "Saved and unlocked items; your private upload flow and earnings view.", variants: "single direction" },
];

const RULES = [
  { k: "Grid", v: "12-column, 1440 max, 24px gutters. Cards in a 3-up masonry so tall 3D scenes and wide landing pages both sit right. 8px spacing scale throughout." },
  { k: "Form", v: "Radius 12px on cards, 99px on pills, 0 on nothing. Borders are 1px hairlines, never shadows — shadows on near-black just look muddy." },
  { k: "Motion", v: "Previews autoplay muted and loop, staggered so the grid never pulses in unison. Hover lifts the border to lime in 160ms. No parallax, no scroll-jacking, no entrance animation on the grid." },
];

const OPEN = [
  "Which two names should I pursue?",
  "Real previews: do you have actual outputs I can drop in, or do I build with striped placeholders for now? This is the single biggest factor in whether it reads as premium.",
  "Roughly how many items exist at launch? Under 60 changes the pitch from “library” to “curated vault”, and I'd design the grid differently.",
  "Monthly price point you have in mind, so pricing copy is honest rather than invented.",
];

function Head({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <div className={styles.sectionHead}>
      <a className="skip-link" href="#plan">Skip to the plan</a>
      <span className={styles.num}>{n}</span>
      <h2>{children}</h2>
    </div>
  );
}

export default function Plan() {
  return (
    <div className={`${styles.page} ${display.variable} ${body.variable}`}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>Plan v1 — August 2026</p>
          <h1 className={styles.h1}>
            A vault for AI outputs that reads like a design house, not a prompt dump.
          </h1>
          <p className={styles.lede}>
            Everything below is the decision set: what we sell, how it is gated, the screens we
            build, and the design system that makes it feel expensive. Nothing is built yet — react
            to this first and I&rsquo;ll change it before a single pixel is drawn.
          </p>
        </header>

        <section id="plan" className={styles.section}>
          <Head n="01">Positioning</Head>
          <p className={styles.pull}>
            Your words:{" "}
            <em>the design should have real market value, not AI slop.</em> That&rsquo;s the entire
            strategy, so it has to be visible in the first three seconds.
          </p>
          <div className={styles.cards}>
            {POSITIONING.map((c) => (
              <div className={styles.card} key={c.k}>
                <p className={styles.label}>{c.k}</p>
                <p className={styles.body}>{c.v}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <Head n="02">Names to react to</Head>
          <p className={styles.note}>
            Short, sayable, .com-plausible. Tell me which two you like and I&rsquo;ll check domains.
          </p>
          <div className={styles.names}>
            {NAMES.map((n) => (
              <div className={styles.outline} key={n.name}>
                <p className={styles.nameTitle}>{n.name}</p>
                <p className={styles.mono}>{n.domain}</p>
                <p className={styles.small}>{n.note}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <Head n="03">Catalog &amp; taxonomy</Head>
          <p className={styles.note}>
            You listed eight asset types. Eight top-level tabs would kill the homepage, so they
            collapse into three shelves with type as a filter. Order below is also the launch order
            — ship shelf one deep before shelf three exists.
          </p>
          <div className={styles.stack}>
            {SHELVES.map((s) => (
              <div className={styles.shelf} key={s.name}>
                <div>
                  <p className={styles.shelfName}>{s.name}</p>
                  <p className={styles.shelfNum}>{s.n}</p>
                </div>
                <div>
                  <p className={styles.body}>{s.v}</p>
                  <div className={styles.tags}>
                    {s.tags.map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.callout}>
            <p className={styles.label}>Cross-cutting filters</p>
            <p className={styles.body}>
              Tone (dark / light) · Mood (luxe, technical, organic, brutalist, playful) · Stack
              (Next, Three.js, Tailwind, Lovable, Cursor, Claude) · Access (free / unlimited). Mood
              is the filter buyers actually browse by — it goes in the primary rail, stack goes
              behind &ldquo;all filters&rdquo;.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <Head n="04">Money &amp; the gate</Head>
          <p className={styles.note}>
            Free tier plus paid unlimited, and you chose all four gating mechanics. They
            shouldn&rsquo;t all fire at once — each asset type gets the gate that hurts least and
            teases most.
          </p>
          <div className={styles.cards}>
            {GATES.map((g) => (
              <div className={styles.card} key={g.k}>
                <p className={styles.labelAccent}>{g.k}</p>
                <p className={styles.body}>{g.v}</p>
              </div>
            ))}
          </div>
          <p className={styles.note}>
            Pricing shape I&rsquo;d propose: <b>Free</b> · <b>Monthly</b> · <b>Lifetime</b>, with
            lifetime priced at ~10× monthly and framed as founding-member. Since you&rsquo;re the
            sole supplier, &ldquo;creator upload&rdquo; and &ldquo;creator earnings&rdquo; become{" "}
            <b>your studio admin</b> — same screens, private, and they move to the end of the build.
          </p>
        </section>

        <section className={styles.section}>
          <Head n="05">Screens, in build order</Head>
          <div className={styles.rows}>
            {SCREENS.map((s) => (
              <div className={styles.row} key={s.n}>
                <span className={styles.num}>{s.n}</span>
                <div>
                  <p className={styles.rowTitle}>{s.name}</p>
                  <p className={styles.small}>{s.v}</p>
                </div>
                <span className={styles.mono}>{s.variants}</span>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <Head n="06">The design system</Head>
          <p className={styles.note}>
            Cinematic dark stays the default. From the reference boards: the warm near-black (not
            blue-black), the cream ink, the green-to-lime accent ladder, and the
            serif-display-over-neutral-UI type pairing. The same tokens invert into a cream light
            mode, so marketing pages can breathe while the library stays dark.
          </p>
          <div className={styles.cards}>
            {RULES.map((r) => (
              <div className={styles.outline} key={r.k}>
                <p className={styles.label}>{r.k}</p>
                <p className={styles.body}>{r.v}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.open}>
          <p className={styles.labelAccent}>Open decisions — I need you on these</p>
          <ol className={styles.openList}>
            {OPEN.map((o, i) => (
              <li key={o}>
                {i + 1} — {o}
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
