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
import { MotionSection } from "./BenchMotion";

const COMPARISON: Array<[string, Array<[string, string, string]>]> = [
  ["Library", [["Browse real-preview items", "Yes", "Yes"], ["Open items with an account", "Yes", "Yes"], ["Verified source files", "When available", "When available"]]],
  ["Membership", [["Commercial use", "Under each listed license", "Under each reviewed license"], ["Future verified releases", "Available to browse", "Included when membership opens"], ["Membership price", "Free during early access", "$24/month when it opens"]]],
  ["Support", [["Payment details", "Not collected", "Not collected today"], ["Launch email", "Newsletter only", "Confirmed membership interest"], ["Checkout", "Inactive", "Inactive"]]],
];

const FAQS = [
  ["Do I pay today?", "No. Early access is free. Joining the Founding Membership interest list does not create a subscription, collect payment details, or bill you."],
  ["What will Founding Membership include?", "Verified kits, their available source files and instructions, commercial use under each reviewed license, and future verified releases when they are ready."],
  ["Is this the newsletter?", "No. Membership interest is a separate, confirmation-based list used only for the future membership launch."],
  ["When will it open?", "There is no release date yet. Membership opens only after the kits and their accompanying files have been reviewed."],
];

export default async function PricingView() {
  const [assets, viewer] = await Promise.all([getAssets(), getViewer()]);
  const visible = assets.filter(hasRealPreview).length;
  return <Shell>
    <SiteHeader />
    <main data-view className="bench-pricing pricing-page">
      <MotionSection as="section" className="pricing-hero"><span>Pricing</span><h1>Use the library freely while it grows.</h1><p>Early access is open today. Founding Membership is a future $24/month offer for verified kits and releases that follow.</p></MotionSection>
      <MotionSection as="section" className="pricing-plans" aria-label="Plans" delay={0.05}>
        <article className="pricing-plan"><span className="pricing-plan-label">Free early access</span><h2>$0</h2><p className="pricing-plan-unit">While early access is open</p><p>Explore the current library with an account.</p><GlassButton href={viewer ? "/library" : "/join?next=/library"} pull={5}>{viewer ? "Browse the library" : "Create a free account"}</GlassButton><ul><li>{visible} items with real previews today</li><li>Use each item under its listed license</li><li>{LIMITS.free.prompt} prompt reads and {LIMITS.free.download} downloads a day</li></ul></article>
        <article className="pricing-plan pricing-plan-featured"><div className="pricing-plan-top"><span className="pricing-plan-label">Founding Membership</span><span className="pricing-future">Future offer</span></div><h2>$24</h2><p className="pricing-plan-unit">/ month when it opens</p><p>For verified kits and the releases that follow.</p><MembershipInterestForm /><ul><li>Verified kits as they become available</li><li>Available source files and setup instructions</li><li>Commercial use under each reviewed license</li><li>No subscription or charge today</li></ul></article>
      </MotionSection>
      <MotionSection as="section" className="pricing-notice"><strong>Nothing is being charged today.</strong> Founding Membership is a proposed price, not a current purchase. <Link href="/contact">Questions about a future team or studio option?</Link></MotionSection>
      <MotionSection as="section" className="pricing-compare" aria-labelledby="compare-title"><div><span>Compare access</span><h2 id="compare-title">What is available now, and what is planned.</h2></div>{COMPARISON.map(([group, rows]) => <div className="pricing-table" key={group}><div className="pricing-table-head"><strong>{group}</strong><span>Early access</span><span>Founding Membership</span></div>{rows.map(([label, free, founding]) => <div className="pricing-table-row" key={label}><span>{label}</span><span>{free}</span><span>{founding}</span></div>)}</div>)}</MotionSection>
      <MotionSection as="section" className="pricing-faq" aria-labelledby="faq-title"><div><span>FAQ</span><h2 id="faq-title">Before you join.</h2></div><div>{FAQS.map(([question, answer], index) => <details key={question} open={index === 0}><summary>{question}<b aria-hidden="true">+</b></summary><p>{answer}</p></details>)}</div></MotionSection>
    </main>
    <Footer />
  </Shell>;
}
