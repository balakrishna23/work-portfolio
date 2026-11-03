// Cutsway prototypes: shared page behaviour (classic script, load after the markup).
// Exposes window.CUT (turnaround), window.lenis (smooth scroll) and window.chapterPos().
(function () {
  document.documentElement.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // text arrives with its chapter
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -12% 0px' });
  document.querySelectorAll('.rise').forEach(el => io.observe(el));
  // the last lines of the page can never cross the trigger line, so reaching the end reveals whatever is left
  addEventListener('scroll', () => { if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) document.querySelectorAll('.rise:not(.in)').forEach(el => el.classList.add('in')); }, { passive: true });
  // corner readouts (the night clock, the clip counter) step aside when the footer's last row is on screen
  const endRow = document.querySelector('.foot__row');
  if (endRow) new IntersectionObserver(es => document.documentElement.classList.toggle('at-end', es[0].isIntersecting)).observe(endRow);

  // export intro: under a second, and it covers the 3D world's warm-up (shaders, textures) so the first frame you see is smooth;
  // it holds at 90% for a ready world, but never longer than CAP
  const ex = document.getElementById('export');
  if (ex) {
    const fill = document.getElementById('export-fill'), pct = document.getElementById('export-pct');
    if (reduce) ex.classList.add('done');
    else {
      const t0 = performance.now(), dur = 700, CAP = 2600, root = document.documentElement, hasWorld = !!document.getElementById('world');
      let shown = 0;
      (function tick(now) {
        const ready = !hasWorld || root.classList.contains('world-ready') || root.classList.contains('no-webgl') || now - t0 > CAP;
        const p = Math.min(1, (now - t0) / dur), e = (1 - Math.pow(1 - p, 2)) * (ready ? 1 : 0.9);
        shown = Math.max(shown, shown + (e - shown) * 0.35);
        fill.style.setProperty('--p', shown); pct.textContent = String(Math.round(shown * 100)).padStart(3, '0') + '%';
        if (ready && shown > 0.995) setTimeout(() => ex.classList.add('done'), 120); else requestAnimationFrame(tick);
      })(t0);
    }
  }

  // launch settings (shared/site-config.js); the fallbacks keep older pages working without it
  const SITE = window.CUTSWAY || {};
  // on data saver, or without WebGL, the pages show their poster instead of a live world
  if (navigator.connection && navigator.connection.saveData) document.documentElement.classList.add('lite', 'no-webgl');

  // links that depend on the settings: email, WhatsApp, socials, the year ("Book a call" opens the enquiry sheet, shared/ui.js)
  document.querySelectorAll('[data-email]').forEach(a => { if (SITE.email) { a.href = `mailto:${SITE.email}`; a.textContent = SITE.email; } });
  const wa = SITE.whatsapp && `https://wa.me/${SITE.whatsapp}${SITE.whatsappText ? `?text=${encodeURIComponent(SITE.whatsappText)}` : ''}`;
  document.querySelectorAll('[data-whatsapp]').forEach(a => { if (wa) { a.href = wa; a.target = '_blank'; a.rel = 'noopener'; } else a.hidden = true; });
  document.querySelectorAll('[data-social]').forEach(a => {
    const url = SITE.socials && SITE.socials[a.dataset.social];
    if (url) { a.href = url; a.target = '_blank'; a.rel = 'noopener'; } else a.hidden = true;
  });
  document.querySelectorAll('.foot__grid nav').forEach(nav => { if (![...nav.children].some(a => !a.hidden)) nav.parentElement.hidden = true; });   // no profiles yet: no empty column
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  // turnaround: the promises come from the settings
  window.CUT = { due: new Date(Date.now() + 36 * 36e5), hours: 36, listeners: [] };
  const F = SITE.turnaround || {
    thumb:   [['Brief in', 0], ['Three concepts', 3], ['Final art', 8]],
    shorts:  [['VOD in', 0], ['Cut + captions', 16], ['Delivered', 24]],
    video:   [['Raw in', 0], ['Rough cut', 20], ['Your notes', 28], ['Delivered', 48]],
    podcast: [['Recording in', 0], ['Episode cut', 30], ['Your notes', 40], ['Delivered', 72]],
  };
  const when = h => new Date(Date.now() + h * 36e5).toLocaleString(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: true });
  function show(k) {
    const s = F[k], last = s[s.length - 1][1], due = document.getElementById('due'), splits = document.getElementById('splits');
    if (due) due.textContent = when(last).toLowerCase();
    if (splits) splits.innerHTML = s.map(([n, h]) => `<li><span>${n}</span><span>${String(h).padStart(2, '0')}:00</span><span>${when(h)}</span></li>`).join('');
    document.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', c.dataset.f === k));
    CUT.due = new Date(Date.now() + last * 36e5); CUT.hours = last; CUT.format = k;
    CUT.listeners.forEach(fn => fn(CUT.due, k));
  }
  document.querySelectorAll('.chip').forEach(c => c.addEventListener('click', () => show(c.dataset.f)));
  show('video');

  // smooth scrolling; the world's render loop drives it (lenis.raf)
  window.lenis = !reduce && window.Lenis ? new window.Lenis({ lerp: 0.085, smoothWheel: true, autoRaf: false }) : null;
  if (!window.lenis) document.documentElement.classList.add('no-lenis');
  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href'); if (!id.startsWith('#') || id.length < 2) return;
    const el = id === '#top' ? 0 : document.querySelector(id);
    if (window.lenis && el !== null) { e.preventDefault(); window.lenis.scrollTo(el, { duration: 1.6 }); }
  }));
  // pages without a 3D world still need lenis ticking
  window.tickLenis = now => { if (window.lenis) window.lenis.raf(now); };

  // scroll position measured in chapters: 0 at the first chapter's centre, 1 at the second's, and so on
  const chapters = () => [...document.querySelectorAll('[data-scene]')];
  let centers = [];
  const measure = () => { centers = chapters().map(c => { const r = c.getBoundingClientRect(); return r.top + scrollY + r.height / 2; }); };
  measure(); addEventListener('resize', measure); new ResizeObserver(measure).observe(document.body);
  window.chapterPos = function () {
    const y = scrollY + innerHeight / 2;
    if (!centers.length || y <= centers[0]) return 0;
    for (let i = 0; i < centers.length - 1; i++) if (y < centers[i + 1]) return i + (y - centers[i]) / (centers[i + 1] - centers[i]);
    return centers.length - 1;
  };
  window.chapterCount = () => centers.length;
  // ?at=N opens the page on chapter N, or between chapters for a fraction (for reviews and screenshots)
  const at = parseFloat(new URLSearchParams(location.search).get('at'));
  if (!isNaN(at) && centers.length) {
    const i = Math.min(centers.length - 1, Math.floor(at)), j = Math.min(centers.length - 1, i + 1);
    scrollTo(0, centers[i] + (centers[j] - centers[i]) * (at - Math.floor(at)) - innerHeight / 2);
  }
})();
