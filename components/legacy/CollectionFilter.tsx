"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { SHELVES, type Shelf } from "@/lib/kl/types";

/** Shelf filter for the collections index. State lives in the URL, as it does in the library. */
export default function CollectionFilter({
  active,
  shown,
  total,
}: {
  active: "All" | Shelf;
  shown: number;
  total: number;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  function pick(s: "All" | Shelf) {
    const next = new URLSearchParams(params.toString());
    if (s === "All") next.delete("shelf");
    else next.set("shelf", s);
    const qs = next.toString();
    startTransition(() => router.replace(qs ? `?${qs}` : "?", { scroll: false }));
  }

  return (
    <div
      data-morph
      data-bg="rgba(15,15,13,0.94)"
      data-bg-compact="rgba(13,13,11,0.97)"
      style={{
        position: "sticky",
        top: 66,
        zIndex: 15,
        background: "rgba(15,15,13,0.94)",
        backdropFilter: "blur(12px)",
        borderTop: "1px solid var(--line)",
        borderBottom: "1px solid var(--line)",
      }}
    >
      <div className="kl-pad" style={{ paddingBlock: 14, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div role="group" aria-label="Shelf" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {SHELVES.map((s) => (
            <button key={s} type="button" className="pill pill--muted" aria-pressed={active === s} onClick={() => pick(s)}>
              {s}
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
