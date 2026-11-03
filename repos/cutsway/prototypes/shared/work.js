// Cutsway's own work, shown inside the worlds: thumbnails and a reel, with their labels.
// Files sit in one folder; each page passes its path to that folder (it differs between the prototypes and a launch build).
export const THUMBS = {
  wealthy: { file: 'thumb-wealthy.jpg', label: '10 Things to Become Wealthy' },
  stocks: { file: 'thumb-stocks.jpg', label: 'Top 10 Rising Stocks' },
  creator: { file: 'thumb-creator.jpg', label: 'Day in the Life of a Content Creator' },
  rawtalks: { file: 'thumb-rawtalks.jpg', label: 'Podcast episode' },
  'rawtalks-plain': { file: 'thumb-rawtalks-plain.jpg', label: 'Podcast episode' },
};
export const REEL = { file: 'reel-podcast.mp4', small: 'reel-podcast-sm.mp4', label: 'Podcast short', seconds: 11 };

// thumbnails load in the background; an entry is drawable once .ready is true
export function loadThumbs(dir, keys = Object.keys(THUMBS)) {
  const out = {};
  keys.forEach(k => {
    const img = new Image(); img.decoding = 'async'; img.src = dir + THUMBS[k].file;
    out[k] = { img, ready: false, label: THUMBS[k].label };
    img.decode().then(() => { out[k].ready = true; }, () => {});
  });
  return out;
}

// the reel as a silent, looping picture
export function reelVideo(dir, small) {
  const v = document.createElement('video');
  v.muted = true; v.loop = true; v.playsInline = true; v.setAttribute('playsinline', ''); v.preload = 'auto';
  v.src = dir + (small ? REEL.small : REEL.file);
  return v;
}
// it decodes only while it is wanted on screen
export function keepPlaying(v, want) {
  if (want && v.paused) v.play().catch(() => {});
  else if (!want && !v.paused) v.pause();
}
export const frameReady = v => v.readyState >= 2;

// an image or video frame filling a rect, cropped to fit (cover) or letterboxed (contain)
export function drawFit(g, src, x, y, w, h, mode = 'cover') {
  const sw = src.videoWidth || src.naturalWidth || src.width, sh = src.videoHeight || src.naturalHeight || src.height;
  if (!sw || !sh) return;
  const s = (mode === 'cover' ? Math.max : Math.min)(w / sw, h / sh), dw = sw * s, dh = sh * s;
  g.drawImage(src, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}
