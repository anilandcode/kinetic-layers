import type { Metadata } from "next";
import NoticePage from "@/components/kl/NoticePage";
import { unsubscribeByToken } from "@/lib/kl/newsletter";

export const metadata: Metadata = { title: "Unsubscribed", robots: { index: false } };
export const dynamic = "force-dynamic";

/**
 * One click, no confirmation step.
 *
 * Asking "are you sure?" after someone has already decided is a dark pattern,
 * and /privacy promises this plainly: "Every one of those emails can
 * unsubscribe you, and doing so removes you from the list."
 */
export default async function Unsubscribe({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const outcome = await unsubscribeByToken(token ?? "");

  if (outcome === "done" || outcome === "already") {
    return (
      <NoticePage
        eyebrow="Unsubscribed"
        title={outcome === "done" ? "Done — you're off the list." : "You were already off the list."}
        body="No more weekly emails. Your account, if you have one, is untouched and everything you downloaded is still yours."
        action={{ href: "/library", label: "Browse the library" }}
      />
    );
  }

  return (
    <NoticePage
      eyebrow="Nothing to do"
      title="That link did not match anything."
      body="It may already have been used. If you are still receiving emails, reply to one and we will take you off by hand."
      action={{ href: "/library", label: "Browse the library" }}
    />
  );
}
