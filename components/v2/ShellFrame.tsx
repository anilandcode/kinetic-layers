import type { ReactNode } from "react";
import type { Viewer } from "@/lib/kl/types";
import Header from "./Header";
import Footer from "./Footer";
import Spotlight from "./fx/Spotlight";
import s from "./layout.module.css";

/**
 * The frame every v2 screen renders inside.
 *
 * `data-v2` scopes the tokens in styles/kl-foundations.css. `data-look` is
 * always "cinematic" — the one direction, chosen by the owner — and stays as
 * an attribute because component styles key their cinematic rules off it.
 *
 * Synchronous, so a loading boundary or the error boundary can paint it
 * without waiting on a session — `pending` draws the header's account slot as
 * a placeholder.
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
    <div data-v2 data-look="cinematic" className={s.shell}>
      <a href="#main" className={s.skip}>
        Skip to content
      </a>
      {/* The dotted canvas under every screen, brightening round the pointer. */}
      <Spotlight />
      <Header viewer={viewer} pending={pending} />
      <div id="main" className={s.main} tabIndex={-1}>
        {children}
      </div>
      <Footer />
    </div>
  );
}
