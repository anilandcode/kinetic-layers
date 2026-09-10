import type { ReactNode } from "react";
import Shell from "./Shell";
import SiteHeader from "./SiteHeader";
import Footer from "./Footer";

/**
 * Shell, header, main, footer — for every page that is not one of the five
 * designed screens.
 *
 * Those five each compose their own chrome because each does something
 * different with the hero. Everything else wants the same frame, and repeating
 * it per page is how a header quietly drifts between routes.
 */
export default function PageShell({ children }: { children: ReactNode }) {
  return (
    <Shell>
      <SiteHeader />
      <main data-view>{children}</main>
      <Footer />
    </Shell>
  );
}
