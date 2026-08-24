"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * The Kiln motion layer.
 *
 * A port of the design's `site-motion.js`. That file loaded GSAP and
 * Motion.dev from a CDN; here GSAP is a real dependency and the pointer
 * micro-interactions Motion.dev handled are plain CSS transitions instead —
 * they were doing scale and opacity on hover, which CSS does natively for a
 * fraction of the weight.
 *
 * Four behaviours, all skipped entirely under reduced motion:
 *   [data-hero] > *   staggered rise on load
 *   [data-reveal]     rise as it scrolls into view
 *   [data-morph]      sticky bar compacts past 220px
 *   a[data-nav]       veil covers the page before navigating
 */

const EASE = "power3.out";

export default function KilnMotion() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* Nothing was ever hidden under reduced motion — the CSS starting state
       is scoped to no-preference — so there is nothing to reveal either. */
    if (reduced) return;

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const hero = gsap.utils.toArray<HTMLElement>("[data-hero] > *");
      if (hero.length) {
        gsap.fromTo(
          hero,
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.85, ease: EASE, stagger: 0.07, delay: 0.1 }
        );
      }

      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el, i) => {
        gsap.fromTo(
          el,
          { y: 28, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: "power2.out",
            delay: (i % 3) * 0.07,
            scrollTrigger: { trigger: el, start: "top 92%" },
          }
        );
      });
    });

    /* The original had a safety net that forced opacity to 1 if an element
       was still invisible after 900ms. Keep it: a failed ScrollTrigger must
       never cost the visitor the content. */
    const net = window.setTimeout(() => {
      document
        .querySelectorAll<HTMLElement>("[data-hero] > *, [data-reveal]")
        .forEach((el) => {
          if (parseFloat(getComputedStyle(el).opacity) > 0.02) return;
          el.style.opacity = "1";
          el.style.transform = "none";
        });
    }, 900);

    return () => {
      window.clearTimeout(net);
      ctx.revert();
    };
  }, [pathname]);

  /* --- Sticky bar compaction ------------------------------------------ */
  useEffect(() => {
    const bar = document.querySelector<HTMLElement>("[data-morph]");
    if (!bar) return;
    const inner = bar.firstElementChild as HTMLElement | null;
    if (!inner) return;

    let compact: boolean | null = null;
    const onScroll = () => {
      const next = window.scrollY > 220;
      if (next === compact) return;
      compact = next;
      inner.style.paddingBlock = next ? "8px" : "14px";
      const bg = bar.getAttribute(next ? "data-bg-compact" : "data-bg");
      if (bg) bar.style.background = bg;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  /* --- Veil on navigation ---------------------------------------------- */
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const onClick = (evt: MouseEvent) => {
      if (evt.defaultPrevented || evt.metaKey || evt.ctrlKey || evt.shiftKey || evt.button !== 0) {
        return;
      }
      const target = evt.target as HTMLElement | null;
      const link = target?.closest<HTMLAnchorElement>("a[data-nav]");
      const href = link?.getAttribute("href");
      if (!link || !href || href.startsWith("#") || href.startsWith("http")) return;

      evt.preventDefault();
      if (reduced) {
        router.push(href);
        return;
      }

      let veil = document.getElementById("km-veil");
      if (!veil) {
        veil = document.createElement("div");
        veil.id = "km-veil";
        document.body.appendChild(veil);
      }
      gsap.to(veil, {
        opacity: 1,
        duration: 0.32,
        ease: "power1.in",
        onComplete: () => router.push(href),
      });
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [router]);

  /* Lift the veil once the new route has painted. */
  useEffect(() => {
    const veil = document.getElementById("km-veil");
    if (!veil) return;
    gsap.to(veil, { opacity: 0, duration: 0.28, ease: "power1.out" });
  }, [pathname]);

  return null;
}
