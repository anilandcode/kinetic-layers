import type { ReactNode } from "react";
import type { Viewer } from "@/lib/kl/types";
import Header from "./Header";
import Footer from "./Footer";
import Spotlight from "./fx/Spotlight";
import s from "./layout.module.css";

/**
 * The frame every v2 screen renders inside.
 *
 * It lives in app/(site)/layout.tsx, so it is mounted once and survives
 * navigation: only `#main` swaps, and a loading boundary paints inside it
 * rather than repainting the header, footer and canvas on every click.
 *
 * `viewer` is a promise the header resolves on its own, so the frame streams
 * before the session is known — a cold Supabase can take seconds, and the page
 * should not wait on the account slot. With no promise (the root error and
 * not-found boundaries), the slot stays a placeholder.
 *
 * `data-v2` scopes the tokens in styles/kl-foundations.css. `data-look` is
 * always "cinematic" — the one direction, chosen by the owner — and stays as
 * an attribute because component styles key their cinematic rules off it.
 */
export function ShellFrame({ viewer, children }: { viewer?: Promise<Viewer | null>; children: ReactNode }) {
  return (
    <div data-v2 data-look="cinematic" className={s.shell}>
      <a href="#main" className={s.skip}>
        Skip to content
      </a>
      {/* The dotted canvas under every screen, brightening round the pointer. */}
      <Spotlight />
      <Header viewer={viewer} />
      <div id="main" className={s.main} tabIndex={-1}>
        {children}
      </div>
      <Footer />
    </div>
  );
}
