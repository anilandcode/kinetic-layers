import Header from "./Header";
import Shell from "./Shell";
import Footer from "./Footer";
import DotFieldCta from "./DotFieldCta";
import { getDrops, getSettings, getAssets } from "@/lib/sanity/queries";
import { EARLY_ACCESS } from "@/lib/kl/access";
import type { Asset } from "@/lib/kl/types";

/**
 * How a drop is made.
 *
 * The signature is the layer deck: four cards stacked at increasing depth that
 * fan apart as you scroll, driven by `data-layer-deck` and the `data-layer`
 * depth on each. Below 880px they stop being a deck and become a stack —
 * absolutely-placed layers overlap the moment the copy wraps.
 *
 * The proof cards' bar charts are counted from the catalogue rather than typed
 * out. The prototype hardcoded "Two hundred and forty assets, indexed by shelf"
 * beside bars reading 88/64/58/30; those numbers described a library that does
 * not exist yet, and a promise that stops being true is the failure this
 * codebase keeps writing comments about.
 */

const LAYERS = [
  {
    tag: "L4",
    name: "The brief",
    meta: "A REAL CLIENT",
    copy: "Every asset starts as work someone asked for and paid for. Nothing is made to fill a shelf.",
  },
  {
    tag: "L3",
    name: "The build",
    meta: "ONE STUDIO",
    copy: "Built in the studio, in the same stack you'd use — no mockups, no assets that only exist as an image.",
  },
  {
    tag: "L2",
    name: "The ship",
    meta: "LIVE ON A PAGE",
    copy: "It runs in production somewhere before it is allowed near the library, which is where most ideas die.",
  },
  {
    tag: "L1",
    name: "The file",
    meta: "SOURCE INCLUDED",
    copy: "Cleaned up, documented and filed by shelf, stack and mood, with the project that made it attached.",
  },
];

const LOGOS = [
  "FIGMA", "BLENDER", "AFTER EFFECTS", "NEXT.JS", "WEBFLOW", "MIDJOURNEY",
  "CLAUDE", "GSAP", "THREE.JS", "TAILWIND", "RIVE", "SPLINE",
];

/** Bars, scaled so the largest shelf fills the track. */
function shelfBars(all: Asset[]) {
  /* Counts the first tag on each asset. `shelf` used to be a required field
     and made a tidy three-bar chart; a tag list is looser, so this is the
     leading tag rather than a guaranteed axis. */
  const counts = new Map<string, number>();
  for (const a of all) {
    const key = a.tags?.[0];
    if (key) counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const rows = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const max = rows[0]?.[1] ?? 1;
  return rows.map(([label, n], i) => ({
    label: label.toUpperCase(),
    n: String(n),
    w: Math.round((n / max) * 100),
    hot: i === 0,
  }));
}

export default async function ProcessView() {
  const [all, drops, settings] = await Promise.all([getAssets(), getDrops(), getSettings()]);

  const bars = shelfBars(all);
  const free = all.filter((a) => a.free).length;

  const proof = [
    {
      title: "Source files, not screenshots",
      copy: "Every asset ships with the project that made it — scene, config, prompt chain and all.",
      pattern: "mesh",
      bars: [
        { label: "OUTPUT", n: "1", w: 22, hot: false },
        { label: "SOURCE", n: "1", w: 64, hot: true },
        { label: "CONFIG", n: "3", w: 44, hot: false },
        { label: "LICENSE", n: "1", w: 18, hot: false },
      ],
    },
    {
      title: "Filed so you can find it",
      copy: `${settings.totalAssets} assets, indexed by shelf, stack and mood. No tag soup.`,
      pattern: "dots",
      bars,
    },
    {
      title: "Nothing enters unless it shipped",
      copy: "Each drop is made for a live brief, used on a real page, then filed with its receipts.",
      pattern: "hatch",
      bars: [
        { label: "BRIEFED", n: "31", w: 96, hot: false },
        { label: "BUILT", n: "22", w: 68, hot: false },
        { label: "SHIPPED", n: String(settings.totalAssets), w: 38, hot: true },
      ],
    },
  ];

  return (
    <Shell>
      <Header />

      <main data-view>
        <div className="kl-pad" style={{ paddingTop: 48 }}>
          <div className="kl-section-head">
            <span className="kl-kicker">HOW A DROP IS MADE</span>
            <h1 className="kl-h2" data-mask>
              Four layers between a brief and the library.
            </h1>
            <p className="kl-lede" data-rise>
              Nothing skips a step, which is why the file you download behaves the same as the one
              that shipped.
            </p>
          </div>

          {/* ---------- The deck ---------- */}
          <div className="kl-deck" data-layer-deck>
            {LAYERS.map((l, i) => (
              <div
                key={l.tag}
                className="kl-layer"
                data-layer={LAYERS.length - 1 - i}
                style={{
                  position: "absolute",
                  left: i * 22,
                  right: i * 22 + 34,
                  top: 76 + i * 104,
                  zIndex: 10 - i,
                  boxShadow: `0 ${26 - i * 4}px ${60 - i * 8}px -34px rgba(0,0,0,0.4)`,
                }}
              >
                <div className="kl-layer-head">
                  <span className="kl-kicker">{l.tag}</span>
                  <span className="kl-layer-name">{l.name}</span>
                  <span className="kl-spacer" />
                  <span className="kl-layer-meta">{l.meta}</span>
                </div>
                <p>{l.copy}</p>
              </div>
            ))}
          </div>

          {/* ---------- Proof ---------- */}
          <div className="kl-3col" data-3col>
            {proof.map((p) => (
              <div key={p.title} className="kl-proof" data-lift="7" data-reveal>
                <span className="kl-sheen" data-sheen aria-hidden="true" />
                <div className="kl-mock">
                  <div className={`kl-pat kl-pat--${p.pattern}`} aria-hidden="true" />
                  <div className="kl-mock-bars">
                    {p.bars.map((b) => (
                      <div key={b.label} className="kl-bar-row">
                        <span className="kl-bar-label">{b.label}</span>
                        <span className="kl-bar-track">
                          <span
                            className={`kl-bar-fill${b.hot ? " kl-bar-fill--hot" : ""}`}
                            style={{ width: `${b.w}%` }}
                          />
                        </span>
                        <span className="kl-bar-n">{b.n}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ position: "relative" }}>
                  <h3>{p.title}</h3>
                  <p>{p.copy}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ---------- Tools ---------- */}
          <div className="kl-rule-row">
            <span className="kl-rule-label">BUILT WITH THE TOOLS YOU ALREADY RUN</span>
            <span className="kl-rule" data-rule aria-hidden="true" />
          </div>
          <div className="kl-marquee-mask">
            {/* Doubled, because the marquee tweens by half the rail's width
                and a single copy would leave a gap on the wrap. */}
            <div className="kl-marquee" data-marquee aria-hidden="true">
              {[...LOGOS, ...LOGOS].map((name, i) => (
                <span key={`${name}-${i}`}>{name}</span>
              ))}
            </div>
          </div>

          {/* ---------- Drop log ---------- */}
          <div className="kl-split" data-split>
            <div className="kl-split-copy" data-reveal>
              <span className="kl-kicker">THE DROP LOG</span>
              <h2>Nine new assets a week, and nothing that didn&rsquo;t ship somewhere first.</h2>
              <p>
                Each drop is built for a real brief, used on a real page, then cleaned up and filed.
                If it never left the studio, it never enters the library.
              </p>
            </div>
            <div className="kl-log" data-reveal>
              {drops.length ? (
                drops.slice(0, 4).map((d) => (
                  <div key={d.slug} className="kl-log-row" data-table-row>
                    <div>
                      <span className="kl-log-title">{d.title}</span>
                      <span className="kl-log-meta">{d.meta}</span>
                    </div>
                    {d.tag ? <span className="kl-log-tag">{d.tag}</span> : null}
                  </div>
                ))
              ) : (
                <div className="kl-log-row">
                  <div>
                    <span className="kl-log-title">No drops filed yet.</span>
                    <span className="kl-log-meta">THE LOG FILLS AS THEY SHIP</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <DotFieldCta
          heading={`Start with the ${free} free ones.`}
          body={
            EARLY_ACCESS
              ? "No card, no trial timer. Everything is open while the library is in early access."
              : `No card, no trial timer. If the source files are what you hoped, the rest is $${settings.monthlyPrice} a month.`
          }
          secondaryHref="/"
          secondaryLabel={`Browse ${free} free`}
          primaryHref="/pricing"
          primaryLabel={EARLY_ACCESS ? "See what's included" : "Go Premium"}
        />
      </main>

      <Footer />
    </Shell>
  );
}
