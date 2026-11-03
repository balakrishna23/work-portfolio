/* Cutsway sample footage: flat, drawn stills of the kinds of videos Cutsway edits.
   CutFrames.draw(ctx, w, h, kind, seed, t)  kinds: fps race platform podcast boss chat map menu
   Everything is flat colour; t (seconds) animates the frame when you redraw it. */
(function () {
  const P = {
    night: '#0d0907', ink: '#1c120d', paper: '#f6efe4', gold: '#ffc72e', amber: '#ffb02a',
    orange: '#ff8a22', ember: '#ff6420', red: '#f0163a', wine: '#7a1027', maroon: '#44171f',
    sky: '#2b3a4a', teal: '#1f6f74', grass: '#3f7d3a', stone: '#6b5d52', sand: '#c9a77a'
  };
  function rng(seed) { let s = (seed * 9301 + 49297) % 233280 || 1; return () => (s = (s * 9301 + 49297) % 233280) / 233280; }
  function rect(c, x, y, w, h, f) { c.fillStyle = f; c.fillRect(x, y, w, h); }
  function poly(c, pts, f) { c.fillStyle = f; c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.closePath(); c.fill(); }
  function circ(c, x, y, r, f) { c.fillStyle = f; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); }

  const K = {
    fps(c, w, h, r, t) {
      rect(c, 0, 0, w, h, P.maroon);
      const vx = w * (0.5 + Math.sin(t * 0.7) * 0.04), vy = h * 0.46;
      poly(c, [0, 0, w, 0, vx + w * 0.08, vy - h * 0.1, vx - w * 0.08, vy - h * 0.1], '#2a1512');
      poly(c, [0, h, w, h, vx + w * 0.08, vy + h * 0.1, vx - w * 0.08, vy + h * 0.1], '#5a2a1c');
      poly(c, [0, 0, vx - w * 0.08, vy - h * 0.1, vx - w * 0.08, vy + h * 0.1, 0, h], '#3a1a14');
      poly(c, [w, 0, vx + w * 0.08, vy - h * 0.1, vx + w * 0.08, vy + h * 0.1, w, h], '#331712');
      rect(c, vx - w * 0.08, vy - h * 0.1, w * 0.16, h * 0.2, P.ember);
      for (let i = 0; i < 4; i++) rect(c, w * (0.1 + i * 0.05), h * (0.25 + i * 0.03), w * 0.012, h * (0.5 - i * 0.06), i % 2 ? P.gold : P.orange);
      const ex = vx + Math.sin(t * 1.3 + r() * 6) * w * 0.05;
      rect(c, ex - w * 0.012, vy - h * 0.04, w * 0.024, h * 0.08, P.night); circ(c, ex, vy - h * 0.055, w * 0.012, P.night);
      poly(c, [w * 0.62, h, w * 0.7, h * 0.66, w * 0.82, h * 0.62, w * 0.88, h], '#120b08');
      rect(c, w * 0.69, h * 0.64, w * 0.1, h * 0.04, P.stone);
      c.strokeStyle = P.paper; c.lineWidth = Math.max(1, w / 260);
      c.beginPath(); c.moveTo(w / 2 - w * 0.02, h / 2); c.lineTo(w / 2 + w * 0.02, h / 2); c.moveTo(w / 2, h / 2 - w * 0.02); c.lineTo(w / 2, h / 2 + w * 0.02); c.stroke();
      rect(c, w * 0.04, h * 0.88, w * 0.2, h * 0.035, P.ink); rect(c, w * 0.04, h * 0.88, w * 0.2 * (0.35 + 0.3 * Math.abs(Math.sin(t * 0.3))), h * 0.035, P.red);
    },
    race(c, w, h, r, t) {
      rect(c, 0, 0, w, h * 0.45, P.amber); circ(c, w * 0.72, h * 0.32, h * 0.13, P.paper);
      for (let i = 0; i < 6; i++) poly(c, [w * (i / 5 - 0.2), h * 0.45, w * (i / 5), h * (0.22 + r() * 0.12), w * (i / 5 + 0.22), h * 0.45], i % 2 ? P.ember : P.orange);
      rect(c, 0, h * 0.45, w, h * 0.55, P.wine);
      poly(c, [w * 0.47, h * 0.45, w * 0.53, h * 0.45, w * 1.1, h, -w * 0.1, h], P.ink);
      const s = (t * 3) % 1;
      for (let i = 0; i < 6; i++) { const k = (i / 6 + s / 6); const y = h * 0.45 + Math.pow(k, 2) * h * 0.55; const ww = w * 0.01 + k * w * 0.03; rect(c, w / 2 - ww / 2, y, ww, h * 0.01 + k * h * 0.05, P.paper); }
      for (let i = 0; i < 5; i++) { const k = ((i / 5) + s / 5); poly(c, [w * 0.47 - k * w * 0.6, h * 0.45 + k * k * h * 0.55, w * 0.47 - k * w * 0.5, h * 0.45 + k * k * h * 0.55, w * 0.47 - k * w * 0.52, h * 0.45 + k * k * h * 0.55 + k * h * 0.06], i % 2 ? P.red : P.paper); }
      const cx = w * (0.5 + Math.sin(t * 1.1) * 0.06);
      poly(c, [cx - w * 0.14, h * 0.92, cx + w * 0.14, h * 0.92, cx + w * 0.11, h * 0.74, cx - w * 0.11, h * 0.74], P.red);
      rect(c, cx - w * 0.07, h * 0.68, w * 0.14, h * 0.08, P.night); rect(c, cx - w * 0.16, h * 0.86, w * 0.05, h * 0.09, P.night); rect(c, cx + w * 0.11, h * 0.86, w * 0.05, h * 0.09, P.night);
      rect(c, cx - w * 0.1, h * 0.78, w * 0.04, h * 0.025, P.gold); rect(c, cx + w * 0.06, h * 0.78, w * 0.04, h * 0.025, P.gold);
    },
    platform(c, w, h, r, t) {
      rect(c, 0, 0, w, h, P.teal);
      for (let i = 0; i < 4; i++) { const x = ((r() * w - t * w * 0.03) % w + w) % w; circ(c, x, h * (0.12 + r() * 0.2), h * 0.06, '#d9e4dc'); circ(c, x + h * 0.07, h * (0.14 + r() * 0.1), h * 0.08, '#d9e4dc'); }
      for (let i = 0; i < 7; i++) { const bx = i * w / 6 - ((t * w * 0.08) % (w / 6)); poly(c, [bx, h * 0.8, bx + w / 12, h * (0.45 + (i % 3) * 0.07), bx + w / 6, h * 0.8], '#17504f'); }
      rect(c, 0, h * 0.8, w, h * 0.2, P.grass); rect(c, 0, h * 0.84, w, h * 0.16, P.stone);
      const bw = w / 16;
      for (let i = 0; i < 4; i++) rect(c, w * 0.42 + i * bw, h * 0.42, bw - 2, bw - 2, i === 1 ? P.gold : P.orange);
      rect(c, w * 0.75, h * 0.56, w * 0.07, h * 0.24, '#1d8a4a'); rect(c, w * 0.735, h * 0.52, w * 0.1, h * 0.06, '#26a35a');
      const jy = Math.abs(Math.sin(t * 2.2)) * h * 0.18;
      rect(c, w * 0.22, h * 0.68 - jy, w * 0.045, h * 0.12, P.red); rect(c, w * 0.215, h * 0.64 - jy, w * 0.055, h * 0.05, P.red); rect(c, w * 0.235, h * 0.66 - jy, w * 0.02, h * 0.02, P.paper);
      for (let i = 0; i < 3; i++) circ(c, w * (0.5 + i * 0.05), h * 0.3, w * 0.012, P.gold);
    },
    podcast(c, w, h, r, t) {
      rect(c, 0, 0, w, h, P.ink); rect(c, 0, 0, w / 2 - 1, h, '#24150f');
      rect(c, w * 0.08, h * 0.12, w * 0.12, h * 0.36, P.wine); rect(c, w * 0.62, h * 0.1, w * 0.3, h * 0.05, P.gold);
      for (let i = 0; i < 6; i++) rect(c, w * (0.63 + i * 0.045), h * 0.17, w * 0.03, h * 0.18 + (i % 3) * h * 0.04, [P.red, P.amber, P.orange, P.paper, P.ember, P.wine][i]);
      const head = (x, f, talk) => {
        rect(c, x - w * 0.13, h * 0.7, w * 0.26, h * 0.3, f);
        circ(c, x, h * 0.5, h * 0.15, P.sand);
        rect(c, x - h * 0.16, h * 0.34, h * 0.32, h * 0.08, P.night);
        rect(c, x - h * 0.17, h * 0.42, h * 0.05, h * 0.1, P.night); rect(c, x + h * 0.12, h * 0.42, h * 0.05, h * 0.1, P.night);
        const m = talk ? h * (0.01 + Math.abs(Math.sin(t * 9)) * 0.03) : h * 0.008; rect(c, x - h * 0.04, h * 0.58, h * 0.08, m, P.wine);
      };
      head(w * 0.27, P.red, Math.sin(t * 0.8) > 0); head(w * 0.73, P.orange, Math.sin(t * 0.8) <= 0);
      for (const x of [0.4, 0.6]) { rect(c, w * x - w * 0.006, h * 0.66, w * 0.012, h * 0.34, P.stone); rect(c, w * x - w * 0.025, h * 0.55, w * 0.05, h * 0.13, '#2f2f2f'); }
    },
    boss(c, w, h, r, t) {
      rect(c, 0, 0, w, h, P.night);
      for (let i = 0; i < 9; i++) rect(c, (i / 9) * w, h * (0.15 + (i % 3) * 0.05), w / 9 - 3, h, i % 2 ? '#1a0f0b' : '#150c09');
      const s = 1 + Math.sin(t * 1.6) * 0.03;
      poly(c, [w * 0.5, h * 0.1 * s, w * 0.78, h * 0.42, w * 0.7, h * 0.86, w * 0.3, h * 0.86, w * 0.22, h * 0.42], P.wine);
      poly(c, [w * 0.36, h * 0.18, w * 0.3, h * 0.02, w * 0.42, h * 0.22], P.gold); poly(c, [w * 0.64, h * 0.18, w * 0.7, h * 0.02, w * 0.58, h * 0.22], P.gold);
      rect(c, w * 0.39, h * 0.4, w * 0.07, h * 0.05, P.gold); rect(c, w * 0.54, h * 0.4, w * 0.07, h * 0.05, P.gold);
      poly(c, [w * 0.4, h * 0.62, w * 0.6, h * 0.62, w * 0.56, h * 0.7, w * 0.44, h * 0.7], P.red);
      rect(c, w * 0.18, h * 0.06, w * 0.64, h * 0.04, P.ink); rect(c, w * 0.18, h * 0.06, w * 0.64 * (0.6 + 0.2 * Math.sin(t * 0.4)), h * 0.04, P.red);
      rect(c, w * 0.12, h * 0.8, w * 0.05, h * 0.1, P.paper); rect(c, w * 0.115, h * 0.76, w * 0.06, h * 0.05, P.paper);
      for (let i = 0; i < 5; i++) { const k = (t * 0.8 + i / 5) % 1; circ(c, w * (0.2 + k * 0.25), h * (0.8 - k * 0.3), w * 0.012, P.gold); }
    },
    chat(c, w, h, r, t) {
      K.fps(c, w, h, r, t);
      rect(c, w * 0.68, 0, w * 0.32, h, 'rgba(13,9,7,0.86)');
      const cols = [P.gold, P.red, P.orange, P.paper, P.amber];
      const off = Math.floor(t * 2);
      for (let i = 0; i < 9; i++) { const rr = rng(i + off); const y = h * (0.08 + i * 0.1); rect(c, w * 0.7, y, w * 0.05, h * 0.03, cols[(i + off) % 5]); rect(c, w * 0.76, y, w * (0.08 + rr() * 0.14), h * 0.03, '#6b5d52'); }
      rect(c, w * 0.02, h * 0.04, w * 0.08, h * 0.05, P.red); rect(c, w * 0.11, h * 0.04, w * 0.1, h * 0.05, 'rgba(13,9,7,0.7)');
      rect(c, w * 0.02, h * 0.68, w * 0.18, h * 0.28, P.night); circ(c, w * 0.11, h * 0.8, h * 0.07, P.sand); rect(c, w * 0.06, h * 0.86, w * 0.1, h * 0.1, P.orange);
    },
    map(c, w, h, r, t) {
      rect(c, 0, 0, w, h, '#2e4a3c');
      for (let i = 0; i < 14; i++) circ(c, r() * w, r() * h, h * (0.04 + r() * 0.1), i % 3 ? '#3b5e48' : '#25402f');
      c.strokeStyle = P.sand; c.lineWidth = h * 0.035; c.beginPath(); c.moveTo(0, h * 0.7); c.bezierCurveTo(w * 0.3, h * 0.4, w * 0.6, h * 0.95, w, h * 0.3); c.stroke();
      rect(c, w * 0.6, h * 0.12, w * 0.3, h * 0.22, '#5d6f80');
      const k = (t * 0.15) % 1; circ(c, w * k, h * (0.7 - Math.sin(k * Math.PI) * 0.2), h * 0.03, P.red);
      for (let i = 0; i < 3; i++) poly(c, [w * (0.2 + i * 0.25), h * 0.2, w * (0.23 + i * 0.25), h * 0.12, w * (0.26 + i * 0.25), h * 0.2], P.gold);
      rect(c, w * 0.03, h * 0.04, w * 0.22, h * 0.22, P.night); rect(c, w * 0.04, h * 0.06, w * 0.2, h * 0.18, '#3b5e48'); circ(c, w * (0.08 + k * 0.12), h * 0.14, h * 0.015, P.red);
    },
    menu(c, w, h, r, t) {
      rect(c, 0, 0, w, h, P.wine);
      for (let i = 0; i < 12; i++) rect(c, 0, (i / 12) * h, w, h / 24, i % 2 ? '#6a0e22' : P.wine);
      rect(c, w * 0.08, h * 0.16, w * 0.5, h * 0.14, P.gold);
      const sel = Math.floor(t * 0.8) % 4;
      for (let i = 0; i < 4; i++) rect(c, w * 0.08, h * (0.42 + i * 0.12), w * (0.26 - i * 0.03), h * 0.07, i === sel ? P.paper : '#c79a7f');
      rect(c, w * 0.04, h * (0.42 + sel * 0.12), w * 0.025, h * 0.07, P.gold);
      poly(c, [w * 0.62, h, w * 0.7, h * 0.38, w * 0.86, h * 0.32, w * 0.95, h * 0.5, w * 0.92, h], P.night);
      circ(c, w * 0.79, h * 0.28, h * 0.11, P.night); rect(c, w * 0.73, h * 0.26, w * 0.1, h * 0.03, P.red);
    }
  };
  const KINDS = Object.keys(K);
  function draw(ctx, w, h, kind, seed, t) { (K[kind] || K.fps)(ctx, w, h, rng(seed || 1), t || 0); }
  window.CutFrames = { draw, KINDS, P };
})();
