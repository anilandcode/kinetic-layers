import type { Metadata, Viewport } from "next";
import { Sora, Source_Serif_4, Geist_Mono } from "next/font/google";
import KilnMotion from "@/components/kiln/KilnMotion";
import Analytics from "@/components/kiln/Analytics";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/kiln/site";
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
  themeColor: "#0F0F0D",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`no-js ${sora.variable} ${serif.variable} ${mono.variable}`}>
      <body>
        {/* Drops the no-js class before paint, so the reveal starting states
            only apply when the motion layer can actually clear them. */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.remove('no-js')",
          }}
        />
        <KilnMotion />
        <Analytics />
        {children}
      </body>
    </html>
  );
}
