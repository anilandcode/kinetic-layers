import type { Metadata } from "next";
import WorkbenchHome from "@/components/v2/cinematic/WorkbenchHome";

/* The cinematic direction's second take — Home as a working node editor of
   the kits — for comparison with `/`. Preview deployments and local only;
   middleware.ts answers 404 on production. */
export const metadata: Metadata = {
  title: "Direction B2 — Cinematic workbench",
  robots: { index: false, follow: false },
};

export default function CinematicDirectionPage() {
  return <WorkbenchHome />;
}
