import Link from "next/link";
import Header from "./Header";
import Shell from "./Shell";
import GlassButton from "./GlassButton";
import AssetCard from "./AssetCard";
import DotFieldCta from "./DotFieldCta";
import { UpgradeCard, NewsCard } from "./PromoCards";
import { getAssets, getSettings } from "@/lib/sanity/queries";
import { getViewer } from "@/lib/kiln/viewer";
import { EARLY_ACCESS } from "@/lib/kiln/access";
import type { Asset } from "@/lib/kiln/types";

/**
 * The landing page.
 *
 * The design draws the full library here — hero, filter rail and the whole
 * masonry. This does not, deliberately: the filters moved to /library in
 * 17db6c3 because a first visitor was meeting a browse UI before being told
 * what the place was, and duplicating the rail would put two libraries in the
 * product. What stays is the pitch and enough of the goods to prove it.
 *
 * Every number is counted from Sanity. The prototype's "two hundred and forty"
 * and "twelve free" were placeholders; a stored count was wrong the day after
 * it was written.
 */

/* Enough to fill the masonry and show range, few enough that the page ends. */
const STRIP = 8;

export default async function HomeView() {
  const [all, settings, viewer] = await Promise.all([getAssets(), getSettings(), getViewer()]);

  const newest = all.slice(0, STRIP);

  /* Early access hands the whole vault to anyone with an account, so nothing
     is locked and no card should claim otherwise. */
  const unlocked = EARLY_ACCESS || Boolean(viewer?.unlimited);

  return (
    <Shell>
      <Header />

      <main data-view>
        {/* ---------- Hero ---------- */}
        <div className="kl-hero-wrap">
          <div className="kl-grid-pattern" aria-hidden="true" />
          <div className="kl-rings" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>

          <div className="kl-pad kl-hero" data-hero>
            <div className="kl-eyebrow">
              {settings.currentDrop ? (
                <span className="kl-drop-tag">{settings.currentDrop}</span>
              ) : null}
              <span className="kl-eyebrow-text" data-letters>
                One studio · shipped Thursday
              </span>
            </div>

            {/* data-mask rebuilds this into per-word spans, so it must stay
                plain text — no markup inside. */}
            <h1 className="kl-h1" data-mask data-h1>
              {`${settings.totalAssets} things worth stealing.`}
            </h1>

            <p className="kl-pull" data-rise data-pull>
              Prompts, templates, scenes and workflows built in one studio and shipped every
              Thursday.
            </p>

            <div className="kl-cta-row" data-rise>
              <GlassButton href="/pricing" premium size="lg" pull={7}>
                {EARLY_ACCESS
                  ? "Free while in early access"
                  : `Premium — $${settings.monthlyPrice}/mo`}
              </GlassButton>
              <GlassButton href="/library" size="lg" pull={5}>
                {`Browse ${settings.freeThisMonth} free`}
              </GlassButton>
            </div>
          </div>
        </div>

        {/* ---------- The newest, as proof ---------- */}
        <div className="kl-pad" style={{ paddingTop: 10 }}>
          <div className="kl-rule-row" style={{ marginTop: 0 }}>
            <span className="kl-rule-label">THE LATEST DROP</span>
            <span className="kl-rule" data-rule aria-hidden="true" />
            <Link href="/library" className="kl-strip-link">
              See all {all.length} →
            </Link>
          </div>

          <div className="kl-masonry" data-masonry style={{ marginTop: 22 }}>
            {newest.flatMap((asset: Asset, i: number) => {
              const card = (
                <AssetCard key={asset.slug} asset={asset} index={i} locked={!unlocked && !asset.free} />
              );
              if (i === 3 && !unlocked)
                return [card, <UpgradeCard key="promo-upgrade" price={settings.monthlyPrice} />];
              if (i === 6) return [card, <NewsCard key="promo-news" />];
              return [card];
            })}
          </div>
        </div>

        {/* ---------- Closing CTA ---------- */}
        <DotFieldCta
          heading={`Start with the ${settings.freeThisMonth} free ones.`}
          body={
            EARLY_ACCESS
              ? "No card, no trial timer. Everything is open while the library is in early access."
              : `No card, no trial timer. If the source files are what you hoped, the rest is $${settings.monthlyPrice} a month.`
          }
          secondaryHref="/library"
          secondaryLabel={`Browse ${settings.freeThisMonth} free`}
          primaryHref="/pricing"
          primaryLabel={EARLY_ACCESS ? "See what's included" : "Go Premium"}
        />
      </main>
    </Shell>
  );
}
