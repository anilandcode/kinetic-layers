"use client";

import { useEffect, useState } from "react";
import s from "./Prose.module.css";

/**
 * The reading pages' contents, sticky beside the column on wide screens. The
 * section in view is marked with aria-current, found by IntersectionObserver
 * — no scroll listener. Hidden below the width where it would crowd the text.
 */
export default function ProseToc({ items }: { items: Array<{ id: string; label: string }> }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter((el): el is HTMLElement => Boolean(el));
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const seen = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (seen[0]) setActive(seen[0].target.id);
      },
      { rootMargin: "-20% 0px -65% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  return (
    <nav className={s.toc} aria-label="On this page">
      <div className={s.tocInner}>
        <p className={s.tocHead}>On this page</p>
        <ol>
          {items.map((i) => (
            <li key={i.id}>
              <a href={`#${i.id}`} aria-current={active === i.id ? "location" : undefined}>
                {i.label}
              </a>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
