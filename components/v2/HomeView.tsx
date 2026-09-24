import Link from "next/link";
import type { CSSProperties } from "react";
import { EARLY_ACCESS } from "@/lib/kl/access";
import { getViewer } from "@/lib/kl/viewer";
import { clip as clipUrl, ITEM_W } from "@/lib/kl/media";
import { getKitsForDisplay } from "@/lib/v2/data";
import { stillFor, tierLabel, typeLabel } from "@/lib/v2/kit";
import Aura from "./Aura";
import Media from "./Media";
import KitCard from "./KitCard";
import Shell from "./Shell";
import Icon, { type IconName } from "./Icon";
import { ButtonLink, Signal } from "./Button";
import l from "./layout.module.css";
import s from "./Home.module.css";

const STEPS: Array<{ n: string; icon: IconName; title: string; body: string }> = [
  {
    n: "01",
    icon: "image",
    title: "Reference",
    body: "A finished website or motion design, made in our studio — the thing you are buying.",
  },
  {
    n: "02",
    icon: "spec",
    title: "Design spec",
    body: "Its type, colour, spacing and motion, written down as values rather than adjectives.",
  },
  {
    n: "03",
    icon: "prompt",
    title: "Reconstruction prompt",
    body: "Rebuilds the reference from the spec in the AI coding tool you already use.",
  },
  {
    n: "04",
    icon: "output",
    title: "Verified output",
    body: "When a rebuild is tested, the tool, model, date and result are published on the kit.",
  },
];

/**
 * Home: what a kit is, one kit running, and the free ones to start with.
 *
 * No reference wall. The homepage used to lead with twenty competitor
 * references beside two real kits (docs/DESIGN-DIRECTION-V2.md); the
 * references now appear only on preview deployments, as marked samples.
 */
export default async function HomeView() {
  const [{ real, shown }, viewer] = await Promise.all([getKitsForDisplay(), getViewer()]);
  const feature = real.find((k) => k.featured && (k.poster || k.clip)) ?? real.find((k) => k.poster) ?? real[0] ?? shown[0];
  const free = shown.filter((k) => k.free && k.slug !== feature?.slug).slice(0, 6);
  const premium = shown.filter((k) => !k.free && k.slug !== feature?.slug).slice(0, 3);
  const aspect = feature?.aspect || 16 / 10;

  return (
    <Shell>
      <main>
        {/* ---------- Hero ---------- */}
        <section className={`${l.container} ${s.hero}`} aria-labelledby="home-title">
          <div className={s.heroTop}>
            {EARLY_ACCESS ? (
              <p className={`${l.label} ${s.rise}`}>
                <Signal /> Early access — free with an account
              </p>
            ) : null}
            <h1 id="home-title" className={`${l.display} ${s.headline} ${s.rise}`}>
              Original websites and motion kits you can recreate, adapt and ship.
            </h1>
          </div>
          <div className={s.heroWords}>
            <p className={`${l.lede} ${s.rise} ${s.delay1}`}>
              Each kit is a finished design with its spec and the prompts that rebuild it — in your own stack, with the
              AI tools you already use.
            </p>
            <div className={`${s.actions} ${s.rise} ${s.delay2}`}>
              <ButtonLink href="/library" size="lg" icon="arrow">
                Browse the library
              </ButtonLink>
              <ButtonLink href="#how-a-kit-works" size="lg" variant="secondary">
                How a kit works
              </ButtonLink>
            </div>
          </div>

          {feature ? (
            <Aura palette={feature.palette} className={`${s.heroStage} ${s.rise} ${s.delay1}`}>
              <div className={s.window} style={{ "--ratio": String(aspect) } as CSSProperties}>
                <div className={s.windowBar}>
                  <span className={s.windowDots} aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </span>
                  <span className={s.windowTitle}>{feature.name}</span>
                  <span className={s.windowType}>{typeLabel(feature.type)}</span>
                </div>
                <div className={s.windowMedia}>
                  <Media
                    still={stillFor(feature, ITEM_W)}
                    clip={feature.clip && !feature.sample ? clipUrl(feature.clip, ITEM_W) : undefined}
                    alt={`${feature.name} — ${typeLabel(feature.type).toLowerCase()} kit, running`}
                    play="auto"
                    priority
                  />
                </div>
              </div>
              <Link href={`/item/${feature.slug}`} className={s.chip}>
                <span className={s.chipName}>{feature.name}</span>
                <span className={s.chipMeta}>
                  {typeLabel(feature.type)} · {tierLabel(feature)}
                </span>
                <Icon name="arrow" size={16} />
              </Link>
            </Aura>
          ) : null}
        </section>

        {/* ---------- How a kit works ---------- */}
        <section id="how-a-kit-works" className={`${l.container} ${l.section}`} aria-labelledby="how-title">
          <div className={l.sectionHead}>
            <div>
              <p className={l.label}>How a kit works</p>
              <h2 id="how-title" className={l.heading}>
                One design, the prompts that rebuild it, and the proof that they do.
              </h2>
            </div>
            <p className={`${l.body} ${s.howAside}`}>
              A kit is the whole chain — the design, the values behind it, the prompts and the test — and every link
              in it is something you can open on the kit page.
            </p>
          </div>

          <ol className={s.steps}>
            {STEPS.map((step) => (
              <li key={step.n} className={s.step}>
                <span className={s.stepNumber} aria-hidden="true">
                  {step.n}
                </span>
                <span className={s.stepGlyph}>
                  <Icon name={step.icon} size={20} />
                </span>
                <h3 className={s.stepTitle}>{step.title}</h3>
                <p className={s.stepBody}>{step.body}</p>
              </li>
            ))}
          </ol>

          <div className={s.branch}>
            <span className={s.branchLine} aria-hidden="true" />
            <span className={s.stepGlyph}>
              <Icon name="branch" size={20} />
            </span>
            <p>
              <strong>Adaptation prompt → your brand.</strong> A branch from the spec that keeps the structure and motion
              and swaps in your palette, typeface and copy.
            </p>
          </div>
        </section>

        {/* ---------- Free starters ---------- */}
        <section className={`${l.container} ${l.section}`} aria-labelledby="free-title">
          <div className={l.sectionHead}>
            <div>
              <p className={l.label}>Free starters</p>
              <h2 id="free-title" className={l.heading}>
                Start with a free kit.
              </h2>
              <p className={l.body}>Free kits download on any account — no card, no trial clock.</p>
            </div>
            <Link href="/library?price=free" className={l.textLink}>
              All free kits
              <Icon name="arrow" size={16} />
            </Link>
          </div>
          {free.length ? (
            <div className={`${l.grid} ${s.wideGrid}`}>
              {free.map((kit, i) => (
                <KitCard key={kit.slug} kit={kit} priority={i < 3} />
              ))}
            </div>
          ) : (
            <div className={l.empty}>
              <p>
                {feature?.free
                  ? `${feature.name} is the free kit published so far — it is above. More free kits are in the studio.`
                  : "The first free kits are in the studio. Tell us what you would build with one."}
              </p>
              <Link href="/contact" className={l.textLink}>
                Tell us what you need
              </Link>
            </div>
          )}
        </section>

        {premium.length ? (
          <section className={`${l.container} ${l.section}`} aria-labelledby="more-title">
            <div className={l.sectionHead}>
              <div>
                <p className={l.label}>Also in the library</p>
                <h2 id="more-title" className={l.heading}>
                  Premium kits.
                </h2>
              </div>
              <Link href="/library" className={l.textLink}>
                The whole library
                <Icon name="arrow" size={16} />
              </Link>
            </div>
            <div className={`${l.grid} ${s.wideGrid}`}>
              {premium.map((kit) => (
                <KitCard key={kit.slug} kit={kit} />
              ))}
            </div>
          </section>
        ) : null}

        {/* ---------- Close ---------- */}
        <section className={`${l.container} ${l.section}`} aria-labelledby="close-title">
          <Aura palette={feature?.palette} intensity="soft" className={s.close}>
            <div className={s.closeWords}>
              <h2 id="close-title" className={l.heading}>
                {viewer ? "Pick up where you left off." : EARLY_ACCESS ? "Free while the library is young." : "Make an account, take a free kit."}
              </h2>
              <p className={l.body}>
                {viewer
                  ? "Your downloads, saved kits and today’s allowance are on your dashboard."
                  : "An account unlocks free kits and their prompts. Premium is a plan we are shaping with early members — it is not on sale."}
              </p>
            </div>
            <div className={s.closeActions}>
              {viewer ? (
                <ButtonLink href="/account" size="lg" icon="arrow">
                  Your dashboard
                </ButtonLink>
              ) : (
                <>
                  <ButtonLink href="/join" size="lg" icon="arrow">
                    Join free
                  </ButtonLink>
                  <ButtonLink href="/pricing" size="lg" variant="secondary">
                    See pricing
                  </ButtonLink>
                </>
              )}
              <Link href="/mcp" className={l.textLink}>
                Use kits from your editor over MCP
              </Link>
            </div>
          </Aura>
        </section>
      </main>
    </Shell>
  );
}
