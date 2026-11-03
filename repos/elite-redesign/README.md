# Elite VFX — cinematic website

Static website in `dist/`. Site identity: `.openai/hosting.json`.

```text
npm ci
npm run vendor
npm run check
npm run dev
```

Preview: http://127.0.0.1:4173/ . No frontend build is needed. Run `node --check dist/vfx.js` for the VFX interaction script as well.

`MEDIA-REVIEW.md` documents the current design, supplied-media review and original background. `RESEARCH.md` records the initial research; its earlier portal concept has been superseded. `VALIDATION.md` records checks.

The source of the original background is in the sibling `original-vfx-loop` HyperFrames project. The high-quality master and web video are separate. User-supplied originals remain in the parent workspace.

Contact prepares a WhatsApp message for visitor review; it does not send a message automatically or store form submissions. The live domain has not been migrated. Analytics is not installed.
