import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Direction Kit — original website layers for agencies",
  description:
    "Original, conversion-ready website layers for agencies: visual direction, tested AI briefs, and source you can safely adapt for client work.",
  openGraph: {
    title: "Win the client. Then ship the site.",
    description:
      "Original, conversion-ready website layers for agencies — AI-ready briefs, canonical source, and a commercial licence for client delivery.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0b0d",
};

/**
 * Variant assignment. Runs synchronously as the first thing in <body>, before
 * anything is painted, because the playbook rule is that a visitor must never
 * see both prices. CSS then reveals exactly one offer block.
 *
 * Assignment is sticky across sessions via a first-party cookie and
 * localStorage. A ?v=a|b override is honoured for QA but is never persisted,
 * and it flags the pageview so QA traffic can be excluded from the readout.
 */
const VARIANT_BOOT = `
(function () {
  var KEY = "dk_variant", SRC_KEY = "dk_source", V = ["a", "b"], YEAR = 31536000;
  var root = document.documentElement;
  root.className = root.className.replace(/\\bno-js\\b/, "js");

  function readCookie(n) {
    var p = ("; " + document.cookie).split("; " + n + "=");
    return p.length === 2 ? decodeURIComponent(p.pop().split(";")[0]) : null;
  }
  function writeCookie(n, v) {
    document.cookie = n + "=" + encodeURIComponent(v) + ";path=/;max-age=" + YEAR +
      ";SameSite=Lax" + (location.protocol === "https:" ? ";Secure" : "");
  }
  function readStore(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function writeStore(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function valid(v) { return V.indexOf(v) !== -1; }

  var qa = false, variant = null;
  var override = (location.search.match(/[?&]v=([ab])\\b/) || [])[1];
  if (override) { variant = override; qa = true; }
  else {
    variant = readCookie(KEY) || readStore(KEY);
    if (!valid(variant)) variant = V[Math.random() < 0.5 ? 0 : 1];
    writeCookie(KEY, variant); writeStore(KEY, variant);
  }
  root.setAttribute("data-variant", variant);

  /* First-touch source, captured once, so a submission weeks later still
     attributes to the channel that produced it. Referrer host only: no query
     strings, no path, nothing that could carry personal data. */
  var source = readStore(SRC_KEY);
  if (!source) {
    var utm = (location.search.match(/[?&]utm_source=([^&]+)/) || [])[1];
    if (utm) source = decodeURIComponent(utm).slice(0, 60);
    else if (document.referrer) {
      try {
        var host = new URL(document.referrer).hostname;
        source = host === location.hostname ? "internal" : host;
      } catch (e) { source = "unknown"; }
    } else source = "direct";
    writeStore(SRC_KEY, source);
  }
  window.DK = { variant: variant, source: source, qa: qa };
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="no-js">
      <body>
        <script dangerouslySetInnerHTML={{ __html: VARIANT_BOOT }} />
        {children}
      </body>
    </html>
  );
}
