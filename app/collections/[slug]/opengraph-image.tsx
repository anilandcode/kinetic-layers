import { ImageResponse } from "next/og";
import { getCollection } from "@/lib/sanity/queries";
import { SITE_NAME } from "@/lib/kl/site";

export const alt = "Kinetic Layers collection";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Collection share card.
 *
 * A page that declares its own `openGraph` does not inherit the root's image,
 * so without this file collection links pasted anywhere showed no picture at
 * all — which is precisely the case where a picture helps most, since a
 * collection has no preview of its own in the link.
 */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = await getCollection(slug);

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
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 24, letterSpacing: 6, color: "#17181A" }}>
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
          <div>{`${SITE_NAME.toUpperCase()} · COLLECTION`}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 80, lineHeight: 1.03, letterSpacing: -2.5, maxWidth: 960 }}>
            {c?.name ?? "Not found"}
          </div>
          {c?.blurb ? (
            <div style={{ fontSize: 29, color: "#6B6E75", maxWidth: 880, lineHeight: 1.35 }}>{c.blurb}</div>
          ) : null}
        </div>

        <div style={{ display: "flex", gap: 30, fontSize: 21, color: "#6B6E75", letterSpacing: 3 }}>
          <div>{`${c?.items ?? 0} ITEMS`}</div>
          {c?.free ? <div>{`${c.free} FREE`}</div> : null}
        </div>
      </div>
    ),
    size
  );
}
