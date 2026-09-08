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
 * This used to have to coexist with an older motion layer that owned the
 * navigation veil and keyed off `a[data-nav]`. That layer was removed once
 * every route had been migrated — it was fading pages to near-black before
 * navigating, which on the warm ground read as a flash. Nothing binds
 * `data-nav` now, and the capture-phase interception it warned about here is
 * gone with it.
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
