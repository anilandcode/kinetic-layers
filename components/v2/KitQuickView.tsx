import type { CSSProperties } from "react";
import type { Asset, Viewer } from "@/lib/kl/types";
import { clip as clipUrl, ITEM_W } from "@/lib/kl/media";
import { kitGraph, stillFor, tierLabel, typeLabel } from "@/lib/v2/kit";
import Gradient from "./Gradient";
import Media from "./Media";
import { Signal, Tag } from "./Button";
import Icon from "./Icon";
import { GraphStrip, kitAccess } from "./KitParts";
import s from "./KitDialog.module.css";

/**
 * What the quick view shows: the kit running, what it contains as a condensed
 * graph, the one action, and the way into the full page. Deliberately less
 * than the page — the dialog is for deciding whether to open it.
 */
export default function KitQuickView({ kit, viewer }: { kit: Asset; viewer: Viewer | null }) {
  const graph = kitGraph(kit);
  const access = kitAccess(kit, viewer);
  const still = stillFor(kit, ITEM_W);
  const clip = kit.clip && !kit.sample ? clipUrl(kit.clip, ITEM_W) : undefined;
  const aspect = kit.aspect || 16 / 10;

  return (
    <div className={s.layout}>
      <Gradient palette={kit.palette} image={still} className={s.stage}>
        <div className={s.frame} style={{ "--ratio": String(aspect) } as CSSProperties}>
          <Media still={still} clip={clip} alt={`${kit.name} — the finished design`} play="auto" priority />
        </div>
      </Gradient>

      <div className={s.details}>
        <div className={s.words}>
          <p className={s.kicker}>
            {graph.verified ? <Signal /> : null}
            {typeLabel(kit.type)} · {tierLabel(kit)}
            {kit.sample ? <Tag tone="sample">{kit.illustrative ? "Illustrative" : "Sample"}</Tag> : null}
          </p>
          <h2 className={s.name}>{kit.name}</h2>
          {kit.tagline ? <p className={s.tagline}>{kit.tagline}</p> : null}
        </div>

        <div className={s.contains}>
          <p className={s.containsLabel}>What’s in this kit</p>
          <GraphStrip graph={graph} />
          <p className={s.proof}>
            {graph.verified ? "Rebuild verified — the test records are on the kit page." : "Not yet verified."}
          </p>
        </div>

        <div className={s.actions}>
          <p className={s.access}>
            {access.open ? <Signal /> : null}
            <strong>{access.label}.</strong> {access.note}
          </p>
          {access.action}
          {/* A real navigation, not a soft one: from inside the interception a
              Link would match (.)item again and re-open the dialog. */}
          <a href={`/item/${kit.slug}`} className={s.open}>
            Open the full kit
            <Icon name="arrow" size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}

