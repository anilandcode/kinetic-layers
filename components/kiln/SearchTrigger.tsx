"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Asset } from "@/lib/kiln/types";
import { track } from "@/lib/track";

/**
 * ⌘K search over the real catalogue.
 *
 * Queries are debounced and the in-flight request is aborted when a newer one
 * starts, so a fast typist never sees results for a prefix they have already
 * moved past.
 */
export default function SearchTrigger() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (evt: KeyboardEvent) => {
      if ((evt.metaKey || evt.ctrlKey) && evt.key.toLowerCase() === "k") {
        evt.preventDefault();
        setOpen(true);
      }
      if (evt.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* Narrow screens used to lose search entirely — data-hide-narrow removed
          the only trigger and left ⌘K, which no phone has. The full field is
          still the desktop affordance; below the breakpoint it collapses to an
          icon button rather than disappearing. */}
      <button
        data-search-compact
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search the vault"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 20,
          flex: "0 1 250px",
          minWidth: 190,
          border: "1px solid var(--hairline-3)",
          borderRadius: "var(--r-pill)",
          padding: "8px 12px",
          background: "transparent",
          cursor: "pointer",
          overflow: "hidden",
          transition: "filter var(--t-fast) var(--ease)",
        }}
      >
        <span style={{ fontSize: 13, color: "var(--faint)" }}>Search the vault</span>
        <span
          className="mono"
          style={{
            fontSize: 10,
            color: "var(--faint)",
            border: "1px solid var(--hairline-3)",
            borderRadius: "var(--r-pill)",
            padding: "3px 8px",
            flexShrink: 0,
          }}
        >
          ⌘K
        </span>
      </button>
      {open && <Palette onClose={() => setOpen(false)} />}
    </>
  );
}

function Palette({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Asset[]>([]);
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const abort = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!q.trim()) {
      setHits([]);
      setState("idle");
      return;
    }
    setState("loading");
    const t = setTimeout(async () => {
      abort.current?.abort();
      const ctrl = new AbortController();
      abort.current = ctrl;
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: ctrl.signal });
        const json = await res.json();
        setHits(json.hits ?? []);
        /* Recorded after the results land, so the detail carries what was
           searched AND whether it found anything — a query returning nothing
           is the more useful signal of the two. */
        track("search", `${q}:${(json.hits ?? []).length}`);
        setState("done");
      } catch (err) {
        if ((err as Error).name !== "AbortError") setState("done");
      }
    }, 180);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search the vault"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 40,
        background: "rgba(8,8,7,0.8)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "14vh",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(620px,90vw)",
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderRadius: 24,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "20px 22px",
            borderBottom: "1px solid var(--hairline-3)",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span aria-hidden="true" style={{ color: "var(--sage)", fontSize: 16 }}>
            ⌕
          </span>
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search prompts, templates, scenes…"
            aria-label="Search query"
            style={{ flex: 1, background: "transparent", border: 0, outline: "none", fontSize: 16, color: "var(--ink)" }}
          />
        </div>

        <div style={{ padding: 12, minHeight: 80 }}>
          {state === "idle" && (
            <p style={{ padding: "13px 14px", fontSize: 14, color: "var(--faint)" }}>
              Type to search the whole vault.
            </p>
          )}
          {state === "loading" && hits.length === 0 && (
            <p style={{ padding: "13px 14px", fontSize: 14, color: "var(--faint)" }}>Searching…</p>
          )}
          {state === "done" && hits.length === 0 && (
            <p style={{ padding: "13px 14px", fontSize: 14, color: "var(--faint)" }}>
              Nothing matches “{q}”.
            </p>
          )}
          <ul style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {hits.map((h) => (
              <li key={h.slug}>
                <Link
                  href={`/item/${h.slug}`}
                  onClick={onClose}
                  style={{
                    padding: "13px 14px",
                    borderRadius: "var(--r-pill)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                    color: "var(--ink-3)",
                  }}
                >
                  <span style={{ fontSize: 14 }}>{h.name}</span>
                  <span className="mono" style={{ fontSize: 10, color: "var(--faint)" }}>
                    {h.type}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div
          className="mono"
          style={{ padding: "14px 22px", borderTop: "1px solid var(--hairline-3)", fontSize: 10, color: "var(--faint)" }}
        >
          Esc to close
        </div>
      </div>
    </div>
  );
}
