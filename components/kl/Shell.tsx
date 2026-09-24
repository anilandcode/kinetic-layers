import type { ReactNode } from "react";

/**
 * The Kinetic Layers page shell.
 *
 * `data-kl` is the opt-in: the palette and every component style are scoped to
 * it, so a screen that does not render inside this shell keeps the old
 * vocabulary and cannot be restyled by accident. See styles/kl-tokens.css.
 *
 * It used to mount KineticMotion, the GSAP runner, and a scroll-progress
 * hairline that only that runner ever moved. The runner had been reduced to
 * `return null` and bench.css hid the hairline with `display: none`, so both
 * went with lib/kl/motion.ts. Interface motion is Framer Motion
 * (components/kl/BenchMotion.tsx).
 */
export default function Shell({ children }: { children: ReactNode }) {
  return (
    <div data-kl className="kl-shell">
      {children}
    </div>
  );
}
