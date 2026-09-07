"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

/**
 * Filter chips for the downloads list. URL-driven, like every other filter.
 *
 * The options are passed in rather than hardcoded. They used to be a fixed
 * "Templates / Scenes / Prompts" that matched none of the eight types the
 * catalogue actually uses — and the page ignored the value anyway. They are now
 * the set of types present in this user's own downloads, so every chip has
 * something behind it and none is missing.
 */
export default function DownloadFilter({ active, kinds }: { active: string; kinds: string[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  /* With one kind, the chips would offer a choice between everything and
     everything. */
  if (kinds.length < 2) return null;

  function pick(k: string) {
    const next = new URLSearchParams(params.toString());
    if (k === "All") next.delete("kind");
    else next.set("kind", k);
    const qs = next.toString();
    startTransition(() => router.replace(qs ? `?${qs}` : "?", { scroll: false }));
  }

  return (
    <div
      role="group"
      aria-label="Filter downloads"
      style={{ display: "flex", gap: 8, flexWrap: "wrap", opacity: pending ? 0.6 : 1 }}
    >
      {["All", ...kinds].map((k) => (
        <button
          key={k}
          type="button"
          className="pill pill--muted"
          aria-pressed={k === "All" ? !active : active === k}
          onClick={() => pick(k)}
        >
          {k.toLowerCase()}
        </button>
      ))}
    </div>
  );
}
