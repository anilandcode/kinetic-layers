"use client";

import { useState } from "react";
import GlassButton from "./GlassButton";

type State = "idle" | "working" | "failed";

/**
 * Requests a short-lived file URL from the server-side entitlement gate.
 *
 * A normal link cannot do this: /api/download deliberately accepts POST only,
 * so the slug and optional file name are checked before private storage signs
 * anything. Keeping that action here makes the visible button and the secure
 * endpoint use the same path.
 */
export default function ItemDownloadAction({
  slug,
  file,
  label = "Download files",
  compact = false,
}: {
  slug: string;
  file?: string;
  label?: string;
  compact?: boolean;
}) {
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<string | null>(null);

  async function download() {
    setState("working");
    setError(null);

    try {
      const response = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, file }),
      });
      const result = await response.json();

      if (!response.ok || !result.url) {
        setError(result.message ?? "Could not prepare that download.");
        setState("failed");
        return;
      }

      window.location.assign(result.url);
      setState("idle");
    } catch {
      setError("Network trouble. Please try again.");
      setState("failed");
    }
  }

  const buttonLabel = state === "working" ? "Preparing…" : state === "failed" ? "Try again" : label;

  return (
    <div className={compact ? "kl-file-action" : "kl-download-action"}>
      <GlassButton
        onClick={download}
        disabled={state === "working"}
        premium={!compact}
        size={compact ? "sm" : "md"}
        pull={compact ? 3 : 5}
      >
        {buttonLabel}
      </GlassButton>
      {error ? <span className="kl-action-error" role="status">{error}</span> : null}
    </div>
  );
}
