import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/Wordmark";

export const metadata: Metadata = {
  title: "Request received — Direction Kit",
  robots: { index: false, follow: false },
};

export default function Thanks() {
  return (
    <>
      <SiteHeader />
      <main className="band">
        <div className="shell">
          <p className="eyebrow">Request received</p>
          <h1 className="display" style={{ marginTop: "var(--sp-4)", maxWidth: "18ch" }}>
            Thank you. That is genuinely useful.
          </h1>

          <div className="prose" style={{ marginTop: "var(--sp-5)" }}>
            <p>
              You are on the list for the founding collection. Nothing has been charged and
              no payment details were collected&mdash;there is nothing to cancel and
              nothing owed.
            </p>
            <p>
              <strong>What happens next:</strong>
            </p>
            <ul className="includes" style={{ marginTop: "var(--sp-4)" }}>
              <li>If enough people want this, we build the twelve layers and you hear first.</li>
              <li>If not enough people want it, we will tell you that too, and why.</li>
              <li>If you offered a conversation, expect a short note proposing two times.</li>
            </ul>
            <p>Either way you will hear something. A list you never hear from is just a list.</p>
          </div>

          <div className="cta-row" style={{ marginTop: "var(--sp-7)" }}>
            <Link className="btn btn--secondary" href="/#directions">
              Look at the three directions again
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
