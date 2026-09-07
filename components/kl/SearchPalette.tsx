"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Asset } from "@/lib/kiln/types";

/**
 * The ⌘K palette.
 *
 * Backed by /api/search, which returns catalogue metadata only — no prompt
 * text, nothing gated — so this can stay public and unauthenticated.
 *
 * The prototype drew a static list with a label where the input should be.
 * This one takes a query, because a search box that cannot be typed into is
 * worse than no search box.
 */
export default function SearchPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Asset[]>([]);
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement | null>(null);
  const restoreTo = useRef<HTMLElement | null>(null);

  /* Remember what had focus so Escape can give it back. */
  useEffect(() => {
    if (!open) return;
    restoreTo.current = document.activeElement as HTMLElement | null;
    input.current?.focus();
    return () => restoreTo.current?.focus?.();
  }, [open]);

  /* The page behind must not scroll while a dialog is over it. */
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const id = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const body = (await res.json()) as { hits?: Asset[] };
        if (!cancelled) {
          setHits(body.hits ?? []);
          setActive(0);
        }
      } catch {
        if (!cancelled) setHits([]);
      }
    }, 140); /* debounced: a keystroke should not be a request */
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [q, open]);

  const go = useCallback(
    (slug: string) => {
      onClose();
      router.push(`/item/${slug}`);
    },
    [onClose, router]
  );

  if (!open) return null;

  return (
    <div
      className="kl-palette-veil"
      role="dialog"
      aria-modal="true"
      aria-label="Search the library"
      onClick={onClose}
    >
      <div className="kl-palette" onClick={(e) => e.stopPropagation()}>
        <div className="kl-palette-head">
          <svg width="16" height="16" viewBox="0 0 40 40" fill="none" stroke="currentColor" style={{ color: "var(--amber)" }} aria-hidden="true">
            <path d="M0.5 39.5V0.5H39.5" />
            <path d="M12.5 39.5V12.5H39.5" strokeOpacity="0.5" />
          </svg>
          <input
            ref={input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((i) => Math.min(i + 1, hits.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((i) => Math.max(i - 1, 0));
              } else if (e.key === "Enter" && hits[active]) {
                e.preventDefault();
                go(hits[active].slug);
              }
            }}
            placeholder="Search prompts, templates, scenes…"
            aria-label="Search the library"
            className="kl-palette-input"
          />
        </div>

        <div className="kl-palette-hits">
          {hits.length ? (
            hits.map((h, i) => (
              <button
                key={h.slug}
                type="button"
                className={`kl-hit${i === active ? " kl-hit--active" : ""}`}
                onClick={() => go(h.slug)}
                onMouseEnter={() => setActive(i)}
              >
                <span>{h.name}</span>
                <span className="kl-hit-type">{h.type}</span>
              </button>
            ))
          ) : (
            <p className="kl-palette-empty">
              {q ? `Nothing matches “${q}”.` : "Start typing to search the library."}
            </p>
          )}
        </div>

        <div className="kl-palette-foot">ESC TO CLOSE</div>
      </div>
    </div>
  );
}
