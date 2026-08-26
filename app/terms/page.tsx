import type { Metadata } from "next";
import Link from "next/link";
import { Footer, Nav } from "@/components/kiln/Chrome";
import { DraftNote, ProseHero, Terms } from "@/components/kiln/Prose";
import { getViewer } from "@/lib/kiln/viewer";

export const metadata: Metadata = {
  alternates: { canonical: "/terms" },
  title: "Terms",
  description: "The agreement for using Kiln.",
};

/** Terms of use. What the licence page covers for assets, this covers for the service. */
export default async function TermsPage() {
  const viewer = await getViewer();
  const contact = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@example.com";

  const items = [
    {
      h: "What this covers",
      p: (
        <>
          Using the site and the service. What you may do with an asset once you
          have it is a separate document —{" "}
          <Link data-nav href="/license" style={{ color: "var(--sage)" }}>
            the licence
          </Link>
          .
        </>
      ),
    },
    {
      h: "Your account",
      p: "One person per account. Keep your password and your API keys to yourself — a key acts with your plan's permissions, so sharing one is sharing your subscription. You can revoke a key at any time from the account page.",
    },
    {
      h: "What we owe you",
      p: "A working site and the assets your plan covers. We aim to ship new work weekly and to fix anything broken in what is already there. We do not promise uninterrupted availability, and we will say so plainly when something is down rather than quietly.",
    },
    {
      h: "Cancelling",
      p: "Cancel whenever. Access to new drops stops at the end of the period you have paid for. Everything you downloaded stays yours under the licence it came with — cancelling does not reach backwards.",
    },
    {
      h: "Refunds",
      p: "If an asset does not do what its page says it does, tell us and we will refund that period. Requests are read by a person, not a form.",
    },
    {
      h: "Fair use of the service",
      p: "Do not scrape the catalogue wholesale, resell access, or share credentials to avoid paying for seats. Automated use through the documented MCP endpoint with your own key is expected and fine.",
    },
    {
      h: "Ending an account",
      p: "We may close an account that is redistributing assets or abusing the service, and will explain why. You may close yours at any time by asking.",
    },
    {
      h: "Changes",
      p: `These terms may change as the service does. Material changes will be announced by email to account holders before they take effect. Questions: ${contact}.`,
    },
  ];

  return (
    <>
      <a className="skip-link" href="#terms-list">Skip to the terms</a>
      <Nav viewer={viewer} />
      <main>
        <ProseHero
          eyebrow="Terms"
          title="Short, and meant to be read."
          lead="The agreement for using the service. Assets have their own licence."
        />
        <DraftNote contact={contact} />
        <Terms id="terms-list" items={items} />
      </main>
      <Footer />
    </>
  );
}
