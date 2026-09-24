import Link from "next/link";
import type { CSSProperties } from "react";
import type { Asset, Viewer } from "@/lib/kl/types";
import { clip as clipUrl, ITEM_W } from "@/lib/kl/media";
import { kitGraph, stillFor, tierLabel, typeLabel } from "@/lib/v2/kit";
import Gradient from "./Gradient";
import Media from "./Media";
import NodeGraph from "./NodeGraph";
import KitCard from "./KitCard";
import Shell from "./Shell";
import { Signal } from "./Button";
import { KitAccessPanel, KitFigures, kitPanels, SampleNotice, VerificationNote } from "./KitParts";
import l from "./layout.module.css";
import s from "./Kit.module.css";

/**
 * The kit page — /item/[slug].
 *
 * Top to bottom: what it is, the kit running over its own aura, its anatomy
 * as a graph (the signature), and the access panel beside it. The graph draws
 * only the parts this kit has; everything it lacks is said in words under it,
 * so a near-empty kit reads as honest rather than broken.
 */
export default function KitView({
  kit,
  related,
  relatedReason = "newest",
  viewer,
}: {
  kit: Asset;
  related: Asset[];
  relatedReason?: "drop" | "tag" | "newest";
  viewer: Viewer | null;
}) {
  const graph = kitGraph(kit);
  const still = stillFor(kit, ITEM_W);
  const clip = kit.clip && !kit.sample ? clipUrl(kit.clip, ITEM_W) : undefined;
  const aspect = kit.aspect || 16 / 10;
  const relatedHeading =
    relatedReason === "drop" ? "From the same drop" : relatedReason === "tag" ? "Related kits" : "More kits";

  return (
    <Shell>
      <main className={s.page}>
        <div className={l.container}>
          <nav aria-label="Breadcrumb" className={s.crumbs}>
            <Link href="/library">Library</Link>
            <span aria-hidden="true">/</span>
            <Link href={`/library?type=${encodeURIComponent(kit.type)}`}>{typeLabel(kit.type)}</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{kit.name}</span>
          </nav>

          <SampleNotice kit={kit} />

          <header className={s.head}>
            <div className={s.headWords}>
              <p className={l.label}>
                {graph.verified ? <Signal /> : null}
                {typeLabel(kit.type)} · {tierLabel(kit)}
                {kit.releaseStatus ? <> · {kit.releaseStatus}</> : null}
              </p>
              <h1 className={l.title}>{kit.name}</h1>
              {kit.tagline ? <p className={l.lede}>{kit.tagline}</p> : null}
            </div>
            <KitFigures kit={kit} />
          </header>
        </div>

        <div className={l.container}>
          <Gradient as="section" palette={kit.palette} image={still} className={s.stage} aria-label={`${kit.name}, preview`}>
            <div
              className={s.stageFrame}
              style={{ "--ratio": String(aspect) } as CSSProperties}
            >
              <Media still={still} clip={clip} alt={`${kit.name} — the finished design`} play="auto" priority fit="cover" />
            </div>
          </Gradient>
        </div>

        <section className={`${l.container} ${s.anatomy}`} aria-labelledby="anatomy-title">
          <div className={s.anatomyHead}>
            <h2 id="anatomy-title" className={l.heading}>Anatomy</h2>
            <p className={l.body}>What this kit is made of, and what has been proven about it. Select a part to open it.</p>
          </div>
          <NodeGraph
            graph={graph}
            panels={kitPanels(kit)}
            label={`${kit.name} anatomy`}
            note={<VerificationNote kit={kit} graph={graph} />}
            aside={<KitAccessPanel kit={kit} viewer={viewer} />}
          />
        </section>

        {related.length ? (
          <section className={`${l.container} ${l.section}`} aria-labelledby="related-title">
            <div className={l.sectionHead}>
              <h2 id="related-title" className={l.heading}>{relatedHeading}</h2>
              <Link href="/library" className={l.textLink}>All kits</Link>
            </div>
            <div className={l.grid}>
              {related.slice(0, 3).map((r) => (
                <KitCard key={r.slug} kit={r} />
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </Shell>
  );
}
