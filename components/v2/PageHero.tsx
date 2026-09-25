import type { ReactNode } from "react";
import { ditherColors, HUES } from "@/lib/v2/gradient";
import DitherField from "./fx/DitherField";
import l from "./layout.module.css";
import s from "./Page.module.css";

/**
 * The head of every inner page, in Home's language: an ember kicker, a title,
 * a lede, and a living dithered glow behind them — Home's hero at a third of
 * the height, so the page's content starts in the first screen.
 *
 * The glow sits top right and fades before it reaches the words. `hue` takes a
 * kit's colour on a kit page; everything else is ember. `aside` holds what
 * sits opposite the words — dot-matrix figures, a plan's price.
 */
export default function PageHero({
  kicker,
  title,
  lede,
  actions,
  aside,
  crumbs,
  hue = HUES.ember,
  second,
  id = "page-title",
  compact = false,
}: {
  kicker?: ReactNode;
  title: ReactNode;
  lede?: ReactNode;
  actions?: ReactNode;
  aside?: ReactNode;
  crumbs?: ReactNode;
  hue?: number;
  second?: number;
  id?: string;
  /** For pages whose content is the point — the library, the account. */
  compact?: boolean;
}) {
  return (
    <section className={s.hero} data-compact={compact ? "" : undefined} aria-labelledby={id}>
      <div className={s.heroField} aria-hidden="true">
        <DitherField colors={ditherColors(hue, second)} cell={5} gain={1.05} />
      </div>
      <div className={`${l.container} ${s.heroInner}`}>
        {crumbs ? <div className={s.crumbs}>{crumbs}</div> : null}
        <div className={s.heroGrid}>
          <div className={s.heroWords}>
            {kicker ? (
              <p className={s.kicker}>{kicker}</p>
            ) : null}
            <h1 id={id} className={s.title}>
              {title}
            </h1>
            {lede ? <p className={s.lede}>{lede}</p> : null}
            {actions ? <div className={s.actions}>{actions}</div> : null}
          </div>
          {aside ? <div className={s.heroAside}>{aside}</div> : null}
        </div>
      </div>
    </section>
  );
}

/** A section heading in Home's voice: the ember kicker over a title. */
export function SectionHead({
  kicker,
  title,
  lede,
  id,
  action,
}: {
  kicker?: ReactNode;
  title: ReactNode;
  lede?: ReactNode;
  id?: string;
  action?: ReactNode;
}) {
  return (
    <div className={s.sectionHead}>
      <div className={s.sectionWords}>
        {kicker ? (
          <p className={s.kicker}>{kicker}</p>
        ) : null}
        <h2 id={id} className={s.sectionTitle}>
          {title}
        </h2>
        {lede ? <p className={s.sectionLede}>{lede}</p> : null}
      </div>
      {action}
    </div>
  );
}
