# Assets and credits

| Asset | File | Source | Licence |
|---|---|---|---|
| Showreel footage | `public/footage/elite-reel.mp4` | Supplied by Elite VFX Services | Owned by the client |
| Enhanced 4K footage | `public/footage/elite-reel-4k.mp4` | Derived from the reel above (denoise, Lanczos upscale, sharpen) | Owned by the client |
| Thumbnail and hook stills | `public/stills/*.png` | Frames taken from the reel | Owned by the client |
| Logo mark (gold, white), and its vector rebuild in `src/components/LogoMark.tsx` | `public/brand/*.png` | elitevfxservices.com | Owned by the client |
| Music: "Hitman" by Kevin MacLeod | `public/audio/hitman-kevin-macleod.mp3` | https://incompetech.com | CC BY 4.0, attribution required |
| Whoosh sound effect: "Woosh" by 1bob | `public/sfx/whoosh.wav` | https://freesound.org/s/831936/ | CC0 |
| Riser, impact, hit and shimmer sound effects | `public/sfx/{riser,impact,hit,shimmer}.wav` | Synthesised for this project by `scripts/make-sfx.py` | Original, no third-party samples |
| Fonts: Bodoni Moda, Nunito Sans | loaded by `@remotion/google-fonts` | Google Fonts | SIL Open Font License |

## Attribution to include when posting the video

> Music: "Hitman" by Kevin MacLeod (incompetech.com). Licensed under Creative Commons: By Attribution 4.0. http://creativecommons.org/licenses/by/4.0/

To avoid the attribution, replace the track with one you have a licence for that doesn't require it. Then update `MUSIC` in `src/config.ts`.
