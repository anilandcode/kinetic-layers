"use client";

import { useEffect, useState } from "react";
import Icon from "./Icon";

const KEY = "kl-theme";
const EVENT = "kl-theme-change";

/**
 * Light (the soft studio) or dark (the workbench). Same storage key and event
 * as the v1 toggle, so the choice carries across screens while both exist.
 * The pre-paint script in app/layout.tsx applies it before first paint.
 */
export default function ThemeToggle({ className, withLabel = false }: { className?: string; withLabel?: boolean }) {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const sync = () => setDark(document.documentElement.getAttribute("data-theme") !== "light");
    sync();
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
    try {
      localStorage.setItem(KEY, next ? "dark" : "light");
    } catch {
      /* Storage can be disabled; this visit still changes. */
    }
    window.dispatchEvent(new Event(EVENT));
  }

  const label = dark ? "Switch to light theme" : "Switch to dark theme";
  return (
    <button type="button" className={className} onClick={toggle} aria-label={withLabel ? undefined : label} title={label}>
      <Icon name={dark ? "moon" : "sun"} size={18} />
      {withLabel ? <span>{label}</span> : null}
    </button>
  );
}
