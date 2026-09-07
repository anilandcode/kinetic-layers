import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/kl/site";
import { getSettings } from "@/lib/sanity/queries";

/**
 * The rule-and-links footer.
 *
 * Fetches its own count rather than taking one as a prop. Every page would
 * otherwise have to load the catalogue just to print a number in the footer,
 * and the written pages have no other reason to. The screens that already call
 * getSettings pay nothing extra — the query is deduped within a request.
 *
 * The prototype hardcodes "240 assets filed"; this counts.
 */
export default async function Footer() {
  const settings = await getSettings();

  return (
    <div className="kl-pad" style={{ paddingTop: 72, paddingBottom: 44 }}>
      <div className="kl-footer">
        <div className="kl-footer-brand">
          <div className="kl-footer-mark">
            <svg width="16" height="16" viewBox="0 0 40 40" fill="none" aria-hidden="true">
              <defs>
                <linearGradient id="klFootMark" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#8C8A84" />
                  <stop offset="1" stopColor="#E8853A" />
                </linearGradient>
              </defs>
              <path d="M0 0H40V40H10C4.5 40 0 35.5 0 30V0Z" fill="url(#klFootMark)" />
              <path d="M10 10H40V40H15C12.2 40 10 37.8 10 35V10Z" fill="#FFFFFF" fillOpacity="0.34" />
              <path d="M20 20H40V40H22C20.9 40 20 39.1 20 38V20Z" fill="#FFFFFF" fillOpacity="0.52" />
            </svg>
            <span>KINETICLAYERS.COM — ONE STUDIO, SINCE 2026</span>
          </div>
          <span className="kl-footer-count">
            {settings.totalAssets} assets filed. More this Thursday.
          </span>
        </div>

        <nav className="kl-footer-links" aria-label="Footer">
          <Link href="/library">LIBRARY</Link>
          <Link href="/how">HOW IT WORKS</Link>
          <Link href="/pricing">PRICING</Link>
          <Link href="/license">LICENSE</Link>
          <a href={`mailto:${CONTACT_EMAIL}`}>CONTACT</a>
        </nav>
      </div>
    </div>
  );
}
