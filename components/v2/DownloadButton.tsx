"use client";

import { useState } from "react";
import { Button } from "./Button";
import s from "./Kit.module.css";

/**
 * Asks /api/download for a short-lived file URL. That route accepts POST
 * only and re-checks the gate and the quota before private storage signs
 * anything, so this button and the endpoint share one path
 * (components/kl/ItemDownloadAction did the same for v1).
 */
export default function DownloadButton({
  slug,
  file,
  label = "Download",
  size = "lg",
  variant = "primary",
}: {
  slug: string;
  file?: string;
  label?: string;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "quiet";
}) {
  const [state, setState] = useState<"idle" | "working" | "failed">("idle");
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

  return (
    <span className={s.download}>
      <Button
        onClick={download}
        disabled={state === "working"}
        size={size}
        variant={variant}
        icon={state === "idle" ? "download" : undefined}
        className={size === "lg" ? s.wide : undefined}
      >
        {state === "working" ? "Preparing…" : state === "failed" ? "Try again" : label}
      </Button>
      {error ? (
        <span className={s.error} role="status">
          {error}
        </span>
      ) : null}
    </span>
  );
}
