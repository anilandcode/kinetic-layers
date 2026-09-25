import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { preload } from "react-dom";
import Analytics from "@/components/v2/Analytics";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/kl/site";
import "./globals.css";

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
  /* One dark look, so one colour for the browser chrome: the canvas. */
  themeColor: "#0A0A0B",
  colorScheme: "dark",
};

/* General Sans is declared with plain @font-face (styles/kl-foundations.css)
   rather than next/font/local, whose subsetting its licence forbids — so it
   does not get next/font's automatic preload. These two weights carry almost
   every line of v2 text. */
const GENERAL_SANS_PRELOAD = ["Regular", "Medium"].map((w) => `/fonts/general-sans/GeneralSans-${w}.woff2`);

export default function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  /** The @modal parallel route — filled only when an interception matched. */
  modal: React.ReactNode;
}) {
  for (const href of GENERAL_SANS_PRELOAD) preload(href, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>
        <Analytics />
        {children}
        {/* The kit quick view: app/@modal/(.)item intercepts /item/[slug] on a
            soft navigation. Back closes it, refresh gives the full page, and
            the address bar holds the kit's real URL. */}
        {modal}
      </body>
    </html>
  );
}
