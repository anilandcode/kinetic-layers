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
          background: c?.g ?? "linear-gradient(150deg, #242014, #0F0F0D 62%)",
          color: "#F4F1E8",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 24, letterSpacing: 6, color: "#B9CE95" }}>
          <div style={{ width: 12, height: 12, borderRadius: 99, background: "#B9CE95" }} />
          <div>{`${SITE_NAME.toUpperCase()} · COLLECTION`}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 80, lineHeight: 1.03, letterSpacing: -2.5, maxWidth: 960 }}>
            {c?.name ?? "Not found"}
          </div>
          {c?.blurb ? (
            <div style={{ fontSize: 29, color: "#A8A395", maxWidth: 880, lineHeight: 1.35 }}>{c.blurb}</div>
          ) : null}
        </div>

        <div style={{ display: "flex", gap: 30, fontSize: 21, color: "#89857B", letterSpacing: 3 }}>
          <div>{`${c?.items ?? 0} ITEMS`}</div>
          {c?.free ? <div>{`${c.free} FREE`}</div> : null}
        </div>
      </div>
    ),
    size
  );
}
