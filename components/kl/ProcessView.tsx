import Link from "next/link";
import SiteHeader from "./SiteHeader";
import Shell from "./Shell";
import Footer from "./Footer";
import { getDrops, getSettings, getAssets } from "@/lib/sanity/queries";
import { EARLY_ACCESS } from "@/lib/kl/access";
import { hasRealPreview } from "@/lib/kl/preview-ready";

const LAYERS = [
  { tag: "L4", name: "The brief", meta: "Choose a direction", copy: "Start with the visual outcome and the job it needs to do, then identify what a buyer should be able to change." },
  { tag: "L3", name: "The build", meta: "Make it work", copy: "Build the design and its interaction as a working project, with the media and dependencies it needs." },
  { tag: "L2", name: "The check", meta: "Test the result", copy: "Check the preview, setup, mobile layout and reconstruction before calling a kit ready." },
  { tag: "L1", name: "The file", meta: "Release the kit", copy: "Package the files, instructions and usage terms so someone else can start and adapt the work." },
];

/** A four-panel account of the process, using counts and drops from the live catalogue. */
export default async function ProcessView() {
  const [all, drops, settings] = await Promise.all([getAssets(), getDrops(), getSettings()]);
  const free = all.filter((asset) => asset.free && hasRealPreview(asset)).length;
  const previewed = all.filter(hasRealPreview).length;
  const proof = [
    { title: "See the work first", copy: `${previewed} catalogue items currently have a distinct uploaded preview. More appear when their media is ready.` },
    { title: "Find a useful starting point", copy: "Browse by type and tag, then open an item to see its preview and the details actually filed for it." },
    { title: "Verify before promising", copy: "A preview alone is not a complete kit. Source packages and setup instructions are reviewed before a paid release." },
  ];

  return (
    <Shell>
      <SiteHeader />
      <main data-view className="bench-page">
        <section className="bench-intro">
          <h1>How it works.</h1>
          <p>Four steps from a design direction to a kit someone else can use.</p>
        </section>

        <section className="bench-page-section" aria-labelledby="layers-heading">
          <div className="bench-page-label"><span id="layers-heading">The four layers</span></div>
          <ol className="bench-process-grid">
            {LAYERS.map((layer) => (
              <li key={layer.tag} className="bench-panel" data-reveal>
                <span className="bench-panel-meta">{layer.tag} · {layer.meta}</span>
                <h2>{layer.name}</h2>
                <p>{layer.copy}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="bench-page-section bench-proof-grid" aria-label="What is included">
          {proof.map((item) => (
            <article key={item.title} className="bench-panel" data-reveal>
              <h2>{item.title}</h2>
              <p>{item.copy}</p>
            </article>
          ))}
        </section>

        <section className="bench-page-section bench-drop-section">
          <article className="bench-panel bench-drop-copy" data-reveal>
            <span className="bench-panel-meta">The drop log</span>
            <h2>New work appears when it is ready.</h2>
            <p>The catalogue grows as previews and packages are checked. There is no fixed weekly release promise.</p>
          </article>
          <div className="bench-panel bench-drop-log" data-reveal>
            {drops.length ? drops.slice(0, 4).map((drop) => (
              <div key={drop.slug} className="bench-drop-row">
                <span><strong>{drop.title}</strong><small>{drop.meta}</small></span>
                {drop.tag ? <em>{drop.tag}</em> : null}
              </div>
            )) : (
              <div className="bench-drop-row"><span><strong>No drops filed yet.</strong><small>The log fills as they ship.</small></span></div>
            )}
          </div>
        </section>

        <section className="bench-page-section">
          <article className="bench-panel bench-process-cta" data-reveal>
            <h2>Start with the {free} free previews.</h2>
            <p>{EARLY_ACCESS ? "No card or trial timer. The library stays open during early access." : `Founding Membership is planned at $${settings.monthlyPrice} a month when verified kits are ready.`}</p>
            <div>
              <Link href="/pricing" className="kl-bench-upgrade">{EARLY_ACCESS ? "See what is included" : "Go Premium"}</Link>
              <Link href="/library" className="bench-text-link">Browse {free} free</Link>
            </div>
          </article>
        </section>
      </main>
      <Footer />
    </Shell>
  );
}
