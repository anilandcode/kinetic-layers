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
    <section
      className="kl-pad"
      style={{ paddingBlock: 20, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(380px,100%),1fr))", gap: 12, alignItems: "start" }}
    >
      <div
        data-reveal
        style={{
          borderRadius: 10,
          border: "1px solid var(--amber-line)",
          background: "radial-gradient(120% 90% at 85% 0%, var(--amber-bg), transparent 62%), var(--board)",
          padding: 26,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <span className="kl-mono" style={{ fontSize: 10, letterSpacing: 0, color: "var(--amber)" }}>
          Subscription
        </span>
        <div style={{ display: "flex", alignItems: "baseline", gap: 9, flexWrap: "wrap" }}>
          <span style={{ fontSize: 34, fontWeight: 600, letterSpacing: "-0.03em" }}>
            {EARLY_ACCESS ? "Early access" : viewer.premium ? "Premium" : "Free"}
          </span>
          <span style={{ fontSize: 15, color: "var(--muted)" }}>
            {EARLY_ACCESS || !viewer.premium ? "$0" : `$${settings.monthlyPrice}/mo`}
          </span>
        </div>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--muted)" }}>
          {EARLY_ACCESS
            ? `All ${settings.totalAssets} assets and every source file, free while Kinetic Layers is in early access. Nothing to cancel, and anything you download stays yours.`
            : viewer.premium
              ? `Renews ${renews ?? "automatically"}. Cancel any time and keep every file you downloaded.`
              : `${settings.freeThisMonth} free assets. Premium opens all ${settings.totalAssets} and every source file.`}
        </p>
        {!EARLY_ACCESS && !viewer.premium ? (
          <div style={{ marginTop: 4 }}>
            <GlassButton href="/pricing" premium size="sm">
              Go Premium
            </GlassButton>
          </div>
        ) : null}
      </div>

      <div data-reveal style={{ borderRadius: 10, border: "1px solid var(--line)", background: "var(--pane)", padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600 }}>Invoices</h2>
        {/* Honest: there is no billing yet, so there is nothing to list. */}
        <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--muted)" }}>
          No invoices yet. Receipts appear here automatically once a subscription is charged.
        </p>
      </div>
    </section>
  );
}
