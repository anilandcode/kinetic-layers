import Link from "next/link";
import type { Asset } from "@/lib/kiln/data";

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
}: {
  asset: Asset;
  /** Overrides the ragged masonry height — used by the even grids. */
  height?: number;
}) {
  const h = height ?? asset.h;

  return (
    <Link
      data-nav
      data-card
      href={`/item/${asset.slug}`}
      className="kiln-card"
      aria-label={`${asset.name} — ${asset.free ? "free" : "unlimited only"}`}
    >
      <div
        style={{
          height: h,
          borderRadius: "var(--r-inner)",
          overflow: "hidden",
          background: asset.g,
        }}
      >
        <div data-preview-inner style={{ width: "100%", height: "100%", background: asset.g }} />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "16px 4px 0" }}>
        <span style={{ fontSize: 17, fontWeight: 500, letterSpacing: "-0.01em", color: "var(--ink)" }}>
          {asset.name}
        </span>
        <span className={asset.free ? "chip chip--sage" : "chip"} style={{ padding: "5px 13px" }}>
          {asset.free ? "Free" : "Unlimited"}
        </span>
      </div>

      <div data-meta style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: "11px 4px 2px" }}>
        <span className="chip">{asset.type.toLowerCase()}</span>
        <span className="chip">{asset.stack.toLowerCase()}</span>
      </div>
    </Link>
  );
}
