import { ImageResponse } from "next/og";
import { getAsset } from "@/lib/sanity/queries";
import { SITE_NAME } from "@/lib/kl/site";

export const alt = "Kinetic Layers asset";
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

  /* Not asset.g: those gradients were authored for the retired dark palette,
     which is why the card grid refuses them too. */
  const gradient = "linear-gradient(150deg, #FBF3EA 0%, #F7F6F3 58%)";

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
          color: "#14161A",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 24, letterSpacing: 6, color: "#A4501A" }}>
          <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
            <defs>
              <linearGradient id="klMarkOg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#8C8A84" />
                <stop offset="1" stopColor="#E8853A" />
              </linearGradient>
            </defs>
            <path d="M0 0H40V40H10C4.5 40 0 35.5 0 30V0Z" fill="url(#klMarkOg)" />
            <path d="M10 10H40V40H15C12.2 40 10 37.8 10 35V10Z" fill="#FFFFFF" fillOpacity="0.34" />
            <path d="M20 20H40V40H22C20.9 40 20 39.1 20 38V20Z" fill="#FFFFFF" fillOpacity="0.52" />
          </svg>
          <div>{SITE_NAME.toUpperCase()}</div>
          {asset?.free ? <div style={{ marginLeft: 12, color: "#6B6E75" }}>· FREE</div> : null}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 82, lineHeight: 1.03, letterSpacing: -2.5, maxWidth: 960 }}>
            {asset?.name ?? "Not found"}
          </div>
          {asset?.tagline ? (
            <div style={{ fontSize: 30, color: "#6B6E75", maxWidth: 860, lineHeight: 1.35 }}>
              {asset.tagline}
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", gap: 30, fontSize: 21, color: "#6B6E75", letterSpacing: 3 }}>
          {asset?.type ? <div>{asset.type}</div> : null}
          {asset?.tags?.[0] ? <div>{asset.tags[0]}</div> : null}
          {asset?.tags?.[1] ? <div>{asset.tags[1].toUpperCase()}</div> : null}
        </div>
      </div>
    ),
    size
  );
}
