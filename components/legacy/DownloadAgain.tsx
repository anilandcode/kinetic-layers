"use client";

import { useState } from "react";

/**
 * Re-download a file straight from the history list.
 *
 * This used to be a link to the item page, which is not downloading again — it
 * is going somewhere else and starting over. The signed URL is short-lived, so
 * it has to be minted per click; there is nothing to cache and nothing worth
 * holding in state.
 */
export default function DownloadAgain({
  slug,
  file,
  label = "Download again",
}: {
  slug: string;
  file?: string | null;
  label?: string;
}) {
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
        /* Entitlement can lapse between the original download and now, so this
           genuinely can refuse — say why rather than failing silently. */
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
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      {error && (
        <span role="status" style={{ fontSize: 12, color: "var(--muted)", maxWidth: 220 }}>
          {error}
        </span>
      )}
      <button
        type="button"
        onClick={go}
        disabled={busy}
        className="btn btn--ghost"
        style={{ fontSize: 13, padding: "7px 15px", color: "var(--muted)" }}
      >
        {busy ? "Preparing…" : label}
      </button>
    </span>
  );
}
