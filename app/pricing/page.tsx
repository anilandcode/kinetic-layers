import type { Metadata } from "next";
import { Footer, Nav } from "@/components/kiln/Chrome";
import PricingBody from "@/components/kiln/PricingBody";
import { getSettings } from "@/lib/sanity/queries";
import { getViewer } from "@/lib/kiln/viewer";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Twelve free forever. The other 228 for the price of one stock scene.",
};

export default async function Pricing() {
  const [settings, viewer] = await Promise.all([getSettings(), getViewer()]);

  return (
    <>
      <a className="skip-link" href="#plans">Skip to the plans</a>
      <Nav viewer={viewer} />
      <main>
        <PricingBody settings={settings} viewer={viewer} />
      </main>
      <Footer />
    </>
  );
}
