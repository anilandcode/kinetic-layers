import Link from "next/link";
import type { Asset } from "@/lib/kl/types";
import PreviewMedia from "./PreviewMedia";
import CardCopy from "./CardCopy";

/**
 * The atom of the whole product.
 *
 * Preview edge to edge, access badge beside the title, type and stack in
 * chips at the foot. Hover lifts the border and scales the preview — the
 * scale is a CSS transition on [data-preview-inner], not a script.
 *
 * No descriptions, no avatars, no buttons on the card.
 */
export default function AssetCard({
  asset,
  height,
  canCopy = false,
}: {
  asset: Asset;
  /** Overrides the ragged masonry height — used by the even grids. */
  height?: number;
  /** Whether this viewer may already read the prompt. Decided by the caller
      with the shared gate in lib/kl/gate.ts, never guessed at here. */
  canCopy?: boolean;
}) {
  const h = height ?? asset.h;

  return (
    <Link
      data-card
      href={`/item/${asset.slug}`}
      className="kl-card kl-card-link"
      aria-label={`${asset.name} — ${asset.free ? "free" : "Premium only"}`}
    >
      <div
        style={{
          height: h,
          borderRadius: "12px",
          overflow: "hidden",
          background: asset.g,
          position: "relative",
        }}
      >
        {canCopy && asset.promptLength ? <CardCopy slug={asset.slug} name={asset.name} /> : null}
        <div data-preview-inner style={{ width: "100%", height: "100%" }}>
          <PreviewMedia
            gradient={asset.g}
            poster={asset.poster}
            clip={asset.clip}
            alt=""
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "16px 4px 0" }}>
        <span style={{ fontSize: 17, fontWeight: 500, letterSpacing: "-0.01em", color: "var(--ink)" }}>
          {asset.name}
        </span>
        <span className={asset.free ? "chip chip--sage" : "chip"} style={{ padding: "5px 13px" }}>
          {asset.free ? "Free" : "Premium"}
        </span>
      </div>

      <div data-meta style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: "11px 4px 2px" }}>
        <span className="kl-tag">{asset.type.toLowerCase()}</span>
        <span className="kl-tag">{asset.stack.toLowerCase()}</span>
      </div>
    </Link>
  );
}
