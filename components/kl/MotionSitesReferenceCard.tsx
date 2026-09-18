"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { MotionSitesReference } from "@/lib/kl/motionsites";

export default function MotionSitesReferenceCard({ reference }: { reference: MotionSitesReference }) {
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const reduced = useReducedMotion();
  const opener = useRef<HTMLButtonElement>(null);
  const close = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    close.current?.focus();
    const dismiss = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", dismiss);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", dismiss); document.body.style.overflow = ""; opener.current?.focus(); };
  }, [open]);

  return <div className="bench-wall-cell">
    <button ref={opener} type="button" className="bench-card bench-reference-card" onClick={() => setOpen(true)} aria-label={`Open ${reference.name}, MotionSites reference`}>
      {failed ? <span className="bench-reference-unavailable">Preview unavailable</span> : <motion.img src={reference.media} alt="" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: loaded ? 1 : 0 }} transition={{ duration: 0.2 }} onLoad={() => setLoaded(true)} onError={() => setFailed(true)} />}
      <span className="bench-card-kind">Reference</span>
      <span className="bench-card-scrim" />
      <span className="bench-card-caption"><strong>{reference.name}</strong><span>MotionSites reference</span></span>
    </button>
    <AnimatePresence>{open ? <motion.div className="bench-reference-overlay" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .2 }} onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}>
      <motion.article className="bench-reference-popup" role="dialog" aria-modal="true" aria-labelledby={`reference-${reference.name}`} initial={{ opacity: 0, y: 24, scale: .985 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 330, damping: 30, mass: .72 }}>
        <section className="bench-reference-stage">
          {failed ? <span className="bench-reference-unavailable">Preview unavailable</span> : <motion.img src={reference.media} alt={`${reference.name} reference preview`} initial={reduced ? false : { opacity: 0 }} animate={{ opacity: loaded ? 1 : 0 }} transition={{ duration: 0.2 }} onLoad={() => setLoaded(true)} onError={() => setFailed(true)} />}
        </section>
        <section className="bench-reference-details">
          <button ref={close} type="button" onClick={() => setOpen(false)} aria-label="Close reference preview">×</button>
          <span>Reference</span><h2 id={`reference-${reference.name}`}>{reference.name}</h2>
          <dl><div><dt>Source</dt><dd>MotionSites</dd></div><div><dt>Access</dt><dd>Reference only</dd></div></dl>
          <a href="https://motionsites.ai/" target="_blank" rel="noreferrer">View MotionSites ↗</a>
          <p>This is an attributed visual reference. It has no download, purchase, or catalogue action.</p>
        </section>
      </motion.article>
    </motion.div> : null}</AnimatePresence>
  </div>;
}
