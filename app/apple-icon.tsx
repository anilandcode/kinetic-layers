import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * The iOS web-clip icon.
 *
 * There was no `apple-icon` at all, so adding the site to a home screen produced
 * whatever the OS chose to invent — usually a screenshot of the page. 180×180 is
 * the size iOS asks for.
 *
 * Full-bleed and square on purpose: iOS applies its own corner mask, and a
 * radius baked in here would show as a second, smaller rounding inside it.
 */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F7F6F3",
        }}
      >
        <svg width="112" height="112" viewBox="0 0 40 40" fill="none">
          <defs>
            <linearGradient id="klMarkApple" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#8C8A84" />
              <stop offset="1" stopColor="#E8853A" />
            </linearGradient>
          </defs>
          <path d="M0 0H40V40H10C4.5 40 0 35.5 0 30V0Z" fill="url(#klMarkApple)" />
          <path d="M10 10H40V40H15C12.2 40 10 37.8 10 35V10Z" fill="#FFFFFF" fillOpacity="0.34" />
          <path d="M20 20H40V40H22C20.9 40 20 39.1 20 38V20Z" fill="#FFFFFF" fillOpacity="0.52" />
        </svg>
      </div>
    ),
    size
  );
}
