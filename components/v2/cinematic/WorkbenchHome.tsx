import { EARLY_ACCESS } from "@/lib/kl/access";
import { getKitsForDisplay, getKit } from "@/lib/v2/data";
import type { Asset } from "@/lib/kl/types";
import Library from "../Library";
import Shell from "../Shell";
import { ButtonLink } from "../Button";
import Magnetic from "../fx/Magnetic";
import Spotlight from "../fx/Spotlight";
import Workbench from "../workbench/Workbench";
import HeroDeck from "./HeroDeck";
import l from "../layout.module.css";
import s from "./WorkbenchHome.module.css";

/**
 * The cinematic direction, second take — for comparison with `/`.
 *
 * The node editors and the dark dashboard in the references are whole
 * screens, so here Home is one: a short line, then a working node editor of
 * the kits themselves (components/v2/workbench), then the dashboard's
 * glowing card row, then the library.
 */
export default async function WorkbenchHome() {
  const { real, shown } = await getKitsForDisplay();
  /* The card projection leaves out the spec and prompt previews the canvas
     shows, so real kits are read in full — there are few, and they are cached. */
  const full = (await Promise.all(real.slice(0, 16).map((k) => getKit(k.slug)))).filter(Boolean) as Asset[];
  const kits = [...full, ...shown.filter((k) => k.sample)];
  const feature = full.find((k) => k.poster) ?? full[0] ?? kits[0];
  const start = kits.find((k) => k.illustrative)?.slug ?? feature?.slug;

  return (
    <Shell look="cinematic">
      <Spotlight />
      <main className={s.home}>
        <section className={`${l.container} ${s.intro}`} aria-labelledby="home-title">
          <div className={s.words}>
            {EARLY_ACCESS ? (
              <p className={s.badge}>
                <span className={s.ember} aria-hidden="true" /> Early access · free with an account
              </p>
            ) : null}
            <h1 id="home-title" className={s.headline}>
              Original kits, <span>and the prompts that rebuild them.</span>
            </h1>
          </div>
          <div className={s.actions}>
            <Magnetic>
              <ButtonLink href="#library" size="lg" icon="arrowDown">
                Browse kits
              </ButtonLink>
            </Magnetic>
            <ButtonLink href="/join" size="lg" variant="secondary">
              Join free
            </ButtonLink>
          </div>
        </section>

        <section className={`${l.container} ${s.benchWrap}`} aria-label="Kit workbench">
          <span className={s.glow} aria-hidden="true" />
          <Workbench kits={kits} initial={start} />
        </section>

        <section className={`${l.container} ${s.deck}`} aria-label="Kinetic Layers at a glance">
          <span className={s.haze} aria-hidden="true" />
          <HeroDeck real={real} feature={feature} />
        </section>

        <section id="library" className={`${l.container} ${s.library}`} aria-labelledby="library-title">
          <div className={s.sectionHead}>
            <p className={s.kicker}>
              <span className={s.ember} aria-hidden="true" /> The library
            </p>
            <h2 id="library-title" className={s.sectionTitle}>
              Kits, shown running.
            </h2>
          </div>
          <Library kits={shown} headingId="library-title" limit={12} />
        </section>
      </main>
    </Shell>
  );
}
