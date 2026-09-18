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
import { canDownload } from "@/lib/kl/gate";
import { MotionSection } from "./BenchMotion";
import ItemDownloadAction from "./ItemDownloadAction";
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

function fileMeta(file: NonNullable<Asset["files"]>[number]) {
  const size = file.bytes
    ? file.bytes >= 1048576
      ? `${(file.bytes / 1048576).toFixed(file.bytes >= 10485760 ? 0 : 1)} MB`
      : `${Math.max(1, Math.round(file.bytes / 1024))} KB`
    : null;
  return [file.tag, file.meta, size].filter(Boolean).join(" · ");
}

export default function ItemView({
  asset,
  related,
  relatedReason = "newest",
  viewer,
  variant = "page",
}: {
  asset: Asset;
  related: Asset[];
  relatedReason?: "drop" | "tag" | "newest";
  viewer: Viewer | null;
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
  const files = asset.files ?? [];
  const downloadable = canDownload(viewer, asset) && files.length > 0;
  const access = downloadable
    ? {
        label: "Available",
        note: "Your account can access the files listed on this page.",
      }
    : EARLY_ACCESS
      ? {
          label: "Account required",
          note: "Create a free account to access this early-release item.",
        }
      : {
          label: "Preview only",
          note: files.length
            ? "The preview is published. New account access and checkout are not open today."
            : "The preview is published. Downloadable files have not been listed for this item yet.",
        };

  /* Facts come from the asset's own specs first, then the fields every item
     has — deduped by key, because specs already carry TYPE, SHELF and STACK
     for most assets and listing them twice reads like a rendering fault.
     Authored specs win: they say "84 MB total" where the field says nothing. */
  const facts = (() => {
    const seen = new Map<string, string>();
    const fallbacks: Array<[string, string | undefined]> = [
      ["FORMAT", asset.type],
      /* Was five named columns. One tag list reads better here anyway — the
         table was mostly repeating the same word under different headings. */
      ["TAGS", asset.tags?.length ? asset.tags.join(", ") : undefined],
      ["ACCESS", access.label],
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

  const accountHref = `/join?next=/item/${asset.slug}`;

  const isModal = variant === "modal";

  if (isModal) {
    return (
      <main
        className="bench-item-layout bench-dialog"
        data-view
        style={{ "--bench-media-aspect": String(asset.aspect || 1.4) } as React.CSSProperties}
      >
        <section className="bench-item-stage bench-dialog-stage" aria-label={`${asset.name} preview`}>
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

        <aside className="bench-item-details bench-dialog-details" aria-label={`${asset.name} details`}>
          <div className="bench-item-details-copy">
            <span className="bench-item-eyebrow bench-dialog-eyebrow">Original kit · {access.label}</span>
            <h1 className="bench-item-title bench-dialog-title">{asset.name}</h1>
            {asset.tagline ? <p className="bench-item-tagline">{asset.tagline}</p> : null}
            <div className="bench-item-facts bench-dialog-facts">
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
                    <small>{fileMeta(file)}</small>
                  </li>
                ))}</ul>
              </div>
            ) : null}
          </div>
          <div className="bench-item-actions bench-dialog-actions">
            <span className="bench-item-action-note bench-dialog-note">{access.note}</span>
            {downloadable ? (
              <ItemDownloadAction slug={asset.slug} label={files.length === 1 ? "Download file" : "Download first file"} />
            ) : EARLY_ACCESS ? (
              <Link href={accountHref} className="bench-item-primary-action bench-dialog-primary">Create a free account</Link>
            ) : (
              <Link href="/library" className="bench-item-primary-action bench-dialog-primary">Explore the library</Link>
            )}
            <a href={`/item/${asset.slug}`} className="bench-item-secondary-action bench-dialog-secondary">Open full item page</a>
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
              <div className="kl-item-badges" aria-label="Item status">
                <span className="kl-badge">Original kit</span>
                <span className={`kl-badge${downloadable ? " kl-badge--moss" : " kl-badge--amber"}`}>
                  {access.label}
                </span>
              </div>
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

            {asset.notes ? (
              <section className="kl-item-about" aria-labelledby="item-about-heading">
                <span className="kl-kicker">About this item</span>
                <h2 id="item-about-heading">About {asset.name}</h2>
                <div className="kl-item-notes">
                  {asset.notes.split(/\n{2,}/).filter(Boolean).map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ) : null}

            <div className="kl-item-download">
              <span className="kl-kicker">{files.length ? "Included files" : "Release status"}</span>
              <ol className="kl-stack-rows">
                {files.length ? files.map((file, index) => (
                  <li key={`${file.name}-${index}`} className="kl-stack-row">
                    <div className="kl-layer-head">
                      <span className="kl-kicker">{String(index + 1).padStart(2, "0")}</span>
                      <span className="kl-layer-name">{file.name}</span>
                      <span className="kl-spacer" />
                      <span className="kl-layer-meta">{fileMeta(file) || "File"}</span>
                    </div>
                    {downloadable ? (
                      <ItemDownloadAction slug={asset.slug} file={file.name} label="Download" compact />
                    ) : null}
                  </li>
                )) : (
                  <li className="kl-stack-row">
                    <div className="kl-layer-head">
                      <span className="kl-kicker">Preview</span>
                      <span className="kl-layer-name">Files are not listed yet</span>
                    </div>
                    <p>This page shows the published preview only. It does not promise a download that is not ready.</p>
                  </li>
                )}
              </ol>
            </div>
          </div>

          {/* ---------- Right: the ask ---------- */}
          <aside className="kl-item-side" data-item-sticky>
            <div className="kl-item-card">
              {downloadable ? (
                <ItemDownloadAction slug={asset.slug} label={files.length === 1 ? "Download file" : "Download first file"} />
              ) : EARLY_ACCESS ? (
                <GlassButton href={accountHref} premium={false} pull={5}>Create a free account</GlassButton>
              ) : (
                <GlassButton href="/library" premium={false} ghost pull={5}>Explore the library</GlassButton>
              )}

              <span className="kl-item-note">{access.note}</span>

              <div className="kl-hairline" />

              {facts.map((f) => (
                <div key={f.k} className="kl-fact">
                  <span className="kl-fact-k">{f.k}</span>
                  <span className="kl-fact-v">{f.v}</span>
                </div>
              ))}

              <Link href="/license" className="kl-item-license">Review the licence terms →</Link>
            </div>

            {related.length ? (
              <div className="kl-item-card">
                <span className="kl-item-related-head">{relatedHeading}</span>
                {related.filter(hasRealPreview).slice(0, 3).map((r) => {
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
                        <span className="kl-related-type">Original kit · {r.type}</span>
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
