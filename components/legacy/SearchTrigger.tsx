"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Asset } from "@/lib/kl/types";
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
  const trigger = useRef<HTMLButtonElement | null>(null);
  const wasOpen = useRef(false);

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

  /**
   * Return focus to the trigger when the dialog closes.
   *
   * This belongs here, not in the dialog. Inside Palette the obvious approach —
   * capture document.activeElement on mount — records the wrong element: the
   * input's autoFocus has already fired by the time the effect runs, so it
   * "restores" focus to a field that is being unmounted, and the browser drops
   * it on <body>. The trigger is the thing that opened it, so the trigger is
   * what knows where to put focus back.
   */
  useEffect(() => {
    if (wasOpen.current && !open) trigger.current?.focus();
    wasOpen.current = open;
  }, [open]);

  return (
    <>
      {/* Narrow screens used to lose search entirely — data-hide-narrow removed
          the only trigger and left ⌘K, which no phone has. The full field is
          still the desktop affordance; below the breakpoint it collapses to an
          icon button rather than disappearing. */}
      <button
        ref={trigger}
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
          border: "1px solid var(--line2)",
          borderRadius: "99px",
          padding: "8px 12px",
          background: "transparent",
          cursor: "pointer",
          overflow: "hidden",
          transition: "filter 0.18s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <span style={{ fontSize: 13, color: "var(--muted)" }}>Search the vault</span>
        <span
          className="kl-mono"
          style={{
            fontSize: 10,
            color: "var(--muted)",
            border: "1px solid var(--line2)",
            borderRadius: "99px",
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
  const panel = useRef<HTMLDivElement | null>(null);

  /**
   * Focus trap and restore.
   *
   * The dialog already declared role="dialog" and aria-modal="true", which
   * promise that focus is confined and that what is behind is inert. Neither
   * was true: Tab walked straight out into the page behind the overlay, and
   * closing dropped focus onto <body>, so a keyboard user landed at the top of
   * the document with no idea where they were. An aria-modal that does not
   * trap is worse than no attribute — it tells assistive tech a lie.
   */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const root = panel.current;
      if (!root) return;
      /* getClientRects, not offsetParent. The dialog is position:fixed, and
         offsetParent is null for descendants of a fixed ancestor — using it
         here would quietly filter out every candidate and leave the trap
         doing nothing at all while appearing to work. */
      const focusable = [
        ...root.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
        ),
      ].filter((el) => el.getClientRects().length > 0);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      /* Wrap in both directions, and catch the case where focus has somehow
         escaped the panel entirely — pull it back rather than letting Tab
         continue into the page. */
      if (e.shiftKey && (active === first || !root.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !root.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

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
        ref={panel}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(620px,90vw)",
          background: "var(--card)",
          border: "1px solid var(--line)",
          borderRadius: 24,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "20px 22px",
            borderBottom: "1px solid var(--line2)",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span aria-hidden="true" style={{ color: "var(--amber)", fontSize: 16 }}>
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
          {/* Announced, not merely displayed. The result count changing was
              previously silent — a screen-reader user typed into a box and got
              no feedback that anything had happened at all. */}
          <p role="status" aria-live="polite" className="visually-hidden">
            {state === "loading"
              ? "Searching"
              : state === "done"
                ? hits.length === 0
                  ? `No results for ${q}`
                  : `${hits.length} result${hits.length === 1 ? "" : "s"} for ${q}`
                : ""}
          </p>
          {state === "idle" && (
            <p style={{ padding: "13px 14px", fontSize: 14, color: "var(--muted)" }}>
              Type to search the whole vault.
            </p>
          )}
          {state === "loading" && hits.length === 0 && (
            <p style={{ padding: "13px 14px", fontSize: 14, color: "var(--muted)" }}>Searching…</p>
          )}
          {state === "done" && hits.length === 0 && (
            <p style={{ padding: "13px 14px", fontSize: 14, color: "var(--muted)" }}>
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
                    borderRadius: "99px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                    color: "var(--muted)",
                  }}
                >
                  <span style={{ fontSize: 14 }}>{h.name}</span>
                  <span className="kl-mono" style={{ fontSize: 10, color: "var(--muted)" }}>
                    {h.type}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div
          className="kl-mono"
          style={{ padding: "14px 22px", borderTop: "1px solid var(--line2)", fontSize: 10, color: "var(--muted)" }}
        >
          Esc to close
        </div>
      </div>
    </div>
  );
}
