"use client";

import { useId, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import type { KitGraph, KitNode, NodeId } from "@/lib/v2/kit";
import Icon, { type IconName } from "./Icon";
import { Signal } from "./Button";
import s from "./NodeGraph.module.css";

const ICON: Record<NodeId, IconName> = {
  reference: "image",
  spec: "spec",
  reconstruction: "prompt",
  output: "output",
  adaptation: "branch",
  brand: "brand",
};

/**
 * The kit graph — the signature of the kit page.
 *
 *   reference ─▶ spec ─▶ reconstruction ─▶ output
 *                  └──▶ adaptation ─────▶ your brand
 *
 * Laid out on a CSS grid where every other column is a connector, so the
 * lines are real elements that follow the nodes at any width — no measuring,
 * nothing drawn after hydration. Below 720px the same DOM stacks into a
 * vertical spine.
 *
 * The nodes are tabs: each one opens its panel (the media, the spec, the
 * prompt, the test records) in the same material underneath. Arrow keys move
 * between them, as the tab pattern expects.
 */
export default function NodeGraph({
  graph,
  panels,
  label,
  note,
  aside,
}: {
  graph: KitGraph;
  panels: Partial<Record<NodeId, ReactNode>>;
  /** Names the tab list, e.g. "verdro anatomy". */
  label: string;
  /** The proof line, drawn between the graph and the panel. */
  note?: ReactNode;
  /** Sits beside the open panel on wide screens (the kit page's access panel). */
  aside?: ReactNode;
}) {
  const uid = useId();
  const ordered: KitNode[] = [...graph.main, ...graph.branch];
  const [selected, setSelected] = useState<NodeId | null>(ordered[0]?.id ?? null);
  const refs = useRef<Partial<Record<NodeId, HTMLButtonElement | null>>>({});

  if (!ordered.length) return null;

  const cols = Math.max(graph.main.length, graph.branch.length ? graph.branchFrom + 1 + graph.branch.length : 0);
  const template = Array.from({ length: cols }, () => "minmax(0, 1fr)").join(" var(--gc) ");
  const hasBranch = graph.branch.length > 0;

  function onKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const keys: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    let next: number | null = null;
    if (event.key in keys) next = (index + keys[event.key] + ordered.length) % ordered.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = ordered.length - 1;
    if (next === null) return;
    event.preventDefault();
    const id = ordered[next].id;
    setSelected(id);
    refs.current[id]?.focus();
  }

  const node = (n: KitNode, index: number, col: number, row: number) => {
    const active = selected === n.id;
    return (
      <button
        key={n.id}
        ref={(el) => {
          refs.current[n.id] = el;
        }}
        type="button"
        role="tab"
        id={`${uid}-tab-${n.id}`}
        aria-selected={active}
        aria-controls={`${uid}-panel`}
        tabIndex={active ? 0 : -1}
        className={s.node}
        data-active={active ? "" : undefined}
        data-kind={n.id}
        style={{ "--col": col, "--row": row } as CSSProperties}
        onClick={() => setSelected(n.id)}
        onKeyDown={(e) => onKey(e, index)}
      >
        <span className={s.glyph}>
          <Icon name={ICON[n.id]} size={18} />
        </span>
        <span className={s.words}>
          <span className={s.title}>
            {n.title}
            {n.signal ? <Signal className={s.signal} /> : null}
          </span>
          <span className={s.meta}>{n.meta}</span>
        </span>
      </button>
    );
  };

  const link = (key: string, col: number, row: number, delay: number) => (
    <span
      key={key}
      className={s.link}
      aria-hidden="true"
      style={{ "--col": col, "--row": row, "--delay": `${delay}ms` } as CSSProperties}
    >
      <span className={s.pulse} />
    </span>
  );

  const pieces: ReactNode[] = [];
  graph.main.forEach((n, i) => {
    pieces.push(node(n, i, 2 * i + 1, 1));
    if (i < graph.main.length - 1) pieces.push(link(`l-${n.id}`, 2 * i + 2, 1, i * 380));
  });
  if (hasBranch) {
    const originCol = 2 * graph.branchFrom + 1;
    pieces.push(
      <span
        key="elbow"
        className={s.elbow}
        aria-hidden="true"
        style={{ "--col": `${originCol} / span 2`, "--row": 2 } as CSSProperties}
      >
        <span className={s.elbowNote}>
          from {graph.main[graph.branchFrom]?.title ?? "the reference"}
        </span>
      </span>
    );
    graph.branch.forEach((n, j) => {
      const col = 2 * (graph.branchFrom + 1 + j) + 1;
      pieces.push(node(n, graph.main.length + j, col, 2));
      if (j < graph.branch.length - 1) pieces.push(link(`b-${n.id}`, col + 1, 2, 600 + j * 380));
    });
  }

  const current = ordered.find((n) => n.id === selected) ?? ordered[0];

  return (
    <div className={s.graph}>
      <div
        className={s.canvas}
        role="tablist"
        aria-label={label}
        data-single={ordered.length === 1 ? "" : undefined}
        style={{ "--template": template, "--rows": hasBranch ? 2 : 1 } as CSSProperties}
      >
        {pieces}
      </div>
      {note}
      <div className={s.lower} data-aside={aside ? "" : undefined}>
        <div
          className={s.panel}
          role="tabpanel"
          id={`${uid}-panel`}
          aria-labelledby={`${uid}-tab-${current.id}`}
          tabIndex={0}
        >
          {panels[current.id] ?? null}
        </div>
        {aside}
      </div>
    </div>
  );
}
