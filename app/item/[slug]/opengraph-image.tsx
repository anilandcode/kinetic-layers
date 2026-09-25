import { ImageResponse } from "next/og";
import { getAsset } from "@/lib/sanity/queries";
import { SITE_NAME } from "@/lib/kl/site";
import { ditherColors, HUES, kitHue } from "@/lib/v2/gradient";

export const alt = "Kinetic Layers asset";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Per-asset share card.
 *
 * Glows in the kit's own hue, so a shared link looks like the thing it points
 * at rather than a generic house card. The preview media itself is not used:
 * next/og would have to fetch it per request, and the hue is already the
 * kit's identity in the grid.
 */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const asset = await getAsset(slug);

  /* The kit's own hue, glowing low on the right of the near-black canvas —
     the same colour its card and kit page carry. */
  const [hot, glow] = ditherColors(kitHue(asset?.palette, HUES.ember));
  const rgba = (c: [number, number, number], a: number) => `rgba(${c.map((v) => Math.round(v * 255)).join(",")},${a})`;
  const gradient = `radial-gradient(60% 75% at 88% 95%, ${rgba(glow, 0.6)}, ${rgba(hot, 0.3)} 45%, rgba(10,10,11,0) 75%)`;

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
          backgroundColor: "#0A0A0B",
          backgroundImage: gradient,
          color: "#F2F2F0",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 24, letterSpacing: 6, color: "#F2F2F0" }}>
          <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
            <defs>
              <linearGradient id="klMarkOg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#F4F4F2" />
                <stop offset="1" stopColor="#737371" />
              </linearGradient>
            </defs>
            <path d="M4 0H36A4 4 0 0 1 40 4V36A4 4 0 0 1 36 40H10C4.5 40 0 35.5 0 30V4A4 4 0 0 1 4 0Z" fill="url(#klMarkOg)" />
            <path d="M14 10H36A4 4 0 0 1 40 14V36A4 4 0 0 1 36 40H15C12.2 40 10 37.8 10 35V14A4 4 0 0 1 14 10Z" fill="#FFFFFF" fillOpacity="0.34" />
            <path d="M23 20H37A3 3 0 0 1 40 23V37A3 3 0 0 1 37 40H22C20.9 40 20 39.1 20 38V23A3 3 0 0 1 23 20Z" fill="#FFFFFF" fillOpacity="0.52" />
          </svg>
          <div>{SITE_NAME.toUpperCase()}</div>
          {asset?.free ? <div style={{ marginLeft: 12, color: "#A1A1A6" }}>· FREE</div> : null}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 82, lineHeight: 1.03, letterSpacing: -2.5, maxWidth: 960 }}>
            {asset?.name ?? "Not found"}
          </div>
          {asset?.tagline ? (
            <div style={{ fontSize: 30, color: "#A1A1A6", maxWidth: 860, lineHeight: 1.35 }}>
              {asset.tagline}
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", gap: 30, fontSize: 21, color: "#A1A1A6", letterSpacing: 3 }}>
          {asset?.type ? <div>{asset.type}</div> : null}
          {asset?.tags?.[0] ? <div>{asset.tags[0]}</div> : null}
          {asset?.tags?.[1] ? <div>{asset.tags[1].toUpperCase()}</div> : null}
        </div>
      </div>
    ),
    size
  );
}
