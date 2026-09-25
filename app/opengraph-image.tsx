import { readFile } from "node:fs/promises";
import { join } from "node:path";
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
  const mark = `data:image/png;base64,${(await readFile(join(process.cwd(), "public/brand/mark.png"))).toString("base64")}`;
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
          {/* eslint-disable-next-line @next/next/no-img-element -- rendered by next/og, not the browser */}
          <img src={mark} width={34} height={34} alt="" />
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
