"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./BenchPreviewGallery.module.css";

export type PreviewItem = {
  name: string;
  media: string;
  source: string;
  type?: string;
  slug?: string;
  external: boolean;
};

function kind(item: PreviewItem) {
  return item.type || (item.external ? "Reference" : "Layer");
}

export default function BenchPreviewGallery({ items }: { items: PreviewItem[] }) {
  const [selected, setSelected] = useState<PreviewItem | null>(null);
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  const closePreview = () => setSelected(null);
  const openPreview = (item: PreviewItem) => {
    openerRef.current = document.activeElement as HTMLElement;
    setSelected(item);
  };

  useEffect(() => {
    if (!selected) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePreview();
      if (event.key !== "Tab") return;
      const controls = Array.from(document.querySelectorAll<HTMLElement>(`[role="dialog"] button, [role="dialog"] a[href]`));
      if (!controls.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; openerRef.current?.focus(); };
  }, [selected]);

  return (
    <section className={styles.page} aria-labelledby="preview-title">
      <div className={styles.intro}>
        <div>
          <p className={styles.eyebrow}>Development preview / 22 items</p>
          <h1 id="preview-title">Bench, with references.</h1>
          <p className={styles.lede}>A private visual wall for checking the popup, media rhythm, and attribution before these references leave the local build.</p>
        </div>
        <span className={styles.note}>Local only · no catalogue records changed</span>
      </div>
      <div className={styles.wall}>
        {items.map((item, index) => {
          const key = `${item.name}-${index}`;
          const unavailable = failed[key];
          return (
            <button className={styles.card} key={key} type="button" onClick={() => openPreview(item)} aria-label={`Open ${item.name} preview`}>
              <span className={styles.media}>
                {unavailable ? <span className={styles.unavailable}>Preview unavailable</span> : <img src={item.media} alt="" onError={() => setFailed((current) => ({ ...current, [key]: true }))} />}
              </span>
              <span className={styles.cardScrim} aria-hidden="true" />
              <span className={styles.cardMeta}><strong>{item.name}</strong><small>{kind(item)} · {item.source}</small></span>
            </button>
          );
        })}
      </div>
      {selected && (
        <div className={styles.overlay} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && closePreview()}>
          <article className={styles.popup} role="dialog" aria-modal="true" aria-labelledby="selected-title">
            <div className={styles.stage}>
              {failed[`${selected.name}-${items.indexOf(selected)}`] ? <span className={styles.unavailable}>Preview unavailable</span> : <img src={selected.media} alt={`${selected.name} preview`} onError={() => setFailed((current) => ({ ...current, [`${selected.name}-${items.indexOf(selected)}`]: true }))} />}
            </div>
            <div className={styles.details}>
              <button ref={closeRef} className={styles.close} type="button" onClick={closePreview} aria-label="Close preview">×</button>
              <p className={styles.eyebrow}>{kind(selected)}</p>
              <h2 id="selected-title">{selected.name}</h2>
              <dl><div><dt>Source</dt><dd>{selected.source}</dd></div><div><dt>Access</dt><dd>{selected.external ? "Reference only" : "Kinetic Layers asset"}</dd></div></dl>
              {selected.external && <a className={styles.sourceLink} href="https://motionsites.ai/" target="_blank" rel="noreferrer">View MotionSites ↗</a>}
              <p className={styles.disclaimer}>{selected.external ? "This is an attributed visual reference. It has no download, purchase, or catalogue action." : "This is a genuine Kinetic Layers preview. The normal item page handles access and downloads."}</p>
            </div>
          </article>
        </div>
      )}
    </section>
  );
}
