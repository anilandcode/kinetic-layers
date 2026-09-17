import type { Metadata } from "next";
import PricingView from "@/components/kl/PricingView";
import { EARLY_ACCESS } from "@/lib/kl/access";

export function generateMetadata(): Metadata {
  return {
    alternates: { canonical: "/pricing" },
    title: "Pricing",
    description: EARLY_ACCESS
      ? "All available assets are free while Kinetic Layers is in early access. Founding Membership is a proposed future offer."
      : "Founding Membership will open after verified kits are ready. Join the non-binding interest list for launch updates.",
  };
}

export default function Pricing() {
  return <PricingView />;
}
