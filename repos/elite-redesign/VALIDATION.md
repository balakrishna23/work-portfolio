# Validation

## VFX revision

- Reviewed all four supplied promos using timestamped frame sheets.
- Installed pinned GSAP 3.14.2 and Lenis 1.3.23; npm reported no vulnerabilities in the installed dependency set.
- JavaScript syntax checks pass for `app.js` and `vfx.js`.
- The frame-sequence explorer changes the displayed image with chapter selection and keyboard range input. Reaching the end selects the compositing chapter; the sequence is trimmed before the promo's next title card.
- Original background verified as 240 frames at 30 fps, exactly 8.0 seconds; decoded frames at 0, 2, 4 and 6 seconds inspected. Web encode is approximately 2.76 MB. No supplied promo footage is used in the background.
- Desktop hero and 390 × 844 mobile hero inspected. No horizontal overflow at that phone breakpoint.
- Pause changes the label to Resume, pauses the hero, and switches the breakdown to manual exploration.
- Film button opens the labelled native-control promo modal; close control is provided.
- HyperFrames source check passed with no errors. Driver precision and canvas static-bound warnings reviewed against visibly changing valid snapshots; see the source project's `REVIEW.md`.
- Native touch gestures on a physical phone and real visitor retention have not been measured.

The earlier checks below describe the initial design and are retained as history. Its illustrative tab-based portal demo has been replaced by the frame-sequence explorer.

- JavaScript syntax: `node --check dist/app.js` passed.
- Local HTTP response: 200.
- Desktop hero inspected in the connected Brave browser.
- Mobile checked at 390 × 844; no horizontal page overflow found.
- Mobile navigation opens, follows section links and closes.
- Concept tabs update their selected state and layer text.
- Service accordion expands Compositing and closes the previous service.
- Service enquiry link preselects Compositing in the form.
- Empty enquiry submission is blocked by native required-field validation and focuses the name field.
- No WhatsApp message was sent during QA. The prefilled handoff is implemented but actual delivery is not tested.
- Reduced motion uses CSS media queries and GSAP matchMedia; manual motion pause is available. OS-level reduced-motion emulation was not tested.
- No measured retention or conversion result is claimed.

Source is buildless static HTML/CSS/JS. Fonts use Google Fonts with local system fallbacks. GSAP scripts and hero imagery are served locally. The original site remains unchanged.
