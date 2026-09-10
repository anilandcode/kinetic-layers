import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import PageShell from "@/components/kl/PageShell";
import AccountTabs from "@/components/kl/AccountTabs";
import { getViewer } from "@/lib/kl/viewer";

/**
 * Everything behind the account door.
 *
 * The guard lives here rather than in each page. It used to sit in
 * app/account/page.tsx, which was fine while there was one page; with four, a
 * per-page redirect is four chances to forget one, and forgetting one leaks a
 * signed-out visitor into somebody's downloads.
 *
 * The shell and the section header are here for the same reason: a tab row that
 * each page rendered for itself would drift.
 */
export default async function AccountLayout({ children }: { children: ReactNode }) {
  const viewer = await getViewer();
  if (!viewer) redirect("/join?next=/account");

  const renews = viewer.periodEnd
    ? new Date(viewer.periodEnd).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : null;

  return (
    <PageShell>
      <section className="kl-pad" style={{ paddingBlock: "64px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div data-hero style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <span className="kl-mono" style={{ fontSize: 11, letterSpacing: "0.16em", color: "var(--amber)" }}>
            {viewer.premium ? `Premium${renews ? ` · renews ${renews}` : ""}` : "Free plan"}
          </span>
          <h1 className="kl-prose-h1">
            {viewer.name ? `Hello, ${viewer.name}.` : "Your account."}
          </h1>
        </div>
        <AccountTabs />
      </section>

      {children}
    </PageShell>
  );
}
