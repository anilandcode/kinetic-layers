"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { IconName } from "../Icon";
import Icon from "../Icon";
import { EASE, gsap, MOTION_OK, ScrollTrigger, useGSAP } from "../motion";
import s from "./NodeCanvas.module.css";

type Port = "sand" | "sage" | "sky" | "ember";
type NodeDef = {
  id: string;
  title: string;
  icon: IconName;
  port: Port;
  fields: string[];
  /** Grid placement on the canvas (column, row), 1-based. */
  at: [number, number];
  thumb?: boolean;
};

/* What every kit is made of. Field names only — no values, because this is
   the shape of a kit, not a claim about any particular one. */
const NODES: NodeDef[] = [
  { id: "reference", title: "Reference", icon: "image", port: "sand", fields: ["image", "video"], at: [1, 1], thumb: true },
  { id: "spec", title: "Design spec", icon: "spec", port: "sage", fields: ["type", "colour", "spacing", "motion"], at: [2, 1] },
  { id: "rebuild", title: "Reconstruction prompt", icon: "prompt", port: "sky", fields: ["rebuilds the reference from the spec"], at: [3, 1] },
  { id: "output", title: "Verified output", icon: "output", port: "ember", fields: ["tool", "model", "date", "result"], at: [4, 1] },
  { id: "adapt", title: "Adaptation prompt", icon: "branch", port: "sky", fields: ["palette", "typeface", "copy"], at: [3, 2] },
  { id: "brand", title: "Your brand", icon: "brand", port: "ember", fields: ["the kit, in your identity"], at: [4, 2] },
];

const WIRES: Array<[string, string]> = [
  ["reference", "spec"],
  ["spec", "rebuild"],
  ["rebuild", "output"],
  ["spec", "adapt"],
  ["adapt", "brand"],
];

/**
 * How a kit works, drawn as the node editors in the references: glass nodes on
 * a dotted canvas, coloured ports, curved wires with a pulse running along
 * them. The wires are measured from the nodes after layout, so they follow at
 * any width; below 760px the canvas becomes a vertical spine and the wires
 * are not drawn.
 */
export default function NodeCanvas({ thumb }: { thumb?: string }) {
  const canvas = useRef<HTMLDivElement | null>(null);
  const [paths, setPaths] = useState<Array<{ id: string; d: string }>>([]);

  useLayoutEffect(() => {
    const root = canvas.current;
    if (!root) return;
    const measure = () => {
      if (window.matchMedia("(max-width: 760px)").matches) return setPaths([]);
      const box = root.getBoundingClientRect();
      const port = (id: string, side: "in" | "out") => {
        const el = root.querySelector<HTMLElement>(`[data-node="${id}"] [data-port="${side}"]`);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top };
      };
      const next: Array<{ id: string; d: string }> = [];
      for (const [from, to] of WIRES) {
        const a = port(from, "out");
        const b = port(to, "in");
        if (!a || !b) continue;
        const bend = Math.max(40, Math.abs(b.x - a.x) * 0.45);
        next.push({ id: `${from}-${to}`, d: `M ${a.x} ${a.y} C ${a.x + bend} ${a.y}, ${b.x - bend} ${b.y}, ${b.x} ${b.y}` });
      }
      setPaths(next);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    return () => ro.disconnect();
  }, []);

  useGSAP(
    () => {
      if (!paths.length) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const base = gsap.utils.toArray<SVGPathElement>("[data-wire]");
        base.forEach((p) => {
          const len = p.getTotalLength();
          gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
        });
        gsap.to(base, {
          strokeDashoffset: 0,
          duration: 1.2,
          ease: EASE,
          stagger: 0.15,
          scrollTrigger: { trigger: canvas.current, start: "top 80%", once: true },
        });
        gsap.to("[data-pulse]", { strokeDashoffset: -180, duration: 2.6, ease: "none", repeat: -1 });
        ScrollTrigger.refresh();
      });
      return () => mm.revert();
    },
    { scope: canvas, dependencies: [paths] }
  );

  return (
    <div ref={canvas} className={s.canvas}>
      <svg className={s.wires} aria-hidden="true">
        {paths.map((p) => (
          <g key={p.id}>
            <path d={p.d} className={s.wire} data-wire="" />
            <path d={p.d} className={s.pulse} data-pulse="" />
          </g>
        ))}
      </svg>
      <ol className={s.nodes} aria-label="The parts of a kit, in order">
        {NODES.map((n) => (
          <li
            key={n.id}
            data-node={n.id}
            className={s.node}
            style={{ gridColumn: n.at[0], gridRow: n.at[1] }}
            data-branch={n.at[1] === 2 ? "" : undefined}
          >
            <span className={s.port} data-port="in" data-tone={n.port} aria-hidden="true" />
            <span className={s.nodeHead}>
              <Icon name={n.icon} size={15} />
              <span>{n.title}</span>
            </span>
            {n.thumb && thumb ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className={s.thumb} src={thumb} alt="" loading="lazy" decoding="async" />
            ) : null}
            <span className={s.fields}>
              {n.fields.map((f) => (
                <span key={f} className={s.field}>
                  <i data-tone={n.port} aria-hidden="true" />
                  {f}
                </span>
              ))}
            </span>
            <span className={s.port} data-port="out" data-tone={n.port} aria-hidden="true" />
          </li>
        ))}
      </ol>
      <p className={s.legend}>
        <span className={s.legendDot} aria-hidden="true" />
        Each kit page draws only the parts that kit really has.
      </p>
    </div>
  );
}
