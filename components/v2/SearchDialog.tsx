"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { hasRealPreview } from "@/lib/kl/preview-ready";
import { typeLabel, tierLabel } from "@/lib/v2/kit";
import type { Asset } from "@/lib/kl/types";
import Icon from "./Icon";
import { useDialog } from "./useDialog";
import s from "./SearchDialog.module.css";

/**
 * ⌘K search. Same backend as before — /api/search returns public catalogue
 * metadata only, so this stays anonymous — with a listbox the keyboard can
 * drive and a focus trap it did not have.
 */
export default function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Asset[]>([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const panel = useRef<HTMLDivElement | null>(null);
  const input = useRef<HTMLInputElement | null>(null);

  useDialog(panel, open, onClose, input);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    const id = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const body = (await res.json()) as { hits?: Asset[] };
        if (!cancelled) {
          setHits((body.hits ?? []).filter(hasRealPreview));
          setActive(0);
        }
      } catch {
        if (!cancelled) setHits([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 140);
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

  const listId = "v2-search-results";
  return (
    <div className={s.veil} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={panel} className={s.panel} role="dialog" aria-modal="true" aria-label="Search the library">
        <div className={s.field}>
          <Icon name="search" size={19} />
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
            placeholder="Search kits by name, type or tag"
            aria-label="Search the library"
            role="combobox"
            aria-expanded={hits.length > 0}
            aria-controls={listId}
            aria-activedescendant={hits[active] ? `${listId}-${hits[active].slug}` : undefined}
            autoComplete="off"
            spellCheck={false}
          />
          <button type="button" className={s.close} onClick={onClose} aria-label="Close search">
            <kbd>Esc</kbd>
          </button>
        </div>

        {hits.length ? (
          <ul id={listId} role="listbox" className={s.list} aria-label="Results">
            {hits.map((hit, i) => (
              <li
                key={hit.slug}
                id={`${listId}-${hit.slug}`}
                role="option"
                aria-selected={i === active}
                className={s.hit}
                onMouseEnter={() => setActive(i)}
                onClick={() => go(hit.slug)}
              >
                <span className={s.hitName}>{hit.name}</span>
                <span className={s.hitMeta}>
                  {typeLabel(hit.type)} · {tierLabel(hit)}
                </span>
                <Icon name="arrow" size={16} className={s.hitArrow} />
              </li>
            ))}
          </ul>
        ) : (
          <p className={s.empty} role="status">
            {loading ? "Searching…" : q ? `Nothing matches “${q}”.` : "Type to search the published kits."}
          </p>
        )}
      </div>
    </div>
  );
}
