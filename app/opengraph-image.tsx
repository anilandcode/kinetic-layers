import { ImageResponse } from "next/og";
import { getSettings } from "@/lib/sanity/queries";
import { SITE_NAME } from "@/lib/kiln/site";
import { EARLY_ACCESS } from "@/lib/kiln/access";

export const alt = "Kiln — a library worth stealing from";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The card people actually see when a Kiln link is pasted anywhere.
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
          background: "linear-gradient(150deg, #1D2410 0%, #0F0F0D 62%)",
          color: "#F4F1E8",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 26, letterSpacing: 6, color: "#B9CE95" }}>
          <div style={{ width: 14, height: 14, borderRadius: 99, background: "#B9CE95" }} />
          <div>{SITE_NAME.toUpperCase()}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ fontSize: 74, lineHeight: 1.05, letterSpacing: -2, maxWidth: 900 }}>
            Prompts, templates, scenes and workflows.
          </div>
          {/* One string child, not three. Satori requires an explicit
              display on any element with multiple children, and interpolation
              splits text into separate nodes — "text {value} text" is three. */}
          <div style={{ fontSize: 30, color: "#A8A395", maxWidth: 820 }}>
            {`Built in one studio, shipped weekly. ${settings.freeThisMonth} free.`}
          </div>
        </div>

        <div style={{ display: "flex", gap: 34, fontSize: 22, color: "#89857B", letterSpacing: 3 }}>
          <div>{`${settings.totalAssets} ASSETS`}</div>
          <div>{`${settings.collectionCount} COLLECTIONS`}</div>
          <div>{EARLY_ACCESS ? "FREE — EARLY ACCESS" : `$${settings.monthlyPrice}/MONTH`}</div>
        </div>
      </div>
    ),
    size
  );
}
