// Everything you are likely to change lives in this file: brand, copy, timing and footage.
// Times are in seconds; scenes are laid out back to back in the order of SCENES.

export const BRAND = {
  name: 'Elite VFX Services',
  wordmarkTop: 'ELITE VFX',
  wordmarkBottom: 'SERVICES',
  parent: 'a Manvik VFX Works (OPC) PVT LTD Company',
  url: 'elitevfxservices.com',
  contact: 'WhatsApp +91 99495 67831',
  location: 'Hyderabad, India',
  logoGold: 'brand/logo-mark-gold.png',
  logoWhite: 'brand/logo-mark-white.png',
  colors: {
    black: '#050505',
    gold: '#B39F79', // website accent, rgb(179,159,121)
    goldDeep: '#95815B', // website button, rgb(149,129,91)
    ivory: '#EDEAE4',
    muted: '#9A958D',
  },
};

export const COPY = {
  hookPlate: 'What you shot.',
  hookFinal: 'What they remember.',
  intro: 'VFX & post-production for commercials, music videos and films.',
  features: [
    {number: '01', label: '3D · CGI', caption: 'From grey-shaded model to final frame.'},
    {number: '02', label: 'Set extension · Chroma key', caption: 'Bluescreen plate to a full city street.'},
    {number: '03', label: 'FX · Compositing', caption: 'Plate, CG and fire, layered into one shot.'},
  ],
  montage: ['Commercials.', 'Music videos.', 'Films.'],
  tagline: 'Mind-blowing visuals, delivered.',
  cta: 'Book a call',
};

// Scene durations follow the music: the drop lands at 3.0s and the cuts sit on bar lines
// (100.6 BPM, one bar = 2.385s). Change MUSIC.startAt if you swap the track.
export const SCENES = {
  hook: 3.0,
  intro: 4.77,
  feature1: 4.77,
  feature2: 4.77,
  feature3: 4.77,
  montage: 3.58,
  endCard: 4.34,
};

export const MUSIC = {
  src: 'audio/hitman-kevin-macleod.mp3',
  startAt: 49.08, // seconds into the track; puts its drop on the logo reveal
  volume: 0.72,
  duck: 0.62, // music gain multiplier for a moment under each impact (so ~0.45 there)
};

// On-screen layer tags for the reel's before/after wipes. Frames are reel frames (30 fps) as
// measured from the footage. A wipe sweeps left to right: `left` is the layer being revealed,
// `right` the layer it replaces. `tag` is a hold where one layer fills the frame.
// null = a pass not identified yet: no tag is shown. Fill in the real pass names
// (e.g. 'LIGHTING', 'FX · DEBRIS', 'COMP') and they appear in every cut.
export type LayerSegment =
  | {readonly from: number; readonly to: number; readonly tag: string | null}
  | {readonly from: number; readonly to: number; readonly left: string | null; readonly right: string | null};

export const LAYER_TAGS: Record<'truck' | 'street' | 'explosion', readonly LayerSegment[]> = {
  truck: [
    {from: 70, to: 115, tag: 'FINAL'},
    {from: 116, to: 129, left: 'CG MODEL', right: 'FINAL'},
    {from: 130, to: 134, tag: 'CG MODEL'},
    {from: 135, to: 148, left: null, right: 'CG MODEL'},
    {from: 149, to: 154, tag: null}, // pass A
    {from: 155, to: 168, left: null, right: null}, // pass B over pass A
    {from: 169, to: 173, tag: null}, // pass B
    {from: 174, to: 187, left: null, right: null}, // pass C over pass B
    {from: 188, to: 194, tag: null}, // pass C
    {from: 195, to: 208, left: 'FINAL', right: null},
    {from: 209, to: 239, tag: 'FINAL'},
  ],
  street: [
    {from: 256, to: 317, tag: 'FINAL'},
    {from: 318, to: 330, left: 'PLATE', right: 'FINAL'},
    {from: 331, to: 338, tag: 'PLATE'},
    {from: 339, to: 352, left: 'CG SET EXTENSION', right: 'PLATE'},
    {from: 353, to: 359, tag: 'CG SET EXTENSION'},
    {from: 360, to: 373, left: null, right: 'CG SET EXTENSION'},
    {from: 374, to: 380, tag: null}, // pass A
    {from: 381, to: 394, left: null, right: null}, // pass B over pass A
    {from: 395, to: 402, tag: null}, // pass B
    {from: 403, to: 415, left: 'FINAL', right: null},
    {from: 416, to: 438, tag: 'FINAL'},
  ],
  explosion: [
    {from: 549, to: 602, tag: 'FINAL'},
    {from: 603, to: 615, left: 'PLATE', right: 'FINAL'},
    {from: 616, to: 623, tag: 'PLATE'},
    {from: 624, to: 637, left: 'CG SET EXTENSION', right: 'PLATE'},
    {from: 638, to: 643, tag: 'CG SET EXTENSION'},
    {from: 644, to: 655, left: null, right: 'CG SET EXTENSION'},
    // 656-672: overlapping wipes (two lines on screen at once); left untagged
  ],
};

// 15s social cutdown: hook, logo, two breakdowns, end card. Same music start, so the drop
// still lands on the logo and every cut sits on a bar line.
export const SCENES_SHORT = {
  hook: 3.0,
  intro: 2.385,
  feature1: 2.385,
  feature2: 2.385,
  endCard: 4.845,
};

// Sound design. riser/impact/hit/shimmer are synthesised by scripts/make-sfx.py.
export const SFX = {
  whoosh: {src: 'sfx/whoosh.wav', volume: 0.45},
  riser: {src: 'sfx/riser.wav', volume: 0.45},
  impact: {src: 'sfx/impact.wav', volume: 0.5},
  hit: {src: 'sfx/hit.wav', volume: 0.38},
  shimmer: {src: 'sfx/shimmer.wav', volume: 0.35},
};

// Source reel and the moments used from it. `from` is seconds into the reel; `rate` is the
// playback speed; `focusX` (0–1) is the horizontal centre of the crop in the vertical cut.
export const FOOTAGE = {
  // 4096×2304 denoised, Lanczos-upscaled and sharpened copy of footage/elite-reel.mp4
  // (the original 1024×576 WhatsApp export). Point this at a master file when you have one.
  src: 'footage/elite-reel-4k.mp4',
  // Geometry below is in the original reel's 1024×576 pixel units, whatever file is used.
  width: 1024,
  height: 576,
  // The reel is letterboxed; rows 97–479 hold picture in every shot.
  pictureTop: 97,
  pictureBottom: 479,
  hookPlateStill: 'stills/plate-explosion-4k.png',
  hookFinal: {from: 19.0, rate: 0.75, focusX: 0.5},
  intro: {from: 7.95, rate: 0.5, focusX: 0.5},
  feature1: {from: 3.6, rate: 0.91, focusX: 0.55},
  feature2: {from: 10.6, rate: 0.83, focusX: 0.5},
  // Starts at the shot's first frame (18.3s) and must end by 22.40s: the reel's own burned-in
  // tagline fades in from frame 673 (22.43s). 18.3 + 4.77s × 0.855 = 22.38s.
  feature3: {from: 18.3, rate: 0.855, focusX: 0.48},
  montage: [
    {from: 15.0, rate: 1, focusX: 0.5},
    {from: 16.0, rate: 1, focusX: 0.45},
    {from: 17.65, rate: 1, focusX: 0.5},
    {from: 9.0, rate: 0.56, focusX: 0.5},
  ],
  endCard: {from: 13.9, rate: 0.4, focusX: 0.5},
  // 15s cut: shorter windows that still show plate → CG → final
  short: {
    intro: {from: 7.95, rate: 0.5, focusX: 0.5},
    feature1: {from: 3.87, rate: 1, focusX: 0.55},
    feature2: {from: 20.0, rate: 1, focusX: 0.48},
  },
};
