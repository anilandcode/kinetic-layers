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
/* Preview media uploaded in the Studio is served from Sanity's asset CDN, which
   is a fixed host rather than a configured one. Without it here, every image
   uploaded through the Studio is blocked by the policy and renders as a broken
   tile — which is exactly what happened to the first one. */
const sanityCdn = "https://cdn.sanity.io";
const supabase = origin(process.env.NEXT_PUBLIC_SUPABASE_URL);
const list = (...parts: (string | null)[]) => parts.filter(Boolean).join(" ");
/* Publicly attributed reference previews on the library wall. These are image
   sources only; the reference cards never receive catalogue actions. */
const benchReferenceImages = ["https://motionsites.ai", "https://image.mux.com"];

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
  `img-src ${list("'self'", "data:", "blob:", media, sanityCdn, supabase, ...benchReferenceImages)}`,
  `media-src ${list("'self'", "blob:", media, sanityCdn)}`,
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
  /**
   * /studio is a redirect, not a page.
   *
   * Mounting the Studio here pulled ~800 MB of Sanity into the build and
   * clashed with React 19 over useEffectEvent, so it is hosted by Sanity
   * instead. This keeps the address people actually try — kineticlayers.com/studio
   * — pointing at it, for no bundle cost. `permanent: false` because where it
   * is hosted is a deployment choice, and a 308 would be cached by browsers
   * long after we changed our minds.
   */
  async redirects() {
    return [
      { source: "/studio", destination: "https://kineticlayers.sanity.studio", permanent: false },
      { source: "/studio/:path*", destination: "https://kineticlayers.sanity.studio/:path*", permanent: false },
    ];
  },
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
        /* Every path. This used to exclude /studio, which needed eval for its
           own bundles — but the Studio has not been mounted here since it was
           pulled out of the build, so the exclusion was leaving anything under
           that prefix with no CSP at all, protecting nothing. */
        source: "/:path*",
        headers: [{ key: "Content-Security-Policy", value: csp }],
      },
    ];
  },
};

export default nextConfig;
