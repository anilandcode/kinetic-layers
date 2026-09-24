import type { ElementType, ReactNode } from "react";
import s from "./Glass.module.css";

/**
 * The frosted panel. For chrome, dialogs and the few panels that sit over an
 * aura or media — never for every card, which is how glass stops meaning
 * anything (docs/DESIGN-DIRECTION-V2.md, "a signature material").
 */
export default function Glass({
  as: Tag = "div",
  strong = false,
  className,
  children,
  ...rest
}: {
  as?: ElementType;
  /** A denser fill for panels carrying body text over busy media. */
  strong?: boolean;
  className?: string;
  children?: ReactNode;
} & Record<string, unknown>) {
  return (
    <Tag className={`${s.glass} ${strong ? s.strong : ""} ${className ?? ""}`} {...rest}>
      {children}
    </Tag>
  );
}
