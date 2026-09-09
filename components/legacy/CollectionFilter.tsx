"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

/**
 * Tag filter for the collections index. State lives in the URL, as it does in
 * the library.
 *
 * It filtered by `shelf` — one of three fixed values — until shelf became a tag
 * like any other. The options are derived from the collections actually on the
 * page rather than a constant, so a chip can never offer a filter that returns
 * nothing.
 */
export default function CollectionFilter({
  active,
  options,
  shown,
  total,
}: {
  active?: string;
  options: string[];
  shown: number;
  total: number;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  function pick(t?: string) {
    const next = new URLSearchParams(params.toString());
    if (!t) next.delete("tag");
    else next.set("tag", t);
    const qs = next.toString();
    startTransition(() => router.replace(qs ? `?${qs}` : "?", { scroll: false }));
  }

  return (
    <div
      data-morph
      style={{
        position: "sticky",
        top: 66,
        zIndex: 15,
        /* Was a hardcoded near-black. The ground is warm now, and a bar that
           ignores the theme is a dark stripe across a light page. */
        background: "var(--veil)",
        backdropFilter: "blur(12px)",
        borderTop: "1px solid var(--line)",
        borderBottom: "1px solid var(--line)",
      }}
    >
      <div className="kl-pad" style={{ paddingBlock: 14, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div role="group" aria-label="Tag" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            className="kl-tag"
            aria-pressed={!active}
            onClick={() => pick(undefined)}
          >
            All
          </button>
          {options.map((t) => (
            <button
              key={t}
              type="button"
              className={`kl-tag${active === t ? " kl-tag--free" : ""}`}
              aria-pressed={active === t}
              onClick={() => pick(active === t ? undefined : t)}
            >
              {t}
            </button>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <span className="kl-mono" aria-live="polite" style={{ fontSize: 10, color: "var(--muted)", opacity: pending ? 0.5 : 1 }}>
          {shown} of {total}
        </span>
      </div>
    </div>
  );
}
