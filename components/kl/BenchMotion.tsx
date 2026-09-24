"use client";

import type { ReactNode } from "react";
import { Children, isValidElement } from "react";
import { motion, useReducedMotion } from "framer-motion";

type MotionSectionProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "section";
  delay?: number;
  "aria-label"?: string;
  "aria-labelledby"?: string;
};

/** Small, shared motion primitives for the public Bench surfaces. */
export function MotionSection({ children, className, as = "div", delay = 0, ...rest }: MotionSectionProps) {
  const reduced = useReducedMotion();
  const props = reduced
    ? {}
    : {
        initial: { opacity: 0, y: 14 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.18 },
        transition: { duration: 0.42, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
      };
  if (as === "section") return <motion.section className={className} {...props} {...rest}>{children}</motion.section>;
  return <motion.div className={className} {...props} {...rest}>{children}</motion.div>;
}

/**
 * A grid with no entrance, on purpose.
 *
 * This used to stagger every card 35ms apart from `initial: "hidden"`. Framer
 * Motion server-renders that initial state as inline `opacity: 0`, so the whole
 * catalogue arrived invisible and stayed invisible until JavaScript hydrated —
 * permanently, if it never did. That is HANDOFF.md trap 1, and
 * DESIGN-REBUILD-SPEC.md §10 forbids both halves of it: staggering dozens of
 * cards, and hiding content until hydration.
 *
 * The wrapper stays because bench.css lays the masonry out through
 * `.bench-motion-grid-item`. The name stays so its two callers need no change.
 */
export function MotionGrid({ children, className }: { children: ReactNode; className: string }) {
  return (
    <div className={className}>
      {Children.toArray(children).map((child, index) => (
        <div className="bench-motion-grid-item" key={isValidElement(child) && child.key != null ? child.key : index}>
          {child}
        </div>
      ))}
    </div>
  );
}
