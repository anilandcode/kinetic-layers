import type { CSSProperties, ElementType, ReactNode } from "react";
import type { Palette } from "@/lib/kl/types";
import { auraStops } from "@/lib/v2/kit";
import s from "./Aura.module.css";

/**
 * A kit's colour field.
 *
 * The stops come from the kit's own image — Sanity extracts the swatches on
 * upload — so a kit's aura is its identity rather than decoration. A kit with
 * no image (video-only) gets the neutral field from the tokens, never an
 * invented hue.
 *
 * Light mode mixes the stops toward white and dark mode toward the canvas, in
 * CSS, so one set of swatches serves both strands.
 */
export default function Aura({
  palette,
  as: Tag = "div",
  intensity = "full",
  className,
  style,
  children,
  ...rest
}: {
  palette?: Palette | null;
  as?: ElementType;
  /** "soft" for large surfaces behind text, "full" for a media stage. */
  intensity?: "soft" | "full";
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
} & Record<string, unknown>) {
  const stops = auraStops(palette);
  const vars = stops
    ? ({ "--a1": stops[0], "--a2": stops[1], "--a3": stops[2] } as CSSProperties)
    : undefined;
  return (
    <Tag
      className={`${s.aura} ${intensity === "soft" ? s.soft : ""} ${className ?? ""}`}
      style={{ ...vars, ...style }}
      data-neutral={stops ? undefined : ""}
      {...rest}
    >
      <span className={s.field} aria-hidden="true" />
      <span className={s.grain} aria-hidden="true" />
      {children}
    </Tag>
  );
}
