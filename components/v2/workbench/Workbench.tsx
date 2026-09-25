"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { Asset } from "@/lib/kl/types";
import { clip as clipUrl, ITEM_W } from "@/lib/kl/media";
import { kitGraph, stillFor, tierLabel, typeLabel, type NodeId } from "@/lib/v2/kit";
import Icon, { type IconName } from "../Icon";
import Media from "../Media";
import { StillImage } from "../FirstFrame";
import Mark from "../Mark";
import { EASE, gsap, MOTION_OK } from "../motion";
import s from "./Workbench.module.css";

/**
 * The workbench — Home as the node editors in the owner's references.
 *
 * Pick a kit on the left and the canvas draws its real anatomy: the reference,
 * the design spec, the adaptation prompt, the kit itself (the references'
 * "image generator" node, with its true settings), and the tested rebuild.
 * Parts a kit does not have yet are drawn as ghosts that say so. The preview
 * on the right plays the kit; the floating bar at the bottom shows the first
 * lines of its reconstruction prompt — the part everyone may read.
 *
 * Geometry is fixed in a 900 × 760 space and scaled to fit, so the wires are
 * plain SVG with no measuring. Zoom works; the "you" cursor is the visitor's
 * own pointer, never an invented collaborator.
 */

const W = 900;
const H = 760;

type Box = { x: number; y: number; w: number; h: number };
const BOX: Record<"reference" | "spec" | "adapt" | "kit" | "verify", Box> = {
  reference: { x: 22, y: 196, w: 200, h: 244 },
  spec: { x: 276, y: 58, w: 222, h: 200 },
  adapt: { x: 276, y: 380, w: 222, h: 190 },
  kit: { x: 552, y: 110, w: 238, h: 364 },
  verify: { x: 552, y: 496, w: 238, h: 64 },
};

const OUT = (b: Box) => ({ x: b.x + b.w, y: b.y + 40 });
const IN = (b: Box) => ({ x: b.x, y: b.y + 40 });
const KIT_IN = (row: number) => ({ x: BOX.kit.x, y: BOX.kit.y + 74 + row * 22 });

function curve(a: { x: number; y: number }, b: { x: number; y: number }) {
  const d = Math.max(40, Math.abs(b.x - a.x) * 0.5);
  return `M ${a.x} ${a.y} C ${a.x + d} ${a.y}, ${b.x - d} ${b.y}, ${b.x} ${b.y}`;
}

const WIRES: Array<{ id: string; d: string; need: NodeId[] }> = [
  { id: "ref-spec", d: curve(OUT(BOX.reference), IN(BOX.spec)), need: ["reference", "spec"] },
  { id: "ref-adapt", d: curve(OUT(BOX.reference), IN(BOX.adapt)), need: ["reference", "adaptation"] },
  { id: "ref-kit", d: curve(OUT(BOX.reference), KIT_IN(0)), need: ["reference"] },
  { id: "spec-kit", d: curve(OUT(BOX.spec), KIT_IN(1)), need: ["spec"] },
  { id: "adapt-kit", d: curve(OUT(BOX.adapt), KIT_IN(2)), need: ["adaptation"] },
  { id: "kit-out", d: curve({ x: BOX.kit.x + BOX.kit.w, y: BOX.kit.y + 74 }, { x: W, y: 150 }), need: [] },
  {
    id: "kit-verify",
    d: `M ${BOX.kit.x + BOX.kit.w / 2} ${BOX.kit.y + BOX.kit.h} L ${BOX.verify.x + BOX.verify.w / 2} ${BOX.verify.y}`,
    need: ["output"],
  },
];

const place = (b: Box) => ({ left: b.x, top: b.y, width: b.w, height: b.h }) as CSSProperties;

/* The six parts of a finished kit, for the single-kit panel. */
const PARTS: Array<{ id: NodeId; title: string; icon: IconName }> = [
  { id: "reference", title: "Reference", icon: "image" },
  { id: "spec", title: "Design spec", icon: "spec" },
  { id: "reconstruction", title: "Reconstruction prompt", icon: "prompt" },
  { id: "output", title: "Tested rebuild", icon: "output" },
  { id: "adaptation", title: "Adaptation prompt", icon: "branch" },
  { id: "brand", title: "Your brand", icon: "brand" },
];

function Ghost({ what }: { what: string }) {
  return <span className={s.ghostNote}>{what} is not published for this kit yet.</span>;
}

/**
 * `single` is the kit page's bench: one kit, so the kit picker becomes the
 * list of its six parts, the preview column goes (the page's stage already
 * plays the kit) and the canvas fits its height as well as its width.
 */
export default function Workbench({
  kits,
  initial,
  single = false,
}: {
  kits: Asset[];
  initial?: string;
  single?: boolean;
}) {
  const [slug, setSlug] = useState(initial ?? kits[0]?.slug);
  const [q, setQ] = useState("");
  const [zoom, setZoom] = useState(1);
  const [scale, setScale] = useState(1);
  const [copied, setCopied] = useState(false);
  const stage = useRef<HTMLDivElement | null>(null);
  const world = useRef<HTMLDivElement | null>(null);
  const cursor = useRef<HTMLSpanElement | null>(null);

  const index = Math.max(0, kits.findIndex((k) => k.slug === slug));
  const kit = kits[index];
  const graph = useMemo(() => (kit ? kitGraph(kit) : null), [kit]);
  const has = useMemo(() => new Set<NodeId>(graph ? [...graph.main, ...graph.branch].map((n) => n.id) : []), [graph]);
  const parts = ["reference", "spec", "reconstruction", "output", "adaptation", "brand"].filter((p) =>
    has.has(p as NodeId)
  ).length;

  const real = kits.filter((k) => !k.sample);
  const samples = kits.filter((k) => k.sample);
  const match = (k: Asset) => !q.trim() || `${k.name} ${k.type}`.toLowerCase().includes(q.trim().toLowerCase());

  /* Scale the fixed 900 × 760 world to the stage. */
  useLayoutEffect(() => {
    const el = stage.current;
    if (!el) return;
    /* The smaller of the two, so a canvas given a fixed height still fits. */
    const fit = () => setScale(Math.min(el.clientWidth / W, el.clientHeight / H) || el.clientWidth / W);
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* A kit change redraws the canvas: nodes rise in, wires draw along. */
  useEffect(() => {
    const root = world.current;
    if (!root || !window.matchMedia(MOTION_OK).matches) return;
    const nodes = root.querySelectorAll("[data-node]");
    /* Ghost wires keep their dashes; only live ones draw in. */
    const wires = root.querySelectorAll<SVGPathElement>("[data-live] [data-wire]");
    gsap.fromTo(nodes, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, ease: EASE, stagger: 0.05 });
    wires.forEach((p) => {
      const len = p.getTotalLength();
      gsap.fromTo(p, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 0.9, ease: EASE, delay: 0.15 });
    });
  }, [slug]);

  /* The visitor's own cursor, labelled — the only presence on this canvas. */
  useEffect(() => {
    const el = stage.current;
    const tag = cursor.current;
    if (!el || !tag || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const x = gsap.quickTo(tag, "x", { duration: 0.25, ease: "power3.out" });
    const y = gsap.quickTo(tag, "y", { duration: 0.25, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tag.dataset.on = "";
      x(e.clientX - r.left + 10);
      y(e.clientY - r.top + 12);
    };
    const leave = () => delete tag.dataset.on;
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, []);

  if (!kit || !graph) return null;

  const step = (dir: 1 | -1) => setSlug(kits[(index + dir + kits.length) % kits.length].slug);
  const still = stillFor(kit, 900);
  const clip = kit.clip && !kit.sample ? clipUrl(kit.clip, ITEM_W) : undefined;
  const records = kit.verifications ?? [];
  const pass = records.find((r) => r.result === "Pass");
  const openSearch = () =>
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, ctrlKey: true, bubbles: true }));
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/item/${kit.slug}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* Clipboard can be refused; the link is still on the Open button. */
    }
  };

  const tools: Array<{ icon: IconName; label: string; href?: string; onClick?: () => void; active?: boolean }> = [
    { icon: "arrowUpRight", label: "Open the kit", href: `/item/${kit.slug}`, active: true },
    { icon: "search", label: "Search kits", onClick: openSearch },
    { icon: "file", label: copied ? "Link copied" : "Copy the kit's link", onClick: copyLink },
    { icon: "prompt", label: "Use it over MCP", href: "/mcp" },
  ];

  return (
    <div className={s.bench} data-single={single ? "" : undefined}>
      {/* ---------- Top bar ---------- */}
      <div className={s.top}>
        <span className={s.brand}>
          <span className={s.brandMark}>
            <Mark size={18} />
          </span>
          <span className={s.crumb}>Workbench</span>
          <span className={s.crumbDim}>Kit anatomy</span>
        </span>
        <span className={s.tabs}>
          {single ? null : (
            <button type="button" className={s.square} onClick={() => step(-1)} aria-label="Previous kit">
              <Icon name="arrow" size={14} className={s.flip} />
            </button>
          )}
          <span className={s.tab}>
            {kit.name}
            <span className={s.tabType}>{typeLabel(kit.type)}</span>
          </span>
          {single ? null : (
            <button type="button" className={s.square} onClick={() => step(1)} aria-label="Next kit">
              <Icon name="arrow" size={14} />
            </button>
          )}
        </span>
        {single ? (
          <span className={s.actions}>
            <button type="button" className={s.dark} onClick={copyLink}>
              <Icon name={copied ? "check" : "file"} size={14} /> {copied ? "Link copied" : "Copy link"}
            </button>
            <Link href="/mcp" className={s.white}>
              <Icon name="prompt" size={14} /> Use over MCP
            </Link>
          </span>
        ) : (
          <span className={s.actions}>
            <Link href={`/item/${kit.slug}`} className={s.white}>
              <Icon name="arrowUpRight" size={14} /> Open kit
            </Link>
            <Link href="/join" className={s.dark}>
              Join free
            </Link>
          </span>
        )}
      </div>

      <div className={s.body}>
        {/* ---------- Left: the kit's parts, or the kits to choose from ---------- */}
        {single ? (
          <aside className={s.panel} aria-label={`What ${kit.name} is made of`}>
            <p className={s.groupHead}>
              <Icon name="spec" size={13} />
              Parts
              <span className={s.count}>{parts}/6</span>
            </p>
            <ul className={s.parts}>
              {PARTS.map((p) => (
                <li key={p.id} data-on={has.has(p.id) ? "" : undefined}>
                  <span className={s.partIcon}>
                    <Icon name={p.icon} size={14} />
                  </span>
                  <span>
                    {p.title}
                    <small>{has.has(p.id) ? "Published" : "Not yet"}</small>
                  </span>
                </li>
              ))}
            </ul>
            <div className={s.connect}>
              {["Claude Code", "Cursor"].map((tool) => (
                <Link key={tool} href="/mcp" className={s.connectRow}>
                  <span className={s.connectIcon} aria-hidden="true">
                    <Icon name="prompt" size={14} />
                  </span>
                  <span>
                    {tool}
                    <small>over MCP</small>
                  </span>
                  <span className={s.connectBtn}>Connect</span>
                </Link>
              ))}
            </div>
          </aside>
        ) : (
          <aside className={s.panel} aria-label="Choose a kit">
            <label className={s.search}>
              <Icon name="search" size={14} />
              <span className="v-sr">Filter kits</span>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter kits" autoComplete="off" />
            </label>

            {[
              { title: "Published kits", list: real.filter(match) },
              { title: "Samples · previews only", list: samples.filter(match) },
            ]
              .filter((g) => g.list.length)
              .map((group) => (
                <div key={group.title} className={s.group}>
                  <p className={s.groupHead}>
                    <Icon name="spec" size={13} />
                    {group.title}
                    <span className={s.count}>{group.list.length}</span>
                  </p>
                  <div className={s.tiles} role="listbox" aria-label={group.title}>
                    {group.list.map((k) => (
                      <button
                        key={k.slug}
                        type="button"
                        role="option"
                        aria-selected={k.slug === kit.slug}
                        className={s.tile}
                        onClick={() => setSlug(k.slug)}
                      >
                        <span className={s.tileName}>{k.name}</span>
                        <span className={s.tileMeta}>{typeLabel(k.type)}</span>
                        <span className={s.tileThumb}>
                          {stillFor(k, 300) ? <StillImage src={stillFor(k, 300)!} /> : null}
                        </span>
                        {k.slug === kit.slug ? (
                          <span className={s.tick} aria-hidden="true">
                            <Icon name="check" size={11} />
                          </span>
                        ) : null}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

            <div className={s.connect}>
              {["Claude Code", "Cursor"].map((tool) => (
                <Link key={tool} href="/mcp" className={s.connectRow}>
                  <span className={s.connectIcon} aria-hidden="true">
                    <Icon name="prompt" size={14} />
                  </span>
                  <span>
                    {tool}
                    <small>over MCP</small>
                  </span>
                  <span className={s.connectBtn}>Connect</span>
                </Link>
              ))}
            </div>
          </aside>
        )}

        {/* ---------- Centre: the canvas ---------- */}
        <div ref={stage} className={s.stage} style={{ "--scale": scale * zoom } as CSSProperties}>
          <div ref={world} className={s.world}>
            <p className={s.canvasTitle}>
              {kit.name} · anatomy {kit.version ? `v${kit.version}` : "v1"}
            </p>

            <svg className={s.wires} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
              {WIRES.map((w) => {
                const live = w.need.every((n) => has.has(n));
                return (
                  <g key={w.id} data-live={live ? "" : undefined}>
                    <path d={w.d} className={s.wire} data-wire="" />
                    {live ? <path d={w.d} className={s.pulse} /> : null}
                  </g>
                );
              })}
            </svg>

            {/* Reference — the references' "Model" node */}
            <span className={s.label} style={{ left: BOX.reference.x, top: BOX.reference.y - 26 }}>
              <i /> Reference
            </span>
            <div data-node="" className={`${s.node} ${s.selected}`} style={place(BOX.reference)}>
              <div className={s.inner}>
                <span className={s.thumb}>
                  {still ? <StillImage src={still} /> : null}
                </span>
                <span className={s.ports}>
                  <span>
                    image <i data-c="yellow" />
                  </span>
                  <span>
                    video <i data-c={kit.clip ? "green" : "off"} />
                  </span>
                </span>
              </div>
              <span className={s.select}>
                {kit.width && kit.height ? `${kit.width} × ${kit.height}` : typeLabel(kit.type)}
                <Icon name="chevronDown" size={12} />
              </span>
            </div>

            {/* Design spec — "Positive" */}
            <span className={s.label} style={{ left: BOX.spec.x, top: BOX.spec.y - 26 }}>
              <i /> Design spec
            </span>
            <div data-node="" className={`${s.node} ${has.has("spec") ? "" : s.ghost}`} style={place(BOX.spec)}>
              <span className={s.nodeHead}>
                <i data-c="green" /> Spec <span className={s.headPort} data-c="green" />
              </span>
              {has.has("spec") ? (
                <p className={s.text}>{(kit.notes ?? "").replace(/\s+/g, " ").slice(0, 150)}…</p>
              ) : (
                <Ghost what="The design spec" />
              )}
              <span className={s.field}>type · colour · spacing · motion</span>
            </div>

            {/* Adaptation prompt — "Negative" */}
            <span className={s.label} style={{ left: BOX.adapt.x, top: BOX.adapt.y - 26 }}>
              <i /> Adaptation
            </span>
            <div data-node="" className={`${s.node} ${has.has("adaptation") ? "" : s.ghost}`} style={place(BOX.adapt)}>
              <span className={s.nodeHead}>
                <i data-c="red" /> Adaptation prompt <span className={s.headPort} data-c="red" />
              </span>
              {has.has("adaptation") ? (
                <p className={s.text}>{kit.adaptationPreview}</p>
              ) : (
                <Ghost what="The adaptation prompt" />
              )}
              <span className={s.field}>palette · typeface · copy</span>
            </div>

            {/* The kit — "Image Generator" */}
            <span className={s.label} style={{ left: BOX.kit.x, top: BOX.kit.y - 26 }}>
              <i /> {kit.name}
            </span>
            <div data-node="" className={`${s.node} ${s.generator}`} style={place(BOX.kit)}>
              <span className={s.aurora} aria-hidden="true" />
              <div className={s.inner}>
                <span className={s.inputs}>
                  <span>
                    <i data-c="yellow" /> reference
                  </span>
                  <span>
                    <i data-c={has.has("spec") ? "green" : "off"} /> spec
                  </span>
                  <span>
                    <i data-c={has.has("adaptation") ? "red" : "off"} /> adaptation
                  </span>
                </span>
                <span className={s.outLabel}>
                  kit <i data-c="blue" />
                </span>
              </div>
              {[
                ["Type", typeLabel(kit.type)],
                ["Access", tierLabel(kit)],
                ["Version", kit.version ?? "—"],
                ["Parts", `${parts} / 6`],
                ["Prompt", kit.promptLength ? `${kit.promptLength.toLocaleString("en")} chars` : "Not yet"],
              ].map(([k, v]) => (
                <span key={k} className={s.setting}>
                  <span>{k}</span>
                  <span className={s.value}>
                    {v}
                    <Icon name="chevronDown" size={11} />
                  </span>
                </span>
              ))}
            </div>

            {/* The tested rebuild — the warm "VAE Decode" node */}
            <div data-node="" className={`${s.node} ${pass ? s.warm : s.ghost}`} style={place(BOX.verify)}>
              <span className={s.nodeHead}>
                <i data-c={pass ? "white" : "off"} /> Tested rebuild
              </span>
              <span className={s.verifyLine}>
                {pass ? `${pass.tool} · ${pass.result}` : "Not yet verified"}
              </span>
            </div>

            <span ref={cursor} className={s.cursor} aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24">
                <path d="M3 2l18 8-8 3-3 8z" fill="currentColor" />
              </svg>
              <span>you</span>
            </span>
          </div>

          <div className={s.zoom} role="group" aria-label="Zoom the canvas">
            <button type="button" onClick={() => setZoom((z) => Math.min(1.3, +(z + 0.1).toFixed(2)))} aria-label="Zoom in">
              +
            </button>
            <button type="button" onClick={() => setZoom((z) => Math.max(0.8, +(z - 0.1).toFixed(2)))} aria-label="Zoom out">
              −
            </button>
            <button type="button" onClick={() => setZoom(1)} aria-label="Fit">
              <Icon name="fit" size={14} />
            </button>
          </div>

          {/* The prompt bar — the first lines of the reconstruction prompt */}
          <div className={s.prompt}>
            <p className={s.promptLabel}>Reconstruction prompt</p>
            <p className={s.promptText}>
              {kit.promptPreview
                ? kit.promptPreview
                : kit.promptLength
                  ? `${kit.promptLength.toLocaleString("en")} characters — the first lines open on the kit page.`
                  : `The reconstruction prompt for ${kit.name} is not published yet.`}
            </p>
            <div className={s.promptTools}>
              {tools.map((t) =>
                t.href ? (
                  <Link key={t.label} href={t.href} className={s.tool} data-active={t.active ? "" : undefined} aria-label={t.label} title={t.label}>
                    <Icon name={t.icon} size={15} />
                  </Link>
                ) : (
                  <button key={t.label} type="button" className={s.tool} onClick={t.onClick} aria-label={t.label} title={t.label}>
                    <Icon name={t.icon} size={15} />
                  </button>
                )
              )}
            </div>
          </div>

          <p className={s.stats} aria-hidden="true">
            parts {parts}/6
            <br />
            kits {real.length}
            <br />v {kit.version ?? "—"}
          </p>
        </div>

        {/* ---------- Right: the preview ---------- */}
        {single ? null : (
          <aside className={s.previewCol} aria-label={`${kit.name} preview`}>
            <span className={s.label}>
              <i /> Preview
            </span>
            <div className={s.preview}>
              <span className={s.previewHead}>
                <i data-c="blue" /> {kit.clip ? "video" : "image"}
              </span>
              <div className={s.previewMedia}>
                <Media key={kit.slug} still={still} clip={clip} alt={`${kit.name}, the finished design`} play="auto" />
                <span className={s.final}>
                  <strong>{kit.name}</strong>
                  <span>{kit.tagline ?? `${typeLabel(kit.type)} · ${tierLabel(kit)}${kit.sample ? " · sample" : ""}`}</span>
                </span>
              </div>
            </div>
            <div className={s.previewTools}>
              <Link href={`/item/${kit.slug}`} className={s.square} aria-label="Open the kit">
                <Icon name="arrowUpRight" size={14} />
              </Link>
              <button type="button" className={s.square} onClick={copyLink} aria-label="Copy the kit's link">
                <Icon name={copied ? "check" : "file"} size={14} />
              </button>
              <span className={s.chip}>{typeLabel(kit.type)}</span>
              <span className={s.chip}>{tierLabel(kit)}</span>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
