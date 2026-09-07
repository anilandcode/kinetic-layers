/* Hero Lab — glass button rig + three interactive hero engines. All additive. */
(function () {
  const g = () => window.gsap;

  /* ---------- Glass glow button ---------- */
  function glassButtons() {
    document.querySelectorAll('[data-glass-btn]').forEach(function (btn) {
      const G = g();
      const glow = btn.querySelector('[data-btn-glow]');
      const shine = btn.querySelector('[data-btn-shine]');
      const label = btn.querySelector('[data-btn-label]');
      const pull = parseFloat(btn.getAttribute('data-glass-btn')) || 6;

      let qx, qy, lx, ly;
      if (G) {
        G.set(btn, { transformPerspective: 700 });
        qx = G.quickTo(btn, 'x', { duration: 0.5, ease: 'power3.out' });
        qy = G.quickTo(btn, 'y', { duration: 0.5, ease: 'power3.out' });
        if (label) {
          lx = G.quickTo(label, 'x', { duration: 0.6, ease: 'power3.out' });
          ly = G.quickTo(label, 'y', { duration: 0.6, ease: 'power3.out' });
        }
      }

      btn.addEventListener('pointerenter', function () {
        if (!G) return;
        G.to(btn, { scale: 1.035, duration: 0.35, ease: 'power3.out', overwrite: 'auto' });
        if (glow) G.to(glow, { opacity: 1, duration: 0.35, overwrite: 'auto' });
        if (shine) {
          G.fromTo(shine,
            { xPercent: -140, opacity: 0 },
            { xPercent: 160, opacity: 1, duration: 0.85, ease: 'power2.inOut', overwrite: true,
              onComplete: function () { G.set(shine, { opacity: 0 }); } });
        }
      });

      btn.addEventListener('pointermove', function (e) {
        const r = btn.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        if (qx) { qx(px * pull * 2); qy(py * pull); }
        if (lx) { lx(px * pull * 0.7); ly(py * pull * 0.5); }
        if (glow) {
          glow.style.background = 'radial-gradient(160px circle at ' + (e.clientX - r.left) +
            'px ' + (e.clientY - r.top) + 'px, rgba(255,255,255,0.30), rgba(167,139,250,0.22) 40%, transparent 72%)';
        }
      }, { passive: true });

      btn.addEventListener('pointerleave', function () {
        if (!g()) return;
        const G2 = g();
        G2.to(btn, { scale: 1, duration: 0.55, ease: 'elastic.out(1,0.55)', overwrite: 'auto' });
        if (qx) { qx(0); qy(0); }
        if (lx) { lx(0); ly(0); }
        if (glow) G2.to(glow, { opacity: 0, duration: 0.45, overwrite: 'auto' });
      });

      btn.addEventListener('pointerdown', function () {
        if (g()) g().to(btn, { scale: 0.965, duration: 0.12, ease: 'power2.out', overwrite: 'auto' });
      });
      btn.addEventListener('pointerup', function () {
        if (g()) g().to(btn, { scale: 1.035, duration: 0.3, ease: 'back.out(2.4)', overwrite: 'auto' });
      });
    });
  }

  /* ---------- A — magnetic tile field ---------- */
  function magneticField() {
    const G = g();
    const field = document.querySelector('[data-field]');
    if (!field || !G) return;
    const tiles = Array.from(field.querySelectorAll('[data-tile]'));
    const R = 260;

    /* one tween per tile: scale + y + opacity together, so nothing stomps the
       shared transform cache */
    function drive(el, k) {
      G.to(el, {
        scale: 1 + k * 0.7,
        y: -k * 16,
        opacity: 0.22 + k * 0.78,
        duration: 0.7,
        ease: 'power3.out',
        overwrite: 'auto'
      });
    }

    field.addEventListener('pointermove', function (e) {
      tiles.forEach(function (el) {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        const d = Math.sqrt(dx * dx + dy * dy);
        drive(el, Math.max(0, 1 - d / R));
      });
    }, { passive: true });

    field.addEventListener('pointerleave', function () {
      tiles.forEach(function (el) { drive(el, 0); });
    });
    G.from(tiles, { opacity: 0, scale: 0.6, duration: 1.1, ease: 'power3.out', stagger: { amount: 0.9, from: 'center' } });
  }

  /* ---------- B — spotlight headline ---------- */
  function spotlight() {
    const wrap = document.querySelector('[data-spot]');
    if (!wrap) return;
    const lit = wrap.querySelector('[data-spot-lit]');
    const orb = wrap.querySelector('[data-spot-orb]');
    let raf = null, tx = 0, ty = 0, cx = 0, cy = 0, has = false;

    function apply() {
      cx += (tx - cx) * 0.14;
      cy += (ty - cy) * 0.14;
      const m = 'radial-gradient(220px circle at ' + cx + 'px ' + cy + 'px, #000 0%, rgba(0,0,0,0.75) 46%, transparent 72%)';
      if (lit) { lit.style.webkitMaskImage = m; lit.style.maskImage = m; }
      if (orb) { orb.style.transform = 'translate3d(' + (cx - 200) + 'px,' + (cy - 200) + 'px,0)'; }
      raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.4 ? requestAnimationFrame(apply) : null;
    }

    wrap.addEventListener('pointermove', function (e) {
      const r = wrap.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
      if (!has) { has = true; cx = tx; cy = ty; }
      if (!raf) raf = requestAnimationFrame(apply);
      if (orb) orb.style.opacity = '1';
    }, { passive: true });

    wrap.addEventListener('pointerleave', function () {
      const r = wrap.getBoundingClientRect();
      tx = r.width * 0.5; ty = r.height * 0.42;
      if (orb) orb.style.opacity = '0.55';
    });

    const r0 = wrap.getBoundingClientRect();
    tx = cx = r0.width * 0.5; ty = cy = r0.height * 0.42;
    apply();
  }

  /* ---------- C — isometric marquee ---------- */
  function isoMarquee() {
    const G = g();
    const stage = document.querySelector('[data-iso]');
    if (!stage || !G) return;
    const rows = Array.from(stage.querySelectorAll('[data-iso-row]'));
    const tweens = rows.map(function (row, i) {
      const dir = i % 2 === 0 ? -1 : 1;
      const half = row.scrollWidth / 2 || 1200;
      G.set(row, { x: dir < 0 ? 0 : -half });
      return G.to(row, {
        x: dir < 0 ? -half : 0,
        duration: 34 + i * 7,
        ease: 'none',
        repeat: -1
      });
    });

    let last = 0;
    stage.addEventListener('pointermove', function (e) {
      const v = Math.min(3.2, Math.abs(e.clientX - last) / 9 + 1);
      last = e.clientX;
      tweens.forEach(function (t) { G.to(t, { timeScale: v, duration: 0.5, overwrite: true }); });
    }, { passive: true });
    stage.addEventListener('pointerleave', function () {
      tweens.forEach(function (t) { G.to(t, { timeScale: 1, duration: 0.9, overwrite: true }); });
    });

    stage.querySelectorAll('[data-iso-card]').forEach(function (card) {
      card.addEventListener('pointerenter', function () {
        G.to(card, { scale: 1.12, z: 70, duration: 0.4, ease: 'power3.out', overwrite: 'auto' });
      });
      card.addEventListener('pointerleave', function () {
        G.to(card, { scale: 1, z: 0, duration: 0.6, ease: 'power3.out', overwrite: 'auto' });
      });
    });
  }

  let booted = false;
  function init() {
    if (booted) return;
    booted = true;
    glassButtons();
    magneticField();
    spotlight();
    isoMarquee();
  }

  window.HeroLab = { init: init };
})();
