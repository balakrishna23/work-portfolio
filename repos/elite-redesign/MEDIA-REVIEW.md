# Video-led redesign, 29 October 2026

Reviewed all four supplied files through timestamped contact sheets: 15 seconds and 30 seconds, each supplied as landscape 1920 × 1080 and portrait 1080 × 1920, all 30 fps. They are alternate edits and framing of the same promo story.

## Cues carried into the website

- Midnight navy, champagne gold, ivory and restrained cyan highlights.
- Large italic editorial titles, fine labels and cinematic spacing.
- Shot breakdowns that wipe between CG, plates, environment extension and a finished composite.
- A progression from the captured shot to what the audience remembers.

## Changes

The illustrative portal demo has been replaced by a scroll-driven sequence extracted from the supplied 30-second landscape promo. It uses 165 frames from approximately 8.1–21.77 seconds. Vertical scrolling and touch scrolling reveal the wipes; scrolling backward deconstructs the frame. Three chapter controls and a keyboard-operable range input offer direct access. Frames load on demand, with only the latest requested frame queued while a decode is in progress. The supplied promos are not presented as proof of particular named film credits.

The 15-second and 30-second films have a native-controls modal player. It selects the supplied portrait cut at the mobile breakpoint and the landscape cut otherwise. The original videos are unchanged; smaller web copies live in `dist/assets/`.

The user rejected the promo footage as a background. The opening now uses **Matter in the Making**, an original eight-second 3D wireframe-to-metal loop created from code in `../original-vfx-loop/`. No supplied footage is used in that background. Three.js 0.181.2 renders a torus knot, clipping plane, reflective lighting and sparse particles; HyperFrames renders the deterministic timeline to video. The web encode is 1280 × 720 at 30 fps, 8.0 seconds, approximately 2.76 MB, silent. Poster: `dist/assets/original-hero.webp`; film: `dist/assets/original-hero.mp4`.

GSAP 3.14.2 and Lenis 1.3.23 are installed as pinned project dependencies. Local browser files are copied through `npm run vendor`. Three.js is installed in the background source project; the website plays the rendered film and does not require a live 3D renderer.

Motion can be paused. Reduced-motion preference selects a manual layer explorer without the long pinned scroll section. The original Wix domain is unchanged.
