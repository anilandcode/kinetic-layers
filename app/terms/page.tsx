import type { Metadata } from "next";
import { CONTACT_EMAIL } from "@/lib/kl/site";
import Link from "next/link";
import PageShell from "@/components/kl/PageShell";
import { DraftNote, ProseHero, Terms } from "@/components/kl/Prose";
import { getViewer } from "@/lib/kl/viewer";

export const metadata: Metadata = {
  alternates: { canonical: "/terms" },
  title: "Terms",
  description: "The agreement for using Kinetic Layers.",
};

/** Terms of use. What the licence page covers for assets, this covers for the service. */
export default async function TermsPage() {
  const viewer = await getViewer();
  const contact = CONTACT_EMAIL;

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
      p: "One person per account. Keep your password and your API keys to yourself — a key acts with your account's permissions, so sharing one is sharing your access. You can revoke a key at any time from the account page.",
    },
    {
      h: "It is free right now",
      p: "Kinetic Layers is in early access. An account opens the whole catalogue and every source file at no cost, and there is no checkout to go through. This is not a promotion with a countdown — it is simply where the product is.",
    },
    {
      h: "It will not be free forever",
      p: "At some point access becomes paid. We will say so by email to account holders before it happens, never retroactively, and the pricing page already states what it is expected to cost so it is not a surprise. Anything you downloaded before that stays yours under the licence it came with.",
    },
    {
      h: "What we owe you",
      p: "A working site and the assets your account covers. We aim to ship new work weekly and to fix anything broken in what is already there. We do not promise uninterrupted availability, and we will say so plainly when something is down rather than quietly.",
    },
    {
      h: "Daily allowances",
      p: "Reading prompts and downloading files are capped per day. The cap is set well above what a person doing real work reaches, and exists only to stop an automated loop draining the catalogue. Hitting it tells you when it resets.",
    },
    {
      h: "Fair use of the service",
      p: "Do not scrape the catalogue wholesale, redistribute the assets, or share credentials to hand your access to others. Automated use through the documented MCP endpoint with your own key is expected and fine.",
    },
    {
      h: "Ending an account",
      p: "We may close an account that is redistributing assets or abusing the service, and will explain why. You may close yours at any time by asking.",
    },
    {
      h: "Changes",
      p: `These terms may change as the service does. Material changes — including the end of free access — will be announced by email to account holders before they take effect. Questions: ${contact}.`,
    },
  ];

  return (
    <PageShell>
        <ProseHero
          eyebrow="Terms"
          title="Short, and meant to be read."
          lead="The agreement for using the service, while it is free and after. Assets have their own licence."
        />
        <DraftNote contact={contact} />
        <Terms id="terms-list" items={items} />
      </PageShell>
  );
}
