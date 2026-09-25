import type { CSSProperties, ElementType, ReactNode } from "react";
import type { Palette } from "@/lib/kl/types";
import { kitHues, luminousVars } from "@/lib/v2/gradient";
import { isAnimatedImage } from "@/lib/v2/kit";
import s from "./Gradient.module.css";

/**
 * The material colour lives in: the dark dashboard's luminous cards — the
 * kit's hue lit from within, the kit's own picture faint underneath, and a
 * halftone dither over it so the glow breaks into dots toward the shadow.
 *
 * `--mx` / `--my` (0–100), set by an ancestor (components/v2/motion.ts), place
 * a highlight that follows the pointer. A kit with no chromatic colour gets
 * silver, never an invented hue.
 */
export default function Gradient({
  palette,
  hue,
  second,
  image,
  as: Tag = "div",
  className,
  style,
  children,
  ...rest
}: {
  palette?: Palette | null;
  /** A named hue for surfaces that belong to no kit (lib/v2/gradient.ts HUES). */
  hue?: number;
  /** A second named hue for the bright core, with `hue`. */
  second?: number;
  /** The kit's still, drawn faintly under the glow. Decorative. */
  image?: string;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
} & Record<string, unknown>) {
  const hues = hue !== undefined ? (second !== undefined ? [hue, second] : [hue]) : kitHues(palette);
  const glow = hues.length ? luminousVars(hues[0], hues[1]) : undefined;
  return (
    <Tag
      className={`${s.gradient} ${className ?? ""}`}
      style={{ ...glow, ...style }}
      data-silver={hues.length ? undefined : ""}
      {...rest}
    >
      <span className={s.mesh} aria-hidden="true" />
      {/* Never an animated image: blurred and blended, it would repaint every frame. */}
      {image && !isAnimatedImage(image) ? (
        // eslint-disable-next-line @next/next/no-img-element -- decorative, an image already on the page
        <img className={s.smoke} src={image} alt="" aria-hidden="true" loading="lazy" decoding="async" />
      ) : null}
      <span className={s.glow} aria-hidden="true" />
      <span className={s.halftone} aria-hidden="true" />
      <span className={s.grain} aria-hidden="true" />
      {children}
    </Tag>
  );
}
