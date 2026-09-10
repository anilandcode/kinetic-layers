import Link from "next/link";
import type { Asset } from "@/lib/kl/types";
import { img, clip as clipUrl, frame } from "@/lib/kl/media";
import PreviewMedia from "@/components/legacy/PreviewMedia";
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
  /* A video with no image is no longer a blank tile: Cloudflare cuts the
     poster out of the clip itself. Sanity records no dimensions for a file, so
     an uploaded image is still what sizes the card — this only fixes what it
     shows, not how tall it is. */
  const poster = asset.poster ? img(asset.poster) : asset.clip ? frame(asset.clip) : null;
  const clip = asset.clip ? clipUrl(asset.clip) : null;

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
               the redesign owns it. A real poster covers it anyway.

               The ratio replaces the old inline `height: asset.h`. See the
               note on .kl-preview in styles/kl.css: a pixel height computed
               for a narrow column crops the media once the column is wide.
               asset.h is still projected — Skeleton reserves space with it. */
            style={
              {
                background: `var(${ground})`,
                "--kl-aspect": String(asset.aspect || 1.4),
              } as React.CSSProperties
            }
          >
            {/* play="auto", so a clip starts when its card scrolls into view
                rather than waiting for a hover nobody performs on a phone.

                This is what getlayers does, checked rather than assumed: its
                homepage ships 51 <video> tags, every one of them autoplay and
                preload="none", and not one with a src attribute. The bytes are
                still withheld — PreviewMedia attaches the source on
                intersection and drops it again on the way out, which frees the
                decoded buffer instead of leaving every clip you scrolled past
                resident. Reduced motion still opts out entirely. */}
            {poster || clip ? (
              <PreviewMedia
                gradient={`var(${ground})`}
                poster={poster ?? undefined}
                clip={clip ?? undefined}
                alt={asset.name}
                play="auto"
                style={{ position: "absolute", inset: 0 }}
              />
            ) : (
              /* The design's answer to "no render yet" — faint line-work on a
                 paper tint. It used to render over the image too, because it
                 sits after it in the DOM. */
              <div className="kl-preview-pattern" data-pattern={patternFor(asset.slug)} aria-hidden="true" />
            )}
          </div>

          {/* Name, tier, then the format pinned right — one line, as the
              reference grids do it. The separate chip row this replaces led
              with the type, so the only thing lost by deleting it is a
              duplicate; the first tag went with it, which is the trade: a card
              is a glance, and the tag is one click away on the item page. */}
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

            {/* The design has no early-access state, so this chip is ours. It
                lived in the deleted tag row because the head could not fit a
                third chip at 370px; a full-bleed grid gives the column ~600px,
                and the name ellipses before anything overflows. */}
            {!asset.free && EARLY_ACCESS ? (
              <span className="kl-tag kl-tag--free">Free now</span>
            ) : null}

            <span className="kl-card-type">{asset.type}</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
