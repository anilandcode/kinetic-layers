"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";

/**
 * The Kinetic Layers motion layer.
 *
 * A port of the design's `site-motion.js`. That file loaded GSAP and
 * Motion.dev from a CDN; here GSAP is a real dependency and the pointer
 * micro-interactions Motion.dev handled are plain CSS transitions instead —
 * they were doing scale and opacity on hover, which CSS does natively for a
 * fraction of the weight.
 *
 * Two behaviours now, both skipped under reduced motion:
 *   [data-morph]      sticky bar compacts past 220px
 *   a[data-nav]       veil covers the page before navigating
 *
 * The entrance animations used to live here, driven by GSAP against a CSS
 * starting state of opacity 0. That made content visibility depend on this
 * component finishing its work, and when it did not — for whatever reason —
 * the affected elements were hidden permanently. On /join that was the entire
 * sign-in form.
 *
 * They are plain CSS keyframes now (see `kiln-rise` in styles/kiln.css). A CSS
 * animation with `both` holds its from-state before it runs and its to-state
 * after, so the content arrives with or without JavaScript, and there is no
 * inline-style tug of war with a running animation. The cost is the
 * scroll-triggered stagger, which was a flourish; the gain is that a form can
 * no longer disappear.
 */

export default function KilnMotion() {
  const router = useRouter();
  const pathname = usePathname();

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
      if (
        evt.defaultPrevented ||
        evt.metaKey ||
        evt.ctrlKey ||
        evt.shiftKey ||
        evt.altKey ||
        evt.button !== 0
      ) {
        return;
      }
      const target = evt.target as HTMLElement | null;

      /* A control nested inside a link owns its own click. Cards wrap
         everything in an <a>, and the copy-prompt button lives on top of the
         preview — without this the capture below eats the click and navigates
         to the very page that button exists to save you from opening. */
      if (target?.closest("button, input, select, textarea, [role='button']")) return;

      const link = target?.closest<HTMLAnchorElement>("a[data-nav]");
      const href = link?.getAttribute("href");
      if (!link || !href || href.startsWith("#") || href.startsWith("http")) return;

      /* A link that opens elsewhere, or downloads, is not a route change — and
         swallowing it would break it outright. */
      if (link.target && link.target !== "_self") return;
      if (link.hasAttribute("download")) return;

      /* A card opens a modal over the page it is already on. Fading the whole
         page to black for 320ms first would announce a navigation that is not
         happening — the dialog is its own transition. Let Link handle it. */
      if (link.hasAttribute("data-card")) return;

      /* preventDefault alone was not enough. This listener sits on the
         document, so in the bubble phase Next's own Link handler has already
         run and navigated — then the veil finishes and pushes the same route a
         second time. Capturing, and stopping propagation before the anchor
         sees the click, leaves exactly one navigation. */
      evt.preventDefault();
      evt.stopPropagation();

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

    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, [router]);

  /* Lift the veil once the new route has painted. */
  useEffect(() => {
    const veil = document.getElementById("km-veil");
    if (!veil) return;
    gsap.to(veil, { opacity: 0, duration: 0.28, ease: "power1.out" });
  }, [pathname]);

  return null;
}
