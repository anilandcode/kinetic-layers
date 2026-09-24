import type { Metadata } from "next";
import SoftHome from "@/components/v2/soft/SoftHome";

/* Direction A, for comparison with /direction/cinematic. Preview deployments
   and local only — middleware.ts answers 404 on production. */
export const metadata: Metadata = {
  title: "Direction A — Soft studio",
  robots: { index: false, follow: false },
};

export default function SoftDirectionPage() {
  return <SoftHome />;
}
