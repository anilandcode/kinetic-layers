/* Kinetic Layers — motion layer. Purely additive: the page is complete without it. */
(function () {
  let booted = false;

  function init() {
    if (booted) return;
    booted = true;
    const g = window.gsap;
    if (!g) return;
    const ST = window.ScrollTrigger;
    if (ST) g.registerPlugin(ST);

    /* 1 — headline word mask reveal */
    document.querySelectorAll('[data-mask]').forEach(function (el) {
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
      g.from(inners, { yPercent: 118, opacity: 0, duration: 1.05, ease: 'expo.out', stagger: 0.05, delay: 0.08 });
    });

    /* 2 — support copy rise */
    document.querySelectorAll('[data-rise]').forEach(function (el, i) {
      g.from(el, { y: 16, opacity: 0, duration: 0.85, ease: 'power3.out', delay: 0.3 + i * 0.08 });
    });

    /* 3 — the glow breathes and tracks the pointer a little */
    const arcs = Array.from(document.querySelectorAll('[data-glow-arc]'));
    arcs.forEach(function (el, i) {
      g.fromTo(el,
        { opacity: 0, scaleY: 0.7 },
        { opacity: 1, scaleY: 1, duration: 1.4, ease: 'power2.out', delay: 0.25 });
      g.to(el, {
        scaleX: 1.08, opacity: 0.82, duration: 6.5 + i * 1.4,
        ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 1.6
      });
    });
    if (arcs.length) {
      const rig = arcs.map(function (el) {
        return {
          f: Number.isFinite(parseFloat(el.getAttribute('data-glow-arc'))) ? parseFloat(el.getAttribute('data-glow-arc')) : 18,
          x: g.quickTo(el, 'x', { duration: 1.3, ease: 'power3.out' })
        };
      });
      window.addEventListener('pointermove', function (e) {
        const nx = (e.clientX / window.innerWidth - 0.5) * 2;
        rig.forEach(function (r) { r.x(nx * r.f); });
      }, { passive: true });
    }

    /* 4 — hairline rules draw in */
    if (ST) {
      document.querySelectorAll('[data-rule]').forEach(function (el) {
        g.from(el, {
          scaleX: 0, transformOrigin: 'left center', duration: 1.1, ease: 'power3.inOut',
          scrollTrigger: { trigger: el, start: 'top 92%', once: true }
        });
      });
    }

    /* 5 — card lift + cursor-tracked sheen */
    document.querySelectorAll('[data-lift]').forEach(function (card) {
      const rawAmt = parseFloat(card.getAttribute('data-lift'));
      const amt = Number.isFinite(rawAmt) ? rawAmt : 6;
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

    /* 6 — the layers separate as you scroll past them (the brand gesture) */
    if (ST) {
      const deck = document.querySelector('[data-layer-deck]');
      if (deck) {
        const layers = Array.from(deck.querySelectorAll('[data-layer]'));
        const tl = g.timeline({
          scrollTrigger: { trigger: deck, start: 'top 78%', end: 'bottom 46%', scrub: 0.6 }
        });
        layers.forEach(function (el, i) {
          const raw = parseFloat(el.getAttribute('data-layer'));
          const d = Number.isFinite(raw) ? raw : i;
          tl.to(el, { y: -d * 22, x: d * 10, rotate: -d * 0.4, ease: 'none' }, 0);
        });
      }
    }

    /* 7 — stack pattern parallax */
    if (ST) {
      document.querySelectorAll('[data-parallax]').forEach(function (el) {
        const rawD = parseFloat(el.getAttribute('data-parallax'));
        const d = Number.isFinite(rawD) ? rawD : 40;
        g.to(el, {
          y: d, ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true }
        });
      });
    }

    /* 8 — section reveal */
    if (ST) {
      ST.batch('[data-reveal]', {
        start: 'top 90%', once: true, batchMax: 6,
        onEnter: function (batch) {
          g.from(batch, { y: 28, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.07 });
        }
      });
    }

    /* 9 — logo rail marquee */
    document.querySelectorAll('[data-marquee]').forEach(function (rail) {
      const half = rail.scrollWidth / 2 || 900;
      const tw = g.to(rail, { x: -half, duration: 26, ease: 'none', repeat: -1 });
      rail.addEventListener('pointerenter', function () { g.to(tw, { timeScale: 0.25, duration: 0.6 }); });
      rail.addEventListener('pointerleave', function () { g.to(tw, { timeScale: 1, duration: 0.8 }); });
    });

    /* 10 — count-up figures */
    if (ST) {
      document.querySelectorAll('[data-count]').forEach(function (el) {
        const rawTo = parseFloat(el.getAttribute('data-count'));
        const to = Number.isFinite(rawTo) ? rawTo : 0;
        const suffix = el.getAttribute('data-count-suffix') || '';
        const o = { v: 0 };
        g.to(o, {
          v: to, duration: 1.5, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 92%', once: true },
          onUpdate: function () {
            el.textContent = (to % 1 ? o.v.toFixed(2) : Math.round(o.v)) + suffix;
          }
        });
      });
    }
  }

  window.KLMotion = { init: init };
})();
