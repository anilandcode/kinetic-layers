"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "../Button";
import p from "../Page.module.css";
import f from "../Form.module.css";
import s from "./Account.module.css";

/**
 * API keys for the MCP server.
 *
 * The plaintext key exists in exactly one place for exactly one moment: the
 * response to the POST that created it. It is never stored in a way that
 * could return it, so it is shown once, prominently, and the words say so.
 */

type Key = { id: string; name: string; prefix: string; created_at: string; last_used: string | null };

const day = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

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
      /* Optimistic row; the id is a placeholder until the page reloads. */
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
      /* The key is on screen and selectable; a refused clipboard needs no message. */
    }
  }

  return (
    <section className={`${p.panel} ${s.panelStack}`} aria-labelledby="keys-title">
      <div className={s.panelHead}>
        <h2 id="keys-title" className={p.panelTitle}>
          API keys
        </h2>
        <Button type="button" variant="secondary" size="sm" onClick={create} disabled={busy}>
          {busy ? "Creating…" : "New key"}
        </Button>
      </div>
      <p className={p.panelNote}>
        For the{" "}
        <Link href="/mcp" className={p.link}>
          MCP server
        </Link>
        , so Claude Code or Cursor can search the library and read the prompts you have access to. A key carries your
        plan — it opens exactly what you can open here, and nothing more.
      </p>

      {fresh ? (
        <div role="status" aria-live="polite" className={s.fresh}>
          <strong>Copy this now — it is not shown again.</strong>
          <div className={s.freshRow}>
            <code>{fresh}</code>
            <Button type="button" variant="secondary" size="sm" onClick={copy}>
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        </div>
      ) : null}

      {error ? (
        <p role="alert" className={f.error}>
          {error}
        </p>
      ) : null}

      {keys.length === 0 ? (
        <p className={s.muted}>No keys yet.</p>
      ) : (
        <ul className={s.rows}>
          {keys.map((k) => (
            <li key={k.id} className={s.row}>
              <span className={s.rowMain}>
                <code className={s.code}>{k.prefix}…</code>
                <span className={s.rowMeta}>
                  {k.name} · {k.last_used ? `used ${day(k.last_used)}` : "never used"}
                </span>
              </span>
              <Button
                type="button"
                variant="quiet"
                size="sm"
                onClick={() => revoke(k.id)}
                aria-label={`Revoke key ${k.prefix}`}
              >
                Revoke
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
