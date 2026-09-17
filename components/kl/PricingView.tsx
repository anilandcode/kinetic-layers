import Link from "next/link";
import SiteHeader from "./SiteHeader";
import Shell from "./Shell";
import Footer from "./Footer";
import GlassButton from "./GlassButton";
import MembershipInterestForm from "./MembershipInterestForm";
import { getAssets } from "@/lib/sanity/queries";
import { getViewer } from "@/lib/kl/viewer";
import { LIMITS } from "@/lib/kl/limits";
import { hasRealPreview } from "@/lib/kl/preview-ready";
import { EARLY_ACCESS } from "@/lib/kl/access";
import { MotionSection } from "./BenchMotion";

type Comparison = Array<[string, Array<[string, string, string]>]>;

function comparison(currentLabel: string): Comparison {
  return [
    ["Library", [
      ["Browse real-preview items", "When published", "Yes"],
      ["Open kits with an account", EARLY_ACCESS ? "Yes" : "Not open", "Yes"],
      ["Verified source files", "When available", "When available"],
    ]],
    ["Membership", [
      ["Commercial use", "Under each listed license", "Under each reviewed license"],
      ["Future verified releases", EARLY_ACCESS ? "Available while early access is open" : "Preview when published", "Included when membership opens"],
      ["Membership price", "No charge today", "$24/month when it opens"],
    ]],
    ["Support", [
      ["Payment details", "Not collected", "Not collected today"],
      ["Launch email", "Newsletter only", "Confirmed membership interest"],
      ["Checkout", "Inactive", "Inactive"],
    ]],
  ].map(([group, rows]) => [group, rows]) as Comparison;
}

const FAQS = [
  ["Do I pay today?", "No. Joining the Founding Membership interest list does not create a subscription, collect payment details, or bill you."],
  ["What will Founding Membership include?", "Verified kits, their available source files and instructions, commercial use under each reviewed license, and future verified releases when they are ready."],
  ["Is this the newsletter?", "No. Membership interest is a separate, confirmation-based list used only for the future membership launch."],
  ["When will it open?", "There is no release date yet. Membership opens only after the kits and their accompanying files have been reviewed."],
];

export default async function PricingView() {
  const [assets, viewer] = await Promise.all([getAssets(), getViewer()]);
  const visible = assets.filter(hasRealPreview).length;
  const currentLabel = EARLY_ACCESS ? "Early access" : "Current access";
  const currentHref = EARLY_ACCESS
    ? viewer ? "/library" : "/join?next=/library"
    : visible > 0 ? "/library" : "/contact";
  const currentAction = EARLY_ACCESS
    ? viewer ? "Browse the library" : "Create a free account"
    : visible > 0 ? "Browse published previews" : "Ask about the first drop";
  const rows = comparison(currentLabel);

  return <Shell>
    <SiteHeader />
    <main data-view className="bench-pricing pricing-page">
      <MotionSection as="section" className="pricing-hero">
        <span>Pricing</span>
        <h1>{EARLY_ACCESS ? "Use the library freely while it grows." : "Founding Membership is being prepared."}</h1>
        <p>
          {EARLY_ACCESS
            ? "Early access is open today. Founding Membership is a future $24/month offer for verified kits and releases that follow."
            : "There is no subscription or checkout today. Browse published previews and join the interest list for the future $24/month offer."}
        </p>
      </MotionSection>

      <MotionSection as="section" className="pricing-plans" aria-label="Plans" delay={0.05}>
        <article className="pricing-plan">
          <span className="pricing-plan-label">{EARLY_ACCESS ? "Free early access" : "Current access"}</span>
          <h2>$0</h2>
          <p className="pricing-plan-unit">{EARLY_ACCESS ? "While early access is open" : "No purchase today"}</p>
          <p>
            {EARLY_ACCESS
              ? "Explore every published kit with an account."
              : "Browse release-ready previews while the first membership library is prepared."}
          </p>
          <GlassButton href={currentHref} pull={5}>{currentAction}</GlassButton>
          <ul>
            <li>{visible > 0 ? `${visible} items with real previews today` : "The first release-ready kits are being prepared"}</li>
            <li>Use each published item under its listed license</li>
            {EARLY_ACCESS
              ? <li>{LIMITS.free.prompt} prompt reads and {LIMITS.free.download} downloads a day</li>
              : <li>Account access and checkout are not open today</li>}
          </ul>
        </article>

        <article className="pricing-plan pricing-plan-featured">
          <div className="pricing-plan-top">
            <span className="pricing-plan-label">Founding Membership</span>
            <span className="pricing-future">Future offer</span>
          </div>
          <h2>$24</h2>
          <p className="pricing-plan-unit">/ month when it opens</p>
          <p>For verified kits and the releases that follow.</p>
          <MembershipInterestForm />
          <ul>
            <li>Verified kits as they become available</li>
            <li>Available source files and setup instructions</li>
            <li>Commercial use under each reviewed license</li>
            <li>No subscription or charge today</li>
          </ul>
        </article>
      </MotionSection>

      <MotionSection as="section" className="pricing-notice">
        <strong>Nothing is being charged today.</strong> Founding Membership is a proposed price, not a current purchase. <Link href="/contact">Questions about a future team or studio option?</Link>
      </MotionSection>

      <MotionSection as="section" className="pricing-compare" aria-labelledby="compare-title">
        <div><span>Compare access</span><h2 id="compare-title">What is available now, and what is planned.</h2></div>
        {rows.map(([group, groupRows]) => <div className="pricing-table" key={group}>
          <div className="pricing-table-head"><strong>{group}</strong><span>{currentLabel}</span><span>Founding Membership</span></div>
          {groupRows.map(([label, current, founding]) => <div className="pricing-table-row" key={label}><span>{label}</span><span>{current}</span><span>{founding}</span></div>)}
        </div>)}
      </MotionSection>

      <MotionSection as="section" className="pricing-faq" aria-labelledby="faq-title">
        <div><span>FAQ</span><h2 id="faq-title">Before you join.</h2></div>
        <div>{FAQS.map(([question, answer], index) => <details key={question} open={index === 0}><summary>{question}<b aria-hidden="true">+</b></summary><p>{answer}</p></details>)}</div>
      </MotionSection>
    </main>
    <Footer />
  </Shell>;
}
