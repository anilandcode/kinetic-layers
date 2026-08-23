import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/Wordmark";

export const metadata: Metadata = {
  title: "What we keep — Direction Kit",
  robots: { index: false, follow: false },
};

const h2 = { fontSize: "var(--step-2)" } as const;

export default function Privacy() {
  return (
    <>
      <SiteHeader />
      <main className="band">
        <div className="shell">
          <p className="eyebrow">Privacy</p>
          <h1 className="display" style={{ marginTop: "var(--sp-4)", maxWidth: "20ch" }}>
            What we keep, and what we do not.
          </h1>

          <div className="prose" style={{ marginTop: "var(--sp-6)" }}>
            <h2 className="display" style={h2}>
              If you request an invitation
            </h2>
            <p>
              We store what you typed into the form: your email address, how you work, how
              many client sites you shipped last year, which direction you would open
              first, anything you wrote about what would stop you using this, and whether
              you offered a conversation. We also store which price variant you saw and a
              coarse source label such as <em>direct</em> or a referring site&rsquo;s
              hostname.
            </p>
            <p>
              We use it for one thing: deciding whether to build the collection. If we
              contact you about that decision, that is a message about your request, not
              marketing.
            </p>

            <h2 className="display" style={h2}>
              Marketing email is separate
            </h2>
            <p>
              The consent box on the form is optional and unticked. Leaving it unticked
              does not affect your request. If you tick it, you can stop the email at any
              time and we will not ask why.
            </p>

            <h2 className="display" style={h2}>
              If you just visit
            </h2>
            <p>
              We record page views, which direction cards get opened, which buttons get
              clicked, and whether a form was started. Each record carries the price
              variant, a coarse source label, the page path and the viewport size. No
              third-party analytics script runs on this site, and nothing here is used to
              build a profile of you.
            </p>

            <h2 className="display" style={h2}>
              Cookies
            </h2>
            <p>
              One, called <code>dk_variant</code>. It remembers which of the two prices you
              were shown so the page stays consistent if you come back. There are no
              advertising, tracking or third-party cookies.
            </p>

            <h2 className="display" style={h2}>
              Where it lives, and for how long
            </h2>
            <p>
              Records are held in a Supabase Postgres database in the US, reachable only by
              this site&rsquo;s server. If an email provider is connected later, addresses
              given with consent go there too, and this page will say which one before that
              happens. We delete everything once the validation decision is made and any
              resulting list is set up.
            </p>

            <h2 className="display" style={h2}>
              Research notes
            </h2>
            <p>
              If we speak, notes go into the research summary without your name or your
              employer&rsquo;s, unless you tell us in writing that attribution is fine.
            </p>

            <h2 className="display" style={h2}>
              Removing yourself
            </h2>
            <p>
              Email the address in your confirmation and ask. We will delete your record
              and confirm that it is gone. No form, no retention offer.
            </p>
          </div>

          <div className="cta-row" style={{ marginTop: "var(--sp-7)" }}>
            <Link className="btn btn--secondary" href="/">
              Back to the collection
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
