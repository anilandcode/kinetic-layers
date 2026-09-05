import type { Metadata } from "next";
import { CONTACT_EMAIL } from "@/lib/kiln/site";
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
  const contact = CONTACT_EMAIL;

  const items = [
    {
      h: "What we store when you have an account",
      p: "Your email address, which plan you are on, what you downloaded and when, and what you saved. That is the account — it is what lets the site show you your own history and decide what you may open.",
    },
    {
      h: "How often you have read or downloaded",
      p: "Every prompt read and file download is counted against a rolling 24-hour allowance, stored as a row with the asset's name and a timestamp. It exists to stop a script draining the catalogue, and it is the same meter your account page reads back to you.",
    },
    {
      h: "What we store when you do not have an account",
      p: "A page view, with the path, a coarse viewport size, and a hashed identifier derived from your request. The hash is salted with a server secret and cannot be reversed into an address. No cookie is set for this. The same hash is what limits how much an anonymous visitor can read.",
    },
    {
      h: "No third-party trackers",
      p: "There is no analytics script, no advertising pixel, and no embedded widget on this site. Fonts are self-hosted. The only requests your browser makes are to us and to the CDN serving preview images.",
    },
    {
      h: "Who else sees it",
      p: "Supabase hosts the database and files. Sanity hosts the catalogue text. Cloudflare serves the preview media. Vercel serves the site. Resend delivers email. Each sees what it needs to do its job, and nothing is sold or shared beyond that.",
    },
    {
      h: "The weekly email",
      p: "The list lives in our own database, not a marketing platform. You are not on it until you click the link in the confirmation email — signing up alone does not subscribe you. Every message carries a one-click unsubscribe, and using it sets you as unsubscribed immediately and permanently: a later click on an old confirmation link will not put you back.",
    },
    {
      h: "If you answered the questions",
      p: "The signup form asks what you do and what is in your way. Those answers are stored separately from the mailing list, are used to decide what to build next, and are not sent anywhere else.",
    },
    {
      h: "Getting it back, or deleted",
      p: `Ask at ${contact} and we will send you what is stored against your account, or delete it. Deleting the account removes the profile, entitlement, download history, saves and the usage meter; it does not retract a file you already downloaded.`,
    },
    {
      h: "Payments",
      p: "There are none. Kiln is free while it is in early access and no checkout is connected, so no card details reach this site at all. If that changes, payment will go through a processor and card details will still never touch this server.",
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
