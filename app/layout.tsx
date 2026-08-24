import type { Metadata, Viewport } from "next";
import { Sora, Source_Serif_4, Geist_Mono } from "next/font/google";
import KilnMotion from "@/components/kiln/KilnMotion";
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
  title: {
    default: "Kiln — two hundred and forty things worth stealing",
    template: "%s — Kiln",
  },
  description:
    "Prompts, templates, scenes and workflows built in one studio and shipped weekly. Every item comes with the output, the source, and one site already running on it.",
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
        {children}
      </body>
    </html>
  );
}
