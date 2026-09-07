/* Klin — motion layer. Additive and idempotent: every element is bound once, so it
   can be re-run after a screen change. The page is complete without it. */
(function () {
  const gsapReady = () => window.gsap;
  const MARK = '__klinBound';

  function once(el) {
    if (el[MARK]) return false;
    el[MARK] = true;
    return true;
  }

  function num(el, attr, fallback) {
    const v = parseFloat(el.getAttribute(attr));
    return Number.isFinite(v) ? v : fallback;
  }

  function init() {
    const g = gsapReady();
    if (!g) return;
    const ST = window.ScrollTrigger;
    if (ST && !init._reg) { g.registerPlugin(ST); init._reg = true; }

    /* headline word mask */
    document.querySelectorAll('[data-mask]').forEach(function (el) {
      if (!once(el)) return;
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

    /* support copy rise */
    document.querySelectorAll('[data-rise]').forEach(function (el, i) {
      if (!once(el)) return;
      g.from(el, { y: 16, opacity: 0, duration: 0.85, ease: 'power3.out', delay: 0.26 + i * 0.07 });
    });

    /* the lamp: breathe + lean toward the pointer */
    const arcs = [];
    document.querySelectorAll('[data-lamp]').forEach(function (el) {
      if (!once(el)) return;
      arcs.push(el);
      g.fromTo(el, { opacity: 0, scaleY: 0.72 }, { opacity: 1, scaleY: 1, duration: 1.4, ease: 'power2.out', delay: 0.2 });
      g.to(el, { scaleX: 1.08, opacity: 0.84, duration: 6.5 + arcs.length * 1.3, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 1.6 });
    });
    if (arcs.length) {
      const rig = arcs.map(function (el) {
        return { f: num(el, 'data-lamp', 18), x: g.quickTo(el, 'x', { duration: 1.3, ease: 'power3.out' }) };
      });
      window.addEventListener('pointermove', function (e) {
        const nx = (e.clientX / window.innerWidth - 0.5) * 2;
        rig.forEach(function (r) { r.x(nx * r.f); });
      }, { passive: true });
    }

    /* hairlines draw in */
    if (ST) {
      document.querySelectorAll('[data-rule]').forEach(function (el) {
        if (!once(el)) return;
        g.from(el, {
          scaleX: 0, transformOrigin: 'left center', duration: 1.1, ease: 'power3.inOut',
          scrollTrigger: { trigger: el, start: 'top 92%', once: true }
        });
      });
    }

    /* card lift + cursor-tracked lamp */
    document.querySelectorAll('[data-lift]').forEach(function (card) {
      if (!once(card)) return;
      const amt = num(card, 'data-lift', 6);
      const sheen = card.querySelector('[data-sheen]');
      const qy = g.quickTo(card, 'y', { duration: 0.5, ease: 'power3.out' });
      card.addEventListener('pointerenter', function () {
        qy(-amt);
        g.to(card, { boxShadow: '0 26px 60px -30px rgba(20,22,26,0.30)', duration: 0.45, overwrite: 'auto' });
        if (sheen) g.to(sheen, { opacity: 1, duration: 0.35, overwrite: 'auto' });
      });
      card.addEventListener('pointermove', function (e) {
        if (!sheen) return;
        const r = card.getBoundingClientRect();
        sheen.style.background = 'radial-gradient(320px circle at ' + (e.clientX - r.left) + 'px ' +
          (e.clientY - r.top) + 'px, rgba(232,133,58,0.14), rgba(232,133,58,0.04) 42%, transparent 70%)';
      }, { passive: true });
      card.addEventListener('pointerleave', function () {
        qy(0);
        g.to(card, { boxShadow: '0 1px 2px rgba(20,22,26,0.04)', duration: 0.55, overwrite: 'auto' });
        if (sheen) g.to(sheen, { opacity: 0, duration: 0.45, overwrite: 'auto' });
      });
    });

    /* the signature: layers fan apart on scroll */
    if (ST) {
      document.querySelectorAll('[data-layer-deck]').forEach(function (deck) {
        if (!once(deck)) return;
        const layers = Array.from(deck.querySelectorAll('[data-layer]'));
        const tl = g.timeline({ scrollTrigger: { trigger: deck, start: 'top 78%', end: 'bottom 46%', scrub: 0.6 } });
        layers.forEach(function (el, i) {
          const d = num(el, 'data-layer', i);
          tl.to(el, { y: -d * 22, x: d * 10, rotate: -d * 0.4, ease: 'none' }, 0);
        });
      });
    }

    /* pattern parallax */
    if (ST) {
      document.querySelectorAll('[data-parallax]').forEach(function (el) {
        if (!once(el)) return;
        g.to(el, {
          y: num(el, 'data-parallax', 40), ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true }
        });
      });
    }

    /* section reveal */
    if (ST) {
      const fresh = Array.from(document.querySelectorAll('[data-reveal]')).filter(once);
      if (fresh.length) {
        fresh.forEach(function (el) {
          g.from(el, {
            y: 28, opacity: 0, duration: 0.8, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 92%', once: true }
          });
        });
      }
    }

    /* marquee, slowing under the cursor */
    document.querySelectorAll('[data-marquee]').forEach(function (rail) {
      if (!once(rail)) return;
      const half = rail.scrollWidth / 2 || 900;
      const tw = g.to(rail, { x: -half, duration: 26, ease: 'none', repeat: -1 });
      rail.addEventListener('pointerenter', function () { g.to(tw, { timeScale: 0.25, duration: 0.6 }); });
      rail.addEventListener('pointerleave', function () { g.to(tw, { timeScale: 1, duration: 0.8 }); });
    });

    /* count-up figures */
    if (ST) {
      document.querySelectorAll('[data-count]').forEach(function (el) {
        if (!once(el)) return;
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
  }

  window.KlinMotion = {
    init: init,
    refresh: function () {
      init();
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    }
  };
})();
