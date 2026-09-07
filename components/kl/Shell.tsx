import type { ReactNode } from "react";
import KineticMotion from "./KineticMotion";

/**
 * The Kinetic Layers page shell.
 *
 * `data-kl` is the opt-in: the palette and every component style are scoped to
 * it, so a screen that does not render inside this shell keeps the old
 * vocabulary and cannot be restyled by accident. See styles/kl-tokens.css.
 *
 * The progress hairline lives here rather than in the header because it tracks
 * the document, not the bar, and must sit above everything.
 */
export default function Shell({ children }: { children: ReactNode }) {
  return (
    <div data-kl className="kl-shell">
      <KineticMotion />
      <div className="kl-progress-track" aria-hidden="true">
        <div className="kl-progress" data-progress />
      </div>
      {children}
    </div>
  );
}
