
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
import type { Asset } from "@/lib/kl/types";
import MotionSitesReferenceCard from "./MotionSitesReferenceCard";
import { MotionGrid, MotionSection } from "./BenchMotion";

/** Bench layout, backed by the real catalogue rather than the export's demo rows. */
export default async function HomeView() {
  const [assets, settings, viewer] = await Promise.all([getAssets(), getSettings(), getViewer()]);
  const visible = assets.filter(hasRealPreview);
  const mixedWall = MOTIONSITES_REFERENCES.reduce<Array<{ kind: "asset"; asset: Asset } | { kind: "reference"; reference: typeof MOTIONSITES_REFERENCES[number] }>>((wall, reference, index) => {
    const asset = index === 0 ? visible[0] : index === 10 ? visible[1] : undefined;
    if (asset) wall.push({ kind: "asset", asset });
    wall.push({ kind: "reference", reference });
    return wall;
  }, []);
  return (
    <Shell>
      <SiteHeader />
      <main className="bench-home">
        <MotionSection as="section" className="bench-intro">
          <h1>Design kits you can adapt and ship.</h1>
          <p>Explore original Kinetic Layers kits and credited visual references selected for interaction, craft and direction.</p>
        </MotionSection>
        <MotionSection className="bench-wall-label" delay={0.05}>
          <span>{visible.length ? "Original kits and visual references" : "Visual references while the first kits are reviewed"}</span>
          <Link href={visible.length ? "/library" : "/contact"}>
            {visible.length ? `Browse ${visible.length} original kits →` : "Tell us what you need →"}
          </Link>
        </MotionSection>
        <MotionGrid className="bench-wall">
          {mixedWall.flatMap((entry, index) => {
            const card = entry.kind === "asset"
              ? <AssetCard key={entry.asset.slug} asset={entry.asset} />
              : <MotionSitesReferenceCard key={entry.reference.name} reference={entry.reference} />;
            if (visible.length > 0 && index === 5 && !viewer?.premium) return [card, <UpgradeCard key="upgrade" price={settings.monthlyPrice} />];
            if (index === 14) return [card, <NewsCard key="newsletter" />];
            return [card];
          })}
        </MotionGrid>
        {!visible.length && <p className="bench-empty">The first original Kinetic Layers kits are in review. The credited reference wall remains available for research.</p>}
      </main>
      <Footer />
    </Shell>
  );
}
