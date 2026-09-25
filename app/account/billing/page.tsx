import type { Metadata } from "next";
import { getViewer } from "@/lib/kl/viewer";
import { EARLY_ACCESS } from "@/lib/kl/access";
import { LIMITS, tierOf } from "@/lib/kl/limits";
import { HUES } from "@/lib/v2/gradient";
import Gradient from "@/components/v2/Gradient";
import InterestForm from "@/components/v2/InterestForm";
import { DotNumber } from "@/components/v2/DotMatrix";
import { ButtonLink } from "@/components/v2/Button";
import p from "@/components/v2/Page.module.css";
import a from "@/components/v2/account/Account.module.css";
import s from "@/components/v2/Pricing.module.css";

export const metadata: Metadata = { title: "Plan", robots: { index: false, follow: false } };

export const dynamic = "force-dynamic";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The plan this account is on, and the one being shaped. There is no billing
 * in the product, so there are no invoices to list — the page says so rather
 * than drawing an empty table.
 */
export default async function AccountPlan() {
  const viewer = await getViewer();
  if (!viewer) return null;

  const tier = tierOf(viewer);
  const allowance = LIMITS[tier];
  const renews = viewer.periodEnd
    ? new Date(viewer.periodEnd).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : null;

  return (
    <div className={a.split}>
      <Gradient as="section" hue={HUES.ember} second={HUES.rose} className={s.plan} aria-labelledby="plan-title">
        <div className={s.planHead}>
          <h2 id="plan-title" className={s.planLabel}>
            {viewer.premium ? "Premium" : EARLY_ACCESS ? "Early access" : "Free"}
          </h2>
          <span className={s.planChip}>Your plan</span>
        </div>
        <p className={s.price}>
          <span>{viewer.premium ? "Member" : "$0"}</span>
          <small>
            {viewer.premium
              ? `Premium${renews ? `, renews ${renews}` : ""}`
              : EARLY_ACCESS
                ? "while early access is open"
                : "free with your account"}
          </small>
        </p>
        <dl className={s.allow}>
          <div>
            <dt>Prompt reads a day</dt>
            <dd>
              <DotNumber value={pad(allowance.prompt)} label={`${allowance.prompt} prompt reads a day`} dot={7} />
            </dd>
          </div>
          <div>
            <dt>Downloads a day</dt>
            <dd>
              <DotNumber value={pad(allowance.download)} label={`${allowance.download} downloads a day`} dot={7} />
            </dd>
          </div>
        </dl>
        <p className={s.planNote}>
          Nothing to cancel, and anything you download stays yours. Allowances are a rolling 24 hours.
        </p>
        <div className={s.planAction}>
          <ButtonLink href="/pricing" variant="secondary" size="lg" icon="arrow" className={s.wide}>
            Compare plans
          </ButtonLink>
        </div>
      </Gradient>

      <div className={a.panelStack}>
        <section className={`${p.panel} ${a.panelStack}`} aria-labelledby="founding-title">
          <h2 id="founding-title" className={p.panelTitle}>
            Founding Membership
          </h2>
          <p className={p.panelNote}>
            A proposed $24 a month for verified kits and the releases that follow, with {LIMITS.premium.prompt} prompt
            reads and {LIMITS.premium.download} downloads a day. It is not on sale — join the list to hear when it
            opens.
          </p>
          <InterestForm />
        </section>
        <section className={`${p.panel} ${a.panelStack}`} aria-labelledby="invoices-title">
          <h2 id="invoices-title" className={p.panelTitle}>
            Invoices
          </h2>
          <p className={p.panelNote}>None. Nothing has been charged, and no payment details are held.</p>
        </section>
      </div>
    </div>
  );
}
