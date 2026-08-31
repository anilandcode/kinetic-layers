import type { Metadata } from "next";
import NoticePage from "@/components/kiln/NoticePage";
import { confirmByToken } from "@/lib/kiln/newsletter";

/* Nothing here should be indexed or cached: it is a one-time action addressed
   by a token. */
export const metadata: Metadata = { title: "Confirm your subscription", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Confirm({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const outcome = await confirmByToken(token ?? "");

  if (outcome === "done" || outcome === "already") {
    return (
      <NoticePage
        eyebrow="Subscribed"
        title={outcome === "done" ? "You're on the list." : "You were already on the list."}
        body="One email a week — the new assets and what they were built for. Every one of them can unsubscribe you."
        action={{ href: "/library", label: "Browse the library" }}
      />
    );
  }

  return (
    <NoticePage
      eyebrow="Not confirmed"
      title="That link did not work."
      body={
        outcome === "error"
          ? "Something went wrong at our end. Try the link again in a moment."
          : "It may have already been used, or the address may have since unsubscribed. You can sign up again from the library."
      }
      action={{ href: "/library", label: "Browse the library" }}
    />
  );
}
