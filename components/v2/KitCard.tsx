import Link from "next/link";
import type { CSSProperties } from "react";
import type { Asset } from "@/lib/kl/types";
import { clip as clipUrl, CARD_W } from "@/lib/kl/media";
import { kitGraph, stillFor, tierLabel, typeLabel } from "@/lib/v2/kit";
import Aura from "./Aura";
import Media from "./Media";
import { Signal, Tag } from "./Button";
import s from "./KitCard.module.css";

/**
 * A kit in a grid.
 *
 * At rest it is only the media — no frame, no padding, no border (the owner's
 * call on the old card, and still right). On hover or focus the media draws
 * in and the kit's own aura shows around it: the card gets its identity from
 * its content, not from a treatment every card shares. Transform and opacity
 * only, so nothing reflows.
 */
export default function KitCard({
  kit,
  ratio = "4 / 3",
  priority = false,
  sizes = "card",
}: {
  kit: Asset;
  /** A fixed frame keeps a grid's rhythm; "natural" uses the media's own shape. */
  ratio?: string | "natural";
  priority?: boolean;
  sizes?: "card" | "wide";
}) {
  const width = sizes === "wide" ? CARD_W * 1.5 : CARD_W;
  const still = stillFor(kit, width);
  const clip = kit.clip && !kit.sample ? clipUrl(kit.clip, width) : undefined;
  const verified = kitGraph(kit).verified;
  const aspect = ratio === "natural" ? String(kit.aspect || 4 / 3) : ratio;

  return (
    <Link href={`/item/${kit.slug}`} className={s.card} data-sample={kit.sample ? "" : undefined}>
      <Aura palette={kit.palette} className={s.frame} style={{ aspectRatio: aspect } as CSSProperties}>
        <Media still={still} clip={clip} alt="" className={s.media} priority={priority} />
        {kit.sample ? (
          <Tag tone="sample" className={s.flag}>
            Sample
          </Tag>
        ) : null}
      </Aura>
      <span className={s.meta}>
        <span className={s.name}>{kit.name}</span>
        <span className={s.line}>
          {verified ? <Signal /> : null}
          <span>{typeLabel(kit.type)}</span>
          <span aria-hidden="true" className={s.sep}>·</span>
          <span>{tierLabel(kit)}</span>
          {verified ? <span className="v-sr">, verified rebuild</span> : null}
        </span>
      </span>
    </Link>
  );
}
