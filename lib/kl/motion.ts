/**
 * Kinetic Layers — GSAP motion layer.
 *
 * A TypeScript port of design-export/project/kl-site-motion.js, kept
 * deliberately close to the original so the two can be diffed.
 *
 * Two properties of the original are load-bearing and must survive any edit:
 *
 * 1. Every entrance uses `gsap.from()`. The start state is written by JS and
 *    animates to the element's natural state, so a page whose motion layer
 *    never runs is still complete. Nothing here may be paired with a CSS rule
 *    that hides content — that pattern once made the sign-in form permanently
 *    invisible (HANDOFF.md, trap 1).
 *
 * 2. Binding is additive and idempotent, marked per element. Content mounts
 *    progressively, so a single call at mount would miss most of it; a
 *    MutationObserver sweeps for unbound targets instead.
 *
 * The layer is a singleton that outlives navigation. It is never reverted:
 * `gsap.context().revert()` restores the pre-animation state, which for a
 * `from()` tween is `opacity: 0` (trap 6).
 */

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type Gsap = typeof gsap;

const MARK = "__klBound";

type Marked = Element & { [MARK]?: Record<string, boolean> };

/** Bind each element once per behaviour, so a re-sweep is free. */
function once(el: Element, key: string): boolean {
  const node = el as Marked;
  const map = node[MARK] ?? (node[MARK] = {});
  if (map[key]) return false;
  map[key] = true;
  return true;
}

function num(el: Element, attr: string, fallback: number): number {
  const v = parseFloat(el.getAttribute(attr) ?? "");
  return Number.isFinite(v) ? v : fallback;
}

const reduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;

const all = <T extends Element = HTMLElement>(sel: string) =>
  Array.from(document.querySelectorAll<T>(sel));

/* The lamp rig is shared: one pointermove listener drives every arc. */
type LampRig = { f: number; x: (v: number) => void };
let lampRig: LampRig[] | null = null;
let registered = false;

function init(g: Gsap) {
  /* The prototype read window.ScrollTrigger because it loaded GSAP from a CDN.
     Here both are real dependencies, so the plugin is imported and registered —
     which also means `hasST` is never in doubt.

     That matters more than tidiness: every `from()` paired with a ScrollTrigger
     applies its start state immediately and is cleared only when the trigger
     fires. If the plugin were missing, those elements would sit at opacity 0
     forever — trap 1, rebuilt. The guards below skip such tweens entirely
     rather than create one that nothing can finish. */
  if (!registered) {
    g.registerPlugin(ScrollTrigger);
    registered = true;
  }
  const hasST = true;

  /* Everything below is decoration. Someone who asked for less motion gets a
     static page, which is the whole point of the from()-based entrances. */
  if (reduced()) return;

  scrollProgress(g, hasST);
  headlineMask(g);
  letterReveal(g, hasST);
  copyRise(g);
  lamp(g);
  hairlines(g, hasST);
  navLinks(g);
  glassButtons(g);
  autoGlass(g);
  dualGlow(g);
  cardLift(g);
  layerDeck(g, hasST);
  parallax(g, hasST);
  reveal(g, hasST);
  marquee(g);
  countUp(g, hasST);
  filterRail(g, hasST);
  dotField(g);
}

/* ---------- scroll progress hairline ------------------------------------ */
function scrollProgress(g: Gsap, hasST: boolean) {
  const bar = document.querySelector("[data-progress]");
  if (!bar || !hasST || !once(bar, "progress")) return;
  g.set(bar, { scaleX: 0, transformOrigin: "left center" });
  g.to(bar, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });
}

/* ---------- headline word mask ------------------------------------------
   Each word gets a clipping span so it can rise out of nothing. Rebuilding
   the text node loses any markup inside, which is why this is only ever put
   on plain-text headings. */
function headlineMask(g: Gsap) {
  all("[data-mask]").forEach((el) => {
    if (!once(el, "mask")) return;
    const words = (el.textContent ?? "").split(/(\s+)/);
    el.textContent = "";
    const inners: HTMLElement[] = [];
    words.forEach((w) => {
      if (!w.trim()) {
        el.appendChild(document.createTextNode(w));
        return;
      }
      const clip = document.createElement("span");
      clip.style.cssText =
        "display:inline-block; overflow:hidden; vertical-align:bottom; padding-bottom:0.1em;";
      const inner = document.createElement("span");
      inner.style.cssText = "display:inline-block;";
      inner.textContent = w;
      clip.appendChild(inner);
      el.appendChild(clip);
      inners.push(inner);
    });
    g.from(inners, {
      yPercent: 118,
      opacity: 0,
      duration: 1.05,
      ease: "expo.out",
      stagger: 0.05,
      delay: 0.06,
    });
  });
}

/* ---------- letter-by-letter label reveal -------------------------------- */
function letterReveal(g: Gsap, hasST: boolean) {
  all("[data-letters]").forEach((el) => {
    if (!once(el, "letters")) return;
    const txt = el.textContent ?? "";
    el.textContent = "";
    const spans: HTMLElement[] = [];
    txt.split("").forEach((c) => {
      const s = document.createElement("span");
      s.style.cssText = "display:inline-block; white-space:pre;";
      s.textContent = c;
      el.appendChild(s);
      spans.push(s);
    });
    const tw: gsap.TweenVars = {
      opacity: 0,
      y: 6,
      duration: 0.5,
      ease: "power2.out",
      stagger: 0.018,
    };
    if (hasST) tw.scrollTrigger = { trigger: el, start: "top 94%", once: true };
    g.from(spans, tw);
  });
}

/* ---------- support copy rise -------------------------------------------- */
function copyRise(g: Gsap) {
  all("[data-rise]").forEach((el, i) => {
    if (!once(el, "rise")) return;
    g.from(el, { y: 16, opacity: 0, duration: 0.85, ease: "power3.out", delay: 0.26 + i * 0.07 });
  });
}

/* ---------- the lamp: breathes, and leans toward the pointer -------------- */
function lamp(g: Gsap) {
  const arcs: HTMLElement[] = [];
  all("[data-lamp]").forEach((el) => {
    if (!once(el, "lamp")) return;
    arcs.push(el);
    g.fromTo(
      el,
      { opacity: 0, scaleY: 0.72 },
      { opacity: 1, scaleY: 1, duration: 1.4, ease: "power2.out", delay: 0.2 }
    );
    g.to(el, {
      scaleX: 1.08,
      opacity: 0.84,
      duration: 6.5 + arcs.length * 1.3,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
      delay: 1.6,
    });
  });

  if (!lampRig) {
    lampRig = [];
    window.addEventListener(
      "pointermove",
      (e) => {
        const nx = (e.clientX / window.innerWidth - 0.5) * 2;
        lampRig?.forEach((r) => r.x(nx * r.f));
      },
      { passive: true }
    );
  }
  arcs.forEach((el) => {
    lampRig?.push({
      f: num(el, "data-lamp", 18),
      x: g.quickTo(el, "x", { duration: 1.3, ease: "power3.out" }),
    });
  });
}

/* ---------- hairlines draw in -------------------------------------------- */
function hairlines(g: Gsap, hasST: boolean) {
  if (!hasST) return;
  all("[data-rule]").forEach((el) => {
    if (!once(el, "rule")) return;
    g.from(el, {
      scaleX: 0,
      transformOrigin: "left center",
      duration: 1.1,
      ease: "power3.inOut",
      scrollTrigger: { trigger: el, start: "top 92%", once: true },
    });
  });
}

/* ---------- nav links: amber underline wipes in, label lifts -------------- */
function navLinks(g: Gsap) {
  all("[data-nav-link]").forEach((link) => {
    if (!once(link, "navLink")) return;
    const ink = link.querySelector("[data-nav-ink]");
    const label = link.querySelector("[data-nav-label]");
    link.addEventListener("pointerenter", () => {
      if (ink)
        g.fromTo(
          ink,
          { scaleX: 0, transformOrigin: "left center" },
          { scaleX: 1, duration: 0.42, ease: "power3.out", overwrite: true }
        );
      if (label) g.to(label, { y: -2, duration: 0.35, ease: "power3.out", overwrite: "auto" });
    });
    link.addEventListener("pointerleave", () => {
      if (ink)
        g.to(ink, {
          scaleX: 0,
          transformOrigin: "right center",
          duration: 0.34,
          ease: "power3.in",
          overwrite: true,
        });
      if (label) g.to(label, { y: 0, duration: 0.4, ease: "power3.out", overwrite: "auto" });
    });
  });
}

/* ---------- glass buttons: magnetic pull, cursor glow, shine sweep --------
   Listeners are bubble-phase and never stop propagation, so a React onClick
   on the same button still fires (trap 4 is about the nav interceptor, and
   this layer must not reintroduce it). */
function glassButtons(g: Gsap) {
  all("[data-glass-btn]").forEach((btn) => {
    if (!once(btn, "glassBtn")) return;
    const pull = num(btn, "data-glass-btn", 6);
    const glow = btn.querySelector<HTMLElement>("[data-btn-glow]");
    const shine = btn.querySelector<HTMLElement>("[data-btn-shine]");
    const label = btn.querySelector<HTMLElement>("[data-btn-label]");
    const hot = btn.dataset.premium != null && btn.dataset.premium !== "false";

    g.set(btn, { transformPerspective: 700 });
    const qx = g.quickTo(btn, "x", { duration: 0.5, ease: "power3.out" });
    const qy = g.quickTo(btn, "y", { duration: 0.5, ease: "power3.out" });
    const lx = label && g.quickTo(label, "x", { duration: 0.6, ease: "power3.out" });
    const ly = label && g.quickTo(label, "y", { duration: 0.6, ease: "power3.out" });

    const sweep = () => {
      if (!shine) return;
      g.fromTo(
        shine,
        { xPercent: -150, opacity: 0 },
        {
          xPercent: 170,
          opacity: 1,
          duration: 0.9,
          ease: "power2.inOut",
          overwrite: true,
          onComplete: () => g.set(shine, { opacity: 0 }),
        }
      );
    };

    btn.addEventListener("pointerenter", () => {
      g.to(btn, { scale: 1.035, duration: 0.35, ease: "power3.out", overwrite: "auto" });
      if (glow) g.to(glow, { opacity: 1, duration: 0.35, overwrite: "auto" });
      sweep();
    });
    btn.addEventListener(
      "pointermove",
      (e) => {
        const r = btn.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        qx(px * pull * 2);
        qy(py * pull);
        if (lx && ly) {
          lx(px * pull * 0.7);
          ly(py * pull * 0.5);
        }
        if (glow) {
          glow.style.background =
            `radial-gradient(150px circle at ${e.clientX - r.left}px ${e.clientY - r.top}px, ` +
            `rgba(255,255,255,${hot ? 0.34 : 0.24}), rgba(232,133,58,${hot ? 0.3 : 0.16}) 42%, transparent 72%)`;
        }
      },
      { passive: true }
    );
    btn.addEventListener("pointerleave", () => {
      g.to(btn, { scale: 1, duration: 0.55, ease: "elastic.out(1,0.55)", overwrite: "auto" });
      qx(0);
      qy(0);
      if (lx && ly) {
        lx(0);
        ly(0);
      }
      if (glow) g.to(glow, { opacity: 0, duration: 0.45, overwrite: "auto" });
    });
    btn.addEventListener("pointerdown", () => {
      g.to(btn, { scale: 0.965, duration: 0.12, overwrite: "auto" });
    });
    btn.addEventListener("pointerup", () => {
      g.to(btn, { scale: 1.035, duration: 0.3, ease: "back.out(2.4)", overwrite: "auto" });
    });

    /* The Premium button sweeps on its own so it reads as the live one. */
    if (hot && shine) {
      g.delayedCall(2.4, function loop() {
        sweep();
        g.delayedCall(9, loop);
      });
    }
  });
}

/* ---------- the one auto-animated button --------------------------------- */
function autoGlass(g: Gsap) {
  all("[data-auto-glass]").forEach((btn) => {
    if (!once(btn, "autoGlass")) return;
    const aura = btn.querySelector<HTMLElement>("[data-btn-aura]");
    const veil = btn.querySelector<HTMLElement>("[data-btn-veil]");
    const shine = btn.querySelector<HTMLElement>("[data-btn-shine]");

    if (aura) {
      g.set(aura, { transformOrigin: "center center" });
      g.to(aura, { rotate: 360, duration: 9, ease: "none", repeat: -1 });
      g.to(aura, { opacity: 0.5, duration: 2.6, ease: "sine.inOut", repeat: -1, yoyo: true });
    }
    if (veil)
      g.to(veil, {
        backgroundPosition: "100% 50%",
        opacity: 0.72,
        duration: 3.4,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });

    g.to(btn, {
      boxShadow:
        "0 26px 54px -20px rgba(232,133,58,0.95), inset 0 1px 0 rgba(255,255,255,0.42)",
      duration: 2.8,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
    });

    if (shine) {
      const loop = () => {
        g.fromTo(
          shine,
          { xPercent: -150, opacity: 0 },
          {
            xPercent: 170,
            opacity: 1,
            duration: 1.05,
            ease: "power2.inOut",
            onComplete: () => {
              g.set(shine, { opacity: 0 });
              g.delayedCall(2.6, loop);
            },
          }
        );
      };
      g.delayedCall(1.1, loop);
    }
  });
}

/* ---------- dual glass glow: outer bloom + inner rim --------------------- */
function dualGlow(g: Gsap) {
  all("[data-glow2]").forEach((card) => {
    if (!once(card, "glow2")) return;
    const bloom = card.querySelector<HTMLElement>("[data-glow-bloom]");
    const rim = card.querySelector<HTMLElement>("[data-glow-rim]");
    const lift = num(card, "data-glow2", 6);
    const qy = g.quickTo(card, "y", { duration: 0.5, ease: "power3.out" });

    const spin = { a: 0 };
    let spinTween: gsap.core.Tween | null = null;
    const rimBase = (a: number) =>
      `conic-gradient(from ${a.toFixed(1)}deg,rgba(255,255,255,0.05),rgba(255,236,214,0.95) 18%,` +
      `rgba(232,133,58,0.85) 34%,rgba(255,255,255,0.06) 52%,rgba(255,214,160,0.75) 74%,rgba(255,255,255,0.05))`;

    card.addEventListener("pointerenter", () => {
      qy(-lift);
      if (bloom)
        g.to(bloom, { opacity: 1, scale: 1, duration: 0.55, ease: "power3.out", overwrite: "auto" });
      if (rim) {
        g.to(rim, { opacity: 1, duration: 0.4, ease: "power2.out", overwrite: "auto" });
        spinTween?.kill();
        spin.a = 0;
        spinTween = g.to(spin, {
          a: 360,
          duration: 3.2,
          ease: "none",
          repeat: -1,
          onUpdate: () => {
            rim.style.background = rimBase(spin.a);
          },
        });
      }
    });
    card.addEventListener(
      "pointermove",
      (e) => {
        if (!bloom) return;
        const r = card.getBoundingClientRect();
        const px = ((e.clientX - r.left) / r.width) * 100;
        const py = ((e.clientY - r.top) / r.height) * 100;
        bloom.style.background =
          `radial-gradient(60% 60% at ${px}% ${py}%, rgba(232,133,58,0.55), ` +
          `rgba(232,133,58,0.16) 52%, rgba(232,133,58,0) 78%)`;
      },
      { passive: true }
    );
    card.addEventListener("pointerleave", () => {
      qy(0);
      if (bloom)
        g.to(bloom, { opacity: 0, scale: 0.94, duration: 0.6, ease: "power3.out", overwrite: "auto" });
      if (rim)
        g.to(rim, {
          opacity: 0,
          duration: 0.5,
          ease: "power2.out",
          overwrite: "auto",
          onComplete: () => {
            spinTween?.kill();
            spinTween = null;
          },
        });
    });
  });
}

/* ---------- card lift + cursor-tracked sheen ----------------------------- */
function cardLift(g: Gsap) {
  all("[data-lift]").forEach((card) => {
    if (!once(card, "lift")) return;
    const amt = num(card, "data-lift", 6);
    const sheen = card.querySelector<HTMLElement>("[data-sheen]");
    const qy = g.quickTo(card, "y", { duration: 0.5, ease: "power3.out" });

    card.addEventListener("pointerenter", () => {
      qy(-amt);
      g.to(card, {
        boxShadow: "0 26px 60px -30px rgba(20,22,26,0.34)",
        duration: 0.45,
        overwrite: "auto",
      });
      if (sheen) g.to(sheen, { opacity: 1, duration: 0.35, overwrite: "auto" });
    });
    card.addEventListener(
      "pointermove",
      (e) => {
        if (!sheen) return;
        const r = card.getBoundingClientRect();
        sheen.style.background =
          `radial-gradient(320px circle at ${e.clientX - r.left}px ${e.clientY - r.top}px, ` +
          `rgba(232,133,58,0.16), rgba(232,133,58,0.05) 42%, transparent 70%)`;
      },
      { passive: true }
    );
    card.addEventListener("pointerleave", () => {
      qy(0);
      g.to(card, { boxShadow: "0 1px 2px rgba(20,22,26,0.04)", duration: 0.55, overwrite: "auto" });
      if (sheen) g.to(sheen, { opacity: 0, duration: 0.45, overwrite: "auto" });
    });
  });
}

/* ---------- the signature: layers fan apart on scroll -------------------- */
function layerDeck(g: Gsap, hasST: boolean) {
  if (!hasST) return;
  all("[data-layer-deck]").forEach((deck) => {
    if (!once(deck, "layerDeck")) return;
    const layers = Array.from(deck.querySelectorAll<HTMLElement>("[data-layer]"));
    const tl = g.timeline({
      scrollTrigger: { trigger: deck, start: "top 78%", end: "bottom 46%", scrub: 0.6 },
    });
    layers.forEach((el, i) => {
      const d = num(el, "data-layer", i);
      tl.to(el, { y: -d * 22, x: d * 10, rotate: -d * 0.4, ease: "none" }, 0);
    });
    layers.forEach((el) => {
      el.addEventListener("pointerenter", () => {
        g.to(el, { scale: 1.012, duration: 0.4, ease: "power3.out", overwrite: "auto" });
      });
      el.addEventListener("pointerleave", () => {
        g.to(el, { scale: 1, duration: 0.5, ease: "power3.out", overwrite: "auto" });
      });
    });
  });
}

/* ---------- pattern parallax --------------------------------------------- */
function parallax(g: Gsap, hasST: boolean) {
  if (!hasST) return;
  all("[data-parallax]").forEach((el) => {
    if (!once(el, "parallax")) return;
    g.to(el, {
      y: num(el, "data-parallax", 40),
      ease: "none",
      scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
    });
  });
}

/* ---------- section reveal ------------------------------------------------ */
function reveal(g: Gsap, hasST: boolean) {
  if (!hasST) return;
  all("[data-reveal]").forEach((el) => {
    if (!once(el, "reveal")) return;
    g.from(el, {
      y: 28,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 92%", once: true },
    });
  });
}

/* ---------- marquee, slowing under the cursor ---------------------------- */
function marquee(g: Gsap) {
  all("[data-marquee]").forEach((rail) => {
    if (!once(rail, "marquee")) return;
    const half = rail.scrollWidth / 2 || 900;
    const tw = g.to(rail, { x: -half, duration: 26, ease: "none", repeat: -1 });
    rail.addEventListener("pointerenter", () => {
      g.to(tw, { timeScale: 0.25, duration: 0.6 });
    });
    rail.addEventListener("pointerleave", () => {
      g.to(tw, { timeScale: 1, duration: 0.8 });
    });
  });
}

/* ---------- count-up figures ---------------------------------------------
   The target is an attribute, and the element's own text is the real number
   rendered on the server — so this animates toward what is already true. */
function countUp(g: Gsap, hasST: boolean) {
  if (!hasST) return;
  all("[data-count]").forEach((el) => {
    if (!once(el, "count")) return;
    const to = num(el, "data-count", 0);
    const suffix = el.getAttribute("data-count-suffix") ?? "";
    const o = { v: 0 };
    g.to(o, {
      v: to,
      duration: 1.5,
      ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 92%", once: true },
      onUpdate: () => {
        el.textContent = (to % 1 ? o.v.toFixed(2) : Math.round(o.v)) + suffix;
      },
    });
  });
}

/* ---------- sticky filter rail condenses once it pins -------------------- */
function filterRail(g: Gsap, hasST: boolean) {
  if (!hasST) return;
  const rail = document.querySelector("[data-rail]");
  if (!rail || !once(rail, "rail")) return;
  g.to(rail, {
    paddingTop: 9,
    paddingBottom: 9,
    duration: 0.3,
    ease: "power2.out",
    paused: true,
    scrollTrigger: {
      trigger: rail,
      start: "top 100px",
      end: "max",
      toggleActions: "play none none reverse",
    },
  });
}

/* ---------- the CTA field: a dot lattice that bends around the cursor -----
   Hand-rolled rather than tweened: hundreds of dots each frame is more than
   GSAP should be asked to manage, and the loop parks itself after 30 idle
   frames so an untouched field costs nothing. */
function dotField(g: Gsap) {
  all("[data-dotfield]").forEach((field) => {
    if (!once(field, "dotfield")) return;
    const dots = Array.from(field.querySelectorAll<HTMLElement>("[data-dot]"));
    if (!dots.length) return;

    const state = dots.map((d) => ({ el: d, cur: { x: 0, y: 0, s: 1, o: 0.35 } }));
    let pts: { x: number; y: number }[] = [];
    const measure = () => {
      const fr = field.getBoundingClientRect();
      pts = dots.map((d) => {
        const b = d.getBoundingClientRect();
        return { x: b.left - fr.left + b.width / 2, y: b.top - fr.top + b.height / 2 };
      });
    };
    measure();
    window.addEventListener("resize", measure);

    const R = 260;
    let mx = -9999, my = -9999, tx = -9999, ty = -9999;
    let raf: number | null = null;
    let idleFrames = 0;

    const frame = () => {
      mx += (tx - mx) * 0.14;
      my += (ty - my) * 0.14;
      let moved = false;
      for (let i = 0; i < state.length; i++) {
        const p = pts[i];
        const c = state[i].cur;
        if (!p) continue;
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const f = dist < R ? 1 - dist / R : 0;
        const ease = f * f;
        const push = ease * 26;
        const ang = Math.atan2(dy, dx);
        const nx = Math.cos(ang) * push;
        const ny = Math.sin(ang) * push;
        const ns = 1 + ease * 2.6;
        const no = 0.3 + ease * 0.7;
        c.x += (nx - c.x) * 0.18;
        c.y += (ny - c.y) * 0.18;
        c.s += (ns - c.s) * 0.18;
        c.o += (no - c.o) * 0.18;
        state[i].el.style.transform =
          `translate(${c.x.toFixed(2)}px,${c.y.toFixed(2)}px) scale(${c.s.toFixed(3)})`;
        state[i].el.style.opacity = c.o.toFixed(3);
        if (Math.abs(nx - c.x) > 0.1 || Math.abs(ns - c.s) > 0.005) moved = true;
      }
      idleFrames = moved ? 0 : idleFrames + 1;
      if (idleFrames > 30) {
        raf = null;
        return;
      }
      raf = window.requestAnimationFrame(frame);
    };
    const kick = () => {
      idleFrames = 0;
      if (!raf) raf = window.requestAnimationFrame(frame);
    };

    field.addEventListener(
      "pointermove",
      (e) => {
        const fr = field.getBoundingClientRect();
        tx = e.clientX - fr.left;
        ty = e.clientY - fr.top;
        if (mx < -1000) {
          mx = tx;
          my = ty;
        }
        kick();
      },
      { passive: true }
    );
    field.addEventListener("pointerleave", () => {
      tx = -9999;
      ty = -9999;
      kick();
    });

    g.from(dots, {
      opacity: 0,
      scale: 0.4,
      duration: 0.9,
      ease: "power2.out",
      stagger: { each: 0.004, from: "center" },
    });
  });
}

/* ---------- public surface ------------------------------------------------ */

/** Re-animate the grid after a filter change. */
export function animateGrid() {
  const g = gsap;
  if (reduced()) return;
  const cards = all("[data-grid-item]");
  if (!cards.length) return;
  g.fromTo(
    cards,
    { y: 18, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.55, ease: "power3.out", stagger: 0.025, overwrite: true }
  );
}

/** Fade a newly-shown view in. */
export function animateEnter() {
  const g = gsap;
  if (reduced()) return;
  const view = document.querySelector("[data-view]");
  if (!view) return;
  g.fromTo(view, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" });
}

const TARGETS = [
  "[data-progress]", "[data-mask]", "[data-letters]", "[data-rise]", "[data-lamp]",
  "[data-rule]", "[data-nav-link]", "[data-glass-btn]", "[data-auto-glass]", "[data-glow2]",
  "[data-lift]", "[data-layer-deck]", "[data-parallax]", "[data-reveal]",
  "[data-marquee]", "[data-count]", "[data-rail]", "[data-dotfield]",
];

/** Is anything on the page still unbound? */
function pending(): boolean {
  for (const sel of TARGETS) {
    const attr = sel.slice(6, -1);
    const key = attr.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    for (const el of document.querySelectorAll(sel)) {
      const map = (el as Marked)[MARK];
      if (!map || !map[key]) return true;
    }
  }
  return false;
}

let sweeping = false;
let timer: number | null = null;
let watching = false;

/**
 * Bind anything new, then let ScrollTrigger remeasure.
 *
 * Safe to call as often as you like: it returns immediately when every target
 * is already bound, which is what makes the MutationObserver affordable.
 */
export function sweep() {
  const g = gsap;
  if (sweeping || !pending()) return;
  sweeping = true;
  init(g);
  ScrollTrigger.refresh();
  window.setTimeout(() => {
    sweeping = false;
  }, 0);
}

/**
 * Start watching for content that mounts after this call.
 *
 * Idempotent, and never torn down: the layer is a singleton that outlives
 * navigation, because reverting it would restore `from()` start states and
 * leave the page invisible (trap 6).
 */
export function watch() {
  if (watching) {
    sweep();
    return;
  }
  watching = true;
  sweep();

  if (window.MutationObserver) {
    new MutationObserver(() => {
      if (sweeping || timer) return;
      timer = window.setTimeout(() => {
        timer = null;
        sweep();
      }, 120);
    }).observe(document.documentElement, { childList: true, subtree: true });
  }

  /* Fonts, images and late hydration all shift layout after mount. */
  [80, 300, 800, 1600, 3000].forEach((ms) => window.setTimeout(() => sweep(), ms));
  window.addEventListener("load", () => sweep());
}
