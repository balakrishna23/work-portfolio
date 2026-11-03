/* Cutsway brand helpers shared by the awwwards prototypes.
   - injects the logo sprite (#cw-bar = the sliced bar, #cw-logo = bar + wordmark) in the ember colourway
   - Cutsway.JOBS: sample turnaround per deliverable (to confirm with the client)
   - Cutsway.due(hours): readable due time from now
   - [data-rise] elements rise in once when they enter (content stays visible without script) */
(function () {
  const SPEC = ['#d4940f', '#f5bf1e', '#ffdc3c', '#ffcf33', '#ffb02a', '#ff8a22', '#ff6420', '#ff3d2c', '#f81f3a', '#ee1240'];
  const SLICE = ['#f0163a', '#d41436', '#b51231', '#96112c', '#7a1027', '#641023', '#551321', '#4b1520', '#44171f'];
  const stops = SPEC.map((c, i) => `<stop offset="${i / (SPEC.length - 1)}" stop-color="${c}"/>`).join('');
  const slices = SLICE.map((c, i) => `<rect x="${276 + i * 13}" y="0" width="7" height="100" fill="${c}"/>`).join('');
  const sprite = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
    <linearGradient id="cw-spec" x1="0" x2="1" y1="0" y2="0">${stops}</linearGradient>
    <clipPath id="cw-clip"><polygon points="4,58 396,19 396,53 4,92"/></clipPath>
    <symbol id="cw-bar" viewBox="0 15 400 80"><g clip-path="url(#cw-clip)"><rect x="4" y="0" width="266" height="100" fill="url(#cw-spec)"/>${slices}</g></symbol>
    <symbol id="cw-logo" viewBox="0 0 400 166"><g clip-path="url(#cw-clip)"><rect x="4" y="0" width="266" height="100" fill="url(#cw-spec)"/>${slices}</g>
      <text x="0" y="146" font-family="Archivo, sans-serif" font-weight="900" font-stretch="125%" font-size="74" letter-spacing="-3" fill="currentColor">cutsway</text></symbol>
  </defs></svg>`;
  document.body.insertAdjacentHTML('afterbegin', sprite);

  const JOBS = {
    thumb: { label: 'Thumbnail', hours: 8, out: '3 options, one final' },
    shorts: { label: 'Shorts pack', hours: 24, out: '10 vertical clips, captioned' },
    video: { label: 'Gaming video', hours: 48, out: 'one 12 to 25 minute edit' },
    podcast: { label: 'Podcast episode', hours: 72, out: 'full episode and 6 clips' },
    stream: { label: 'Stream VOD', hours: 48, out: 'highlight video and shorts' }
  };
  function due(hours, from) {
    const d = new Date((from || Date.now()) + hours * 3600e3);
    const day = d.toLocaleDateString(undefined, { weekday: 'long' });
    const time = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
    return { date: d, day, time, text: `${day}, ${time}` };
  }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function rise(root) {
    const els = (root || document).querySelectorAll('[data-rise]');
    if (reduce || !('IntersectionObserver' in window)) return;
    els.forEach(el => el.classList.add('rise-wait'));
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      const kids = e.target.matches('[data-rise="kids"]') ? [...e.target.children] : [e.target];
      kids.forEach((k, i) => { k.style.transitionDelay = (i * 70) + 'ms'; });
      e.target.classList.add('rise-in'); io.unobserve(e.target);
    }), { rootMargin: '0px 0px -12% 0px' });
    els.forEach(el => io.observe(el));
  }
  const css = document.createElement('style');
  css.textContent = `.rise-wait:not([data-rise="kids"]),.rise-wait[data-rise="kids"]>*{opacity:0;transform:translateY(24px);transition:opacity .7s cubic-bezier(.16,1,.3,1),transform .9s cubic-bezier(.16,1,.3,1)}
  .rise-in:not([data-rise="kids"]),.rise-in[data-rise="kids"]>*{opacity:1;transform:none}`;
  document.head.appendChild(css);
  document.addEventListener('DOMContentLoaded', () => rise());
  window.Cutsway = { SPEC, SLICE, JOBS, due, reduce, rise };
})();
