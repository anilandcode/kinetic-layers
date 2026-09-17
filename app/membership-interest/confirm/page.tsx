import type { Metadata } from "next";
import NoticePage from "@/components/kl/NoticePage";
import { confirmMembershipInterest } from "@/lib/kl/membership-interest";

export const metadata: Metadata = { title: "Confirm membership interest", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function ConfirmMembershipInterest({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const outcome = await confirmMembershipInterest(token ?? "");

  if (outcome === "done" || outcome === "already") {
    return (
      <NoticePage
        eyebrow="Founding Membership"
        title={outcome === "done" ? "Your interest is confirmed." : "Your interest was already confirmed."}
        body="We will email you when Founding Membership opens. This confirmation does not create a subscription or charge you."
        action={{ href: "/pricing", label: "Back to pricing" }}
      />
    );
  }

  return (
    <NoticePage
      eyebrow="Not confirmed"
      title="That link did not work."
      body={
        outcome === "error"
          ? "Something went wrong at our end. Please try the link again shortly."
          : "It may have already been used or is incomplete. You can submit the interest form again from pricing."
      }
      action={{ href: "/pricing", label: "Back to pricing" }}
    />
  );
}
