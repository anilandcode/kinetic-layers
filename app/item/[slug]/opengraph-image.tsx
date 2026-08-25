import { ImageResponse } from "next/og";
import { getAsset } from "@/lib/sanity/queries";
import { SITE_NAME } from "@/lib/kiln/site";

export const alt = "Kiln asset";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Per-asset share card.
 *
 * Uses the asset's own gradient, so a shared link looks like the thing it
 * points at rather than a generic house card. The preview media itself is not
 * used: next/og would have to fetch it per request, and the gradient is
 * already the asset's identity in the grid.
 */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const asset = await getAsset(slug);

  const gradient = asset?.g ?? "linear-gradient(155deg, #1D2410, #0F0F0D 65%)";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: gradient,
          color: "#F4F1E8",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 24, letterSpacing: 6, color: "#B9CE95" }}>
          <div style={{ width: 12, height: 12, borderRadius: 99, background: "#B9CE95" }} />
          <div>{SITE_NAME.toUpperCase()}</div>
          {asset?.free ? <div style={{ marginLeft: 12, color: "#89857B" }}>· FREE</div> : null}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 82, lineHeight: 1.03, letterSpacing: -2.5, maxWidth: 960 }}>
            {asset?.name ?? "Not found"}
          </div>
          {asset?.tagline ? (
            <div style={{ fontSize: 30, color: "#A8A395", maxWidth: 860, lineHeight: 1.35 }}>
              {asset.tagline}
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", gap: 30, fontSize: 21, color: "#89857B", letterSpacing: 3 }}>
          {asset?.type ? <div>{asset.type}</div> : null}
          {asset?.stack ? <div>{asset.stack}</div> : null}
          {asset?.category ? <div>{asset.category.toUpperCase()}</div> : null}
        </div>
      </div>
    ),
    size
  );
}
