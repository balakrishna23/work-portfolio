// Cutsway immersive stage: renderer + bloom + scroll chapters, shared by the five immersive prototypes.
// Chapters are the page's [data-ch] sections. state.ps is a smoothed chapter position:
// 0 when the first chapter is centred in the viewport, 1 for the second, and so on.
// ?at=2.5 opens the page at that position (used for previews and screenshots).
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export { THREE };
export const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const seg = (p, a, b) => clamp((p - a) / (b - a));
export const smooth = k => k * k * (3 - 2 * k);
export const ease = k => 1 - Math.pow(1 - k, 3);
export const lerp = (a, b, k) => a + (b - a) * k;

export function hasWebGL() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; }
}

export function createStage(opts = {}) {
  const canvas = opts.canvas;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  const mobile = () => innerWidth < 760;
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile() ? 1.5 : 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = opts.exposure ?? 1;
  if (opts.shadows) { renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(opts.fov || 45, 1, opts.near || 0.1, opts.far || 2000);
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  let bloom = null;
  if (opts.bloom) {
    bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), opts.bloom.strength ?? .8, opts.bloom.radius ?? .6, opts.bloom.threshold ?? .7);
    composer.addPass(bloom);
  }
  composer.addPass(new OutputPass());

  const chapters = [...document.querySelectorAll('[data-ch]')];
  const state = { p: 0, ps: 0, mx: 0, my: 0, px: 0, py: 0, t: 0, dt: 0, reduce, mobile: mobile(), active: -1, w: innerWidth, h: innerHeight };

  function resize() {
    const w = innerWidth, h = innerHeight;
    state.w = w; state.h = h; state.mobile = mobile();
    renderer.setSize(w, h, false); composer.setSize(w, h);
    if (bloom) bloom.resolution.set(w / 2, h / 2);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    opts.onResize && opts.onResize(state);
  }
  addEventListener('resize', resize); resize();

  function progress() {
    const c = scrollY + innerHeight * .5; let p = 0;
    chapters.forEach((el, i) => { const top = el.offsetTop; if (c >= top) p = i + Math.min(1, (c - top) / el.offsetHeight) - .5; });
    return clamp(p, 0, chapters.length - 1);
  }
  addEventListener('pointermove', e => { state.mx = e.clientX / innerWidth * 2 - 1; state.my = -(e.clientY / innerHeight * 2 - 1); }, { passive: true });

  const fns = [];
  let last = performance.now(), running = true;
  function loop(now) {
    if (!running) return;
    state.dt = Math.min(.05, (now - last) / 1000); last = now;
    if (!reduce) state.t += state.dt;
    state.p = progress();
    state.ps = reduce ? state.p : state.ps + (state.p - state.ps) * (1 - Math.exp(-state.dt * (opts.follow || 3.2)));
    state.px += (state.mx - state.px) * (1 - Math.exp(-state.dt * 3));
    state.py += (state.my - state.py) * (1 - Math.exp(-state.dt * 3));
    const a = Math.round(state.ps);
    if (a !== state.active) {
      state.active = a;
      chapters.forEach((c, i) => c.classList.toggle('is-on', i === a));
      document.querySelectorAll('[data-go]').forEach(b => b.setAttribute('aria-current', +b.dataset.go === a ? 'true' : 'false'));
      opts.onChapter && opts.onChapter(a, state);
    }
    fns.forEach(f => f(state));
    composer.render();
    requestAnimationFrame(loop);
  }
  // pause when the tab is hidden
  document.addEventListener('visibilitychange', () => { running = !document.hidden; if (running) { last = performance.now(); requestAnimationFrame(loop); } });

  function go(i) {
    const el = chapters[clamp(i, 0, chapters.length - 1)];
    if (el) scrollTo({ top: el.offsetTop + el.offsetHeight / 2 - innerHeight / 2, behavior: reduce ? 'auto' : 'smooth' });
  }
  document.addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (b) { e.preventDefault(); go(+b.dataset.go); } });

  // ?at=N for previews
  const at = new URLSearchParams(location.search).get('at');
  if (at !== null) {
    const v = +at, i = Math.floor(v), f = v - i, el = chapters[Math.min(i, chapters.length - 1)];
    if (el) { history.scrollRestoration = 'manual'; scrollTo(0, el.offsetTop + el.offsetHeight * (f + .5) - innerHeight * .5); state.ps = v; }
  }
  requestAnimationFrame(loop);
  return { THREE, renderer, scene, camera, composer, bloom, state, chapters, onFrame: f => fns.push(f), go };
}

// A canvas atlas of drawn gameplay frames (window.CutFrames), refreshed a few rows at a time.
export function createAtlas({ cols, rows, cw, ch, kinds, draw, fps = 12, pad = 0 }) {
  const c = document.createElement('canvas'); c.width = cols * cw; c.height = rows * ch;
  const x = c.getContext('2d');
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const cells = [];
  for (let i = 0; i < cols * rows; i++) cells.push({ i, kind: kinds[i % kinds.length], seed: i * 7 + 3, phase: i * .37 });
  function paint(cell, t) {
    const cx = (cell.i % cols) * cw, cy = Math.floor(cell.i / cols) * ch;
    x.save(); x.beginPath(); x.rect(cx, cy, cw, ch); x.clip(); x.translate(cx + pad, cy + pad);
    if (draw) draw(x, cw - pad * 2, ch - pad * 2, cell, t); else window.CutFrames.draw(x, cw - pad * 2, ch - pad * 2, cell.kind, cell.seed, t + cell.phase);
    x.restore();
  }
  let acc = 0, row = 0;
  cells.forEach(cl => paint(cl, 0)); tex.needsUpdate = true;
  return {
    canvas: c, ctx: x, texture: tex, cells, cols, rows, paint,
    tick(dt, t, perFrameRows = 2) {
      acc += dt; if (acc < 1 / fps) return; acc = 0;
      for (let r = 0; r < perFrameRows; r++) { for (let k = 0; k < cols; k++) paint(cells[row * cols + k], t); row = (row + 1) % rows; }
      tex.needsUpdate = true;
    },
    uv(i) { return [(i % cols) / cols, 1 - (Math.floor(i / cols) + 1) / rows, 1 / cols, 1 / rows]; }
  };
}
