import type { ReactNode } from "react";
import { getViewer } from "@/lib/kl/viewer";
import type { Viewer } from "@/lib/kl/types";
import Header from "./Header";
import Footer from "./Footer";
import s from "./layout.module.css";

/**
 * Which of the two directions a screen is drawn in. Each is a whole design
 * system — docs/directions/soft/DESIGN.md and docs/directions/cinematic/DESIGN.md —
 * compared side by side until the owner picks one.
 */
export type Look = "soft" | "cinematic";

/**
 * The frame every v2 screen renders inside.
 *
 * `data-v2` scopes the tokens in styles/kl-foundations.css (and is
 * deliberately not `data-kl`, so no v1 stylesheet reaches in). `data-look`
 * picks the direction.
 *
 * Synchronous, so a loading boundary can paint it without waiting on a
 * session — `pending` draws the header's account slot as a placeholder.
 */
export function ShellFrame({
  viewer = null,
  pending = false,
  look = "soft",
  children,
}: {
  viewer?: Viewer | null;
  pending?: boolean;
  look?: Look;
  children: ReactNode;
}) {
  return (
    <div data-v2 data-look={look} className={s.shell}>
      <a href="#main" className={s.skip}>
        Skip to content
      </a>
      <Header viewer={viewer} pending={pending} look={look} />
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
export default async function Shell({ children, look = "soft" }: { children: ReactNode; look?: Look }) {
  const viewer = await getViewer();
  return (
    <ShellFrame viewer={viewer} look={look}>
      {children}
    </ShellFrame>
  );
}
