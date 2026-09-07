/* Kinetic Layers — GSAP motion layer.
   Additive and idempotent: every element is bound once, so init() can be re-run
   after a screen change or a filter change. The page is complete without it. */
(function () {
  const MARK = '__klBound';
  const once = (el, key) => {
    const map = el[MARK] || (el[MARK] = {});
    if (map[key]) return false;
    map[key] = true;
    return true;
  };
  const num = (el, attr, fb) => {
    const v = parseFloat(el.getAttribute(attr));
    return Number.isFinite(v) ? v : fb;
  };
  const reduce = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function init() {
    const g = window.gsap;
    if (!g) return;
    const ST = window.ScrollTrigger;
    if (ST && !init._reg) { g.registerPlugin(ST); init._reg = true; }
    if (reduce()) return;

    /* ---- scroll progress hairline ---- */
    const bar = document.querySelector('[data-progress]');
    if (bar && once(bar, 'progress') && ST) {
      g.set(bar, { scaleX: 0, transformOrigin: 'left center' });
      g.to(bar, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });
    }

    /* ---- headline word mask ---- */
    document.querySelectorAll('[data-mask]').forEach(function (el) {
      if (!once(el, 'mask')) return;
      const words = el.textContent.split(/(\s+)/);
      el.textContent = '';
      const inners = [];
      words.forEach(function (w) {
        if (!w.trim()) { el.appendChild(document.createTextNode(w)); return; }
        const clip = document.createElement('span');
        clip.style.cssText = 'display:inline-block; overflow:hidden; vertical-align:bottom; padding-bottom:0.1em;';
        const inner = document.createElement('span');
        inner.style.cssText = 'display:inline-block;';
        inner.textContent = w;
        clip.appendChild(inner);
        el.appendChild(clip);
        inners.push(inner);
      });
      g.from(inners, { yPercent: 118, opacity: 0, duration: 1.05, ease: 'expo.out', stagger: 0.05, delay: 0.06 });
    });

    /* ---- letter-by-letter label reveal ---- */
    document.querySelectorAll('[data-letters]').forEach(function (el) {
      if (!once(el, 'letters')) return;
      const txt = el.textContent;
      el.textContent = '';
      const spans = [];
      txt.split('').forEach(function (c) {
        const s = document.createElement('span');
        s.style.cssText = 'display:inline-block; white-space:pre;';
        s.textContent = c;
        el.appendChild(s);
        spans.push(s);
      });
      const tw = { opacity: 0, y: 6, duration: 0.5, ease: 'power2.out', stagger: 0.018 };
      if (ST) tw.scrollTrigger = { trigger: el, start: 'top 94%', once: true };
      g.from(spans, tw);
    });

    /* ---- support copy rise ---- */
    document.querySelectorAll('[data-rise]').forEach(function (el, i) {
      if (!once(el, 'rise')) return;
      g.from(el, { y: 16, opacity: 0, duration: 0.85, ease: 'power3.out', delay: 0.26 + i * 0.07 });
    });

    /* ---- the lamp: breathe + lean toward the pointer ---- */
    const arcs = [];
    document.querySelectorAll('[data-lamp]').forEach(function (el) {
      if (!once(el, 'lamp')) return;
      arcs.push(el);
      g.fromTo(el, { opacity: 0, scaleY: 0.72 }, { opacity: 1, scaleY: 1, duration: 1.4, ease: 'power2.out', delay: 0.2 });
      g.to(el, { scaleX: 1.08, opacity: 0.84, duration: 6.5 + arcs.length * 1.3, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 1.6 });
    });
    if (!init._lampRig) {
      init._lampRig = [];
      window.addEventListener('pointermove', function (e) {
        const nx = (e.clientX / window.innerWidth - 0.5) * 2;
        init._lampRig.forEach(function (r) { r.x(nx * r.f); });
      }, { passive: true });
    }
    arcs.forEach(function (el) {
      init._lampRig.push({ f: num(el, 'data-lamp', 18), x: g.quickTo(el, 'x', { duration: 1.3, ease: 'power3.out' }) });
    });

    /* ---- hairlines draw in ---- */
    if (ST) {
      document.querySelectorAll('[data-rule]').forEach(function (el) {
        if (!once(el, 'rule')) return;
        g.from(el, {
          scaleX: 0, transformOrigin: 'left center', duration: 1.1, ease: 'power3.inOut',
          scrollTrigger: { trigger: el, start: 'top 92%', once: true }
        });
      });
    }

    /* ---- nav links: amber underline wipes in, label lifts ---- */
    document.querySelectorAll('[data-nav-link]').forEach(function (link) {
      if (!once(link, 'navLink')) return;
      const ink = link.querySelector('[data-nav-ink]');
      const label = link.querySelector('[data-nav-label]');
      link.addEventListener('pointerenter', function () {
        if (ink) g.fromTo(ink,
          { scaleX: 0, transformOrigin: 'left center' },
          { scaleX: 1, duration: 0.42, ease: 'power3.out', overwrite: true });
        if (label) g.to(label, { y: -2, duration: 0.35, ease: 'power3.out', overwrite: 'auto' });
      });
      link.addEventListener('pointerleave', function () {
        if (ink) g.to(ink, { scaleX: 0, transformOrigin: 'right center', duration: 0.34, ease: 'power3.in', overwrite: true });
        if (label) g.to(label, { y: 0, duration: 0.4, ease: 'power3.out', overwrite: 'auto' });
      });
    });

    /* ---- glass buttons: magnetic pull, cursor glow, shine sweep ---- */
    document.querySelectorAll('[data-glass-btn]').forEach(function (btn) {
      if (!once(btn, 'glassBtn')) return;
      const pull = num(btn, 'data-glass-btn', 6);
      const glow = btn.querySelector('[data-btn-glow]');
      const shine = btn.querySelector('[data-btn-shine]');
      const label = btn.querySelector('[data-btn-label]');
      const hot = btn.dataset.premium != null && btn.dataset.premium !== 'false';

      g.set(btn, { transformPerspective: 700 });
      const qx = g.quickTo(btn, 'x', { duration: 0.5, ease: 'power3.out' });
      const qy = g.quickTo(btn, 'y', { duration: 0.5, ease: 'power3.out' });
      const lx = label && g.quickTo(label, 'x', { duration: 0.6, ease: 'power3.out' });
      const ly = label && g.quickTo(label, 'y', { duration: 0.6, ease: 'power3.out' });

      const sweep = function () {
        if (!shine) return;
        g.fromTo(shine,
          { xPercent: -150, opacity: 0 },
          { xPercent: 170, opacity: 1, duration: 0.9, ease: 'power2.inOut', overwrite: true,
            onComplete: function () { g.set(shine, { opacity: 0 }); } });
      };

      btn.addEventListener('pointerenter', function () {
        g.to(btn, { scale: 1.035, duration: 0.35, ease: 'power3.out', overwrite: 'auto' });
        if (glow) g.to(glow, { opacity: 1, duration: 0.35, overwrite: 'auto' });
        sweep();
      });
      btn.addEventListener('pointermove', function (e) {
        const r = btn.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        qx(px * pull * 2); qy(py * pull);
        if (lx) { lx(px * pull * 0.7); ly(py * pull * 0.5); }
        if (glow) {
          glow.style.background = 'radial-gradient(150px circle at ' + (e.clientX - r.left) + 'px ' +
            (e.clientY - r.top) + 'px, rgba(255,255,255,' + (hot ? 0.34 : 0.24) + '), rgba(232,133,58,' +
            (hot ? 0.3 : 0.16) + ') 42%, transparent 72%)';
        }
      }, { passive: true });
      btn.addEventListener('pointerleave', function () {
        g.to(btn, { scale: 1, duration: 0.55, ease: 'elastic.out(1,0.55)', overwrite: 'auto' });
        qx(0); qy(0);
        if (lx) { lx(0); ly(0); }
        if (glow) g.to(glow, { opacity: 0, duration: 0.45, overwrite: 'auto' });
      });
      btn.addEventListener('pointerdown', function () {
        g.to(btn, { scale: 0.965, duration: 0.12, overwrite: 'auto' });
      });
      btn.addEventListener('pointerup', function () {
        g.to(btn, { scale: 1.035, duration: 0.3, ease: 'back.out(2.4)', overwrite: 'auto' });
      });

      if (hot && shine) {
        g.delayedCall(2.4, function () {
          const loop = function () { sweep(); g.delayedCall(9, loop); };
          loop();
        });
      }
    });

    /* ---- auto-animated glass button: rotating aura, drifting veil, timed sweep ---- */
    document.querySelectorAll('[data-auto-glass]').forEach(function (btn) {
      if (!once(btn, 'autoGlass')) return;
      const aura = btn.querySelector('[data-btn-aura]');
      const veil = btn.querySelector('[data-btn-veil]');
      const shine = btn.querySelector('[data-btn-shine]');
      if (aura) {
        g.set(aura, { transformOrigin: 'center center' });
        g.to(aura, { rotate: 360, duration: 9, ease: 'none', repeat: -1 });
        g.to(aura, { opacity: 0.5, duration: 2.6, ease: 'sine.inOut', repeat: -1, yoyo: true });
      }
      if (veil) g.to(veil, { backgroundPosition: '100% 50%', opacity: 0.72, duration: 3.4, ease: 'sine.inOut', repeat: -1, yoyo: true });
      g.to(btn, { boxShadow: '0 26px 54px -20px rgba(232,133,58,0.95), inset 0 1px 0 rgba(255,255,255,0.42)', duration: 2.8, ease: 'sine.inOut', repeat: -1, yoyo: true });
      if (shine) {
        const loop = function () {
          g.fromTo(shine,
            { xPercent: -150, opacity: 0 },
            { xPercent: 170, opacity: 1, duration: 1.05, ease: 'power2.inOut',
              onComplete: function () { g.set(shine, { opacity: 0 }); g.delayedCall(2.6, loop); } });
        };
        g.delayedCall(1.1, loop);
      }
    });

    /* ---- dual glass glow: outer bloom + inner rim, both tracking the cursor ---- */
    document.querySelectorAll('[data-glow2]').forEach(function (card) {
      if (!once(card, 'glow2')) return;
      const bloom = card.querySelector('[data-glow-bloom]');
      const rim = card.querySelector('[data-glow-rim]');
      const lift = num(card, 'data-glow2', 6);
      const qy = g.quickTo(card, 'y', { duration: 0.5, ease: 'power3.out' });

      const spin = { a: 0 };
      let spinTween = null;
      const rimBase = function (a) {
        return 'conic-gradient(from ' + a.toFixed(1) + 'deg,rgba(255,255,255,0.05),rgba(255,236,214,0.95) 18%,' +
          'rgba(232,133,58,0.85) 34%,rgba(255,255,255,0.06) 52%,rgba(255,214,160,0.75) 74%,rgba(255,255,255,0.05))';
      };

      card.addEventListener('pointerenter', function () {
        qy(-lift);
        if (bloom) g.to(bloom, { opacity: 1, scale: 1, duration: 0.55, ease: 'power3.out', overwrite: 'auto' });
        if (rim) {
          g.to(rim, { opacity: 1, duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
          if (spinTween) spinTween.kill();
          spin.a = 0;
          spinTween = g.to(spin, {
            a: 360, duration: 3.2, ease: 'none', repeat: -1,
            onUpdate: function () { rim.style.background = rimBase(spin.a); }
          });
        }
      });
      card.addEventListener('pointermove', function (e) {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        if (bloom) bloom.style.background = 'radial-gradient(60% 60% at ' + (px * 100) + '% ' + (py * 100) +
          '%, rgba(232,133,58,0.55), rgba(232,133,58,0.16) 52%, rgba(232,133,58,0) 78%)';
      }, { passive: true });
      card.addEventListener('pointerleave', function () {
        qy(0);
        if (bloom) g.to(bloom, { opacity: 0, scale: 0.94, duration: 0.6, ease: 'power3.out', overwrite: 'auto' });
        if (rim) g.to(rim, { opacity: 0, duration: 0.5, ease: 'power2.out', overwrite: 'auto',
          onComplete: function () { if (spinTween) { spinTween.kill(); spinTween = null; } } });
      });
    });

    /* ---- card lift + cursor-tracked lamp (non-asset cards) ---- */
    document.querySelectorAll('[data-lift]').forEach(function (card) {
      if (!once(card, 'lift')) return;
      const amt = num(card, 'data-lift', 6);
      const sheen = card.querySelector('[data-sheen]');
      const qy = g.quickTo(card, 'y', { duration: 0.5, ease: 'power3.out' });
      card.addEventListener('pointerenter', function () {
        qy(-amt);
        g.to(card, { boxShadow: '0 26px 60px -30px rgba(20,22,26,0.34)', duration: 0.45, overwrite: 'auto' });
        if (sheen) g.to(sheen, { opacity: 1, duration: 0.35, overwrite: 'auto' });
      });
      card.addEventListener('pointermove', function (e) {
        if (!sheen) return;
        const r = card.getBoundingClientRect();
        sheen.style.background = 'radial-gradient(320px circle at ' + (e.clientX - r.left) + 'px ' +
          (e.clientY - r.top) + 'px, rgba(232,133,58,0.16), rgba(232,133,58,0.05) 42%, transparent 70%)';
      }, { passive: true });
      card.addEventListener('pointerleave', function () {
        qy(0);
        g.to(card, { boxShadow: '0 1px 2px rgba(20,22,26,0.04)', duration: 0.55, overwrite: 'auto' });
        if (sheen) g.to(sheen, { opacity: 0, duration: 0.45, overwrite: 'auto' });
      });
    });

    /* ---- 3D tilt for preview surfaces ---- */
    document.querySelectorAll('[data-tilt]').forEach(function (el) {
      if (!once(el, 'tilt')) return;
      const max = num(el, 'data-tilt', 5);
      g.set(el, { transformPerspective: 1200, transformOrigin: 'center' });
      const rx = g.quickTo(el, 'rotationX', { duration: 0.6, ease: 'power3.out' });
      const ry = g.quickTo(el, 'rotationY', { duration: 0.6, ease: 'power3.out' });
      el.addEventListener('pointermove', function (e) {
        const r = el.getBoundingClientRect();
        rx(-((e.clientY - r.top) / r.height - 0.5) * max * 2);
        ry(((e.clientX - r.left) / r.width - 0.5) * max * 2);
      }, { passive: true });
      el.addEventListener('pointerleave', function () { rx(0); ry(0); });
    });

    /* ---- the signature: layers fan apart on scroll ---- */
    if (ST) {
      document.querySelectorAll('[data-layer-deck]').forEach(function (deck) {
        if (!once(deck, 'layerDeck')) return;
        const layers = Array.from(deck.querySelectorAll('[data-layer]'));
        const tl = g.timeline({ scrollTrigger: { trigger: deck, start: 'top 78%', end: 'bottom 46%', scrub: 0.6 } });
        layers.forEach(function (el, i) {
          const d = num(el, 'data-layer', i);
          tl.to(el, { y: -d * 22, x: d * 10, rotate: -d * 0.4, ease: 'none' }, 0);
        });
        layers.forEach(function (el) {
          el.addEventListener('pointerenter', function () {
            g.to(el, { scale: 1.012, duration: 0.4, ease: 'power3.out', overwrite: 'auto' });
          });
          el.addEventListener('pointerleave', function () {
            g.to(el, { scale: 1, duration: 0.5, ease: 'power3.out', overwrite: 'auto' });
          });
        });
      });
    }

    /* ---- pattern parallax ---- */
    if (ST) {
      document.querySelectorAll('[data-parallax]').forEach(function (el) {
        if (!once(el, 'parallax')) return;
        g.to(el, {
          y: num(el, 'data-parallax', 40), ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true }
        });
      });
    }

    /* ---- section reveal ---- */
    if (ST) {
      document.querySelectorAll('[data-reveal]').forEach(function (el) {
        if (!once(el, 'reveal')) return;
        g.from(el, {
          y: 28, opacity: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 92%', once: true }
        });
      });
    }

    /* ---- marquee, slowing under the cursor ---- */
    document.querySelectorAll('[data-marquee]').forEach(function (rail) {
      if (!once(rail, 'marquee')) return;
      const half = rail.scrollWidth / 2 || 900;
      const tw = g.to(rail, { x: -half, duration: 26, ease: 'none', repeat: -1 });
      rail.addEventListener('pointerenter', function () { g.to(tw, { timeScale: 0.25, duration: 0.6 }); });
      rail.addEventListener('pointerleave', function () { g.to(tw, { timeScale: 1, duration: 0.8 }); });
    });

    /* ---- count-up figures ---- */
    if (ST) {
      document.querySelectorAll('[data-count]').forEach(function (el) {
        if (!once(el, 'count')) return;
        const to = num(el, 'data-count', 0);
        const suffix = el.getAttribute('data-count-suffix') || '';
        const o = { v: 0 };
        g.to(o, {
          v: to, duration: 1.5, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 92%', once: true },
          onUpdate: function () { el.textContent = (to % 1 ? o.v.toFixed(2) : Math.round(o.v)) + suffix; }
        });
      });
    }

    /* ---- sticky filter rail condenses once it pins ---- */
    if (ST) {
      const rail = document.querySelector('[data-rail]');
      if (rail && once(rail, 'rail')) {
        g.to(rail, {
          paddingTop: 9, paddingBottom: 9, duration: 0.3, ease: 'power2.out', paused: true,
          scrollTrigger: { trigger: rail, start: 'top 100px', end: 'max', toggleActions: 'play none none reverse' }
        });
      }
    }

    /* ---- the CTA field: a dot lattice that bends around the cursor ---- */
    document.querySelectorAll('[data-dotfield]').forEach(function (field) {
      if (!once(field, 'dotfield')) return;
      const dots = Array.from(field.querySelectorAll('[data-dot]'));
      if (!dots.length) return;
      const set = dots.map(function (d) {
        return { el: d, cur: { x: 0, y: 0, s: 1, o: 0.35 } };
      });
      let pts = [];
      const measure = function () {
        const fr = field.getBoundingClientRect();
        pts = dots.map(function (d) {
          const b = d.getBoundingClientRect();
          return { x: b.left - fr.left + b.width / 2, y: b.top - fr.top + b.height / 2 };
        });
      };
      measure();
      window.addEventListener('resize', measure);

      const R = 260;
      let mx = -9999, my = -9999, tx = -9999, ty = -9999, raf = null, idleFrames = 0;

      const frame = function () {
        mx += (tx - mx) * 0.14;
        my += (ty - my) * 0.14;
        let moved = false;
        for (let i = 0; i < set.length; i++) {
          const p = pts[i], c = set[i].cur;
          const dx = p.x - mx, dy = p.y - my;
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
          set[i].el.style.transform = 'translate(' + c.x.toFixed(2) + 'px,' + c.y.toFixed(2) + 'px) scale(' + c.s.toFixed(3) + ')';
          set[i].el.style.opacity = c.o.toFixed(3);
          if (Math.abs(nx - c.x) > 0.1 || Math.abs(ns - c.s) > 0.005) moved = true;
        }
        idleFrames = moved ? 0 : idleFrames + 1;
        if (idleFrames > 30) { raf = null; return; }
        raf = window.requestAnimationFrame(frame);
      };
      const kick = function () { idleFrames = 0; if (!raf) raf = window.requestAnimationFrame(frame); };

      field.addEventListener('pointermove', function (e) {
        const fr = field.getBoundingClientRect();
        tx = e.clientX - fr.left;
        ty = e.clientY - fr.top;
        if (mx < -1000) { mx = tx; my = ty; }
        kick();
      }, { passive: true });
      field.addEventListener('pointerleave', function () { tx = -9999; ty = -9999; kick(); });
      g.from(dots, { opacity: 0, scale: 0.4, duration: 0.9, ease: 'power2.out', stagger: { each: 0.004, from: 'center' } });
    });
  }

  /* re-animate the grid after a filter change */
  function grid() {
    const g = window.gsap;
    if (!g || reduce()) return;
    const cards = document.querySelectorAll('[data-grid-item]');
    if (!cards.length) return;
    g.fromTo(cards,
      { y: 18, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out', stagger: 0.025, overwrite: true });
  }

  /* screen change: fade the new view in */
  function enter() {
    const g = window.gsap;
    if (!g || reduce()) return;
    const view = document.querySelector('[data-view]');
    if (!view) return;
    g.fromTo(view, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' });
  }

  /* soft wipe when the theme flips */
  function themeFlash() {
    const g = window.gsap;
    if (!g || reduce()) return;
    const veil = document.createElement('div');
    veil.style.cssText = 'position:fixed; inset:0; z-index:90; pointer-events:none; background:radial-gradient(closest-side,rgba(232,133,58,0.22),transparent 72%);';
    document.body.appendChild(veil);
    g.fromTo(veil, { opacity: 0, scale: 0.7 }, {
      opacity: 1, scale: 1.25, duration: 0.32, ease: 'power2.out',
      onComplete: function () {
        g.to(veil, { opacity: 0, duration: 0.4, ease: 'power2.in', onComplete: function () { veil.remove(); } });
      }
    });
  }

  /* Content mounts progressively, so binding cannot rely on one call at mount:
     watch for unbound targets and bind them as they appear. */
  const TARGETS = ['[data-progress]', '[data-mask]', '[data-letters]', '[data-rise]', '[data-lamp]',
    '[data-rule]', '[data-nav-link]', '[data-glass-btn]', '[data-auto-glass]', '[data-glow2]',
    '[data-lift]', '[data-tilt]', '[data-layer-deck]', '[data-parallax]', '[data-reveal]',
    '[data-marquee]', '[data-count]', '[data-rail]', '[data-dotfield]'];

  function pending() {
    for (let i = 0; i < TARGETS.length; i++) {
      const attr = TARGETS[i].slice(6, -1);
      const k = attr.replace(/-([a-z])/g, function (_, c) { return c.toUpperCase(); });
      const els = document.querySelectorAll(TARGETS[i]);
      for (let j = 0; j < els.length; j++) {
        const map = els[j][MARK];
        if (!map || !map[k]) return true;
      }
    }
    return false;
  }

  let sweeping = false, timer = null;
  function sweep() {
    if (sweeping || !pending()) return;
    sweeping = true;
    init();
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    window.setTimeout(function () { sweeping = false; }, 0);
  }
  function schedule() {
    if (timer) return;
    timer = window.setTimeout(function () { timer = null; sweep(); }, 120);
  }

  function watch() {
    if (watch._on) return;
    watch._on = true;
    sweep();
    if (window.MutationObserver) {
      new MutationObserver(function () { if (!sweeping) schedule(); })
        .observe(document.documentElement, { childList: true, subtree: true });
    }
    [80, 300, 800, 1600, 3000].forEach(function (ms) { window.setTimeout(sweep, ms); });
    window.addEventListener('load', sweep);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watch);
  else watch();

  window.KLMotion = {
    init: init,
    grid: grid,
    enter: enter,
    themeFlash: themeFlash,
    refresh: function () {
      watch();
      sweep();
    }
  };
})();
