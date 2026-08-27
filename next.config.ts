import type { NextConfig } from "next";

/**
 * The origins the pages actually talk to, read from the same env vars the app
 * reads. Hardcoding them here would mean a changed media host silently breaks
 * every image with a console error rather than following the deploy.
 */
const origin = (value: string | undefined) => {
  try {
    return value ? new URL(value).origin : null;
  } catch {
    return null;
  }
};

const media = origin(process.env.NEXT_PUBLIC_MEDIA_BASE);
const supabase = origin(process.env.NEXT_PUBLIC_SUPABASE_URL);
const list = (...parts: (string | null)[]) => parts.filter(Boolean).join(" ");

/**
 * Content-Security-Policy.
 *
 * Honest about what this is and is not. `script-src` keeps 'unsafe-inline':
 * Next hydrates through inline `self.__next_f.push(...)` scripts, and the only
 * alternatives are a per-request nonce — which forces dynamic rendering on
 * every page and throws away the static output this site is built on — or
 * hashing scripts whose content changes every build. So this is not an XSS
 * defence. What it does do is stop a script from a host that is not on this
 * list from executing at all, close off framing, form posts to other origins,
 * plugins, and `<base>` hijacking.
 *
 * The XSS defence proper is elsewhere and holds: React escapes everything
 * rendered, and the single dangerouslySetInnerHTML in the layout holds a
 * string constant with no interpolation.
 */
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  `img-src ${list("'self'", "data:", "blob:", media, supabase)}`,
  `media-src ${list("'self'", "blob:", media)}`,
  "font-src 'self' data:",
  `connect-src ${list("'self'", supabase, supabase && supabase.replace("https://", "wss://"))}`,
  "frame-ancestors 'self'",
  /* Checkout is a redirect to Stripe, so the browser posts there directly. */
  "form-action 'self' https://checkout.stripe.com",
  "base-uri 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The demand test ships no raster assets at all — every visual is inline
  // SVG or CSS — so the image optimizer has nothing to do.
  images: { unoptimized: true },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          /* Two years and preloadable. Vercel terminates TLS and redirects
             http, but the header is what stops the first request of a session
             from going out in the clear at all. */
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          /* Nothing here uses any of these, so nothing embedded can either. */
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
          },
        ],
      },
      {
        /* Everything except the Studio, which loads its own bundles and needs
           eval — the editor is behind a Sanity login and is not a public
           surface, so it keeps the headers above and skips this one. */
        source: "/((?!studio).*)",
        headers: [{ key: "Content-Security-Policy", value: csp }],
      },
    ];
  },
};

export default nextConfig;
