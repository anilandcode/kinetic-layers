"use client";

import { useState } from "react";
import { Button } from "../Button";
import s from "./Account.module.css";

/**
 * Re-download a file from the history list. The signed URL is short-lived, so
 * it is minted per click through the same /api/download the kit page uses —
 * and entitlement can lapse in between, so a refusal is said, not swallowed.
 */
export default function DownloadAgain({ slug, file }: { slug: string; file?: string | null }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function go() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, file: file ?? undefined }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.message ?? "That did not work.");
        return;
      }
      window.location.href = json.url;
    } catch {
      setError("Network trouble.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className={s.again}>
      {error ? (
        <span role="status" className={s.againError}>
          {error}
        </span>
      ) : null}
      <Button type="button" variant="secondary" size="sm" icon="download" onClick={go} disabled={busy}>
        {busy ? "Preparing…" : "Download again"}
      </Button>
    </span>
  );
}
