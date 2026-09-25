import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * The favicon. Generated, so there is no binary to keep in step with the mark.
 *
 * The same layered glyph the header draws, on the near-black canvas, scaled up
 * to fill the tile: at 32px a small mark inside a large ground is unreadable,
 * so the ground is only a thin surround.
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0A0A0B",
          borderRadius: 7,
        }}
      >
        <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
          <defs>
            <linearGradient id="klMarkIcon" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#F4F4F2" />
              <stop offset="1" stopColor="#737371" />
            </linearGradient>
          </defs>
          <path d="M4 0H36A4 4 0 0 1 40 4V36A4 4 0 0 1 36 40H10C4.5 40 0 35.5 0 30V4A4 4 0 0 1 4 0Z" fill="url(#klMarkIcon)" />
          <path d="M14 10H36A4 4 0 0 1 40 14V36A4 4 0 0 1 36 40H15C12.2 40 10 37.8 10 35V14A4 4 0 0 1 14 10Z" fill="#FFFFFF" fillOpacity="0.34" />
          <path d="M23 20H37A3 3 0 0 1 40 23V37A3 3 0 0 1 37 40H22C20.9 40 20 39.1 20 38V23A3 3 0 0 1 23 20Z" fill="#FFFFFF" fillOpacity="0.52" />
        </svg>
      </div>
    ),
    size
  );
}
