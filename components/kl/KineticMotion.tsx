"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { sweep, watch } from "@/lib/kl/motion";

/**
 * Mounts the Kinetic Layers motion layer.
 *
 * The work lives in lib/kl/motion.ts; this is only the React seam. The layer is
 * a process-wide singleton — `watch()` is idempotent and is never torn down,
 * because reverting a `from()` tween restores its start state and would leave
 * the page at opacity 0 (HANDOFF.md, trap 6).
 *
 * A pathname change re-sweeps rather than re-initialising: binding is marked
 * per element, so already-bound nodes are skipped and only the new screen's
 * elements are picked up.
 *
 * This coexists with the older KilnMotion, which owns the navigation veil and
 * the sticky bar on unmigrated routes. The two share no attributes — that one
 * keys off `a[data-nav]`, this one off `[data-nav-link]`. Do not put `data-nav`
 * on a Kinetic Layers screen: KilnMotion intercepts it in the capture phase and
 * stops propagation, so a React handler on the same element never fires
 * (trap 4).
 */
export default function KineticMotion() {
  const pathname = usePathname();

  useEffect(() => {
    watch();
  }, []);

  useEffect(() => {
    /* After the new screen has painted, not during the same tick — the sweep
       measures, and measuring an unpainted tree gives ScrollTrigger the wrong
       start positions. */
    const id = window.requestAnimationFrame(() => sweep());
    return () => window.cancelAnimationFrame(id);
  }, [pathname]);

  return null;
}
