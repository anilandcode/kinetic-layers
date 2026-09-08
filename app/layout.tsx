import type { Metadata, Viewport } from "next";
import { Sora, Source_Serif_4, Geist_Mono, Figtree, Cormorant } from "next/font/google";
import Analytics from "@/components/legacy/Analytics";
import AssetModal from "@/components/legacy/AssetModal";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/kl/site";
import "./globals.css";

/**
 * The design links these three from the Google Fonts CDN. next/font fetches
 * them at build time and serves them from our own origin instead, so the
 * typography is identical and the page still makes no third-party request.
 */
const sora = Sora({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sora",
  display: "swap",
});

const serif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-serif",
  display: "swap",
});

const mono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

/**
 * Kinetic Layers typography.
 *
 * Figtree carries everything, Cormorant italic is reserved for the single pull
 * line on each screen, and Geist Mono (above) is shared with the old palette
 * for labels. Sora and Source Serif stay until the last unmigrated route is
 * moved across — both sets are live at once, which is why these get their own
 * variable names rather than reusing --font-sora.
 */
const figtree = Figtree({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--kl-sans",
  display: "swap",
});

const cormorant = Cormorant({
  subsets: ["latin"],
  weight: ["400"],
  style: ["italic"],
  variable: "--kl-serif",
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
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`no-js ${sora.variable} ${serif.variable} ${mono.variable} ${figtree.variable} ${cormorant.variable}`}
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
              "if(t==='dark'||t==='light')document.documentElement.setAttribute('data-theme',t);}catch(e){}",
          }}
        />
        <Analytics />
        {children}
        {/* Opens an asset over whatever page you are on. Not a route: the URL
            must not change, which an intercepting route could not honour. */}
        <AssetModal />
      </body>
    </html>
  );
}
