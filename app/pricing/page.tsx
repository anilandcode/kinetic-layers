import type { Metadata } from "next";
import { Footer, Nav } from "@/components/kiln/Chrome";
import PricingBody from "@/components/kiln/PricingBody";
import { getSettings } from "@/lib/sanity/queries";
import { getViewer } from "@/lib/kiln/viewer";
import { checkoutConfigured } from "@/lib/kiln/stripe";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    alternates: { canonical: "/pricing" },
    title: "Pricing",
    description: `${s.freeThisMonth} free forever. The rest for $${s.monthlyPrice} a month.`,
  };
}

export default async function Pricing() {
  const [settings, viewer] = await Promise.all([getSettings(), getViewer()]);

  return (
    <>
      <a className="skip-link" href="#plans">Skip to the plans</a>
      <Nav viewer={viewer} />
      <main>
        <PricingBody settings={settings} viewer={viewer} checkoutReady={checkoutConfigured()} />
      </main>
      <Footer />
    </>
  );
}
