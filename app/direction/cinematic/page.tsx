import type { Metadata } from "next";
import CinematicHome from "@/components/v2/cinematic/CinematicHome";

/* Direction B, for comparison with /direction/soft. Preview deployments and
   local only — middleware.ts answers 404 on production. */
export const metadata: Metadata = {
  title: "Direction B — Cinematic",
  robots: { index: false, follow: false },
};

export default function CinematicDirectionPage() {
  return <CinematicHome />;
}
