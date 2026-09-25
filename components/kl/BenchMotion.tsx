"use client";

import type { ReactNode } from "react";
import { Children } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

type MotionSectionProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "section";
  delay?: number;
  id?: string;
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

export function MotionGrid({ children, className }: { children: ReactNode; className: string }) {
  const reduced = useReducedMotion();
  const gridVariants: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.035, delayChildren: 0.05 } } };
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.36, ease: [0.22, 1, 0.36, 1] } },
  };
  const grid = reduced
    ? {}
    : {
        initial: "hidden",
        animate: "show",
        variants: gridVariants,
      };
  const item = reduced
    ? {}
    : {
        variants: itemVariants,
      };

  return (
    <motion.div className={className} {...grid}>
      {Children.toArray(children).map((child, index) => (
        <motion.div className="bench-motion-grid-item" key={index} {...item}>{child}</motion.div>
      ))}
    </motion.div>
  );
}
