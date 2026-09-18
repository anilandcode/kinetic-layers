"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

export default function DesignSystemMotionPreview() {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(false);

  return (
    <div style={{ display: "grid", gap: "var(--space-4)" }}>
      <motion.button type="button" className="ds-button" data-variant="secondary" style={{ justifySelf: "start" }} onClick={() => setActive((value) => !value)} aria-pressed={active} whileTap={reduced ? undefined : { scale: 0.99 }}>
        {active ? "Reset motion" : "Run motion"}
      </motion.button>
      <motion.div
        key={String(active)}
        initial={active ? { opacity: 0, y: reduced ? 0 : 8 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduced ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
        style={{ maxWidth: 520, padding: "var(--space-6)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-card)", background: "var(--surface-raised)", boxShadow: "var(--elevation-card)", color: "var(--text-primary)" }}
      >
        <strong style={{ display: "block", marginBottom: "var(--space-2)" }}>State changed</strong>
        <span style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>
          {reduced ? "Reduced motion is active: the state appears without translation." : "The panel travels eight pixels and settles in 220ms."}
        </span>
      </motion.div>
    </div>
  );
}
