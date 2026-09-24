import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import Icon, { type IconName } from "./Icon";
import s from "./Controls.module.css";

type Variant = "primary" | "secondary" | "quiet";
type Size = "sm" | "md" | "lg";

const classes = (variant: Variant, size: Size, className?: string) =>
  `${s.pill} ${s[variant]} ${s[size]} ${className ?? ""}`;

/**
 * Pills, as in every reference: black on the soft studio, white on the
 * cinematic dark. Secondary is a glass pill; quiet is text with a hover
 * ground. An icon sits in its own round well at the end, like the
 * references' ↗ buttons.
 */
export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  icon,
  className,
  children,
  ...rest
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  className?: string;
  children: ReactNode;
} & Record<string, unknown>) {
  const inner = (
    <>
      <span>{children}</span>
      {icon ? (
        <span className={s.pillIcon}>
          <Icon name={icon} size={size === "sm" ? 14 : 16} />
        </span>
      ) : null}
    </>
  );
  if (/^(https?:|mailto:)/.test(href)) {
    return (
      <a href={href} className={classes(variant, size, className)} data-icon={icon ? "" : undefined} {...rest}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={classes(variant, size, className)} data-icon={icon ? "" : undefined} {...rest}>
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
    <button type={type} className={classes(variant, size, className)} data-icon={icon ? "" : undefined} {...rest}>
      <span>{children}</span>
      {icon ? (
        <span className={s.pillIcon}>
          <Icon name={icon} size={size === "sm" ? 14 : 16} />
        </span>
      ) : null}
    </button>
  );
}

/** A round icon control — search, theme, menu, close. */
export function RoundButton({
  label,
  icon,
  className,
  ...rest
}: { label: string; icon: IconName; className?: string } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={`${s.round} ${className ?? ""}`} aria-label={label} title={label} {...rest}>
      <Icon name={icon} size={18} />
    </button>
  );
}

/** The references' round ↗: decorative inside a card that is itself the link. */
export function Arrow({ className }: { className?: string }) {
  return (
    <span className={`${s.arrow} ${className ?? ""}`} aria-hidden="true">
      <Icon name="arrowUpRight" size={16} />
    </span>
  );
}

/** A small label: Free, Premium, Sample, Not yet verified, counts. */
export function Tag({
  tone = "neutral",
  signal = false,
  className,
  children,
}: {
  tone?: "neutral" | "solid" | "glass" | "sample";
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

/** The signal dot on its own: something real and current (a passed test, a live kit). */
export function Signal({ className }: { className?: string }) {
  return <span className={`${s.signal} ${className ?? ""}`} aria-hidden="true" />;
}
