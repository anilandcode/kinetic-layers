"use client";

import { useState } from "react";

/**
 * API key management, on the account page.
 *
 * The plaintext key exists in exactly one place for exactly one moment: the
 * response to the POST that created it. It is never stored in a way that could
 * return it, so this component shows it once, prominently, and says so — a
 * "copy it now" that quietly lets you fetch it again later trains people not
 * to believe the warning.
 */

type Key = {
  id: string;
  name: string;
  prefix: string;
  created_at: string;
  last_used: string | null;
};

export default function ApiKeys({ initial }: { initial: Key[] }) {
  const [keys, setKeys] = useState(initial);
  const [fresh, setFresh] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function create() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/keys", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      const json = await res.json();
      if (!res.ok) {
        setError(json.message ?? "Could not create a key.");
        return;
      }
      setFresh(json.key);
      /* Optimistic row so the list is not stale until a refresh. The id is a
         placeholder until the page reloads; revoking uses the real one. */
      setKeys((k) => [
        { id: "pending", name: json.name, prefix: json.prefix, created_at: new Date().toISOString(), last_used: null },
        ...k,
      ]);
    } catch {
      setError("Network trouble.");
    } finally {
      setBusy(false);
    }
  }

  async function revoke(id: string) {
    if (id === "pending") {
      setError("Reload the page before revoking a key you just made.");
      return;
    }
    const before = keys;
    setKeys((k) => k.filter((x) => x.id !== id));
    try {
      const res = await fetch("/api/keys", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) setKeys(before);
    } catch {
      setKeys(before);
    }
  }

  async function copy() {
    if (!fresh) return;
    try {
      await navigator.clipboard.writeText(fresh);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* The value is on screen and selectable; a refused clipboard is not an
         error worth a message of its own. */
    }
  }

  return (
    <section
      data-reveal
      aria-labelledby="keys-heading"
      style={{
        borderRadius: "18px",
        border: "1px solid var(--line)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "18px 22px",
          background: "var(--inset)",
          borderBottom: "1px solid #1A1917",
          flexWrap: "wrap",
        }}
      >
        <h2 id="keys-heading" style={{ fontSize: 17, fontWeight: 500 }}>
          API keys
        </h2>
        <div style={{ flex: 1 }} />
        <button type="button" className="btn btn--ghost" onClick={create} disabled={busy} style={{ fontSize: 13, padding: "7px 15px" }}>
          {busy ? "Creating…" : "New key"}
        </button>
      </div>

      <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
        <p style={{ fontSize: 14, lineHeight: 1.65, color: "var(--muted)", maxWidth: 560 }}>
          For the{" "}
          <a data-nav href="/mcp" style={{ color: "var(--amber)" }}>
            MCP endpoint
          </a>
          , so an agent can search the vault and read prompts you have access to.
          A key carries your plan — it opens exactly what you can open here, and
          nothing more.
        </p>

        {fresh && (
          <div
            role="status"
            aria-live="polite"
            style={{
              border: "1px solid var(--amber-line)",
              borderRadius: "12px",
              background: "var(--amber-bg)",
              padding: "16px 18px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <strong style={{ fontSize: 13, fontWeight: 500, color: "var(--amber)" }}>
              Copy this now — it is not shown again.
            </strong>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <code
                className="kl-mono"
                style={{
                  fontSize: 12,
                  color: "var(--ink)",
                  background: "var(--ground)",
                  border: "1px solid var(--line)",
                  borderRadius: 8,
                  padding: "9px 12px",
                  wordBreak: "break-all",
                  flex: 1,
                  minWidth: 240,
                }}
              >
                {fresh}
              </code>
              <button type="button" className="btn btn--ghost" onClick={copy} style={{ fontSize: 12, padding: "7px 14px" }}>
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        )}

        {error && (
          <p role="alert" style={{ fontSize: 13, color: "var(--danger)" }}>
            {error}
          </p>
        )}

        {keys.length === 0 ? (
          <p style={{ fontSize: 14, color: "var(--muted)" }}>No keys yet.</p>
        ) : (
          <ul style={{ display: "flex", flexDirection: "column", gap: 0, margin: 0, padding: 0, listStyle: "none" }}>
            {keys.map((k) => (
              <li
                key={k.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "12px 0",
                  borderTop: "1px solid var(--line)",
                  flexWrap: "wrap",
                }}
              >
                <code className="kl-mono" style={{ fontSize: 12, color: "var(--muted)" }}>
                  {k.prefix}…
                </code>
                <span style={{ fontSize: 13, color: "var(--muted)" }}>{k.name}</span>
                <div style={{ flex: 1 }} />
                <span className="kl-mono" style={{ fontSize: 10, letterSpacing: "0.1em", color: "var(--muted)" }}>
                  {k.last_used
                    ? `USED ${new Date(k.last_used).toLocaleDateString("en-GB", { day: "numeric", month: "short" }).toUpperCase()}`
                    : "NEVER USED"}
                </span>
                <button
                  type="button"
                  className="btn btn--quiet"
                  onClick={() => revoke(k.id)}
                  aria-label={`Revoke key ${k.prefix}`}
                  style={{ fontSize: 12, padding: "6px 12px" }}
                >
                  Revoke
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
