import Link from "next/link";
import type { CSSProperties } from "react";
import type { Asset, Viewer } from "@/lib/kl/types";
import { clip as clipUrl, ITEM_W } from "@/lib/kl/media";
import { kitGraph, stillFor, tierLabel, typeLabel } from "@/lib/v2/kit";
import { HUES, kitHue } from "@/lib/v2/gradient";
import Gradient from "./Gradient";
import Media from "./Media";
import KitCard from "./KitCard";
import Shell from "./Shell";
import PageHero, { SectionHead } from "./PageHero";
import KitDetails, { type DetailTab } from "./KitDetails";
import Workbench from "./workbench/Workbench";
import { KitAccessPanel, KitFigures, kitPanels, SampleNotice, VerificationNote } from "./KitParts";
import l from "./layout.module.css";
import p from "./Page.module.css";
import s from "./Kit.module.css";

/**
 * The kit page — /item/[slug], in Home's language.
 *
 * A short hero glowing in the kit's own colour; the kit running in a glass
 * window over its luminous, dithered well, with the access panel beside it;
 * its anatomy on the workbench (one kit, so the picker becomes its parts);
 * each part in full under that; then related kits. Parts a kit lacks are
 * drawn as outlines and said in words, so a young kit reads as honest rather
 * than broken.
 */
export default function KitView({
  kit,
  related,
  relatedReason = "newest",
  viewer,
  saved = false,
}: {
  kit: Asset;
  related: Asset[];
  relatedReason?: "drop" | "tag" | "newest";
  viewer: Viewer | null;
  /** Whether this viewer has saved the kit. */
  saved?: boolean;
}) {
  const graph = kitGraph(kit);
  const still = stillFor(kit, ITEM_W);
  const clip = kit.clip && !kit.sample ? clipUrl(kit.clip, ITEM_W) : undefined;
  const aspect = kit.aspect || 16 / 10;
  const panels = kitPanels(kit);
  const relatedHeading =
    relatedReason === "drop" ? "From the same drop" : relatedReason === "tag" ? "Related kits" : "More kits";

  const tabs: DetailTab[] = (
    [
      { id: "spec", title: "Design spec", icon: "spec", body: panels.spec },
      { id: "reconstruction", title: "Reconstruction prompt", icon: "prompt", body: panels.reconstruction },
      { id: "output", title: "Test records", icon: "output", body: panels.output },
      { id: "adaptation", title: "Adaptation prompt", icon: "branch", body: panels.adaptation },
      { id: "reference", title: "Reference", icon: "image", body: panels.reference },
    ] as DetailTab[]
  ).filter((t) => Boolean(t.body));

  return (
    <Shell>
      <main className={p.page}>
        <PageHero
          id="kit-title"
          hue={kitHue(kit.palette, HUES.ember)}
          crumbs={
            <nav aria-label="Breadcrumb" className={p.crumbs}>
              <Link href="/library">Library</Link>
              <span aria-hidden="true">/</span>
              <Link href={`/library?type=${encodeURIComponent(kit.type)}`}>{typeLabel(kit.type)}</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{kit.name}</span>
            </nav>
          }
          kicker={
            <>
              {typeLabel(kit.type)} · {tierLabel(kit)}
              {kit.releaseStatus ? <> · {kit.releaseStatus}</> : null}
              {graph.verified ? <> · rebuild verified</> : null}
            </>
          }
          title={kit.name}
          lede={kit.tagline}
          aside={<KitFigures kit={kit} dot={7} />}
        />

        {kit.sample ? (
          <div className={l.container}>
            <SampleNotice kit={kit} />
          </div>
        ) : null}

        {/* ---------- The kit, running ---------- */}
        <div className={`${l.container} ${s.stageRow}`}>
          <Gradient as="section" palette={kit.palette} image={still} className={s.stage} aria-label={`${kit.name}, preview`}>
            <div className={s.window} style={{ "--ratio": String(aspect) } as CSSProperties}>
              <span className={s.windowBar} aria-hidden="true">
                <i />
                <i />
                <i />
                <span className={s.windowTitle}>{kit.name}</span>
              </span>
              <span className={s.windowMedia}>
                <Media still={still} clip={clip} alt={`${kit.name} — the finished design`} play="auto" priority fit="cover" />
              </span>
            </div>
          </Gradient>
          <div className={s.side}>
            <KitAccessPanel kit={kit} viewer={viewer} saved={saved} />
          </div>
        </div>

        {/* ---------- Anatomy ---------- */}
        <section className={`${l.container} ${p.section}`} aria-labelledby="anatomy-title">
          <SectionHead
            id="anatomy-title"
            kicker="Anatomy"
            title={`What ${kit.name} is made of.`}
            lede="The reference, the spec that describes it, the prompts that rebuild and adapt it, and the proof that they work. Parts not published yet are drawn as outlines."
          />
          <Workbench kits={[kit]} initial={kit.slug} single />
          <div className={s.proofRow}>
            <VerificationNote kit={kit} graph={graph} />
          </div>
        </section>

        {tabs.length ? (
          <section className={`${l.container} ${p.sectionTight}`} aria-label={`${kit.name}, part by part`}>
            <KitDetails tabs={tabs} label={`${kit.name}, part by part`} />
          </section>
        ) : null}

        {related.length ? (
          <section className={`${l.container} ${p.section}`} aria-labelledby="related-title">
            <SectionHead
              id="related-title"
              kicker="Keep looking"
              title={relatedHeading}
              action={
                <Link href="/library" className={p.link}>
                  All kits
                </Link>
              }
            />
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
