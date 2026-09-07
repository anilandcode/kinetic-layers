// Kiln motion layer — GSAP for scroll/timeline work, Motion.dev for pointer micro-interactions.
(function () {
  const EASE = [0.22, 0.8, 0.2, 1];
  const REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let started = false;

  function waitFor(cb) {
    let n = 0;
    const t = setInterval(() => {
      if ((window.gsap && window.Motion) || ++n > 120) { clearInterval(t); if (window.gsap && window.Motion) cb(); }
    }, 50);
  }

  function overlay() {
    let el = document.getElementById('km-veil');
    if (!el) {
      el = document.createElement('div');
      el.id = 'km-veil';
      el.style.cssText = 'position:fixed; inset:0; z-index:90; background:#0B0B0A; pointer-events:none; opacity:0;';
      document.body.appendChild(el);
    }
    return el;
  }

  function init() {
    if (started) return;
    started = true;
    waitFor(() => {
      const gsap = window.gsap, M = window.Motion;
      if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);

      if (!REDUCED && ticking()) {
        const hero = document.querySelectorAll('[data-hero] > *');
        if (hero.length) gsap.fromTo(hero, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.85, ease: 'power3.out', stagger: 0.07, delay: 0.1 });
        revealScan();
        safetyNet();
        new MutationObserver(() => { revealScan(); }).observe(document.body, { childList: true, subtree: true });
      }
      morphBar();
      pointer();
      navigate();
    });
  }

  function ticking() {
    const t = window.gsap && window.gsap.ticker;
    return !!(t && t.time > 0);
  }

  function safetyNet() {
    setTimeout(() => {
      document.querySelectorAll('[data-hero] > *, [data-reveal]').forEach(el => {
        if (parseFloat(getComputedStyle(el).opacity) > 0.02) return;
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      const v = document.getElementById('km-veil');
      if (v) v.style.opacity = '0';
    }, 900);
  }

  function revealScan() {
    const gsap = window.gsap;
    if (REDUCED || !ticking()) return;
    document.querySelectorAll('[data-reveal]:not([data-revealed])').forEach((el, i) => {
      el.setAttribute('data-revealed', '1');
      gsap.fromTo(el, { y: 28, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.7, ease: 'power2.out', delay: (i % 3) * 0.07,
        scrollTrigger: window.ScrollTrigger ? { trigger: el, start: 'top 92%' } : undefined
      });
    });
  }

  function morphBar() {
    const bar = document.querySelector('[data-morph]');
    if (!bar) return;
    const inner = bar.firstElementChild;
    let compact = null;
    const onScroll = () => {
      const next = window.scrollY > 220;
      if (next === compact) return;
      compact = next;
      window.Motion.animate(inner, { paddingTop: next ? '8px' : '14px', paddingBottom: next ? '8px' : '14px' }, { duration: 0.35, easing: [0.22, 0.8, 0.2, 1] });
      const bg = bar.getAttribute(next ? 'data-bg-compact' : 'data-bg');
      if (bg) bar.style.background = bg;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function pointer() {
    const M = window.Motion;
    document.addEventListener('mouseover', e => {
      const card = e.target.closest && e.target.closest('[data-card]');
      if (!card) return;
      const p = card.querySelector('[data-preview-inner]'), meta = card.querySelector('[data-meta]');
      if (p) M.animate(p, { scale: 1.045 }, { duration: 0.5, easing: [0.22, 0.8, 0.2, 1] });
      if (meta) M.animate(meta, { opacity: [null, 1], y: [null, 0] }, { duration: 0.35, easing: [0.22, 0.8, 0.2, 1] });
    });
    document.addEventListener('mouseout', e => {
      const card = e.target.closest && e.target.closest('[data-card]');
      if (!card || (e.relatedTarget && card.contains(e.relatedTarget))) return;
      const p = card.querySelector('[data-preview-inner]');
      if (p) M.animate(p, { scale: 1 }, { duration: 0.5, easing: [0.22, 0.8, 0.2, 1] });
    });
  }

  function navigate() {
    document.addEventListener('click', e => {
      const a = e.target.closest && e.target.closest('a[data-nav]');
      if (!a || !a.getAttribute('href') || a.getAttribute('href').startsWith('#')) return;
      e.preventDefault();
      const href = a.getAttribute('href');
      let navigated = false;
      const once = () => { if (!navigated) { navigated = true; location.href = href; } };
      try {
        const controls = window.Motion.animate(overlay(), { opacity: [0, 1] }, { duration: 0.32, easing: [0.4, 0, 1, 1] });
        if (controls && typeof controls.then === 'function') controls.then(once);
        else if (controls && controls.finished && typeof controls.finished.then === 'function') controls.finished.then(once);
      } catch (err) { once(); }
      setTimeout(once, 450);
    });
  }

  window.KilnMotion = { init };
})();
