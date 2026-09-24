import { EARLY_ACCESS } from "@/lib/kl/access";
import type { Viewer } from "@/lib/kl/types";
import { ditherColors, HUES } from "@/lib/v2/gradient";
import { ButtonLink } from "./Button";
import { DotNumber } from "./DotMatrix";
import DitherField from "./fx/DitherField";
import Magnetic from "./fx/Magnetic";
import s from "./AccessBand.module.css";

/**
 * Home's closing call to action, shared: glass words over a dithered field,
 * and two real figures in the dot matrix. Counts are real kits only — a
 * preview's samples never reach them.
 */
export default function AccessBand({
  viewer,
  published,
  free,
  id = "access-title",
}: {
  viewer: Viewer | null;
  published: number;
  free: number;
  id?: string;
}) {
  return (
    <div className={s.cta}>
      <div className={s.ctaField} aria-hidden="true">
        <DitherField colors={ditherColors(HUES.ember, HUES.rose)} cell={6} gain={1.1} />
      </div>
      <div className={s.ctaWords}>
        <h2 id={id} className={s.ctaTitle}>
          {EARLY_ACCESS ? "Free while the library is young." : "Start with a free kit."}
        </h2>
        <p>
          An account unlocks free kits and their prompts. Premium is a plan we are shaping with early members — it is
          not on sale.
        </p>
        <div className={s.ctaActions}>
          <Magnetic>
            <ButtonLink href={viewer ? "/account" : "/join"} size="lg" icon="arrowUpRight">
              {viewer ? "Your dashboard" : "Join free"}
            </ButtonLink>
          </Magnetic>
          <ButtonLink href="/pricing" size="lg" variant="secondary">
            See pricing
          </ButtonLink>
        </div>
      </div>
      <dl className={s.ctaFigures}>
        <div>
          <dt>Published kits</dt>
          <dd>
            <DotNumber value={String(published).padStart(2, "0")} label={`${published} published kits`} dot={9} />
          </dd>
        </div>
        <div>
          <dt>Free today</dt>
          <dd>
            <DotNumber value={String(free).padStart(2, "0")} label={`${free} free`} dot={9} />
          </dd>
        </div>
      </dl>
    </div>
  );
}
