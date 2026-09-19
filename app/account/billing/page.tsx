import type { Metadata } from "next";
import GlassButton from "@/components/kl/GlassButton";
import { getViewer } from "@/lib/kl/viewer";
import { getSettings } from "@/lib/sanity/queries";
import { EARLY_ACCESS } from "@/lib/kl/access";

export const metadata: Metadata = { title: "Billing", robots: { index: false, follow: false } };

export const dynamic = "force-dynamic";

export default async function AccountBilling() {
  const viewer = await getViewer();
  if (!viewer) return null;

  const settings = await getSettings();
  const renews = viewer.periodEnd
    ? new Date(viewer.periodEnd).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : null;

  return (
    <section className="kl-pad kl-account-summary-grid">
      <div data-reveal className="kl-account-panel kl-account-plan-panel">
        <span className="kl-mono kl-account-plan-kicker">
          Subscription
        </span>
        <div className="kl-account-plan-value">
          <span>
            {EARLY_ACCESS ? "Early access" : viewer.premium ? "Premium" : "Free"}
          </span>
          <span className="kl-account-plan-price">
            {EARLY_ACCESS || !viewer.premium ? "$0" : `$${settings.monthlyPrice}/mo`}
          </span>
        </div>
        <p className="kl-account-panel-copy">
          {EARLY_ACCESS
            ? `All ${settings.totalAssets} published bundles and their listed files, free while Kinetic Layers is in early access. Nothing to cancel, and anything you download stays yours.`
            : viewer.premium
              ? `Renews ${renews ?? "automatically"}. Cancel any time and keep every file you downloaded.`
              : `${settings.freeThisMonth} free bundles. Premium opens all ${settings.totalAssets} published bundles and their listed files.`}
        </p>
        {!EARLY_ACCESS && !viewer.premium ? (
          <div className="kl-account-plan-action">
            <GlassButton href="/pricing" premium size="sm">
              Go Premium
            </GlassButton>
          </div>
        ) : null}
      </div>

      <div data-reveal className="kl-account-panel">
        <h2>Invoices</h2>
        {/* Honest: there is no billing yet, so there is nothing to list. */}
        <p className="kl-account-panel-copy">
          No invoices yet. Receipts appear here automatically once a subscription is charged.
        </p>
      </div>
    </section>
  );
}
