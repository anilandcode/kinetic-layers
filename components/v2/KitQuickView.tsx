import type { CSSProperties } from "react";
import type { Asset, Viewer } from "@/lib/kl/types";
import { clip as clipUrl, ITEM_W } from "@/lib/kl/media";
import { kitGraph, stillFor, tierLabel, typeLabel, type NodeId } from "@/lib/v2/kit";
import Media from "./Media";
import { Signal } from "./Button";
import Icon, { type IconName } from "./Icon";
import CopyPrompt from "./CopyPrompt";
import { kitAccess } from "./KitParts";
import s from "./KitDialog.module.css";

/* The parts that are not prompts, shown as a line of lit or dimmed chips. */
const OTHER_PARTS: Array<{ id: NodeId; title: string; icon: IconName }> = [
  { id: "reference", title: "Reference", icon: "image" },
  { id: "spec", title: "Design spec", icon: "spec" },
  { id: "output", title: "Tested rebuild", icon: "output" },
  { id: "brand", title: "Your brand", icon: "brand" },
];

/**
 * What the quick view shows: the kit running across the whole left of the
 * dialog, and beside it what someone opens a kit for — its prompts, each with
 * the first lines to read and a button to copy it whole — then the kit's
 * other parts, and the one action and the way into the full page pinned to
 * the bottom. Deliberately less than the page: the dialog is for deciding,
 * and for taking the prompt.
 */
export default function KitQuickView({ kit, viewer }: { kit: Asset; viewer: Viewer | null }) {
  const graph = kitGraph(kit);
  const has = new Set<NodeId>([...graph.main, ...graph.branch].map((n) => n.id));
  const access = kitAccess(kit, viewer);
  const still = stillFor(kit, ITEM_W);
  const clip = kit.clip && !kit.sample ? clipUrl(kit.clip, ITEM_W) : undefined;
  const aspect = kit.aspect || 16 / 10;
  const parts = has.size;

  const prompts = [
    {
      kind: "reconstruction" as const,
      title: "Reconstruction prompt",
      what: "Rebuilds this design in your stack, from the spec.",
      icon: "prompt" as IconName,
      length: kit.promptLength,
      preview: kit.promptPreview,
    },
    {
      kind: "adaptation" as const,
      title: "Adaptation prompt",
      what: "Keeps the layout and motion, swaps in your brand.",
      icon: "branch" as IconName,
      length: kit.adaptationLength,
      preview: kit.adaptationPreview,
    },
  ].filter((p) => (p.length ?? 0) > 0);

  return (
    <div className={s.layout}>
      <div className={s.stage} style={{ "--ratio": String(aspect) } as CSSProperties}>
        <Media still={still} clip={clip} alt={`${kit.name} — the finished design`} play="auto" priority />
      </div>

      <div className={s.details}>
        <div className={s.detailsBody}>
          <div className={s.words}>
            <p className={s.chips}>
              <span className={s.chip}>{typeLabel(kit.type)}</span>
              <span className={s.chip}>{tierLabel(kit)}</span>
              {kit.sample ? (
                <span className={s.chip} data-tone="sample">
                  {kit.illustrative ? "Illustrative" : "Sample"}
                </span>
              ) : null}
            </p>
            <h2 className={s.name}>{kit.name}</h2>
            {kit.tagline ? <p className={s.tagline}>{kit.tagline}</p> : null}
          </div>

          <section className={s.prompts} aria-labelledby="qv-prompts">
            <div className={s.blockHead}>
              <h3 id="qv-prompts">Prompts</h3>
              <span>{prompts.length ? `${prompts.length} to copy` : "None yet"}</span>
            </div>

            {prompts.length ? (
              prompts.map((p) => (
                <article key={p.kind} className={s.prompt}>
                  <div className={s.promptHead}>
                    <span className={s.promptIcon} aria-hidden="true">
                      <Icon name={p.icon} size={15} />
                    </span>
                    <span className={s.promptWords}>
                      <strong>{p.title}</strong>
                      <span>{p.what}</span>
                    </span>
                    <span className={s.promptLength}>{p.length?.toLocaleString("en")} chars</span>
                  </div>
                  {p.preview ? (
                    <pre className={s.promptPreview} aria-label={`First lines of the ${p.title.toLowerCase()}`}>
                      {p.preview}
                    </pre>
                  ) : null}
                  <CopyPrompt slug={kit.slug} kind={p.kind} disabled={kit.sample} />
                </article>
              ))
            ) : (
              <p className={s.promptsEmpty}>
                This kit’s prompts are not published yet. The preview is here now; the prompts follow when they have
                been tested.
              </p>
            )}
          </section>

          <section className={s.others} aria-labelledby="qv-parts">
            <div className={s.blockHead}>
              <h3 id="qv-parts">Also in the kit</h3>
              <span>{parts} of 6 parts</span>
            </div>
            <ul className={s.partChips}>
              {OTHER_PARTS.map((p) => (
                <li key={p.id} data-on={has.has(p.id) ? "" : undefined}>
                  <Icon name={p.icon} size={13} />
                  {p.title}
                  <span className="v-sr">{has.has(p.id) ? ", published" : ", not published yet"}</span>
                </li>
              ))}
            </ul>
            <p className={s.proof} data-ok={graph.verified ? "" : undefined}>
              <span className={s.proofMark} aria-hidden="true">
                {graph.verified ? <Icon name="check" size={12} /> : null}
              </span>
              {graph.verified ? "Rebuild verified — the test records are on the kit page." : "Not verified yet."}
            </p>
          </section>
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
            <Icon name="arrowUpRight" size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}
