"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { MotionSitesReference } from "@/lib/kl/motionsites";

export default function MotionSitesReferenceCard({ reference }: { reference: MotionSitesReference }) {
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [aspect, setAspect] = useState(1.4);
  const reduced = useReducedMotion();
  const opener = useRef<HTMLButtonElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    close.current?.focus();
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab" || !dialog.current) return;
      const focusable = Array.from(dialog.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])'))
        .filter((element) => element.getClientRects().length > 0);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    const keepFocusInside = (event: FocusEvent) => {
      if (dialog.current && !dialog.current.contains(event.target as Node)) close.current?.focus();
    };
    document.addEventListener("keydown", dismiss);
    document.addEventListener("focusin", keepFocusInside);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", dismiss);
      document.removeEventListener("focusin", keepFocusInside);
      document.body.style.overflow = previousOverflow;
      opener.current?.focus({ preventScroll: true });
    };
  }, [open]);

  return <div className="bench-wall-cell">
    <button ref={opener} type="button" className="bench-card bench-reference-card" onClick={() => setOpen(true)} aria-label={`Open ${reference.name}, MotionSites reference`}>
      {failed ? <span className="bench-reference-unavailable">Preview unavailable</span> : <motion.img src={reference.media} alt="" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: loaded ? 1 : 0 }} transition={{ duration: reduced ? 0 : 0.2 }} onLoad={(event) => { const image = event.currentTarget; if (image.naturalWidth && image.naturalHeight) setAspect(image.naturalWidth / image.naturalHeight); setLoaded(true); }} onError={() => setFailed(true)} />}
      <span className="bench-card-kind">Reference</span>
      <span className="bench-card-scrim" />
      <span className="bench-card-caption"><strong>{reference.name}</strong><span>MotionSites reference</span></span>
    </button>
    <AnimatePresence>{open ? <motion.div className="bench-reference-overlay" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .2 }} onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}>
      <motion.article ref={dialog} className="bench-reference-popup bench-dialog" role="dialog" aria-modal="true" aria-labelledby={`reference-${reference.name}`} style={{ "--bench-media-aspect": String(aspect) } as CSSProperties} initial={reduced ? false : { opacity: 0, y: 18, scale: .99 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={reduced ? { opacity: 0 } : { opacity: 0, y: 10, scale: .99 }} transition={reduced ? { duration: 0 } : { duration: .2, ease: "easeOut" }}>
        <section className="bench-reference-stage bench-dialog-stage">
          {failed ? <span className="bench-reference-unavailable">Preview unavailable</span> : <motion.img src={reference.media} alt={`${reference.name} reference preview`} initial={reduced ? false : { opacity: 0 }} animate={{ opacity: loaded ? 1 : 0 }} transition={{ duration: reduced ? 0 : 0.2 }} onLoad={(event) => { const image = event.currentTarget; if (image.naturalWidth && image.naturalHeight) setAspect(image.naturalWidth / image.naturalHeight); setLoaded(true); }} onError={() => setFailed(true)} />}
        </section>
        <section className="bench-reference-details bench-dialog-details">
          <button ref={close} className="bench-dialog-close" type="button" onClick={() => setOpen(false)} aria-label="Close reference preview">×</button>
          <span className="bench-dialog-eyebrow">Reference</span><h2 className="bench-dialog-title" id={`reference-${reference.name}`}>{reference.name}</h2>
          <dl className="bench-dialog-facts"><div><dt>Source</dt><dd>MotionSites</dd></div><div><dt>Access</dt><dd>Reference only</dd></div></dl>
          <div className="bench-dialog-actions">
            <p className="bench-dialog-note">This is an attributed visual reference. It has no download, purchase, or catalogue action.</p>
            <a className="bench-dialog-primary" href="https://motionsites.ai/" target="_blank" rel="noreferrer">View MotionSites ↗</a>
          </div>
        </section>
      </motion.article>
    </motion.div> : null}</AnimatePresence>
  </div>;
}
