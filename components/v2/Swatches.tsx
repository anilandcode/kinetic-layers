"use client";

import { useState } from "react";
import s from "./Website.module.css";

/** A website's colours. Click one to copy its hex. */
export default function Swatches({ colors }: { colors: string[] }) {
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(hex: string) {
    try {
      await navigator.clipboard.writeText(hex);
      setCopied(hex);
      setTimeout(() => setCopied((c) => (c === hex ? null : c)), 1400);
    } catch {
      /* The hex is printed under the chip; nothing is lost if the clipboard says no. */
    }
  }

  return (
    <ul className={s.swatches}>
      {colors.map((hex) => (
        <li key={hex}>
          <button type="button" className={s.swatch} onClick={() => copy(hex)} aria-label={`Copy ${hex}`}>
            <span className={s.chip} style={{ background: hex }} aria-hidden="true" />
            <span className={s.hex}>{copied === hex ? "Copied" : hex.toUpperCase()}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
