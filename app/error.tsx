"use client";

import { useEffect } from "react";

/**
 * The error boundary.
 *
 * Renders inside the root layout but outside any page, so it composes its own
 * [data-kl] shell rather than importing PageShell — that would pull the header
 * and a Sanity-backed footer into the one screen that exists because a fetch
 * just failed.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div data-kl className="kl-shell">
      <main
        id="failed"
        className="kl-pad"
        style={{
          paddingBlock: "120px 80px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
          alignItems: "flex-start",
        }}
      >
        <span className="kl-kicker">SOMETHING BROKE</span>
        <h1 className="kl-prose-h1" style={{ maxWidth: "20ch" }}>
          That did not load.
        </h1>
        <p className="kl-prose-lead" style={{ maxWidth: 460 }}>
          The error is logged. Trying again often works — it is usually the content API being slow
          rather than anything actually wrong.
        </p>
        {error.digest ? (
          <span
            style={{
              fontFamily: "var(--font-mono, ui-monospace, monospace)",
              fontSize: 10,
              letterSpacing: "0.12em",
              color: "var(--muted)",
            }}
          >
            REFERENCE {error.digest}
          </span>
        ) : null}
        {/* A button, not a link: this resets the boundary rather than navigating. */}
        <button type="button" onClick={reset} className="kl-btn" style={{ marginTop: 8 }}>
          <span className="kl-btn-glow" data-btn-glow aria-hidden="true" />
          <span className="kl-btn-shine" data-btn-shine aria-hidden="true" />
          <span className="kl-btn-label" data-btn-label>
            Try again
          </span>
        </button>
      </main>
    </div>
  );
}
