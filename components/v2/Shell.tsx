import type { ReactNode } from "react";
import { getViewer } from "@/lib/kl/viewer";
import type { Viewer } from "@/lib/kl/types";
import Header from "./Header";
import Footer from "./Footer";
import s from "./layout.module.css";

/**
 * The frame every v2 screen renders inside.
 *
 * `data-v2` is the scope for the tokens in styles/kl-foundations.css, and it
 * is deliberately not `data-kl`: none of the v1 stylesheets can reach inside.
 *
 * Synchronous, so a loading boundary can paint it without waiting on a
 * session — `pending` draws the header's account slot as a placeholder.
 */
export function ShellFrame({
  viewer = null,
  pending = false,
  children,
}: {
  viewer?: Viewer | null;
  pending?: boolean;
  children: ReactNode;
}) {
  return (
    <div data-v2 className={s.shell}>
      <a href="#main" className={s.skip}>
        Skip to content
      </a>
      <Header viewer={viewer} pending={pending} />
      <div id="main" className={s.main} tabIndex={-1}>
        {children}
      </div>
      <Footer />
    </div>
  );
}

/**
 * The frame, with whoever is looking already resolved. getViewer is wrapped
 * in React `cache`, so a page that also asks for it costs no second round trip.
 */
export default async function Shell({ children }: { children: ReactNode }) {
  const viewer = await getViewer();
  return <ShellFrame viewer={viewer}>{children}</ShellFrame>;
}
