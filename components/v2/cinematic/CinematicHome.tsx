import { EARLY_ACCESS } from "@/lib/kl/access";
import { getViewer } from "@/lib/kl/viewer";
import { clip as clipUrl, ITEM_W } from "@/lib/kl/media";
import { getKitsForDisplay } from "@/lib/v2/data";
import { kitGraph, stillFor, tierLabel, typeLabel } from "@/lib/v2/kit";
import Gradient from "../Gradient";
import Media from "../Media";
import Library from "../Library";
import Shell from "../Shell";
import Icon from "../Icon";
import { DotNumber } from "../DotMatrix";
import { ButtonLink } from "../Button";
import NodeCanvas from "./NodeCanvas";
import l from "../layout.module.css";
import s from "./CinematicHome.module.css";

/**
 * Direction B — the cinematic workbench (docs/directions/cinematic/DESIGN.md).
 *
 * References: Reticla, the two node editors, the dark gradient dashboard.
 * Near-black, the featured kit's own picture blurred into smoke, frosted
 * glass floating over it, white pills and one small ember accent. A short
 * centred hero with the product in a glass window, the library straight
 * after, then how a kit works as a node canvas.
 */
export default async function CinematicHome() {
  const [{ real, shown }, viewer] = await Promise.all([getKitsForDisplay(), getViewer()]);
  const feature =
    real.find((k) => k.featured && (k.poster || k.clip)) ?? real.find((k) => k.poster) ?? real[0] ?? shown[0];
  const still = feature ? stillFor(feature, ITEM_W) : undefined;
  const clip = feature?.clip && !feature.sample ? clipUrl(feature.clip, ITEM_W) : undefined;
  const graph = feature ? kitGraph(feature) : null;
  const parts = graph ? [...graph.main, ...graph.branch] : [];

  return (
    <Shell look="cinematic">
      <main className={s.home}>
        {/* ---------- Hero: smoke, a centred line, the product under glass ---------- */}
        <section className={s.hero} aria-labelledby="home-title">
          <div className={s.backdrop} aria-hidden="true">
            <Gradient palette={feature?.palette} image={still} className={s.smoke} />
            <span className={s.rockLeft} />
            <span className={s.rockRight} />
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
              <span className={s.line}>
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
              <ButtonLink href="#library" size="md">
                Browse kits
              </ButtonLink>
            </div>
          </div>

          {feature ? (
            <div className={`${l.container} ${s.panelWrap}`}>
              <div className={s.panel}>
                <aside className={s.panelRail} aria-hidden="true">
                  <span className={s.railLogo} />
                  <Icon name="image" size={16} />
                  <Icon name="spec" size={16} />
                  <Icon name="prompt" size={16} />
                  <Icon name="output" size={16} />
                </aside>
                <div className={s.panelMain}>
                  <div className={s.panelBar}>
                    <span className={s.panelSearch} aria-hidden="true">
                      <Icon name="search" size={14} /> Search kits
                      <kbd>⌘K</kbd>
                    </span>
                    <a href={`/item/${feature.slug}`} className={s.panelOpen}>
                      {feature.name}
                      <span>{typeLabel(feature.type)} · {tierLabel(feature)}</span>
                      <Icon name="arrowUpRight" size={14} />
                    </a>
                  </div>
                  <div className={s.panelStage}>
                    <Media still={still} clip={clip} alt={`${feature.name}, the finished design`} play="auto" priority />
                    {parts.length ? (
                      <div className={s.panelNodes} aria-hidden="true">
                        <p>Kit anatomy</p>
                        {parts.map((n) => (
                          <span key={n.id}>
                            <i />
                            {n.title}
                          </span>
                        ))}
                        {graph && !graph.verified ? <span className={s.panelMuted}>Not yet verified</span> : null}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </section>

        {/* ---------- The library ---------- */}
        <section id="library" className={`${l.container} ${s.library}`} aria-labelledby="library-title">
          <div className={s.sectionHead}>
            <p className={s.kicker}>The library</p>
            <h2 id="library-title" className={s.sectionTitle}>
              Kits, shown running.
            </h2>
          </div>
          <Library kits={shown} headingId="library-title" limit={12} />
        </section>

        {/* ---------- How a kit works, as a node canvas ---------- */}
        <section id="how-a-kit-works" className={`${l.container} ${s.section}`} aria-labelledby="how-title">
          <div className={s.sectionHead}>
            <p className={s.kicker}>How a kit works</p>
            <h2 id="how-title" className={s.sectionTitle}>
              One design, the prompts that rebuild it, and the proof that they do.
            </h2>
          </div>
          <NodeCanvas thumb={feature ? stillFor(feature, 700) : undefined} />
        </section>

        {/* ---------- Early access, glass over smoke ---------- */}
        <section className={`${l.container} ${s.section}`} aria-labelledby="access-title">
          <Gradient palette={feature?.palette} image={still} className={s.cta}>
            <div className={s.ctaWords}>
              <h2 id="access-title" className={s.ctaTitle}>
                {EARLY_ACCESS ? "Free while the library is young." : "Start with a free kit."}
              </h2>
              <p>
                An account unlocks free kits and their prompts. Premium is a plan we are shaping with early members — it
                is not on sale.
              </p>
              <div className={s.actions}>
                <ButtonLink href={viewer ? "/account" : "/join"} icon="arrowUpRight">
                  {viewer ? "Your dashboard" : "Join free"}
                </ButtonLink>
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
                  <DotNumber
                    value={String(real.filter((k) => k.free).length).padStart(2, "0")}
                    label={`${real.filter((k) => k.free).length} free`}
                    dot={9}
                  />
                </dd>
              </div>
            </dl>
          </Gradient>
        </section>
      </main>
    </Shell>
  );
}
