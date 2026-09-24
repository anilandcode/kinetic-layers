"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { usePointerGlow } from "../motion";
import s from "./HeroDeck.module.css";

/** One card of the hero deck: a link whose glow and edge follow the pointer. */
export default function DeckCard({
  href,
  label,
  className,
  style,
  children,
}: {
  href: string;
  /** The accessible name of the whole card. */
  label: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const ref = usePointerGlow<HTMLAnchorElement>();
  return (
    <Link ref={ref} href={href} aria-label={label} className={`${s.card} ${className ?? ""}`} style={style}>
      {children}
    </Link>
  );
}
