import Link from "next/link";
import type { Asset } from "@/lib/kl/types";
import { mediaUrl } from "@/lib/kl/media";
import { groundFor, patternFor } from "@/lib/kl/ground";
import { EARLY_ACCESS } from "@/lib/kl/access";

/**
 * One asset in the masonry.
 *
 * The card is a link to the real /item/[slug] page, not a click handler. That
 * page is load-bearing outside the app — sitemap, MCP tool output, OG images,
 * every ?next= redirect — so the grid must lead somewhere a refresh survives
 * (HANDOFF.md, trap 3).
 *
 * `data-glow2` puts the bloom and rim under the pointer, `data-grid-item` lets
 * the grid restagger after a filter change. Both are inert without the motion
 * layer, which is the point.
 */

export default function AssetCard({ asset }: { asset: Asset }) {
  const ground = groundFor(asset.slug);
  const poster = asset.poster ? mediaUrl(asset.poster) : null;

  return (
    <div className="kl-grid-item" data-grid-item>
      <div className="kl-glow" data-glow2="6">
        <span className="kl-glow-bloom" data-glow-bloom aria-hidden="true" />
        <span className="kl-glow-rim" data-glow-rim aria-hidden="true" />

        {/* A plain link. The overlay the design asks for is an intercepting
            route at app/@modal/(.)item/[slug], so a click from inside the app
            opens the popup and a direct visit renders the page — without this
            component needing to know which happened. The old delegation off
            `a[data-card]` is gone along with the modal that read it. */}
        <Link href={`/item/${asset.slug}`} className="kl-card kl-card-link">
          <div
            className="kl-preview"
            data-preview
            /* The design's own ground, not `asset.g`. That field holds
               gradients authored for the old dark palette and reads as a
               black hole on the warm ground — it is styling, not content, so
               the redesign owns it. A real poster covers it anyway. */
            style={{
              height: asset.h ? `${asset.h}px` : undefined,
              background: `var(${ground})`,
            }}
          >
            {poster ? (
              <img
                src={poster}
                alt=""
                loading="lazy"
                decoding="async"
                width={asset.aspect ? 800 : undefined}
                height={asset.aspect ? Math.round(800 / asset.aspect) : undefined}
              />
            ) : null}
            {/* Only where there is no image. The pattern is the design's
                answer to "no render yet" — faint line-work on a paper tint —
                and it sits after the <img> in the DOM, so leaving it in painted
                a dot grid over every upload. */}
            {poster ? null : (
              <div className="kl-preview-pattern" data-pattern={patternFor(asset.slug)} aria-hidden="true" />
            )}
          </div>

          <div className="kl-card-head">
            <span className="kl-card-name">{asset.name}</span>

            {!asset.free ? (
              /* Keyed to the asset, as the design keys it — PREMIUM describes
                 the material, not this viewer's entitlement. It used to take a
                 `locked` prop, which early access made permanently false, so
                 the pill never rendered anywhere. The one auto-animated control
                 on a card: aura, veil and a timed sweep. */
              <span className="kl-chip-premium" data-auto-glass data-glass-btn="3" data-premium="true">
                <span className="kl-btn-aura" data-btn-aura aria-hidden="true" />
                <span className="kl-btn-veil" data-btn-veil aria-hidden="true" />
                <span className="kl-btn-shine" data-btn-shine aria-hidden="true" />
                <span className="kl-btn-label" data-btn-label>
                  PREMIUM
                </span>
              </span>
            ) : (
              <span className="kl-badge kl-badge--amber">Free</span>
            )}
          </div>

          <div className="kl-tags">
            <span className="kl-tag">{asset.type}</span>
            {/* One tag, not the whole list: a card is a glance, and five
                chips under a thumbnail is a paragraph. */}
            {asset.tags?.[0] ? <span className="kl-tag">{asset.tags[0]}</span> : null}
            {/* The design has no early-access state, so this chip is ours. It
                sits in the tag row rather than beside PREMIUM because the head
                row is a three-item flex with no wrap — a third chip there
                overflows the narrow masonry columns. */}
            {!asset.free && EARLY_ACCESS ? (
              <span className="kl-tag kl-tag--free">Free now</span>
            ) : null}
          </div>
        </Link>
      </div>
    </div>
  );
}
