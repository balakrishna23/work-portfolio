// Cutsway prototypes: the ember colourway (gold → orange → red, slices burning down to maroon), for pages on the shared kit.
import * as THREE from 'three';

export const SPEC = ['#d4940f', '#f5bf1e', '#ffdc3c', '#ffcf33', '#ffb02a', '#ff8a22', '#ff6420', '#ff3d2c', '#f81f3a', '#ee1240'];
export const SLICES = ['#f0163a', '#d41436', '#b51231', '#96112c', '#7a1027', '#641023', '#551321', '#4b1520', '#44171f'];
export const BG = '#0d0907', PAPER = '#f6efe4', GOLD = '#ffc72e', RED = '#f0163a', ORANGE = '#ff8a22';
const SPEC_C = SPEC.map(h => new THREE.Color(h));
export const specAt = u => { const x = Math.min(0.9999, Math.max(0, u)) * (SPEC_C.length - 1), i = Math.floor(x); return SPEC_C[i].clone().lerp(SPEC_C[i + 1], x - i); };
// the stand-in gameplay frame, regraded to the ember sky
export const GAME_EMBER = { sky: ['#2a120d', '#a3142e', '#ff8a22'], city: '#1c0d0a', ground: '#120a08', grid: 'rgba(255,176,42,0.45)', ink: BG, paper: PAPER, accent: GOLD };
