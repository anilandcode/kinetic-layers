import Link from "next/link";
import type { ReactNode } from "react";

/**
 * The glass button.
 *
 * Primary buttons are translucent with an inset highlight — never solid amber.
 * `premium` is the single lit button on a screen: amber-lit glass, magnetic,
 * and the only one that sweeps its shine on a timer.
 *
 * The glow and shine spans are painted by the motion layer at pointer position
 * and stay invisible without it, so the button is complete either way.
 *
 * Renders an <a> only when given an href. Anything with a handler stays a
 * <button>: KilnMotion intercepts `a[data-nav]` in the capture phase and stops
 * propagation, so a click handler on an anchor can silently never fire
 * (HANDOFF.md, trap 4). Nothing here sets data-nav.
 */

type Size = "sm" | "md" | "lg";

type Common = {
  children: ReactNode;
  premium?: boolean;
  ghost?: boolean;
  size?: Size;
  /** Magnetic pull in px, read by the motion layer. */
  pull?: number;
  className?: string;
};

type Props = Common &
  (
    | { href: string; onClick?: never; type?: never; disabled?: never }
    | { href?: never; onClick?: () => void; type?: "button" | "submit"; disabled?: boolean }
  );

export default function GlassButton({
  children,
  premium = false,
  ghost = false,
  size = "md",
  pull = premium ? 7 : 5,
  className,
  ...rest
}: Props) {
  const classes = [
    "kl-btn",
    premium ? "kl-btn--premium" : null,
    ghost ? "kl-btn--ghost" : null,
    size === "sm" ? "kl-btn--sm" : size === "lg" ? "kl-btn--lg" : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const inner = (
    <>
      <span className="kl-btn-glow" data-btn-glow aria-hidden="true" />
      <span className="kl-btn-shine" data-btn-shine aria-hidden="true" />
      <span className="kl-btn-label" data-btn-label>
        {children}
      </span>
    </>
  );

  /* data-premium is what tells the motion layer to warm the glow and run the
     idle sweep; it must be absent, not "false", on ordinary buttons. */
  const motion = {
    "data-glass-btn": String(pull),
    ...(premium ? { "data-premium": "true" } : {}),
  };

  if ("href" in rest && rest.href) {
    return (
      <Link href={rest.href} className={classes} {...motion}>
        {inner}
      </Link>
    );
  }

  const { onClick, type = "button", disabled } = rest as {
    onClick?: () => void;
    type?: "button" | "submit";
    disabled?: boolean;
  };

  return (
    <button className={classes} type={type} onClick={onClick} disabled={disabled} {...motion}>
      {inner}
    </button>
  );
}
