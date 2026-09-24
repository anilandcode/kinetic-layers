"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import Icon, { type IconName } from "./Icon";
import s from "./KitDetails.module.css";

export type DetailTab = { id: string; title: string; icon: IconName; body: ReactNode };

/**
 * The kit's parts in full, under the workbench: one glass panel with a tab per
 * part the kit really has. The canvas above shows the shape; this is where the
 * spec, the prompt previews and the test records are read.
 *
 * Tabs follow the WAI-ARIA pattern — arrow keys move between them, Home and
 * End jump — and every panel stays in the DOM, hidden, so nothing the server
 * rendered is lost to a crawler or to find-in-page.
 */
export default function KitDetails({ tabs, label }: { tabs: DetailTab[]; label: string }) {
  const [active, setActive] = useState(tabs[0]?.id);
  const uid = useId();
  const list = useRef<HTMLDivElement | null>(null);
  if (!tabs.length) return null;

  const focusTab = (i: number) => {
    const next = tabs[(i + tabs.length) % tabs.length];
    setActive(next.id);
    list.current?.querySelector<HTMLButtonElement>(`[data-tab="${next.id}"]`)?.focus();
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = tabs.findIndex((t) => t.id === active);
    if (e.key === "ArrowRight") focusTab(i + 1);
    else if (e.key === "ArrowLeft") focusTab(i - 1);
    else if (e.key === "Home") focusTab(0);
    else if (e.key === "End") focusTab(tabs.length - 1);
    else return;
    e.preventDefault();
  };

  return (
    <div className={s.details}>
      <div ref={list} className={s.tabs} role="tablist" aria-label={label} onKeyDown={onKey}>
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            data-tab={t.id}
            id={`${uid}-tab-${t.id}`}
            aria-selected={active === t.id}
            aria-controls={`${uid}-panel-${t.id}`}
            tabIndex={active === t.id ? 0 : -1}
            className={s.tab}
            onClick={() => setActive(t.id)}
          >
            <Icon name={t.icon} size={15} />
            {t.title}
          </button>
        ))}
      </div>
      {tabs.map((t) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`${uid}-panel-${t.id}`}
          aria-labelledby={`${uid}-tab-${t.id}`}
          hidden={active !== t.id}
          className={s.panel}
          tabIndex={0}
        >
          {t.body}
        </div>
      ))}
    </div>
  );
}
