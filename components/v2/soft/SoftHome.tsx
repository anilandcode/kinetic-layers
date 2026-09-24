import { EARLY_ACCESS } from "@/lib/kl/access";
import { getViewer } from "@/lib/kl/viewer";
import { getKitsForDisplay } from "@/lib/v2/data";
import { stillFor } from "@/lib/v2/kit";
import Gradient from "../Gradient";
import FeatureCard from "../FeatureCard";
import Library from "../Library";
import Shell from "../Shell";
import Icon, { type IconName } from "../Icon";
import { DotNumber } from "../DotMatrix";
import { ButtonLink, Signal } from "../Button";
import l from "../layout.module.css";
import s from "./SoftHome.module.css";

const STEPS: Array<{ icon: IconName; title: string; body: string }> = [
  { icon: "image", title: "Reference", body: "A finished website or motion design, made in our studio." },
  { icon: "spec", title: "Design spec", body: "Type, colour, spacing and motion, written down as values." },
  { icon: "prompt", title: "Reconstruction prompt", body: "Rebuilds the reference from the spec in your AI tool." },
  { icon: "output", title: "Verified output", body: "When a rebuild is tested, the tool, model and result are published." },
];

/**
 * Direction A — the soft gradient studio (docs/directions/soft/DESIGN.md).
 *
 * References: Synthex, Credit Karma, Superpower, Neka. A warm grey canvas,
 * white cards, colour only inside cards as pastel gradients from each kit's
 * own hues, black pills, thin figures. A short hero, then the library at
 * once, then two quiet sections.
 */
export default async function SoftHome() {
  const [{ real, shown }, viewer] = await Promise.all([getKitsForDisplay(), getViewer()]);
  const feature =
    real.find((k) => k.featured && (k.poster || k.clip)) ?? real.find((k) => k.poster) ?? real[0] ?? shown[0];
  const free = real.filter((k) => k.free).length;

  return (
    <Shell look="soft">
      <main className={s.home}>
        {feature ? (
          <Gradient palette={feature.palette} className={s.atmosphere} aria-hidden="true" />
        ) : null}

        {/* ---------- A short hero ---------- */}
        <section className={`${l.container} ${s.hero}`} aria-labelledby="home-title">
          <div className={s.heroWords}>
            {EARLY_ACCESS ? (
              <p className={s.badge}>
                <Signal /> Early access · free with an account
              </p>
            ) : null}
            <h1 id="home-title" className={s.headline}>
              <span className={s.line}>
                <span>Original website</span>
              </span>{" "}
              <span className={s.line}>
                <span>and motion kits.</span>
              </span>{" "}
              <span className={`${s.line} ${s.muted}`}>
                <span>Recreate, adapt, ship.</span>
              </span>
            </h1>
            <p className={s.lede}>
              Each kit is a finished design with its spec and the prompts that rebuild it — in your stack, with the AI
              tools you already use.
            </p>
            <div className={s.actions}>
              <ButtonLink href="#library" size="lg" icon="arrowDown">
                Browse kits
              </ButtonLink>
              {viewer ? (
                <ButtonLink href="/account" size="lg" variant="secondary">
                  Your dashboard
                </ButtonLink>
              ) : (
                <ButtonLink href="/join" size="lg" variant="secondary">
                  Join free
                </ButtonLink>
              )}
            </div>
          </div>
          {feature ? <FeatureCard kit={feature} className={s.feature} /> : null}
        </section>

        {/* ---------- The library, straight away ---------- */}
        <section id="library" className={`${l.container} ${s.library}`} aria-labelledby="library-title">
          <h2 id="library-title" className="v-sr">
            The library
          </h2>
          <Library kits={shown} headingId="library-title" limit={12} />
        </section>

        {/* ---------- How a kit works: the references' tiles ---------- */}
        <section className={`${l.container} ${s.section}`} aria-labelledby="how-title">
          <div className={s.sectionHead}>
            <h2 id="how-title" className={s.sectionTitle}>
              How a kit works
              <span className={s.muted}> — one design, and everything that rebuilds it.</span>
            </h2>
          </div>
          <ol className={s.tiles}>
            {STEPS.map((step, i) => {
              const last = i === STEPS.length - 1;
              const tile = (
                <>
                  <span className={s.tileTop}>
                    <span className={s.tileIcon}>
                      <Icon name={step.icon} size={17} />
                    </span>
                    <span className={s.tileTitle}>{step.title}</span>
                  </span>
                  <span className={s.tileBody}>{step.body}</span>
                  <span className={s.tileFoot}>
                    <span className={s.tileNumber} aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className={s.tileDots} aria-hidden="true">
                      {Array.from({ length: 4 }, (_, d) => (
                        <i key={d} data-on={d <= i ? "" : undefined} />
                      ))}
                    </span>
                  </span>
                </>
              );
              return last && feature ? (
                <li key={step.title} className={s.tileGlow}>
                  <Gradient palette={feature.palette} className={s.tileGradient}>
                    {tile}
                  </Gradient>
                </li>
              ) : (
                <li key={step.title} className={s.tile}>
                  {tile}
                </li>
              );
            })}
          </ol>
        </section>

        {/* ---------- Early access, as a gradient card ---------- */}
        <section className={`${l.container} ${s.section}`} aria-labelledby="access-title">
          <Gradient palette={feature?.palette} image={feature ? stillFor(feature, 900) : undefined} className={s.cta}>
            <div className={s.ctaWords}>
              <h2 id="access-title" className={s.ctaTitle}>
                {EARLY_ACCESS ? "Free while the library is young." : "Start with a free kit."}
              </h2>
              <p>
                An account unlocks free kits and their prompts. Premium is a plan we are shaping with early members —
                it is not on sale.
              </p>
              <div className={s.actions}>
                <ButtonLink href={viewer ? "/account" : "/join"} size="lg" icon="arrowUpRight">
                  {viewer ? "Your dashboard" : "Join free"}
                </ButtonLink>
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
          </Gradient>
        </section>
      </main>
    </Shell>
  );
}
