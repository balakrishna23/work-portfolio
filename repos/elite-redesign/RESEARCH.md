# Elite VFX redesign research

Reviewed 29 October 2026. This is a separate redesign; the original Wix site is unchanged.

## Audit

The [current homepage](https://www.elitevfxservices.com/) presents a service list and enquiry form. The [about page](https://www.elitevfxservices.com/about-us) contains unfinished template wording. The site shows a placeholder email, so the redesign uses the [published business phone](https://www.elitevfxservices.com/contact-us) for phone and WhatsApp contact. Service content is grounded in the [existing service page](https://www.elitevfxservices.com/vfx-services). No client credits, awards or numerical performance claims have been invented.

## Creative direction

Beyond the Frame: a cinematic journey from possibility to craft to conversation. A wide atmospheric landscape establishes scale. Oversized condensed typography gives the opening a clear hierarchy. Warm amber connects the artwork with the interface. A concept layer explorer gives visitors something to investigate, followed by expandable service details and a short enquiry.

The [Framestore work index](https://www.framestore.com/work) was reviewed as a reference for showing visual work with specific project context. The redesign should eventually feature Elite's own approved project breakdowns, with contribution and client permission documented. The current concept is explicitly labelled illustrative.

## Skills and plugins reviewed

- Sites: implementation, responsive design, source packaging and private deployment.
- Plugin Management: searched the available plugin directory for design integrations.
- ImageGen: original concept scene generated using the built-in image tool.
- Computer Use: browser inspection and visual QA.
- Figma: found and suggested for optional editable design collaboration. Connection is not required for this implementation, and was not confirmed during the build.
- HyperFrames and media skills are available for a future original film or showreel; no supplied reel exists for this build.

## GitHub library shortlist

| Library | Decision | Reason |
| --- | --- | --- |
| [GSAP](https://github.com/greensock/GSAP) and [ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) | Used, locally vendored 3.14.2 | Restrained reveal choreography with responsive reduced-motion handling. |
| [Lenis](https://github.com/darkroomengineering/lenis) | Reviewed, deferred | Smooth-scroll tooling is available, but native scroll is sufficient for this design. |
| [Three.js](https://github.com/mrdoob/three.js) | Reviewed, deferred | Useful for actual interactive 3D; the present narrative doesn't require an always-running renderer. |
| [React Three Fiber](https://github.com/pmndrs/react-three-fiber) | Reviewed, deferred | Suitable if the experience grows into a React-based real-time scene. |

No paid library or new account is needed for the current implementation. Library licenses remain applicable; minified vendor files retain their upstream headers. These are researched implementation choices, not a claim that every available library was assessed.

## Retention and enquiry strategy

Lead with one strong image and an immediately legible proposition. Make the first exploration action visible above the fold. Give each later section a new purpose. Keep contact available through navigation and service links. Use native scrolling, clear focus states, keyboard-operable tabs, reduced-motion support, compressed imagery and a small static site.

Actual retention improvements have not been measured. For launch, collect privacy-appropriate aggregate events for 25/50/75/100% scroll, layer exploration, service expansion, enquiry start and WhatsApp click. Compare enquiry click rate and engaged sessions with a baseline over comparable traffic. A WhatsApp click is not a confirmed lead. No analytics tracking has been installed.

## Launch requirements

Replace the illustrative frame with approved Elite portfolio imagery and matching real before/after plates. Confirm business details and privacy-policy content. The enquiry currently prepares a WhatsApp message for the visitor to review and send; it does not store or silently submit the brief. Real client work and an approved showreel are the largest remaining content opportunities.

## Image provenance

Built-in ImageGen, not CLI. Optimized project asset: `dist/assets/hero.webp`.

Final prompt: Use case: stylized-concept. Asset type: cinematic background for an elite visual effects studio website. Generate a breathtaking photorealistic film frame in very wide 2.4:1 landscape aspect ratio. A monumental dark circular alien ring gate stands vertically in a vast rugged Icelandic black volcanic valley, with tiny solitary explorer near its base for scale. The ring positioned right of center, circular rim softly glowing warm amber with dusty atmospheric light inside; realistic worn metal. Mountains shrouded in low fog, distant enormous cliffs. Moody dark blue-charcoal slate clouds, warm amber light breaking through mist behind the ring. Ground black basalt wet gravel and delicate reflections. Expensive cinematic matte painting, restrained film grain, anamorphic cinematography, extraordinary scale and believable realism. Left third mostly dark misty valley with empty space for website text. No lettering, no logos, no watermarks. This is original illustrative concept artwork, not a movie still.
