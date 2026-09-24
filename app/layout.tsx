import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Source_Serif_4 } from "next/font/google";
import Analytics from "@/components/legacy/Analytics";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/kl/site";
import "./globals.css";

/**
 * The design links these three from the Google Fonts CDN. next/font fetches
 * them at build time and serves them from our own origin instead, so the
 * typography is identical and the page still makes no third-party request.
 */
const serif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-serif",
  display: "swap",
});

/**
 * The interface face, standing in until the v2 canvas settles it.
 *
 * Maison Neue shipped here as four TTFs in public/fonts with no web licence on
 * record — DR-006 in the rebuild backlog, open since the day they were added.
 * Anything in public/ is served to every visitor, so an unlicensed font there is
 * distribution rather than use. Geist is open-licensed (OFL) and is one of the
 * three candidates in docs/DESIGN-DIRECTION-V2.md; if the canvas picks General
 * Sans or Satoshi instead, only these two declarations change.
 */
const sans = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  /* Without this, every relative image and canonical in the tree resolves
     against nothing and Next warns on each build. */
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  /* Light is the default ground, so a single near-black bar sat wrong above a
     warm-white page on mobile. These follow the OS preference; the in-page
     toggle (localStorage['kl-theme']) is finer-grained than browser chrome
     can track. */
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F6F3" },
    { media: "(prefers-color-scheme: dark)", color: "#0C0D10" },
  ],
};

export default function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  /** The @modal parallel route — filled only when an interception matched. */
  modal: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`no-js ${serif.variable} ${sans.variable} ${mono.variable}`}
    >
      <body>
        {/* Drops the no-js class before paint, so the reveal starting states
            only apply when the motion layer can actually clear them. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "document.documentElement.classList.remove('no-js');" +
              /* Kinetic Layers is light by default. Applied before paint so a
                 visitor who chose dark never sees the light ground flash
                 first. Wrapped because storage throws outright in some
                 privacy modes, and a theme is not worth a blank page. */
              "try{var t=localStorage.getItem('kl-theme');" +
              "document.documentElement.setAttribute('data-theme',t==='light'?'light':'dark');}catch(e){}",
          }}
        />
        <Analytics />
        {children}
        {/* The asset popup. It replaced AssetModal, which delegated off
            a[data-card] and rendered the pre-redesign dark ItemView — still
            reachable from /collections/[slug], where it opened a dark overlay
            on a light page.

            The old comment here said an intercepting route could not honour
            "the URL must not change". Changing it is the point: back closes
            the overlay, refresh gives the full page, and the link someone
            copies from the address bar is the one the sitemap already
            publishes. */}
        {modal}
      </body>
    </html>
  );
}
