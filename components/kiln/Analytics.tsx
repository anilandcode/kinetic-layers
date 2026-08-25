"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { track } from "@/lib/track";

/**
 * Page views and click instrumentation.
 *
 * `/api/event` and lib/track.ts were both written and both worked — nothing
 * ever mounted them, so the table stayed empty. This is the missing mount,
 * scoped to Kiln.
 *
 * Deliberately NOT components/ClientRuntime.tsx: that one also drives a
 * `.reveal` class the archived demand test used, which Kiln does not have. Its
 * reveal logic would query nothing and quietly imply something is happening.
 *
 * Anything with `data-track="name"` reports on click. `data-track-detail`
 * carries the specifics. No PII: names and slugs only.
 */
export default function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    track("page_view");
  }, [pathname]);

  useEffect(() => {
    const onClick = (evt: MouseEvent) => {
      const el = (evt.target as HTMLElement | null)?.closest<HTMLElement>("[data-track]");
      if (!el) return;
      const name = el.dataset.track;
      if (!name) return;
      /* Cast is safe because the route re-validates against EVENT_NAMES and
         drops anything it does not recognise. */
      track(name as Parameters<typeof track>[0], el.dataset.trackDetail ?? null);
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
