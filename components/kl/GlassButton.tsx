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
 * Renders an <a> only when given an href; anything with a handler stays a
 * <button>. That split was forced by the old motion layer, which intercepted
 * `a[data-nav]` in the capture phase and could swallow an anchor's handler
 * silently. That layer is gone, but the split is right on its own terms — a
 * thing that navigates is a link, a thing that acts is a button.
 */

type Size = "sm" | "md" | "lg";

type Common = {
  children: ReactNode;
  premium?: boolean;
  ghost?: boolean;
  size?: Size;
  /** Magnetic pull in px, read by the motion layer. */
  pull?: number;
  /**
   * Adds the conic aura and the veil, and sweeps on a timer rather than only on
   * hover. In the design this is not a property of premium buttons — "Go
   * Premium" in the header and the hero CTA are premium and carry neither — it
   * marks the two controls meant to catch the eye unprompted: the card's
   * PREMIUM pill and the upgrade card's CTA.
   */
  autoGlass?: boolean;
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
  autoGlass = false,
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
      {autoGlass ? (
        <>
          <span className="kl-btn-aura" data-btn-aura aria-hidden="true" />
          <span className="kl-btn-veil" data-btn-veil aria-hidden="true" />
        </>
      ) : null}
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
    ...(autoGlass ? { "data-auto-glass": "" } : {}),
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
