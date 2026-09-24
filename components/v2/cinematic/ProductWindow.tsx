"use client";

import Link from "next/link";
import { useId, useState } from "react";
import type { Asset } from "@/lib/kl/types";
import { clip as clipUrl, ITEM_W } from "@/lib/kl/media";
import { kitGraph, stillFor, tierLabel, typeLabel, type NodeId } from "@/lib/v2/kit";
import Icon, { type IconName } from "../Icon";
import Media from "../Media";
import Mark from "../Mark";
import s from "./CleanHome.module.css";

type Tab = "preview" | "anatomy" | "prompt";

const PARTS: Array<{ id: NodeId; title: string; icon: IconName }> = [
  { id: "reference", title: "Reference", icon: "image" },
  { id: "spec", title: "Design spec", icon: "spec" },
  { id: "reconstruction", title: "Reconstruction prompt", icon: "prompt" },
  { id: "output", title: "Tested rebuild", icon: "output" },
  { id: "adaptation", title: "Adaptation prompt", icon: "branch" },
  { id: "brand", title: "Your brand", icon: "brand" },
];

/**
 * The product, under glass — the first cinematic hero's window, now with
 * working tabs. Preview plays the kit with its anatomy popover; Anatomy lists
 * all six parts and which this kit has; Prompt shows the first lines of the
 * reconstruction prompt, the part anyone may read.
 */
export default function ProductWindow({ kit }: { kit: Asset }) {
  const [tab, setTab] = useState<Tab>("preview");
  const uid = useId();
  const graph = kitGraph(kit);
  const has = new Set<NodeId>([...graph.main, ...graph.branch].map((n) => n.id));
  const still = stillFor(kit, ITEM_W);
  const clip = kit.clip && !kit.sample ? clipUrl(kit.clip, ITEM_W) : undefined;
  const tabs: Array<[Tab, string]> = [
    ["preview", "Preview"],
    ["anatomy", "Anatomy"],
    ["prompt", "Prompt"],
  ];

  return (
    <div className={s.panel}>
      <span className={s.sheen} aria-hidden="true" />
      <aside className={s.panelRail} aria-hidden="true">
        <span className={s.railLogo}>
          <Mark size={16} />
        </span>
        {(["image", "spec", "prompt", "output"] as IconName[]).map((icon, i) => (
          <span key={icon} className={s.railIcon} data-active={i === 0 ? "" : undefined}>
            <Icon name={icon} size={16} />
          </span>
        ))}
      </aside>

      <div className={s.panelMain}>
        <div className={s.panelBar}>
          <span className={s.panelSearch} aria-hidden="true">
            <Icon name="search" size={14} /> Search kits
            <kbd>⌘K</kbd>
          </span>
          <span className={s.panelTabs} role="tablist" aria-label={`${kit.name}`}>
            {tabs.map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                id={`${uid}-${id}`}
                aria-selected={tab === id}
                aria-controls={`${uid}-view`}
                className={s.panelTab}
                onClick={() => setTab(id)}
              >
                {label}
              </button>
            ))}
          </span>
          <Link href={`/item/${kit.slug}`} className={s.panelOpen}>
            {kit.name}
            <span>
              {typeLabel(kit.type)} · {tierLabel(kit)}
            </span>
            <Icon name="arrowUpRight" size={14} />
          </Link>
        </div>

        <div className={s.panelStage} role="tabpanel" id={`${uid}-view`} aria-labelledby={`${uid}-${tab}`}>
          {/* The media stays mounted so switching tabs never reloads the kit. */}
          <div className={s.stageMedia} data-dim={tab !== "preview" ? "" : undefined}>
            <Media still={still} clip={clip} alt={`${kit.name}, the finished design`} play="auto" priority />
          </div>

          {tab === "preview" ? (
            <div className={s.panelNodes}>
              <p>Kit anatomy</p>
              {PARTS.filter((p) => has.has(p.id)).map((p) => (
                <span key={p.id}>
                  <i />
                  {p.title}
                </span>
              ))}
              {!graph.verified ? <span className={s.panelMuted}>Not yet verified</span> : null}
            </div>
          ) : null}

          {tab === "anatomy" ? (
            <div className={s.stageSheet}>
              <p className={s.sheetHead}>What {kit.name} is made of</p>
              <ul className={s.partList}>
                {PARTS.map((p) => (
                  <li key={p.id} data-on={has.has(p.id) ? "" : undefined}>
                    <span className={s.partIcon}>
                      <Icon name={p.icon} size={15} />
                    </span>
                    {p.title}
                    <span className={s.partState}>{has.has(p.id) ? "Published" : "Not yet"}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {tab === "prompt" ? (
            <div className={s.stageSheet}>
              <p className={s.sheetHead}>Reconstruction prompt</p>
              <pre className={s.promptBody}>
                {kit.promptPreview
                  ? kit.promptPreview
                  : kit.promptLength
                    ? `${kit.promptLength.toLocaleString("en")} characters — the first lines open on the kit page.`
                    : `The reconstruction prompt for ${kit.name} is not published yet.`}
              </pre>
              {kit.promptLength ? (
                <p className={s.promptMore}>
                  <Icon name="lock" size={13} /> {kit.promptLength.toLocaleString("en")} characters in full, with the kit
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
