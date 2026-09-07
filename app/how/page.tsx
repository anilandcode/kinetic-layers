import type { Metadata } from "next";
import ProcessView from "@/components/kl/ProcessView";

export const metadata: Metadata = {
  alternates: { canonical: "/how" },
  title: "Process",
  description:
    "Four layers between a brief and the library. Every asset is built for a real client, shipped on a real page, then filed with its source.",
};

export default function How() {
  return <ProcessView />;
}
