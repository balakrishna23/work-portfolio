// Cutsway prototypes: shared 3D kit (ES module). Renderer + bloom + adaptive quality, logo drawing, helpers.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export const SPEC = ['#2136cd', '#2664f7', '#32a9f6', '#32d7f6', '#c5f9ed', '#fbf7c9', '#fef78e', '#f9e853', '#f5b843', '#fa7d31', '#ef462e', '#e32139'];
export const SLICES = ['#eb1635', '#d41c40', '#b22546', '#8a2445', '#6a2444', '#52263f', '#3f2740', '#33283f', '#2d2844'];
const SPEC_C = SPEC.map(h => new THREE.Color(h));
export const specAt = u => { const x = Math.min(0.9999, Math.max(0, u)) * (SPEC_C.length - 1), i = Math.floor(x); return SPEC_C[i].clone().lerp(SPEC_C[i + 1], x - i); };
export const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const phone = () => innerWidth < 820;
export const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
export const clamp01 = x => Math.min(1, Math.max(0, x));
export const V = (x, y, z) => new THREE.Vector3(x, y, z);

// world setup: renderer, composer with bloom, quality that steps down on slow devices
export function createWorld({ canvas = document.getElementById('world'), bloom = [0.45, 0.5, 0.86], exposure = 1.05, shadows = false, fov = 40, bg = '#0a0810' } = {}) {
  let renderer;
  if (document.documentElement.classList.contains('lite')) throw new Error('data saver: showing the poster instead');
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' }); }
  catch (e) { document.documentElement.classList.add('no-webgl'); throw e; }
  const lockHigh = new URLSearchParams(location.search).get('q') === 'high';
  let dpr = Math.min(devicePixelRatio || 1, phone() ? 1 : 1.25);   // phones start at native-ish cost; quality steps down further if needed
  renderer.setPixelRatio(dpr);
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = exposure;
  if (shadows) { renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.shadowMap.autoUpdate = false; }
  const scene = new THREE.Scene();
  if (bg) scene.background = new THREE.Color(bg);
  const camera = new THREE.PerspectiveCamera(fov, innerWidth / innerHeight, 0.03, 400);
  const composer = new EffectComposer(renderer);
  composer.setPixelRatio(dpr);
  composer.addPass(new RenderPass(scene, camera));
  const bloomPass = new UnrealBloomPass(new THREE.Vector2(innerWidth / 2, innerHeight / 2), ...bloom);
  composer.addPass(bloomPass);
  composer.addPass(new OutputPass());

  const world = { THREE, renderer, scene, camera, composer, bloomPass, tier: 0, onTier: [], onResize: [], baseFov: fov, phoneFov: fov + 12 };
  function resize() {
    renderer.setSize(innerWidth, innerHeight, false); composer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight; camera.fov = phone() ? world.phoneFov : world.baseFov; camera.updateProjectionMatrix();
    world.onResize.forEach(f => f());
  }
  addEventListener('resize', resize); resize();
  world.resize = resize;

  let frameNo = 0;
  function stepDown() {
    world.tier++;
    if (world.tier === 1) { dpr = 1; renderer.setPixelRatio(1); composer.setPixelRatio(1); resize(); }
    if (world.tier === 2 && shadows) { renderer.shadowMap.enabled = false; scene.traverse(o => { if (o.material) o.material.needsUpdate = true; }); }
    if (world.tier === 3) bloomPass.enabled = false;
    world.onTier.forEach(f => f(world.tier));
  }

  // warm-up, behind the intro: compile every shader (in parallel where the GPU allows), upload every texture, render one
  // frame (the post passes compile there), so none of it lands on a frame anyone sees
  const textures = new Set(), parallel = renderer.extensions.has('KHR_parallel_shader_compile');
  const collect = m => { for (const k in m) { const v = m[k]; if (v && v.isTexture) textures.add(v); } if (m.uniforms) for (const k in m.uniforms) { const v = m.uniforms[k].value; if (v && v.isTexture) textures.add(v); } };
  world.warm = async function (target = scene) {
    try { if (parallel) await renderer.compileAsync(target, camera, scene); else renderer.compile(target, camera, scene); } catch {}
    textures.clear(); target.traverse(o => { if (o.material) [].concat(o.material).forEach(collect); });
    textures.forEach(t => renderer.initTexture(t));
  };

  // the loop: lenis, the scene's own update, render, quality watch
  const clock = new THREE.Clock(), slow = [];
  world.start = async function (update) {
    document.documentElement.classList.add('world-on'); document.documentElement.classList.remove('no-webgl');   // a slow start that tripped the poster recovers
    await world.warm();
    update(0, 0); composer.render();
    document.documentElement.classList.add('world-ready');
    function frame(now) {
      const dt = Math.min(0.05, clock.getDelta()), t = clock.elapsedTime;
      if (window.tickLenis) window.tickLenis(now);
      update(t, dt);
      composer.render();
      frameNo++;
      // quality steps down only when most frames are slow: the median, so a one-off hitch never costs resolution
      if (!lockHigh && frameNo > 30 && world.tier < 3) { slow.push(dt); if (slow.length >= 90) { slow.sort((a, b) => a - b); if (slow[45] > 1 / 42) stepDown(); slow.length = 0; } }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  };
  return world;
}

// scroll in chapter units, smoothed lightly (lenis already smooths the scroll itself)
export function chapterTracker() {
  let target = window.chapterPos(), pos = target;
  addEventListener('scroll', () => { target = window.chapterPos(); }, { passive: true });
  addEventListener('resize', () => { target = window.chapterPos(); });
  // lenis already eases the scroll; easing it a second time only adds lag
  return dt => { pos += (target - pos) * (reduce || window.lenis ? 1 : Math.min(1, dt * 10)); return pos; };
}

// ── materials and mesh helpers ──
export const flat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.78, metalness: 0.05, flatShading: true, ...o });
export const smooth = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.02, ...o });
export const glowMat = (color, k = 2) => new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(k), toneMapped: false });
export function mesh(geo, mat, x, y, z, parent) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; if (parent) parent.add(m); return m; }

// ── canvas helpers ──
export function canvasTex(w, h) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  return { cv, g: cv.getContext('2d'), tex };
}
export function drawLogoBar(g, ox, oy, s, spec = SPEC, slices = SLICES) {
  g.save(); g.beginPath(); g.moveTo(ox + 4 * s, oy + 58 * s); g.lineTo(ox + 396 * s, oy + 19 * s); g.lineTo(ox + 396 * s, oy + 53 * s); g.lineTo(ox + 4 * s, oy + 92 * s); g.closePath(); g.clip();
  const lg = g.createLinearGradient(ox + 4 * s, 0, ox + 270 * s, 0); spec.forEach((c, k) => lg.addColorStop(k / (spec.length - 1), c));
  g.fillStyle = lg; g.fillRect(ox + 4 * s, oy, 266 * s, 100 * s);
  slices.forEach((c, k) => { g.fillStyle = c; g.fillRect(ox + (276 + k * 13) * s, oy, 7 * s, 100 * s); });
  g.restore();
}
export function drawWordmark(g, x, y, px, color) {
  g.fillStyle = color; g.font = `900 ${px}px Archivo, sans-serif`;
  try { g.fontStretch = 'expanded'; } catch {}
  try { g.letterSpacing = `${-px * 0.035}px`; } catch {}
  g.fillText('cutsway', x, y);
  try { g.letterSpacing = '0px'; g.fontStretch = 'normal'; } catch {}
}
export const fontsReady = () => document.fonts.load('900 100px Archivo').catch(() => {});
export const font = (w, px) => `${w} ${px}px Archivo, sans-serif`;

// a soft round sprite for dust and sparks
export function dotTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 32; const g = c.getContext('2d');
  const r = g.createRadialGradient(16, 16, 0, 16, 16, 16); r.addColorStop(0, '#fff'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 32, 32);
  return new THREE.CanvasTexture(c);
}

// a game frame, drawn into any canvas: the stand-in for a client's footage
export const GAME = { sky: ['#2b1d4d', '#b22546', '#fa7d31'], city: '#1a1024', ground: '#140c1c', grid: 'rgba(250,125,49,0.45)', ink: '#0b0a10', paper: '#f2f0e6', accent: '#f9e853' };
export function drawGame(g, x, y, w, h, t, captions = true, pal = GAME) {
  const sky = g.createLinearGradient(0, y, 0, y + h); sky.addColorStop(0, pal.sky[0]); sky.addColorStop(0.55, pal.sky[1]); sky.addColorStop(0.75, pal.sky[2]);
  g.fillStyle = sky; g.fillRect(x, y, w, h);
  g.fillStyle = pal.city; for (let k = 0; k < 7; k++) { const bx = x + ((k * 173 + t * 22) % (w + 120)) - 60; g.fillRect(bx, y + h * 0.42 - (k % 3) * 18, w * 0.05 + 12, h * 0.2 + (k % 3) * 18); }
  g.fillStyle = pal.ground; g.fillRect(x, y + h * 0.62, w, h * 0.38);
  g.strokeStyle = pal.grid; g.lineWidth = Math.max(1, w / 500); g.beginPath();
  for (let k = -8; k <= 8; k++) { g.moveTo(x + w / 2 + k * w * 0.023, y + h * 0.62); g.lineTo(x + w / 2 + k * w * 0.16, y + h); }
  for (let k = 0; k < 6; k++) { const yy = y + h * 0.62 + Math.pow((k + (t * 0.8 % 1)) / 6, 2) * h * 0.38; g.moveTo(x, yy); g.lineTo(x + w, yy); }
  g.stroke();
  const ex = x + w * (0.55 + Math.sin(t * 0.9) * 0.12), u = h / 440;
  g.fillStyle = pal.ink; g.fillRect(ex - 14 * u, y + h * 0.5, 28 * u, 56 * u); g.beginPath(); g.arc(ex, y + h * 0.48, 14 * u, 0, 7); g.fill();
  g.strokeStyle = pal.paper; g.lineWidth = 3 * u; const cx = x + w / 2, cy = y + h * 0.52, a = 18 * u, b = 6 * u;
  g.beginPath(); g.moveTo(cx - a, cy); g.lineTo(cx - b, cy); g.moveTo(cx + b, cy); g.lineTo(cx + a, cy); g.moveTo(cx, cy - a); g.lineTo(cx, cy - b); g.moveTo(cx, cy + b); g.lineTo(cx, cy + a); g.stroke();
  if (!captions) return;
  const words = ['THEY', 'DID NOT', 'SEE IT', 'COMING'], wi = Math.floor(t * 1.6) % words.length;
  g.font = font(900, Math.round(h * 0.11)); g.textAlign = 'center';
  g.lineWidth = h * 0.018; g.strokeStyle = pal.ink; g.strokeText(words[wi], x + w / 2, y + h * 0.86); g.fillStyle = wi % 2 ? pal.accent : pal.paper; g.fillText(words[wi], x + w / 2, y + h * 0.86);
  g.textAlign = 'left';
}
