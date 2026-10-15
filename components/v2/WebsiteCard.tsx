"use client";

import Link from "next/link";
import type { Website } from "@/lib/kl/types";
import { cropTop } from "@/lib/kl/media";
import { websiteHref } from "@/lib/kl/slug";
import { Arrow } from "./Button";
import { usePointerGlow } from "./motion";
import k from "./KitCard.module.css";
import s from "./Website.module.css";

/* 2x a 4-column card at 1440px, at the 3:4 the grid shows. */
const THUMB_W = 720;
const THUMB_H = 960;

/**
 * A website in the grid: the top of its full-page screenshot, edge to edge in
 * the kit card's frame, then the name and category. Same family as KitCard, so
 * the two grids read as one site.
 */
export default function WebsiteCard({ site, priority = false }: { site: Website; priority?: boolean }) {
  const ref = usePointerGlow<HTMLAnchorElement>();
  const src = cropTop(site.screenshot, THUMB_W, THUMB_H);
  return (
    <Link ref={ref} href={websiteHref(site.slug)} className={k.card}>
      <span className={s.thumb}>
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element -- sized by lib/kl/media.ts, not next/image
          <img
            className={s.thumbImg}
            src={src}
            alt=""
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            draggable={false}
          />
        ) : null}
      </span>
      <span className={k.foot}>
        <span className={k.words}>
          <span className={k.name}>{site.name}</span>
          <span className={k.meta}>
            {site.category}
            <span aria-hidden="true" className={k.dot}>
              ·
            </span>
            {site.free ? "Free" : "Premium"}
          </span>
        </span>
        <Arrow className={k.arrow} />
      </span>
    </Link>
  );
}
