"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import type { Asset } from "@/lib/kl/types";
import { clip as clipUrl, ITEM_W } from "@/lib/kl/media";
import { kitGraph, stillFor, tierLabel, typeLabel } from "@/lib/v2/kit";
import Gradient from "./Gradient";
import Media from "./Media";
import { Arrow, Signal } from "./Button";
import { usePointerGlow } from "./motion";
import s from "./FeatureCard.module.css";

/**
 * One kit, large — the references' big gradient card (the TD Bank panel in
 * the Credit Karma shot, the Superpower score card). The kit's page rises out
 * of its own colours; a glass bar names it. Both looks use it: pastel in the
 * soft studio, smoke and glass in the cinematic one.
 */
export default function FeatureCard({
  kit,
  label = "Featured kit",
  height,
  className,
}: {
  kit: Asset;
  label?: string;
  /** Any CSS length; defaults to a clamp that suits the soft hero. */
  height?: string;
  className?: string;
}) {
  const ref = usePointerGlow<HTMLAnchorElement>();
  const still = stillFor(kit, ITEM_W);
  const clip = kit.clip && !kit.sample ? clipUrl(kit.clip, ITEM_W) : undefined;
  const verified = kitGraph(kit).verified;

  return (
    <Link
      ref={ref}
      href={`/item/${kit.slug}`}
      className={`${s.feature} ${className ?? ""}`}
      style={height ? ({ "--feature-h": height } as CSSProperties) : undefined}
    >
      <Gradient palette={kit.palette} image={still} className={s.well}>
        <span className={s.top}>
          <span className={s.chip}>
            {verified ? <Signal /> : null}
            {label}
          </span>
          <Arrow className={s.arrow} />
        </span>
        <span className={s.window}>
          <span className={s.bar} aria-hidden="true">
            <i />
            <i />
            <i />
            <span>{kit.name.toLowerCase().replace(/[^a-z0-9]+/g, "")}.kit</span>
          </span>
          <span className={s.media}>
            <Media still={still} clip={clip} alt={`${kit.name}, the finished design`} play="auto" priority />
          </span>
        </span>
        <span className={s.info}>
          <span className={s.name}>{kit.name}</span>
          <span className={s.meta}>
            {typeLabel(kit.type)} · {tierLabel(kit)}
          </span>
        </span>
      </Gradient>
    </Link>
  );
}
