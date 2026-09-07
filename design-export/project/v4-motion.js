/* Homepage v4 — flowing motion layer. Purely additive: everything is visible without it. */
(function () {
  let booted = false;

  function init() {
    if (booted) return;
    booted = true;
    const g = window.gsap;
    if (!g) return;
    if (window.ScrollTrigger) g.registerPlugin(window.ScrollTrigger);

    /* 1 — bloom drifts with the pointer */
    const blooms = Array.from(document.querySelectorAll('[data-bloom]'));
    if (blooms.length) {
      const rig = blooms.map(function (el) {
        return {
          f: parseFloat(el.getAttribute('data-bloom')) || 20,
          x: g.quickTo(el, 'x', { duration: 1.2, ease: 'power3.out' }),
          y: g.quickTo(el, 'y', { duration: 1.2, ease: 'power3.out' })
        };
      });
      window.addEventListener('pointermove', function (e) {
        const nx = (e.clientX / window.innerWidth - 0.5) * 2;
        const ny = (e.clientY / window.innerHeight - 0.5) * 2;
        rig.forEach(function (r) { r.x(nx * r.f); r.y(ny * r.f); });
      }, { passive: true });
    }

    /* 2 — slow autonomous bloom breathing */
    document.querySelectorAll('[data-breathe]').forEach(function (el, i) {
      g.to(el, {
        scale: 1.14,
        opacity: 0.72,
        duration: 9 + i * 1.7,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: i * 0.9
      });
    });

    /* 3 — card tilt + cursor-following edge glow */
    document.querySelectorAll('[data-tilt]').forEach(function (card) {
      const glow = card.querySelector('[data-glow]');
      const amt = parseFloat(card.getAttribute('data-tilt')) || 5;
      const rx = g.quickTo(card, 'rotationX', { duration: 0.55, ease: 'power2.out' });
      const ry = g.quickTo(card, 'rotationY', { duration: 0.55, ease: 'power2.out' });
      g.set(card, { transformPerspective: 1000, transformStyle: 'preserve-3d' });

      card.addEventListener('pointermove', function (e) {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        rx(-py * amt);
        ry(px * amt * 1.2);
        if (glow) {
          glow.style.background = 'radial-gradient(360px circle at ' + (e.clientX - r.left) +
            'px ' + (e.clientY - r.top) + 'px, rgba(167,139,250,0.18), rgba(192,38,211,0.07) 45%, transparent 72%)';
          g.to(glow, { opacity: 1, duration: 0.3, overwrite: true });
        }
      }, { passive: true });

      card.addEventListener('pointerleave', function () {
        rx(0); ry(0);
        if (glow) g.to(glow, { opacity: 0, duration: 0.5, overwrite: true });
      });
    });

    /* 4 — hero headline: word-by-word mask reveal */
    document.querySelectorAll('[data-mask]').forEach(function (el) {
      const words = el.textContent.split(/(\s+)/);
      el.textContent = '';
      const inners = [];
      words.forEach(function (w) {
        if (!w.trim()) { el.appendChild(document.createTextNode(w)); return; }
        const clip = document.createElement('span');
        clip.style.cssText = 'display:inline-block; overflow:hidden; vertical-align:bottom; padding-bottom:0.08em;';
        const inner = document.createElement('span');
        inner.style.cssText = 'display:inline-block;';
        inner.textContent = w;
        clip.appendChild(inner);
        el.appendChild(clip);
        inners.push(inner);
      });
      g.from(inners, {
        yPercent: 115,
        opacity: 0,
        duration: 1.05,
        ease: 'expo.out',
        stagger: 0.045,
        delay: 0.1
      });
    });

    glassButtons(g);
    isoMarquee(g);

    /* 5 — soft rise-in for hero support copy */
    document.querySelectorAll('[data-rise]').forEach(function (el, i) {
      g.from(el, { y: 18, opacity: 0, duration: 0.9, ease: 'power3.out', delay: 0.35 + i * 0.09 });
    });

    /* 6 — staggered bento / grid reveal on scroll */
    if (window.ScrollTrigger) {
      window.ScrollTrigger.batch('[data-reveal]', {
        start: 'top 92%',
        once: true,
        batchMax: 8,
        onEnter: function (batch) {
          g.from(batch, { y: 34, opacity: 0, duration: 0.85, ease: 'power3.out', stagger: 0.07 });
        }
      });

      /* 7b — hero stage lifts away on scroll */
      const stage = document.querySelector('[data-iso]');
      const plane = stage && stage.querySelector('[data-iso-plane]');
      if (plane) {
        g.to(plane, {
          y: -90,
          opacity: 0.35,
          ease: 'none',
          scrollTrigger: { trigger: stage, start: 'top top', end: 'bottom top', scrub: true }
        });
      }

      /* 7 — pattern parallax */
      document.querySelectorAll('[data-parallax]').forEach(function (el) {
        const d = parseFloat(el.getAttribute('data-parallax')) || 40;
        g.to(el, {
          y: d,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true }
        });
      });
    }
  }

  /* 8 — glass buttons: magnetic pull, cursor glow, shine sweep */
  function glassButtons(g) {
    document.querySelectorAll('[data-glass-btn]').forEach(function (btn) {
      const glow = btn.querySelector('[data-btn-glow]');
      const shine = btn.querySelector('[data-btn-shine]');
      const label = btn.querySelector('[data-btn-label]');
      const pull = parseFloat(btn.getAttribute('data-glass-btn')) || 6;

      g.set(btn, { transformPerspective: 700 });
      const qx = g.quickTo(btn, 'x', { duration: 0.5, ease: 'power3.out' });
      const qy = g.quickTo(btn, 'y', { duration: 0.5, ease: 'power3.out' });
      const lx = label && g.quickTo(label, 'x', { duration: 0.6, ease: 'power3.out' });
      const ly = label && g.quickTo(label, 'y', { duration: 0.6, ease: 'power3.out' });

      btn.addEventListener('pointerenter', function () {
        g.to(btn, { scale: 1.035, duration: 0.35, ease: 'power3.out', overwrite: 'auto' });
        if (glow) g.to(glow, { opacity: 1, duration: 0.35, overwrite: 'auto' });
        if (shine) {
          g.fromTo(shine,
            { xPercent: -140, opacity: 0 },
            { xPercent: 160, opacity: 1, duration: 0.85, ease: 'power2.inOut', overwrite: true,
              onComplete: function () { g.set(shine, { opacity: 0 }); } });
        }
      });

      btn.addEventListener('pointermove', function (e) {
        const r = btn.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        qx(px * pull * 2); qy(py * pull);
        if (lx) { lx(px * pull * 0.7); ly(py * pull * 0.5); }
        if (glow) {
          glow.style.background = 'radial-gradient(160px circle at ' + (e.clientX - r.left) +
            'px ' + (e.clientY - r.top) + 'px, rgba(255,255,255,0.30), rgba(167,139,250,0.22) 40%, transparent 72%)';
        }
      }, { passive: true });

      btn.addEventListener('pointerleave', function () {
        g.to(btn, { scale: 1, duration: 0.55, ease: 'elastic.out(1,0.55)', overwrite: 'auto' });
        qx(0); qy(0);
        if (lx) { lx(0); ly(0); }
        if (glow) g.to(glow, { opacity: 0, duration: 0.45, overwrite: 'auto' });
      });

      btn.addEventListener('pointerdown', function () {
        g.to(btn, { scale: 0.965, duration: 0.12, ease: 'power2.out', overwrite: 'auto' });
      });
      btn.addEventListener('pointerup', function () {
        g.to(btn, { scale: 1.035, duration: 0.3, ease: 'back.out(2.4)', overwrite: 'auto' });
      });
    });
  }

  /* 9 — isometric hero marquee: infinite drift, velocity-driven speed, tile pop */
  function isoMarquee(g) {
    const stage = document.querySelector('[data-iso]');
    if (!stage) return;
    const rows = Array.from(stage.querySelectorAll('[data-iso-row]'));
    const tweens = rows.map(function (row, i) {
      const dir = i % 2 === 0 ? -1 : 1;
      const half = row.scrollWidth / 2 || 1200;
      g.set(row, { x: dir < 0 ? 0 : -half });
      return g.to(row, { x: dir < 0 ? -half : 0, duration: 34 + i * 7, ease: 'none', repeat: -1 });
    });

    let last = 0;
    stage.addEventListener('pointermove', function (e) {
      const v = Math.min(3.2, Math.abs(e.clientX - last) / 9 + 1);
      last = e.clientX;
      tweens.forEach(function (t) { g.to(t, { timeScale: v, duration: 0.5, overwrite: true }); });
    }, { passive: true });
    stage.addEventListener('pointerleave', function () {
      tweens.forEach(function (t) { g.to(t, { timeScale: 1, duration: 0.9, overwrite: true }); });
    });

    stage.querySelectorAll('[data-iso-card]').forEach(function (card) {
      card.addEventListener('pointerenter', function () {
        g.to(card, { scale: 1.12, z: 70, duration: 0.4, ease: 'power3.out', overwrite: 'auto' });
      });
      card.addEventListener('pointerleave', function () {
        g.to(card, { scale: 1, z: 0, duration: 0.6, ease: 'power3.out', overwrite: 'auto' });
      });
    });

    g.from(rows, { opacity: 0, duration: 1.2, ease: 'power2.out', stagger: 0.12 });
  }

  window.V4Motion = { init: init };
})();
