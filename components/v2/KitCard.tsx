"use client";

import Link from "next/link";
import type { Asset } from "@/lib/kl/types";
import { clip as clipUrl, CARD_W } from "@/lib/kl/media";
import { kitGraph, stillFor, tierLabel, typeLabel, type NodeId } from "@/lib/v2/kit";
import Gradient from "./Gradient";
import Media from "./Media";
import { Arrow, Signal, Tag } from "./Button";
import { usePointerGlow } from "./motion";
import s from "./KitCard.module.css";

/* The six parts a finished kit has, in order — one dot each on the card. */
const ANATOMY: NodeId[] = ["reference", "spec", "reconstruction", "output", "adaptation", "brand"];

/**
 * A kit in the library, built like the references' cards.
 *
 * A rounded card holding a gradient well — the kit's own colours, pastel on
 * light and smoke-over-glow on dark — with the kit's page rising out of it
 * like a browser window, then the name, one dot per kit part it really has,
 * and the round ↗. On hover the glow follows the pointer, the window lifts
 * and the arrow turns. No tilt.
 *
 * `data-flip-id` lets the library animate filtering with GSAP Flip, and lets
 * the quick view morph out of this card.
 */
export default function KitCard({ kit, priority = false }: { kit: Asset; priority?: boolean }) {
  const ref = usePointerGlow<HTMLAnchorElement>();
  const still = stillFor(kit, CARD_W);
  const clip = kit.clip && !kit.sample ? clipUrl(kit.clip, CARD_W) : undefined;
  const graph = kitGraph(kit);
  const verified = graph.verified;
  const has = new Set<NodeId>([...graph.main, ...graph.branch].map((n) => n.id));
  const parts = ANATOMY.filter((id) => has.has(id)).length;

  return (
    <Link ref={ref} href={`/item/${kit.slug}`} className={s.card} data-flip-id={`kit-${kit.slug}`} data-sample={kit.sample ? "" : undefined}>
      <Gradient palette={kit.palette} image={still} className={s.well}>
        <span className={s.window} data-kit-media={kit.slug}>
          <span className={s.windowBar} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className={s.windowMedia}>
            <Media still={still} clip={clip} alt="" priority={priority} />
          </span>
        </span>
        {kit.sample ? (
          <Tag tone="sample" className={s.flag}>
            Sample
          </Tag>
        ) : null}
      </Gradient>
      <span className={s.foot}>
        <span className={s.words}>
          <span className={s.name}>{kit.name}</span>
          <span className={s.meta}>
            {verified ? <Signal /> : null}
            {typeLabel(kit.type)}
            <span aria-hidden="true" className={s.dot}>
              ·
            </span>
            {tierLabel(kit)}
            {verified ? <span className="v-sr">, rebuild verified</span> : null}
          </span>
        </span>
        <span className={s.anatomy} title={`${parts} of 6 parts published`}>
          {ANATOMY.map((id) => (
            <i key={id} data-on={has.has(id) ? "" : undefined} />
          ))}
          <span className="v-sr">{parts} of 6 kit parts published</span>
        </span>
        <Arrow className={s.arrow} />
      </span>
    </Link>
  );
}
