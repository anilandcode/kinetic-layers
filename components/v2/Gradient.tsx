import type { CSSProperties, ElementType, ReactNode } from "react";
import type { Palette } from "@/lib/kl/types";
import { gradientVars } from "@/lib/v2/gradient";
import s from "./Gradient.module.css";

/**
 * The material colour lives in.
 *
 * Light (the soft studio): a pastel mesh from the kit's own hues, like the
 * gradient cards in the Credit Karma and Superpower references.
 * Dark (the cinematic workbench): the kit's own picture, blurred into smoke
 * behind a luminous mesh — glass over imagery, as in Reticla.
 *
 * `--mx` / `--my` (0–100) place a soft highlight that follows the pointer;
 * components/v2/motion.ts drives them with GSAP. A kit without chromatic
 * colour gets the silver mesh, never an invented hue.
 */
export default function Gradient({
  palette,
  image,
  as: Tag = "div",
  className,
  style,
  children,
  ...rest
}: {
  palette?: Palette | null;
  /** The kit's still, for the dark theme's smoke. Decorative. */
  image?: string;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
} & Record<string, unknown>) {
  const vars = gradientVars(palette);
  return (
    <Tag className={`${s.gradient} ${className ?? ""}`} style={{ ...vars, ...style }} data-silver={vars ? undefined : ""} {...rest}>
      <span className={s.mesh} aria-hidden="true" />
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element -- decorative blur of an image already on the page
        <img className={s.smoke} src={image} alt="" aria-hidden="true" loading="lazy" decoding="async" />
      ) : null}
      <span className={s.glow} aria-hidden="true" />
      <span className={s.grain} aria-hidden="true" />
      {children}
    </Tag>
  );
}
