import type { Asset } from "@/lib/kl/types";
import { EARLY_ACCESS } from "@/lib/kl/access";
import { HUES } from "@/lib/v2/gradient";
import { kitGraph, stillFor, tierLabel, typeLabel } from "@/lib/v2/kit";
import Gradient from "../Gradient";
import Mark from "../Mark";
import Icon from "../Icon";
import { Arrow } from "../Button";
import { DotNumber } from "../DotMatrix";
import DotGrid from "../fx/DotGrid";
import Fluted from "../fx/Fluted";
import DeckCard from "./DeckCard";
import s from "./HeroDeck.module.css";

/**
 * The hero deck — the four glowing cards of the dark dashboard reference,
 * each saying something true about Kinetic Layers:
 *
 *   1. the library, one dot per published kit (free solid, premium ringed);
 *   2. the featured kit behind fluted glass, with the parts it really has;
 *   3. how kits reach your editor, over MCP (the clients docs/mcp names);
 *   4. early access, on concentric rings.
 *
 * Every figure is counted from the catalogue; nothing is invented.
 */
export default function HeroDeck({ real, feature }: { real: Asset[]; feature?: Asset }) {
  const free = real.filter((k) => k.free);
  const kitDots = real.slice(0, 32);
  const filled = kitDots.map((k, i) => (k.free ? i : -1)).filter((i) => i >= 0);
  const half = kitDots.map((k, i) => (!k.free ? i : -1)).filter((i) => i >= 0);
  const graph = feature ? kitGraph(feature) : null;
  const present = new Set(graph ? [...graph.main, ...graph.branch].map((n) => n.id) : []);
  const rows: Array<[string, boolean]> = [
    ["Reference", present.has("reference")],
    ["Design spec", present.has("spec")],
    ["Reconstruction prompt", present.has("reconstruction")],
    ["Tested rebuild", present.has("output")],
  ];

  return (
    <div className={s.deck}>
      {/* 1 — The library */}
      <DeckCard href="#library" label={`The library: ${real.length} kits published, ${free.length} free`} className={s.lum}>
        <Gradient hue={HUES.rose} className={s.fill}>
          <span className={s.head}>
            <span className={s.title}>The library</span>
            <Arrow className={s.arrow} />
          </span>
          <span className={s.sub}>
            <span className={s.bigThin}>{String(real.length).padStart(2, "0")}</span>
            <span className={s.legend}>
              <span>
                <i data-kind="on" /> Free
              </span>
              <span>
                <i data-kind="ring" /> Premium
              </span>
            </span>
          </span>
          <DotGrid
            cols={8}
            rows={4}
            filled={filled}
            half={half}
            size={9}
            gap={13}
            label={`${free.length} free and ${real.length - free.length} premium kits`}
            className={s.grid}
          />
          <span className={s.foot}>
            <DotNumber value={`${free.length}/${real.length}`} label={`${free.length} of ${real.length} kits are free`} dot={5} />
            <span className={s.footNote}>free today</span>
          </span>
        </Gradient>
      </DeckCard>

      {/* 2 — The featured kit, behind fluted glass */}
      {feature ? (
        <DeckCard href={`/item/${feature.slug}`} label={`Featured kit: ${feature.name}`} className={s.flutedCard}>
          <span className={s.flutedWrap}>
            {stillFor(feature, 900) ? <Fluted src={stillFor(feature, 900)!} ribs={11} zoom={1.7} /> : null}
          </span>
          <span className={s.plate}>
            <span className={s.plateThumb} aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {stillFor(feature, 200) ? <img src={stillFor(feature, 200)} alt="" loading="lazy" /> : null}
            </span>
            <span className={s.plateWords}>
              <span className={s.plateName}>{feature.name}</span>
              <span className={s.plateMeta}>
                {typeLabel(feature.type)} · {tierLabel(feature)}
              </span>
            </span>
            <span className={s.plateButton} aria-hidden="true">
              <Icon name="arrowUpRight" size={15} />
            </span>
          </span>
          <span className={s.list}>
            <span className={s.listHead}>Kit anatomy</span>
            {rows.map(([name, ok]) => (
              <span key={name} className={s.listRow} data-ok={ok ? "" : undefined}>
                <span className={s.listIcon} aria-hidden="true">
                  <Icon name={ok ? "check" : "close"} size={12} />
                </span>
                {name}
                <span className={s.listState}>{ok ? "Published" : "Not yet"}</span>
              </span>
            ))}
          </span>
        </DeckCard>
      ) : null}

      {/* 3 — Into your editor, over MCP */}
      <DeckCard href="/mcp" label="Use kits from your editor over MCP" className={s.smoke}>
        <span className={s.head}>
          <span className={s.title}>In your editor</span>
          <span className={s.pill}>MCP</span>
        </span>
        <span className={s.orbit} aria-hidden="true">
          <span className={s.ring} />
          <span className={s.ringInner} />
          <span className={s.core}>
            <Mark size={26} />
          </span>
          <span className={`${s.chip} ${s.chipA}`}>Claude Code</span>
          <span className={`${s.chip} ${s.chipB}`}>Cursor</span>
          <span className={`${s.chip} ${s.chipC}`}>Any MCP client</span>
          <span className={s.bubble}>
            <code>get_prompt</code>
            <span>(&quot;{feature?.slug ?? "kit"}&quot;)</span>
          </span>
        </span>
        <span className={s.footRow}>
          <span className={s.dots} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className={s.footLink}>
            Set up MCP <Icon name="arrowUpRight" size={13} />
          </span>
        </span>
      </DeckCard>

      {/* 4 — Early access, on rings */}
      <DeckCard href="/join" label={EARLY_ACCESS ? "Early access: free with an account. Join free" : "Join free"} className={s.lum}>
        <Gradient hue={HUES.cobalt} className={s.fill}>
          <span className={s.head}>
            <span className={s.title}>{EARLY_ACCESS ? "Early access" : "Free kits"}</span>
            <Arrow className={s.arrow} />
          </span>
          <span className={s.sub}>
            <span className={s.figureLabel}>Price today</span>
            <DotNumber value="$0" label="Free" dot={5} />
          </span>
          <span className={s.rings} aria-hidden="true">
            <span />
            <span />
            <span />
            <span className={s.ringsCore}>
              <Icon name="download" size={18} />
            </span>
          </span>
          <span className={s.foot}>
            <span className={s.bigThin}>Free</span>
            <span className={s.footNote}>with an account</span>
          </span>
        </Gradient>
      </DeckCard>
    </div>
  );
}
