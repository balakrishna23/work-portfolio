# Elite VFX Services — promo

An editable Remotion project with a 30-second promo and a 15-second social cutdown. Each comes in landscape (1920×1080) and vertical (1080×1920), at 30 fps. Add `--scale=2` to render any of them at 4K.

## Preview

```sh
npm install        # first time only
npm run dev        # opens Remotion Studio at http://localhost:3000
```

| Studio folder | Compositions |
|---|---|
| Promo-30s | `Promo-Landscape`, `Promo-Vertical` |
| Promo-15s | `Promo15-Landscape`, `Promo15-Vertical` |
| Thumbnails | `Thumbnail-Landscape`, `Thumbnail-Vertical` |
| Elements | `CTA-Overlay`, a transparent end card for reuse |

## Edit

Most changes only need [src/config.ts](src/config.ts):

| To change | Edit |
|---|---|
| Wording (hook, intro, service labels, tagline, CTA) | `COPY` |
| Name, URL, WhatsApp, location, colours | `BRAND` |
| Scene lengths (seconds) for the 30s and 15s cuts | `SCENES`, `SCENES_SHORT` |
| Which moment of the reel each scene uses, its speed, and the vertical crop | `FOOTAGE` (`FOOTAGE.short` for the 15s cut) |
| Music file, where in the track it starts, and its volume | `MUSIC` |
| Sound effect files and levels | `SFX` (timings are in [src/Promo.tsx](src/Promo.tsx)) |

**Footage.** `public/footage/elite-reel-4k.mp4` is a 4096×2304 copy of the original 1024×576 reel (`elite-reel.mp4`). It was denoised, upscaled with Lanczos and sharpened. That cleans up compression blocks, but it can't add real detail. When you have master files, point `FOOTAGE.src` at them and re-render. The geometry values stay in the original reel's 1024×576 units, so only the `from` times may need updating.

**Logo.** The mark animates line by line from a vector rebuild in [src/components/LogoMark.tsx](src/components/LogoMark.tsx). It matches `public/brand/logo-mark-gold.png` to within edge anti-aliasing.

**Sound effects.** `riser`, `impact`, `hit` and `shimmer` are synthesised by `python scripts/make-sfx.py`. Edit that script and re-run it to change how they sound.

**Fonts.** [src/fonts.ts](src/fonts.ts) uses Bodoni Moda and Nunito Sans from Google Fonts, standing in for the website's Didot Italic and Avenir.

## Render

```sh
npm run render:all                                             # all four videos + thumbnails, 1080p
npm run render:landscape       npm run render:vertical         # 30s, 1080p
npm run render:15:landscape    npm run render:15:vertical      # 15s, 1080p
npm run render:thumbnails
npm run render:4k:landscape    npm run render:4k:vertical      # 30s at 4K (slow)
```

Renders are H.264, tagged BT.709, and saved in `out/FINAL/` under labelled names such as `Elite-VFX-Promo_30s_Vertical-9x16_1080x1920.mp4`. `out/FINAL/README.txt` says what each file is for and gives the music credit. Superseded renders are in `out/OLD-do-not-use/`.

## Storyboard (30s)

| Time | Scene |
|---|---|
| 0:00–0:03 | Hook: "What you shot." on the bluescreen plate, then "What they remember." on the same angle as delivered. A riser builds into the drop. |
| 0:03–0:07.8 | The drop: impact and light leak, the logo mark draws on line by line, then the intro line |
| 0:07.8–0:12.5 | 01 — 3D · CGI (truck crash) |
| 0:12.5–0:17.3 | 02 — Set extension · Chroma key (street chase) |
| 0:17.3–0:22.1 | 03 — FX · Compositing (explosion) |
| 0:22.1–0:25.7 | Commercials. / Music videos. / Films. on the beat, then the tagline |
| 0:25.7–0:30 | End card: logo, Book a call, URL, WhatsApp |

The 15s cut runs: hook (3s), logo (2.4s), 3D · CGI (2.4s), FX · Compositing (2.4s), end card (4.8s).

## Credits

See [CREDITS.md](CREDITS.md). The music needs an attribution line wherever the video is posted.

Remotion is free for individuals and companies of up to 3 people. Larger companies need a company licence: https://www.remotion.dev/license
