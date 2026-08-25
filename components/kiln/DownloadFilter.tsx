"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

const KINDS = ["All", "Templates", "Scenes", "Prompts"] as const;

/** Filter chips for the downloads list. URL-driven, like every other filter. */
export default function DownloadFilter({ active }: { active: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  function pick(k: string) {
    const next = new URLSearchParams(params.toString());
    if (k === "All") next.delete("kind");
    else next.set("kind", k);
    const qs = next.toString();
    startTransition(() => router.replace(qs ? `?${qs}` : "?", { scroll: false }));
  }

  return (
    <div role="group" aria-label="Filter downloads" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {KINDS.map((k) => (
        <button key={k} type="button" className="pill pill--muted" aria-pressed={active === k} onClick={() => pick(k)}>
          {k}
        </button>
      ))}
    </div>
  );
}
