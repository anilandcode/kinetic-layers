import type { Metadata } from "next";
import PricingView from "@/components/kl/PricingView";
import { getSettings } from "@/lib/sanity/queries";
import { EARLY_ACCESS } from "@/lib/kl/access";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    alternates: { canonical: "/pricing" },
    title: "Pricing",
    description: EARLY_ACCESS
      ? `All ${s.totalAssets} assets are free while the library is in early access.`
      : `${s.freeThisMonth} free forever. The whole library for $${s.monthlyPrice} a month.`,
  };
}

export default function Pricing() {
  return <PricingView />;
}
