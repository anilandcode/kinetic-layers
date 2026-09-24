import type { Metadata } from "next";
import CleanHome from "@/components/v2/cinematic/CleanHome";

/* The cinematic direction's clean take — the first version the owner liked,
   refined — for comparison with `/`. Preview deployments and local only;
   middleware.ts answers 404 on production. */
export const metadata: Metadata = {
  title: "Direction B — Cinematic, clean",
  robots: { index: false, follow: false },
};

export default function CinematicDirectionPage() {
  return <CleanHome />;
}
