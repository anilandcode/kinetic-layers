
import { hasRealPreview } from "@/lib/kl/preview-ready";
import Link from "next/link";
import SiteHeader from "./SiteHeader";
import Shell from "./Shell";
import Footer from "./Footer";
import AssetCard from "./AssetCard";
import { UpgradeCard, NewsCard } from "./PromoCards";
import { getAssets, getSettings } from "@/lib/sanity/queries";
import { getViewer } from "@/lib/kl/viewer";
import { MOTIONSITES_REFERENCES } from "@/lib/kl/motionsites";
import MotionSitesReferenceCard from "./MotionSitesReferenceCard";
import { MotionGrid, MotionSection } from "./BenchMotion";

/** Bench layout, backed by the real catalogue rather than the export's demo rows. */
export default async function HomeView() {
  const [assets, settings, viewer] = await Promise.all([getAssets(), getSettings(), getViewer()]);
  const visible = assets.filter(hasRealPreview);
  return (
    <Shell>
      <SiteHeader />
      <main className="bench-home">
        <MotionSection as="section" className="bench-intro">
          <h1>Design kits you can adapt and ship.</h1>
          <p>Explore original Kinetic Layers kits and credited visual references selected for interaction, craft and direction.</p>
        </MotionSection>
        <MotionSection as="section" className="bench-home-section-head" delay={0.05} aria-labelledby="original-kits-title">
          <div>
            <span>Original catalogue</span>
            <h2 id="original-kits-title">Built by Kinetic Layers.</h2>
            <p>Production-ready design kits with clear access status, real previews and source files when available.</p>
          </div>
          <Link href={visible.length ? "/library" : "/contact"}>{visible.length ? `Browse all ${visible.length} kits →` : "Tell us what you need →"}</Link>
        </MotionSection>
        {visible.length ? (
          <MotionGrid className="bench-original-grid">
            {visible.map((asset) => <AssetCard key={asset.slug} asset={asset} />)}
          </MotionGrid>
        ) : <p className="bench-empty">The first original Kinetic Layers kits are in review.</p>}

        <MotionSection as="section" className="bench-home-section-head bench-reference-heading" delay={0.05} aria-labelledby="reference-library-title">
          <div>
            <span>Research library</span>
            <h2 id="reference-library-title">Credited visual references.</h2>
            <p>Inspiration selected for interaction and craft. References are clearly attributed and are never sold as Kinetic Layers products.</p>
          </div>
          <a href="https://motionsites.ai/" target="_blank" rel="noreferrer">Source: MotionSites ↗</a>
        </MotionSection>
        <MotionGrid className="bench-wall bench-reference-wall">
          {MOTIONSITES_REFERENCES.flatMap((reference, index) => {
            const card = <MotionSitesReferenceCard key={reference.name} reference={reference} />;
            if (visible.length > 0 && index === 4 && !viewer?.premium) return [card, <UpgradeCard key="upgrade" price={settings.monthlyPrice} />];
            if (index === 13) return [card, <NewsCard key="newsletter" />];
            return [card];
          })}
        </MotionGrid>
      </main>
      <Footer />
    </Shell>
  );
}
