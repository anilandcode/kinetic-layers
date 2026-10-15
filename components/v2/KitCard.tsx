"use client";

import Link from "next/link";
import type { Asset } from "@/lib/kl/types";
import { clip as clipUrl, CARD_W } from "@/lib/kl/media";
import { kitGraph, stillFor, tierLabel, typeLabel, type NodeId } from "@/lib/v2/kit";
import Media from "./Media";
import { Arrow, Signal, Tag } from "./Button";
import { usePointerGlow } from "./motion";
import s from "./KitCard.module.css";
import { itemHref } from "@/lib/kl/slug";

/* The six parts a finished kit has, in order — one dot each on the card. */
const ANATOMY: NodeId[] = ["reference", "spec", "reconstruction", "output", "adaptation", "brand"];

/**
 * A kit in the library, built like the references' cards.
 *
 * A rounded card whose top is the kit itself — the still or the looping clip,
 * edge to edge, with no frame around it — then the name, one dot per kit part
 * it really has, and the round ↗. On hover the hairline glow follows the
 * pointer, the media eases in a touch and the arrow turns. No tilt.
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
    <Link ref={ref} href={itemHref(kit.slug)} className={s.card} data-flip-id={`kit-${kit.slug}`} data-sample={kit.sample ? "" : undefined}>
      <span className={s.media} data-kit-media={kit.slug}>
        <Media still={still} clip={clip} alt="" play="auto" priority={priority} className={s.mediaInner} />
        {kit.sample ? (
          <Tag tone="sample" className={s.flag}>
            Sample
          </Tag>
        ) : null}
      </span>
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
