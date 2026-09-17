import { ImageResponse } from "next/og";
import { getSettings } from "@/lib/sanity/queries";
import { SITE_NAME } from "@/lib/kl/site";
import { EARLY_ACCESS } from "@/lib/kl/access";

export const alt = "Kinetic Layers — a library worth stealing from";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The card people actually see when a Kinetic Layers link is pasted anywhere.
 *
 * Drawn rather than uploaded, so the count on it is the real one and cannot go
 * stale the way a hand-made PNG would. next/og runs on the edge runtime and
 * only supports a subset of CSS — flex, no grid, no external fonts unless
 * fetched — so this is deliberately plain.
 */
export default async function Image() {
  const settings = await getSettings();

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
          background: "linear-gradient(150deg, #F7F7F6 0%, #F7F6F3 58%)",
          color: "#14161A",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 26, letterSpacing: 6, color: "#17181A" }}>
          <svg width="30" height="30" viewBox="0 0 40 40" fill="none">
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
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ fontSize: 74, lineHeight: 1.05, letterSpacing: -2, maxWidth: 900 }}>
            Prompts, templates, scenes and workflows.
          </div>
          {/* One string child, not three. Satori requires an explicit
              display on any element with multiple children, and interpolation
              splits text into separate nodes — "text {value} text" is three. */}
          <div style={{ fontSize: 30, color: "#6B6E75", maxWidth: 820 }}>
            {`Built in one studio, released when ready. ${settings.freeThisMonth} free.`}
          </div>
        </div>

        <div style={{ display: "flex", gap: 34, fontSize: 22, color: "#6B6E75", letterSpacing: 3 }}>
          <div>{`${settings.totalAssets} ASSETS`}</div>
          <div>{`${settings.collectionCount} COLLECTIONS`}</div>
          <div>{EARLY_ACCESS ? "FREE — EARLY ACCESS" : `$${settings.monthlyPrice}/MONTH`}</div>
        </div>
      </div>
    ),
    size
  );
}
