import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import Icon, { type IconName } from "./Icon";
import s from "./Controls.module.css";

type Variant = "primary" | "secondary" | "quiet";
type Size = "md" | "sm" | "lg";

function classes(variant: Variant, size: Size, className?: string) {
  return `${s.button} ${s[variant]} ${s[size]} ${className ?? ""}`;
}

/**
 * The one button, as a link or a button.
 *
 * Primary is the chartreuse fill — the page's single most important action,
 * and there is at most one per view. Secondary is a lined control; quiet is
 * text with a hover ground.
 */
export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  icon,
  external = false,
  className,
  children,
  ...rest
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  external?: boolean;
  className?: string;
  children: ReactNode;
} & Record<string, unknown>) {
  const inner = (
    <>
      <span>{children}</span>
      {icon ? <Icon name={icon} size={size === "sm" ? 15 : 17} /> : null}
    </>
  );
  if (external || href.startsWith("http") || href.startsWith("mailto:")) {
    return (
      <a href={href} className={classes(variant, size, className)} {...rest}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={classes(variant, size, className)} {...rest}>
      {inner}
    </Link>
  );
}

export function Button({
  variant = "primary",
  size = "md",
  icon,
  className,
  children,
  type = "button",
  ...rest
}: {
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  className?: string;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={classes(variant, size, className)} {...rest}>
      <span>{children}</span>
      {icon ? <Icon name={icon} size={size === "sm" ? 15 : 17} /> : null}
    </button>
  );
}

/** A small label for a state: Free, Premium, Sample, Not yet verified. */
export function Tag({
  tone = "neutral",
  signal = false,
  className,
  children,
}: {
  tone?: "neutral" | "accent" | "warn" | "sample";
  /** Prefix the chartreuse dot: something real and current. */
  signal?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span className={`${s.tag} ${s[`tag_${tone}`]} ${className ?? ""}`}>
      {signal ? <span className={s.signal} aria-hidden="true" /> : null}
      {children}
    </span>
  );
}

/** The chartreuse dot on its own. */
export function Signal({ className }: { className?: string }) {
  return <span className={`${s.signal} ${className ?? ""}`} aria-hidden="true" />;
}
