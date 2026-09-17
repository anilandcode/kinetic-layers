import { hasRealPreview } from "@/lib/kl/preview-ready";
import Link from "next/link";
import SiteHeader from "./SiteHeader";
import Shell from "./Shell";
import Footer from "./Footer";
import GlassButton from "./GlassButton";
import { img, clip as clipUrl, frame, ITEM_W, CARD_W } from "@/lib/kl/media";
import PreviewMedia from "@/components/legacy/PreviewMedia";
import { groundFor } from "@/lib/kl/ground";
import { EARLY_ACCESS } from "@/lib/kl/access";
import { MotionSection } from "./BenchMotion";
import type { Asset, Viewer } from "@/lib/kl/types";

/**
 * An asset, in the Kinetic Layers treatment.
 *
 * Built to the design's overlay exactly, as asked. That is narrower than the
 * page it replaces: the gated prompt reader, the save button, the multi-shot
 * switcher and the per-file download list are all gone.
 *
 * The prompt reader is the one worth naming. It was one of four doors sharing
 * a single prompt budget — the item page, CardCopy on a library card,
 * /api/download and the MCP get_prompt tool. The Kinetic Layers card carries
 * no CardCopy either, so on these screens the only remaining ways to read a
 * prompt are the API and MCP. getPromptBody now has no UI caller, which is the
 * condition HANDOFF.md trap 7 describes: a gate that only ever refuses is half
 * tested. Restoring it means putting CardCopy back on AssetCard, or a prompt
 * panel back here.
 *
 * the pre-redesign item view held all of that; it was deleted with the old
 * so none of it has to be rewritten to come back.
 */

/* What lands in the download. Three fixed layers, the same on every asset —
   the design's copy, and true of every item in the library. */
const STACK = [
  {
    tag: "01",
    name: "The output",
    meta: "PNG · MP4 · FRAME",
    copy: "What you saw in the preview, at full resolution, exactly as it shipped.",
  },
  {
    tag: "02",
    name: "The source",
    meta: "Project files",
    copy: "The scene, repo, prompt chain or weights that produced it — editable, documented, no stripped layers.",
  },
  {
    tag: "03",
    name: "The receipt",
    meta: "Where it shipped",
    copy: "A link to the live page it was built for, the brief behind it, and the license covering your use.",
  },
];

export default function ItemView({
  asset,
  related,
  relatedReason = "newest",
  viewer,
  locked,
  monthlyPrice,
  variant = "page",
}: {
  asset: Asset;
  related: Asset[];
  relatedReason?: "drop" | "tag" | "newest";
  viewer: Viewer | null;
  /** Whether the files are behind the paywall for this viewer. */
  locked: boolean;
  monthlyPrice: number;
  /**
   * "page" is the real route at /item/[slug] — the one the sitemap, the MCP
   * tool, the OG image and every ?next= redirect point at (HANDOFF.md, trap 3).
   * "modal" is the same content rendered inside the intercepting route, where
   * ItemModal supplies the shell, the crumbs and a close that goes back.
   */
  variant?: "page" | "modal";
}) {
  const ground = groundFor(asset.slug);
  /* Wider than a card, so it asks for a wider file. Same fallback: a
     video-only asset gets a frame cut from its own clip. */
  const poster = asset.poster
    ? img(asset.poster, ITEM_W)
    : asset.clip
      ? frame(asset.clip, ITEM_W)
      : null;
  const clip = asset.clip ? clipUrl(asset.clip, ITEM_W) : null;

  /* Facts come from the asset's own specs first, then the fields every item
     has — deduped by key, because specs already carry TYPE, SHELF and STACK
     for most assets and listing them twice reads like a rendering fault.
     Authored specs win: they say "84 MB total" where the field says nothing. */
  const facts = (() => {
    const seen = new Map<string, string>();
    const fallbacks: Array<[string, string | undefined]> = [
      ["TYPE", asset.type],
      /* Was five named columns. One tag list reads better here anyway — the
         table was mostly repeating the same word under different headings. */
      ["TAGS", asset.tags?.length ? asset.tags.join(", ") : undefined],
    ];
    for (const [k, v] of fallbacks) if (v && !seen.has(k)) seen.set(k, v);
    return [...seen].map(([k, v]) => ({ k, v }));
  })();

  const relatedHeading =
    relatedReason === "drop"
      ? "From the same drop"
      : relatedReason === "tag"
        ? "Related"
        : "Newest in the library";

  const cta = locked
    ? { label: "Unlock with Premium", href: "/pricing" }
    : viewer
      ? { label: asset.free ? "Download — free" : "Download the files", href: `/api/download?slug=${asset.slug}` }
      : { label: "Create a free account", href: `/join?next=/item/${asset.slug}` };

  const ctaNote = locked
    ? `Included in the $${monthlyPrice} subscription, with every other premium asset.`
    : viewer
      ? "Output, source and the receipt, in one archive."
      : EARLY_ACCESS
        ? "Free while the library is in early access — it just needs an account."
        : "An account is the only thing between you and the source files.";

  const isModal = variant === "modal";

  if (isModal) {
    return (
      <main className="bench-item-layout" data-view>
        <section className="bench-item-stage" aria-label={`${asset.name} preview`}>
          <div
            className={`bench-item-media${asset.aspect && asset.aspect < 1 ? " is-tall" : ""}`}
            tabIndex={0}
            aria-label={`${asset.name} preview. ${asset.aspect && asset.aspect < 1 ? "Scroll to view the full image." : ""}`}
            style={{ background: `var(${ground})` }}
          >
            {poster || clip ? (
              <PreviewMedia
                gradient={`var(${ground})`}
                poster={poster ?? undefined}
                clip={clip ?? undefined}
                alt={asset.name}
                play="auto"
                priority
                className="bench-item-media-preview"
              />
            ) : (
              <div className="kl-preview-pattern" aria-label="Preview unavailable" />
            )}
          </div>
          <div className="bench-item-media-caption">
            <span>{asset.type}</span>
            <span>{asset.tags?.[0] ?? "Preview"}</span>
          </div>
        </section>

        <aside className="bench-item-details" aria-label={`${asset.name} details`}>
          <div className="bench-item-details-copy">
            <span className="bench-item-eyebrow">{asset.type} · {asset.free ? "Free early access" : "Premium"}</span>
            <h1 className="bench-item-title">{asset.name}</h1>
            {asset.tagline ? <p className="bench-item-tagline">{asset.tagline}</p> : null}
            <div className="bench-item-facts">
              {facts.map((fact) => (
                <div key={fact.k} className="bench-item-fact">
                  <span>{fact.k}</span><strong>{fact.v}</strong>
                </div>
              ))}
            </div>
            {asset.files?.length ? (
              <div className="bench-item-files">
                <h2>Included files</h2>
                <ul>{asset.files.map((file, index) => (
                  <li key={`${file.name}-${index}`}>
                    <span>{file.name}</span>
                    <small>{file.meta ?? file.tag ?? ""}</small>
                  </li>
                ))}</ul>
              </div>
            ) : null}
          </div>
          <div className="bench-item-actions">
            <span className="bench-item-action-note">{ctaNote}</span>
            <Link href={cta.href} className="bench-item-primary-action">{cta.label}</Link>
            <a href={`/item/${asset.slug}`} className="bench-item-secondary-action">Open full item page</a>
          </div>
        </aside>
      </main>
    );
  }

  const content = (
    <main
      data-view
      className={isModal ? undefined : "kl-pad"}
      style={isModal ? undefined : { paddingTop: 28, paddingBottom: 40 }}
    >
      {/* The modal draws its own crumbs, because its close has to dismiss the
          overlay rather than navigate to the library. */}
      {isModal ? null : (
        <div className="kl-crumbs">
          <span>{asset.tags?.[0] ?? asset.type}</span>
          <span>/</span>
          <span style={{ color: "var(--ink)" }}>{asset.name}</span>
          <span className="kl-spacer" />
          <Link href="/library" className="kl-close">
            Close ×
          </Link>
        </div>
      )}

        <MotionSection className="kl-item-motion">
        <div className="kl-item" data-item-split>
          {/* ---------- Left: the goods ---------- */}
          <div className="kl-item-main">
            <div style={{ position: "relative" }}>
              <div className="kl-item-lamp" data-lamp="18" aria-hidden="true" />
              <div className="kl-item-preview-frame">
                <div
                  className="kl-preview"
                  data-preview
                  /* The media's own ratio, not a computed pixel height.

                     This used to derive a height from the aspect and then clamp
                     it to 320–560, which meant an inline `height` that silently
                     overrode the `aspect-ratio` .kl-preview already carries: a
                     wide screenshot and a tall one both landed inside a 240px
                     band and got cropped to fit. The card was fixed the same
                     way; this is the panel catching up.

                     .kl-item-preview-frame caps it at 72vh so an extreme
                     portrait cannot push the panel off the screen. */
                  style={
                    {
                      background: `var(${ground})`,
                      "--kl-aspect": String(asset.aspect || 1.4),
                    } as React.CSSProperties
                  }
                >
                  {/* play="auto" here, not "hover": this is one file on a page
                      the visitor chose to open, rather than one of sixteen in a
                      grid. Same component, different intent. */}
                  {poster || clip ? (
                    <PreviewMedia
                      gradient={`var(${ground})`}
                      poster={poster ?? undefined}
                      clip={clip ?? undefined}
                      alt={asset.name}
                      play="auto"
                      priority
                    />
                  ) : (
                    <div className="kl-preview-pattern" aria-hidden="true" />
                  )}
                </div>
                <div className="kl-item-preview-foot">
                  <span>Preview</span>
                  <span className="kl-spacer" />
                  <span>{asset.type.toLowerCase()}</span>
                  <span>{asset.tags?.[0] ?? ""}</span>
                </div>
              </div>
            </div>

            <div className="kl-item-copy">
              {/* data-mask rebuilds this into per-word spans, so plain text only. */}
              <h1 className="kl-item-title" data-mask>
                {asset.name}
              </h1>
              {asset.tagline ? (
                <p className="kl-pull" data-pull style={{ fontSize: 23, maxWidth: 560, margin: 0 }}>
                  {asset.tagline}
                </p>
              ) : null}
            </div>

            {/* Three rows in normal flow, not a deck.

                This was `data-layer-deck`: the rows sat absolutely at
                left: i*22 / right: i*22+34, each 44px narrower than the last,
                inside a fixed 430px box, and a scroll-scrubbed GSAP timeline
                (layerDeck, lib/kl/motion.ts) unstacked them as the page moved.

                In the overlay it never could. The scrolling element there is
                .kl-modal-veil rather than the window, so the scrub never
                advanced and the three rows sat frozen mid-skew — which read as
                a broken layout rather than an effect, because that is what it
                was: a scroll animation with no scroll.

                Flat here fixes the overlay and the full page together, and the
                fixed 430px went with it, so the panel no longer reserves height
                it may not fill. */}
            <div className="kl-item-download">
              <span className="kl-kicker">What&rsquo;s in the download</span>
              <ol className="kl-stack-rows">
                {STACK.map((s) => (
                  <li key={s.tag} className="kl-stack-row">
                    <div className="kl-layer-head">
                      <span className="kl-kicker">{s.tag}</span>
                      <span className="kl-layer-name">{s.name}</span>
                      <span className="kl-spacer" />
                      <span className="kl-layer-meta">{s.meta}</span>
                    </div>
                    <p>{s.copy}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* ---------- Right: the ask ---------- */}
          <aside className="kl-item-side" data-item-sticky>
            <div className="kl-item-card">
              <div className="kl-item-badges">
                <span className={`kl-badge${asset.free ? " kl-badge--amber" : ""}`}>
                  {asset.free ? "Free" : "Premium"}
                </span>
                <span className="kl-badge kl-badge--moss">Shipped</span>
              </div>

              <GlassButton href={cta.href} premium={!asset.free} pull={5}>
                {cta.label}
              </GlassButton>

              <span className="kl-item-note">{ctaNote}</span>

              <div className="kl-hairline" />

              {facts.map((f) => (
                <div key={f.k} className="kl-fact">
                  <span className="kl-fact-k">{f.k}</span>
                  <span className="kl-fact-v">{f.v}</span>
                </div>
              ))}
            </div>

            {related.length ? (
              <div className="kl-item-card">
                <span className="kl-item-related-head">{relatedHeading}</span>
                {related.filter(hasRealPreview).slice(0, 3).map((r, i) => {
                  const thumb = r.poster ? img(r.poster, CARD_W) : r.clip ? frame(r.clip, CARD_W) : null;
                  return (
                    <Link key={r.slug} href={`/item/${r.slug}`} className="kl-related">
                      <span
                        className="kl-related-thumb"
                        style={{ background: `var(${groundFor(r.slug)})` }}
                      >
                        {thumb ? <img src={thumb} alt="" decoding="async" /> : null}
                      </span>
                      <span className="kl-related-meta">
                        <span className="kl-related-name">{r.name}</span>
                        <span className="kl-related-type">{r.type}</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </aside>
        </div>
        </MotionSection>
    </main>
  );

  if (isModal) return content;

  return (
    <Shell>
      <SiteHeader />
      {content}
      <Footer />
    </Shell>
  );
}
