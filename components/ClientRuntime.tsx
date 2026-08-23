"use client";

import { useEffect } from "react";
import { track } from "@/lib/track";

/**
 * Everything the page needs at runtime that is not the form: the page view,
 * the scroll reveal, and click instrumentation for anything carrying a
 * data-track attribute.
 *
 * Nothing here is needed before first paint, so it mounts as a normal effect.
 */
export default function ClientRuntime() {
  useEffect(() => {
    track("page_view");

    /* --- Reveal on scroll ------------------------------------------- */
    const revealables = document.querySelectorAll<HTMLElement>(".reveal");

    if (!("IntersectionObserver" in window)) {
      revealables.forEach((el) => el.classList.add("is-in"));
    } else {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-in");
              observer.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
      );
      revealables.forEach((el) => observer.observe(el));

      /* --- Click instrumentation ------------------------------------ */
      const onClick = (evt: MouseEvent) => {
        const target = evt.target as HTMLElement | null;
        const el = target?.closest<HTMLElement>("[data-track]");
        if (!el) return;
        track(
          el.getAttribute("data-track") as never,
          el.getAttribute("data-track-detail")
        );
      };
      document.addEventListener("click", onClick, { passive: true });

      return () => {
        observer.disconnect();
        document.removeEventListener("click", onClick);
      };
    }

    const onClick = (evt: MouseEvent) => {
      const target = evt.target as HTMLElement | null;
      const el = target?.closest<HTMLElement>("[data-track]");
      if (!el) return;
      track(el.getAttribute("data-track") as never, el.getAttribute("data-track-detail"));
    };
    document.addEventListener("click", onClick, { passive: true });
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
