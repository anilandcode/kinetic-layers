"use client";

import { useRef, type RefObject } from "react";
import { gsap } from "gsap";
import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

/**
 * GSAP, registered once for every v2 client component.
 *
 * Interface motion follows DESIGN-REBUILD-SPEC §10 in spirit — one easing
 * family, short durations — but GSAP does the work now: Flip for the grid and
 * the quick view, ScrollTrigger for below-the-fold reveals, quickTo for the
 * pointer-following glow. All of it is gated on prefers-reduced-motion
 * through gsap.matchMedia, and nothing is ever hidden before hydration: an
 * element is only moved from its visible state by a tween that is already
 * running.
 */
if (typeof window !== "undefined") gsap.registerPlugin(useGSAP, Flip, ScrollTrigger);

export { gsap, Flip, ScrollTrigger, useGSAP };

export const EASE = "power3.out";
export const MOTION_OK = "(prefers-reduced-motion: no-preference)";

/**
 * The gradient highlight follows the pointer across a card: GSAP eases
 * `--mx` / `--my` (0–100) on the element, which Gradient.module.css reads.
 * Pointer only — touch has no hover, and the highlight rests where the CSS
 * puts it.
 */
export function usePointerGlow<T extends HTMLElement>(): RefObject<T | null> {
  const ref = useRef<T | null>(null);
  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(`${MOTION_OK} and (hover: hover) and (pointer: fine)`, () => {
        const x = gsap.quickTo(el, "--mx", { duration: 0.6, ease: EASE });
        const y = gsap.quickTo(el, "--my", { duration: 0.6, ease: EASE });
        const move = (event: PointerEvent) => {
          const r = el.getBoundingClientRect();
          x(((event.clientX - r.left) / r.width) * 100);
          y(((event.clientY - r.top) / r.height) * 100);
        };
        const leave = () => {
          x(72);
          y(18);
        };
        el.addEventListener("pointermove", move);
        el.addEventListener("pointerleave", leave);
        return () => {
          el.removeEventListener("pointermove", move);
          el.removeEventListener("pointerleave", leave);
        };
      });
      return () => mm.revert();
    },
    { scope: ref }
  );
  return ref;
}
