import type { Metadata } from "next";
import { Footer, Nav } from "@/components/kiln/Chrome";
import { DraftNote, ProseHero, Terms } from "@/components/kiln/Prose";
import { getViewer } from "@/lib/kiln/viewer";

export const metadata: Metadata = {
  alternates: { canonical: "/privacy" },
  title: "Privacy",
  description: "What this site records, and what it does not.",
};

/**
 * Privacy.
 *
 * Written from what the code actually does rather than from a template: the
 * events table stores a hashed visitor id and no cookie, downloads record a
 * slug and a filename, and there is no third-party analytics because there is
 * no third-party script on the site at all. Anything claimed here should be
 * checkable in the repo.
 */
export default async function Privacy() {
  const viewer = await getViewer();
  const contact = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@example.com";

  const items = [
    {
      h: "What we store when you have an account",
      p: "Your email address, which plan you are on, what you downloaded and when, and what you saved. That is the account — it is what lets the site show you your own history and decide what you may open.",
    },
    {
      h: "What we store when you do not",
      p: "A page view, with the path, a coarse viewport size, and a hashed identifier derived from your request. The hash is salted with a server secret and cannot be reversed into an address. No cookie is set for this.",
    },
    {
      h: "No third-party trackers",
      p: "There is no analytics script, no advertising pixel, and no embedded widget on this site. Fonts are self-hosted. The only requests your browser makes are to us and to the CDN serving preview images.",
    },
    {
      h: "Who else sees it",
      p: "Supabase hosts the database and files. Sanity hosts the catalogue text. Cloudflare serves the preview media. Vercel serves the site. Each sees what it needs to do its job and nothing is sold or shared beyond that.",
    },
    {
      h: "Email",
      p: "If you subscribe to the Thursday email, your address goes to the mailing provider for that purpose only. Every one of those emails can unsubscribe you, and doing so removes you from the list.",
    },
    {
      h: "Getting it back, or deleted",
      p: `Ask at ${contact} and we will send you what is stored against your account, or delete it. Deleting the account removes the profile, entitlement, download history and saves; it does not retract a file you already downloaded.`,
    },
    {
      h: "Payments",
      p: "There are none yet — checkout is not connected. When it is, card details will go to the payment processor and never touch this server.",
    },
  ];

  return (
    <>
      <a className="skip-link" href="#privacy">Skip to the detail</a>
      <Nav viewer={viewer} />
      <main>
        <ProseHero
          eyebrow="Privacy"
          title="We keep what runs the site, and nothing else."
          lead="No trackers, no third-party scripts, no selling anything on. The specifics are below."
        />
        <DraftNote contact={contact} />
        <Terms id="privacy" items={items} />
      </main>
      <Footer />
    </>
  );
}
