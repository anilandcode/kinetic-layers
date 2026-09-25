
import { hasRealPreview } from "@/lib/kl/preview-ready";
import Link from "next/link";
import SiteHeader from "./SiteHeader";
import Shell from "./Shell";
import Footer from "./Footer";
import AssetCard from "./AssetCard";
import { getAssets } from "@/lib/sanity/queries";
import { MOTIONSITES_REFERENCES } from "@/lib/kl/motionsites";
import MotionSitesReferenceCard from "./MotionSitesReferenceCard";
import { MotionGrid, MotionSection } from "./BenchMotion";

/** Bench layout, backed by the real catalogue rather than the export's demo rows. */
export default async function HomeView() {
  const assets = await getAssets();
  const visible = assets.filter(hasRealPreview);
  const featured = visible[0];
  const remaining = visible.slice(1, 7);
  return (
    <Shell>
      <SiteHeader />
      <main className="bench-home">
        <MotionSection as="section" className="bench-home-hero">
          <div className="bench-home-hero-copy">
            <span className="bench-home-kicker">Original AI design bundles</span>
            <h1>Design layers you can inspect, adapt and ship.</h1>
            <p>Each Kinetic Layers release is a full bundle: its actual prompt, guide, files, licence and compatibility are listed before you decide.</p>
            <div className="bench-home-actions">
              <Link href={visible.length ? "/library" : "/contact"} className="kl-btn">{visible.length ? "Browse original bundles" : "Request a bundle"}</Link>
              <a href="#reference-library" className="kl-btn kl-btn--ghost">Explore references</a>
            </div>
          </div>
          {featured ? (
            <div className="bench-home-feature" aria-label={`Featured original bundle: ${featured.name}`}>
              <AssetCard asset={featured} />
              <p><span>Featured release</span>{featured.name}</p>
            </div>
          ) : null}
        </MotionSection>
        <MotionSection as="section" className="bench-home-section-head" delay={0.05} aria-labelledby="original-kits-title">
          <div>
            <span>Original catalogue</span>
            <h2 id="original-kits-title">Built by Kinetic Layers.</h2>
            <p>Full design bundles with real previews and a factual contents list on every item page.</p>
          </div>
          <Link href={visible.length ? "/library" : "/contact"}>{visible.length ? `Browse all ${visible.length} kits →` : "Tell us what you need →"}</Link>
        </MotionSection>
        {remaining.length ? (
          <MotionGrid className="bench-original-grid">
            {remaining.map((asset) => <AssetCard key={asset.slug} asset={asset} />)}
          </MotionGrid>
        ) : !featured ? <p className="bench-empty">The first original Kinetic Layers bundles are in review.</p> : null}

        <MotionSection as="section" id="reference-library" className="bench-home-section-head bench-reference-heading" delay={0.05} aria-labelledby="reference-library-title">
          <div>
            <span>Research library</span>
            <h2 id="reference-library-title">Credited visual references.</h2>
            <p>Inspiration selected for interaction and craft. References are clearly attributed and are never sold as Kinetic Layers products.</p>
          </div>
          <a href="https://motionsites.ai/" target="_blank" rel="noreferrer">Source: MotionSites ↗</a>
        </MotionSection>
        <MotionGrid className="bench-wall bench-reference-wall">
          {MOTIONSITES_REFERENCES.map((reference) => <MotionSitesReferenceCard key={reference.name} reference={reference} />)}
        </MotionGrid>
      </main>
      <Footer />
    </Shell>
  );
}
