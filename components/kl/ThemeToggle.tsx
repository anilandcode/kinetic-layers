"use client";

import { useEffect, useState } from "react";
import { themeFlash } from "@/lib/kl/motion";

/**
 * Light / dark toggle.
 *
 * Light is the ground state for Kinetic Layers, so "off" is light and the knob
 * slides right for dark. The attribute goes on <html> rather than the shell,
 * because the tokens accept it in either place and the pre-paint script in the
 * root layout can only reach <html>.
 *
 * The stored value is read before paint by that script; this component only
 * mirrors what is already on the document, which is why the initial state is
 * read in an effect rather than during render — the server has no way to know
 * which theme this visitor chose, and guessing produces a hydration mismatch.
 */

const KEY = "kl-theme";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.getAttribute("data-theme") === "dark");
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
    try {
      localStorage.setItem(KEY, next ? "dark" : "light");
    } catch {
      /* Private mode, or storage disabled. The toggle still works for this
         visit; it just will not be remembered. */
    }
    themeFlash();
  }

  return (
    <button
      type="button"
      className="kl-theme"
      onClick={toggle}
      aria-pressed={dark}
      title={dark ? "Switch to light" : "Switch to dark"}
    >
      <span className="kl-vh">{dark ? "Switch to light" : "Switch to dark"}</span>
      <span className="kl-theme-knob" aria-hidden="true" />
      <span className="kl-theme-icons" aria-hidden="true">
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke={dark ? "var(--muted)" : "var(--amber)"}
          strokeWidth="1.6"
        >
          <circle cx="12" cy="12" r="4.2" />
          <path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.4 5.4l1.6 1.6M17 17l1.6 1.6M18.6 5.4L17 7M7 17l-1.6 1.6" />
        </svg>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke={dark ? "var(--amber)" : "var(--muted)"}
          strokeWidth="1.6"
        >
          <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
        </svg>
      </span>
    </button>
  );
}
