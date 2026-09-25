import type { ReactNode } from "react";
import { ditherColors, HUES } from "@/lib/v2/gradient";
import DitherField from "./fx/DitherField";
import l from "./layout.module.css";
import s from "./Auth.module.css";

/**
 * Join, sign in and reset: a glass card over Home's dithered field, with an
 * optional luminous side panel saying what an account opens. The field glows
 * behind the card, the way the deck glows behind Home's cards.
 */
export default function AuthStage({
  labelledBy,
  children,
  aside,
}: {
  labelledBy: string;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section className={s.stage} aria-labelledby={labelledBy}>
      <div className={s.field} aria-hidden="true">
        <DitherField colors={ditherColors(HUES.ember, HUES.rose)} cell={6} gain={1.05} />
      </div>
      <div className={`${l.container} ${s.inner}`} data-single={aside ? undefined : ""}>
        <div className={s.card}>{children}</div>
        {aside ? <div className={s.aside}>{aside}</div> : null}
      </div>
    </section>
  );
}
