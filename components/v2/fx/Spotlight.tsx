"use client";

import { useRef } from "react";
import { gsap, MOTION_OK, useGSAP } from "../motion";
import s from "./fx.module.css";

const R = 260;
const PITCH = 22;
const mod = (v: number) => ((v % PITCH) + PITCH) % PITCH;

/**
 * The page's dotted canvas — the node editors' dot grid, across the whole
 * page — with a spotlight: dots near the pointer brighten, as if a lamp moved
 * over the table. Decorative.
 *
 * The grid scrolls with the page (it used to be fixed to the viewport, which
 * made every glass element above it re-blur on every scroll frame). The lamp
 * is one small square that GSAP moves by transform, its dot pattern offset to
 * stay aligned with the grid — so a pointer move repaints 520px, not the page.
 */
export default function Spotlight() {
  const root = useRef<HTMLDivElement | null>(null);
  const lamp = useRef<HTMLSpanElement | null>(null);

  useGSAP(() => {
    const el = lamp.current;
    const host = root.current;
    if (!el || !host) return;
    const mm = gsap.matchMedia();
    mm.add(`${MOTION_OK} and (hover: hover) and (pointer: fine)`, () => {
      let cx = window.innerWidth / 2;
      let cy = window.innerHeight * 0.3;
      /* Keep the lamp's dots on the grid wherever the transform has it. */
      const align = () => {
        const x = Number(gsap.getProperty(el, "x"));
        const y = Number(gsap.getProperty(el, "y"));
        el.style.backgroundPosition = `${mod(PITCH / 2 - x)}px ${mod(PITCH / 2 - y)}px`;
      };
      const toX = gsap.quickTo(el, "x", { duration: 0.8, ease: "power3.out", onUpdate: align });
      const toY = gsap.quickTo(el, "y", { duration: 0.8, ease: "power3.out", onUpdate: align });
      const aim = () => {
        const top = host.getBoundingClientRect().top + window.scrollY;
        toX(cx - R);
        toY(cy + window.scrollY - top - R);
      };
      const move = (e: PointerEvent) => {
        cx = e.clientX;
        cy = e.clientY;
        aim();
      };
      gsap.set(el, { x: cx - R, y: cy - R });
      align();
      window.addEventListener("pointermove", move, { passive: true });
      window.addEventListener("scroll", aim, { passive: true });
      return () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("scroll", aim);
      };
    });
    return () => mm.revert();
  });

  return (
    <div ref={root} className={s.spotlight} aria-hidden="true">
      <span className={s.dotsBase} />
      <span ref={lamp} className={s.dotsLit} />
    </div>
  );
}
