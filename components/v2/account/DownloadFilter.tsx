"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { typeLabel } from "@/lib/v2/kit";
import s from "./Account.module.css";

/**
 * Type chips for the downloads list, URL-driven. The options are the types
 * present in this account's own downloads, so no chip is ever empty; with one
 * type there is nothing to choose between, so there are no chips at all.
 */
export default function DownloadFilter({ active, kinds }: { active: string; kinds: string[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  if (kinds.length < 2) return null;

  function pick(k?: string) {
    const next = new URLSearchParams(params.toString());
    if (!k) next.delete("kind");
    else next.set("kind", k);
    const qs = next.toString();
    startTransition(() => router.replace(qs ? `?${qs}` : "?", { scroll: false }));
  }

  return (
    <div role="group" aria-label="Filter downloads" className={s.chips} data-pending={pending ? "" : undefined}>
      <button type="button" aria-pressed={!active} onClick={() => pick()}>
        All
      </button>
      {kinds.map((k) => (
        <button key={k} type="button" aria-pressed={active === k} onClick={() => pick(k)}>
          {typeLabel(k)}
        </button>
      ))}
    </div>
  );
}
