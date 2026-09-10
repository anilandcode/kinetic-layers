import SiteHeader from "./SiteHeader";
import Shell from "./Shell";
import Footer from "./Footer";
import DotFieldCta from "./DotFieldCta";
import { getDrops, getSettings, getAssets } from "@/lib/sanity/queries";
import { EARLY_ACCESS } from "@/lib/kl/access";

/**
 * How a drop is made.
 *
 * Four steps, three claims, and the drop log. That is the whole page.
 *
 * It used to open with a layer deck — the four steps placed absolutely and
 * fanned apart by a scroll-scrubbed timeline — plus a twelve-logo marquee and
 * three bar charts. The deck put the page's own explanation behind an
 * interaction, and the charts were the older failure this file has always
 * complained about in comments: the prototype hardcoded "Two hundred and forty
 * assets" beside bars reading 88/64/58/30, describing a library that did not
 * exist. Replacing those with real counts only moved the problem, because
 * BRIEFED 31 / BUILT 22 were still typed out, and the one chart that was
 * genuinely counted read a.tags?.[0] — empty since tags became references.
 *
 * A page explaining that nothing here is invented should not lead with invented
 * numbers. It leads with the four steps instead.
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
    copy: "Cleaned up, documented and filed by type and tag, with the project that made it attached.",
  },
];

export default async function ProcessView() {
  const [all, drops, settings] = await Promise.all([getAssets(), getDrops(), getSettings()]);

  const free = all.filter((a) => a.free).length;

  /* Titles and copy, no charts. The bars beside these read BRIEFED 31 / BUILT 22
     — numbers describing a library that does not exist — and the third chart was
     counted from a.tags?.[0], which is empty now that tags are references. A
     chart with invented figures and a chart with no figures are both worse than
     the sentence they sat next to. */
  const proof = [
    {
      title: "Source files, not screenshots",
      copy: "Every asset ships with the project that made it — scene, config, prompt chain and all.",
    },
    {
      title: "Filed so you can find it",
      copy: `${settings.totalAssets} assets, filed by type and tag, and every filter carries its own count.`,
    },
    {
      title: "Nothing enters unless it shipped",
      copy: "Each drop is made for a live brief, used on a real page, then filed with its receipts.",
    },
  ];


  return (
    <Shell>
      <SiteHeader />

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

          {/* ---------- The four layers ----------
              A list, not a deck. These were absolutely placed and fanned apart
              by a scroll-scrubbed timeline, which put the page's own
              explanation behind an interaction: until you scrolled just far
              enough, the four steps overlapped each other. Four short steps are
              a list, and a list is legible the moment it arrives. */}
          <ol className="kl-stack-rows" style={{ marginTop: 28 }}>
            {LAYERS.map((l) => (
              <li key={l.tag} className="kl-stack-row" data-reveal>
                <div className="kl-layer-head">
                  <span className="kl-kicker">{l.tag}</span>
                  <span className="kl-layer-name">{l.name}</span>
                  <span className="kl-spacer" />
                  <span className="kl-layer-meta">{l.meta}</span>
                </div>
                <p>{l.copy}</p>
              </li>
            ))}
          </ol>

          {/* ---------- Proof ---------- */}
          <div className="kl-3col" data-3col>
            {proof.map((p) => (
              <div key={p.title} className="kl-proof" data-lift="7" data-reveal>
                <span className="kl-sheen" data-sheen aria-hidden="true" />
                <div style={{ position: "relative" }}>
                  <h3>{p.title}</h3>
                  <p>{p.copy}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ---------- Drop log ---------- */}
          <div className="kl-split" data-split>
            <div className="kl-split-copy" data-reveal>
              <span className="kl-kicker">THE DROP LOG</span>
              <h2>Nothing enters that didn&rsquo;t ship somewhere first.</h2>
              <p>
                Each drop is built for a real brief, used on a real page, then cleaned up and filed.
                If it never left the studio, it never enters the library. New work appears when
                it is ready rather than to a schedule.
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
