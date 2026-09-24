import { EARLY_ACCESS } from "@/lib/kl/access";
import { getViewer } from "@/lib/kl/viewer";
import { getKitsForDisplay } from "@/lib/v2/data";
import { ditherColors, HUES, kitHue } from "@/lib/v2/gradient";
import { stillFor } from "@/lib/v2/kit";
import Library from "../Library";
import Shell from "../Shell";
import { DotNumber } from "../DotMatrix";
import { ButtonLink } from "../Button";
import DitherField from "../fx/DitherField";
import Magnetic from "../fx/Magnetic";
import Spotlight from "../fx/Spotlight";
import HeroDeck from "./HeroDeck";
import NodeCanvas from "./NodeCanvas";
import l from "../layout.module.css";
import s from "./CinematicHome.module.css";

/**
 * The cinematic workbench (docs/directions/cinematic/DESIGN.md) — the chosen
 * direction.
 *
 * References: Reticla, the two node editors, the dark gradient dashboard.
 * Near-black under a dotted canvas that brightens around the pointer; a
 * living, dithered field of the featured kit's colour behind a short hero;
 * the four glowing cards of the dashboard reference; then the library, how a
 * kit works as a node editor, and a dithered call to action.
 */
export default async function CinematicHome() {
  const [{ real, shown }, viewer] = await Promise.all([getKitsForDisplay(), getViewer()]);
  const feature =
    real.find((k) => k.featured && (k.poster || k.clip)) ?? real.find((k) => k.poster) ?? real[0] ?? shown[0];
  const hue = kitHue(feature?.palette, HUES.ember);
  const free = real.filter((k) => k.free).length;

  return (
    <Shell look="cinematic">
      <Spotlight />
      <main className={s.home}>
        {/* ---------- Hero ---------- */}
        <section className={s.hero} aria-labelledby="home-title">
          <div className={s.field} aria-hidden="true">
            <DitherField colors={ditherColors(hue)} cell={5} gain={1.1} />
          </div>

          <div className={`${l.container} ${s.heroWords}`}>
            {EARLY_ACCESS ? (
              <p className={s.badge}>
                <span className={s.ember} aria-hidden="true" /> Early access · free with an account
              </p>
            ) : null}
            <h1 id="home-title" className={s.headline}>
              <span className={s.line}>
                <span>Original website and motion kits</span>
              </span>{" "}
              <span className={`${s.line} ${s.dim}`}>
                <span>your AI can rebuild.</span>
              </span>
            </h1>
            <p className={s.lede}>
              Each kit is a finished design with its spec and the prompts that recreate it in your stack.
            </p>
            <div className={s.actions}>
              <Magnetic>
                <ButtonLink href="#library" size="lg" icon="arrowDown">
                  Browse kits
                </ButtonLink>
              </Magnetic>
              <ButtonLink href="#how-a-kit-works" size="lg" variant="secondary">
                How a kit works
              </ButtonLink>
            </div>
          </div>

          <div className={`${l.container} ${s.deckWrap}`}>
            <HeroDeck real={real} feature={feature} />
          </div>
        </section>

        {/* ---------- The library ---------- */}
        <section id="library" className={`${l.container} ${s.library}`} aria-labelledby="library-title">
          <div className={s.sectionHead}>
            <p className={s.kicker}>
              <span className={s.kickerDot} aria-hidden="true" /> The library
            </p>
            <h2 id="library-title" className={s.sectionTitle}>
              Kits, shown running.
            </h2>
          </div>
          <Library kits={shown} headingId="library-title" limit={12} />
        </section>

        {/* ---------- How a kit works ---------- */}
        <section id="how-a-kit-works" className={`${l.container} ${s.section}`} aria-labelledby="how-title">
          <div className={s.sectionHead}>
            <p className={s.kicker}>
              <span className={s.kickerDot} aria-hidden="true" /> How a kit works
            </p>
            <h2 id="how-title" className={s.sectionTitle}>
              One design, the prompts that rebuild it, and the proof that they do.
            </h2>
          </div>
          <NodeCanvas thumb={feature ? stillFor(feature, 700) : undefined} />
        </section>

        {/* ---------- Early access ---------- */}
        <section className={`${l.container} ${s.section}`} aria-labelledby="access-title">
          <div className={s.cta}>
            <div className={s.ctaField} aria-hidden="true">
              <DitherField colors={ditherColors(HUES.ember, HUES.rose)} cell={6} gain={1.1} />
            </div>
            <div className={s.ctaWords}>
              <h2 id="access-title" className={s.ctaTitle}>
                {EARLY_ACCESS ? "Free while the library is young." : "Start with a free kit."}
              </h2>
              <p>
                An account unlocks free kits and their prompts. Premium is a plan we are shaping with early members — it
                is not on sale.
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
                  <DotNumber value={String(real.length).padStart(2, "0")} label={`${real.length} published kits`} dot={9} />
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
        </section>
      </main>
    </Shell>
  );
}
