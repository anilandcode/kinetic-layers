import { EARLY_ACCESS } from "@/lib/kl/access";
import { getViewer } from "@/lib/kl/viewer";
import { getKit, getKitsForDisplay } from "@/lib/v2/data";
import { stillFor } from "@/lib/v2/kit";
import Gradient from "../Gradient";
import Library from "../Library";
import Shell from "../Shell";
import Icon from "../Icon";
import { DotNumber } from "../DotMatrix";
import { ButtonLink } from "../Button";
import Magnetic from "../fx/Magnetic";
import Parallax from "../fx/Parallax";
import Waveform from "../fx/Waveform";
import NodeCanvas from "./NodeCanvas";
import ProductWindow from "./ProductWindow";
import l from "../layout.module.css";
import s from "./CleanHome.module.css";

/**
 * The cinematic direction, clean take — the first version the owner liked,
 * refined (docs/directions/cinematic/DESIGN.md).
 *
 * Reticla's composition: a centred line over smoke and stone, the product in
 * a glass window beneath it, two glass cards floating over the window's edges,
 * a quiet row of facts. Then the library, how a kit works as a node canvas,
 * and glass over smoke to close. No dither here — this take stays calm.
 * `data-cine="clean"` gives its cards the first version's smoke wells.
 */
export default async function CleanHome() {
  const [{ real, shown }, viewer] = await Promise.all([getKitsForDisplay(), getViewer()]);
  const card =
    real.find((k) => k.featured && (k.poster || k.clip)) ?? real.find((k) => k.poster) ?? real[0] ?? shown[0];
  const feature = card ? ((await getKit(card.slug)) ?? card) : undefined;
  const still = feature ? stillFor(feature, 1400) : undefined;
  const free = real.filter((k) => k.free).length;

  return (
    <Shell look="cinematic">
      {/* Displacement for the stone at the hero's edges. */}
      <svg width="0" height="0" className={s.defs} aria-hidden="true" focusable="false">
        <filter id="kl-rock" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="4" seed="7" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="70" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      <main className={s.home} data-cine="clean">
        {/* ---------- Hero ---------- */}
        <section className={s.hero} aria-labelledby="home-title">
          <div className={s.backdrop} aria-hidden="true">
            <Gradient palette={feature?.palette} image={still} className={s.smoke} />
            <span className={s.beam} />
            <span className={`${s.rock} ${s.rockLeft}`} />
            <span className={`${s.rock} ${s.rockRight}`} />
            <span className={s.grain} />
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
              <span className={`${s.line} ${s.lineSoft}`}>
                <span>your AI can rebuild.</span>
              </span>
            </h1>
            <p className={s.lede}>
              Each kit is a finished design with its spec and the prompts that recreate it in your stack.
            </p>
            <div className={s.actions}>
              <ButtonLink href="#how-a-kit-works" size="md" variant="secondary">
                How a kit works
              </ButtonLink>
              <Magnetic>
                <ButtonLink href="#library" size="md" icon="arrowDown">
                  Browse kits
                </ButtonLink>
              </Magnetic>
            </div>
          </div>

          {feature ? (
            <div className={`${l.container} ${s.panelWrap}`}>
              <span className={s.screenLight} aria-hidden="true" />
              <ProductWindow kit={feature} />

              <Parallax depth={14} className={`${s.float} ${s.floatLeft}`}>
                <div className={s.floatCard}>
                  <p className={s.floatHead}>
                    <Icon name="prompt" size={14} /> Reconstruction prompt
                  </p>
                  <Waveform seed={feature.slug} />
                  <p className={s.floatMeta}>
                    {feature.promptLength
                      ? `${feature.promptLength.toLocaleString("en")} characters`
                      : "Not published yet"}
                  </p>
                </div>
              </Parallax>

              <Parallax depth={20} className={`${s.float} ${s.floatRight}`}>
                <div className={s.floatCard}>
                  <p className={s.floatHead}>
                    <Icon name="output" size={14} /> In your editor
                    <span className={s.floatChip}>MCP</span>
                  </p>
                  <p className={s.floatTools}>
                    <span>Claude Code</span>
                    <span>Cursor</span>
                  </p>
                  <p className={s.floatMeta}>get_prompt(&quot;{feature.slug}&quot;)</p>
                </div>
              </Parallax>
            </div>
          ) : null}

          {/* Reticla's figures row — facts, not metrics. */}
          <dl className={`${l.container} ${s.facts}`}>
            <div>
              <dt>kits published</dt>
              <dd>{String(real.length).padStart(2, "0")}</dd>
            </div>
            <div>
              <dt>parts in a complete kit</dt>
              <dd>6</dd>
            </div>
            <div>
              <dt>{EARLY_ACCESS ? "during early access" : "free kits today"}</dt>
              <dd>{EARLY_ACCESS ? "$0" : String(free).padStart(2, "0")}</dd>
            </div>
            <div>
              <dt>for Claude Code and Cursor</dt>
              <dd>MCP</dd>
            </div>
          </dl>
        </section>

        {/* ---------- The library ---------- */}
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

        {/* ---------- How a kit works ---------- */}
        <section id="how-a-kit-works" className={`${l.container} ${s.section}`} aria-labelledby="how-title">
          <div className={s.sectionHead}>
            <p className={s.kicker}>
              <span className={s.ember} aria-hidden="true" /> How a kit works
            </p>
            <h2 id="how-title" className={s.sectionTitle}>
              One design, the prompts that rebuild it, and the proof that they do.
            </h2>
          </div>
          <NodeCanvas thumb={feature ? stillFor(feature, 700) : undefined} />
        </section>

        {/* ---------- Early access, glass over smoke ---------- */}
        <section className={`${l.container} ${s.section}`} aria-labelledby="access-title">
          <Gradient palette={feature?.palette} image={still} className={s.cta}>
            <span className={s.sheen} aria-hidden="true" />
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
                  <ButtonLink href={viewer ? "/account" : "/join"} icon="arrowUpRight">
                    {viewer ? "Your dashboard" : "Join free"}
                  </ButtonLink>
                </Magnetic>
                <ButtonLink href="/pricing" variant="secondary">
                  See pricing
                </ButtonLink>
              </div>
            </div>
            <dl className={s.ctaFigures}>
              <div>
                <dt>Published kits</dt>
                <dd>
                  <DotNumber value={String(real.length).padStart(2, "0")} label={`${real.length} published kits`} dot={9} tone="accent" />
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
