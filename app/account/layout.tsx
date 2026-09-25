import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getViewer } from "@/lib/kl/viewer";
import { EARLY_ACCESS } from "@/lib/kl/access";
import { HUES } from "@/lib/v2/gradient";
import Shell from "@/components/v2/Shell";
import PageHero from "@/components/v2/PageHero";
import AccountTabs from "@/components/v2/account/AccountTabs";
import l from "@/components/v2/layout.module.css";
import p from "@/components/v2/Page.module.css";
import a from "@/components/v2/account/Account.module.css";

/**
 * Everything behind the account door.
 *
 * The guard lives here rather than in each page: with four pages, a per-page
 * redirect is four chances to forget one, and forgetting one leaks a
 * signed-out visitor into somebody's downloads. The hero and the tab row are
 * here for the same reason — a tab row each page drew for itself would drift.
 */
export default async function AccountLayout({ children }: { children: ReactNode }) {
  const viewer = await getViewer();
  if (!viewer) redirect("/join?next=/account");

  const renews = viewer.periodEnd
    ? new Date(viewer.periodEnd).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : null;
  const plan = viewer.premium
    ? `Premium${renews ? ` · renews ${renews}` : ""}`
    : EARLY_ACCESS
      ? "Free · early access"
      : "Free plan";

  return (
    <Shell>
      <main className={p.page}>
        <PageHero
          compact
          id="account-title"
          kicker={plan}
          title={viewer.name ? `Hello, ${viewer.name}.` : "Your account."}
          lede={viewer.email}
          hue={HUES.violet}
          second={HUES.cobalt}
        />
        <div className={l.container}>
          <AccountTabs />
          <div className={a.body}>{children}</div>
        </div>
      </main>
    </Shell>
  );
}
