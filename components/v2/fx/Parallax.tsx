"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { gsap, MOTION_OK, useGSAP } from "../motion";

/**
 * Drifts its child a few pixels against the pointer, so layered glass reads
 * as layers. `depth` is the travel at the edge of the viewport, in px — keep
 * it small; this is depth, not motion. Never tilts.
 */
export default function Parallax({
  depth = 10,
  className,
  style,
  children,
}: {
  depth?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  useGSAP(() => {
    const el = ref.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add(`${MOTION_OK} and (hover: hover) and (pointer: fine)`, () => {
      const x = gsap.quickTo(el, "x", { duration: 1.1, ease: "power3.out" });
      const y = gsap.quickTo(el, "y", { duration: 1.1, ease: "power3.out" });
      const move = (e: PointerEvent) => {
        x(((e.clientX / window.innerWidth) * 2 - 1) * -depth);
        y(((e.clientY / window.innerHeight) * 2 - 1) * -depth * 0.6);
      };
      window.addEventListener("pointermove", move, { passive: true });
      return () => window.removeEventListener("pointermove", move);
    });
    return () => mm.revert();
  });
  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
