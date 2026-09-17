import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/kl/PageShell";
import { CONTACT_EMAIL } from "@/lib/kl/site";
import { MotionSection } from "@/components/kl/BenchMotion";

export const metadata: Metadata = { title: "Contact", description: "Contact Kinetic Layers." };

export default function ContactPage() {
  return <PageShell><MotionSection as="section" className="contact-page"><div><span>Contact</span><h1>Bring a useful brief.</h1><p>Questions about an item, a license, a future studio option, or a collaboration all start here.</p></div><div className="contact-options"><a href={`mailto:${CONTACT_EMAIL}?subject=Kinetic%20Layers%20library%20question`}><strong>Library and licensing</strong><span>Ask about an item, its files, or the usage terms attached to it.</span><em>{CONTACT_EMAIL} ↗</em></a><a href={`mailto:${CONTACT_EMAIL}?subject=Kinetic%20Layers%20membership%20question`}><strong>Membership and studio access</strong><span>Ask about Founding Membership, a future team option, or the interest list.</span><em>{CONTACT_EMAIL} ↗</em></a><Link href="/library"><strong>Start with the library</strong><span>Browse the public previews before writing in.</span><em>Browse items →</em></Link></div></MotionSection></PageShell>;
}
