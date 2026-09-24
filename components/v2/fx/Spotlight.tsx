"use client";

import { useRef } from "react";
import { gsap, MOTION_OK, useGSAP } from "../motion";
import s from "./fx.module.css";

/**
 * The page's dotted canvas — the node editors' dot grid, across the whole
 * screen — with a spotlight: dots near the pointer brighten, as if a lamp
 * moved over the table. Two fixed layers, one masked by a radial gradient at
 * `--sx` / `--sy`, which GSAP eases after the pointer. Decorative.
 */
export default function Spotlight() {
  const ref = useRef<HTMLDivElement | null>(null);
  useGSAP(() => {
    const el = ref.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add(`${MOTION_OK} and (hover: hover) and (pointer: fine)`, () => {
      const x = gsap.quickTo(el, "--sx", { duration: 0.8, ease: "power3.out" });
      const y = gsap.quickTo(el, "--sy", { duration: 0.8, ease: "power3.out" });
      const move = (e: PointerEvent) => {
        x(e.clientX);
        y(e.clientY);
      };
      window.addEventListener("pointermove", move, { passive: true });
      return () => window.removeEventListener("pointermove", move);
    });
    return () => mm.revert();
  });
  return (
    <div ref={ref} className={s.spotlight} aria-hidden="true">
      <span className={s.dotsBase} />
      <span className={s.dotsLit} />
    </div>
  );
}
