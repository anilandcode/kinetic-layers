import { ImageResponse } from "next/og";
import { getKits } from "@/lib/v2/data";
import { SITE_NAME } from "@/lib/kl/site";
import { EARLY_ACCESS } from "@/lib/kl/access";

export const alt = "Kinetic Layers — original website and motion kits your AI can rebuild";
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
  const kits = await getKits();
  const free = kits.filter((k) => k.free).length;

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
          /* Home's ember glow, low on the right, over the near-black canvas. */
          backgroundColor: "#0A0A0B",
          backgroundImage:
            "radial-gradient(60% 70% at 85% 95%, rgba(232,131,74,0.55), rgba(194,71,122,0.25) 45%, rgba(10,10,11,0) 75%)",
          color: "#F2F2F0",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 26, letterSpacing: 1, color: "#F2F2F0" }}>
          <svg width="34" height="34" viewBox="0 0 40 40" fill="none">
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
          <div>{SITE_NAME}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ fontSize: 72, lineHeight: 1.04, letterSpacing: -2, maxWidth: 940 }}>
            Original website and motion kits your AI can rebuild.
          </div>
          {/* One string child: Satori needs an explicit display on any element
              with several children, and interpolation splits text into nodes. */}
          <div style={{ fontSize: 28, color: "#A1A1A6", maxWidth: 860 }}>
            Each kit is a finished design with its spec and the prompts that recreate it in your stack.
          </div>
        </div>

        <div style={{ display: "flex", gap: 34, fontSize: 22, color: "#A1A1A6", letterSpacing: 2 }}>
          <div>{`${kits.length} ${kits.length === 1 ? "KIT" : "KITS"} · ${free} FREE`}</div>
          <div>CLAUDE CODE AND CURSOR, OVER MCP</div>
          <div>{EARLY_ACCESS ? "FREE — EARLY ACCESS" : "PREMIUM PLANNED"}</div>
        </div>
      </div>
    ),
    size
  );
}
