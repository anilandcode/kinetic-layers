"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="failed" className="shell" style={{ paddingBlock: "120px 80px", display: "flex", flexDirection: "column", gap: 20, alignItems: "flex-start" }}>
      <a className="skip-link" href="#failed">Skip to the message</a>
      <span className="mono" style={{ fontSize: 11, letterSpacing: "0.16em", color: "var(--sage)" }}>
        Something broke
      </span>
      <h1 style={{ fontSize: "clamp(28px,3.6vw,44px)", fontWeight: 500, letterSpacing: "-0.03em", maxWidth: "20ch" }}>
        That did not load.
      </h1>
      <p style={{ fontSize: 17, color: "var(--muted)", maxWidth: 460 }}>
        The error is logged. Trying again often works — it is usually the content API being slow
        rather than anything actually wrong.
      </p>
      {error.digest && (
        <span className="mono" style={{ fontSize: 10, color: "var(--faint)" }}>
          Reference {error.digest}
        </span>
      )}
      <button type="button" onClick={reset} className="btn btn--primary" style={{ marginTop: 8 }}>
        Try again
      </button>
    </main>
  );
}
